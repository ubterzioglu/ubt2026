# Bekleyen Supabase migrasyonlarini bulur ve (istege bagli) uygular.
#
# Kural: bekleyenleri ararken migrasyon dosyalarina TEK TEK bakilmaz.
# Dosya adlarindaki version listesi tek bir psql sorgusuna verilir, set
# farkini Postgres hesaplar. Yani N dosya icin 1 sorgu, N degil.
#
#   pwsh scripts/db-migrations.ps1           # sadece listele
#   pwsh scripts/db-migrations.ps1 -Apply    # bekleyenleri sirayla uygula
#
# supabase db push calismiyor (access token bu projeyi gormuyor), o yuzden
# psql dogrudan baglanti kullaniliyor. DB_PASS sadece CLI/migrasyon icindir;
# uygulama runtime'i service-role REST client ile baglanir.

[CmdletBinding()]
param(
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot '.env.local'
$migrationsDir = Join-Path $repoRoot 'supabase/migrations'

# --- Kimlik bilgileri: .env.local sinir noktasi, okunani dogrula ---------------

if (-not (Test-Path $envPath)) {
    throw "Bulunamadi: $envPath"
}

$envVars = @{}
foreach ($line in Get-Content $envPath) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $envVars[$Matches[1]] = $Matches[2].Trim().Trim('"')
    }
}

$dbPass = $envVars['DB_PASS']
if (-not $dbPass) { throw '.env.local icinde DB_PASS yok.' }

$supabaseUrl = $envVars['NEXT_PUBLIC_SUPABASE_URL']
if ($supabaseUrl -notmatch '^https://([a-z0-9]+)\.supabase\.co') {
    throw "NEXT_PUBLIC_SUPABASE_URL beklenen bicimde degil: $supabaseUrl"
}
$projectRef = $Matches[1]

# Baglanti adayi sirasi: once dogrudan host, sonra pooler.
#
# db.<ref>.supabase.co artik SADECE IPv6 cozuyor (Supabase IPv4'u ucretli
# eklentiye tasidi). IPv6 rotasi olmayan agdan buraya baglanmak timeout ile
# biter; o yuzden .env.local'daki DB_POOLER_HOST'a (IPv4'lu session-mode
# pooler) dusuyoruz. Pooler'in kullanici adi "postgres.<ref>" formatinda --
# dogrudan baglantidaki duz "postgres" ile ayni degil.
$env:PGPASSWORD = $dbPass
$candidates = @("postgresql://postgres@db.$projectRef.supabase.co:5432/postgres")
$poolerHost = $envVars['DB_POOLER_HOST']
if ($poolerHost) {
    $candidates += "postgresql://postgres.$projectRef@${poolerHost}:5432/postgres"
}

$connString = $null
foreach ($candidate in $candidates) {
    psql $candidate -t -A -c 'select 1' *> $null
    if ($LASTEXITCODE -eq 0) {
        $connString = $candidate
        break
    }
    Write-Host "Baglanilamadi, siradaki adaya geciliyor: $(($candidate -split '@')[1])"
}
if (-not $connString) {
    throw 'Hicbir baglanti adayi calismadi (dogrudan host + DB_POOLER_HOST).'
}

# --- Dosya version'lari -------------------------------------------------------

$migrationFiles = Get-ChildItem (Join-Path $migrationsDir '*.sql') | Sort-Object Name
if ($migrationFiles.Count -eq 0) { throw "Migrasyon dosyasi yok: $migrationsDir" }

# version = dosya adinin ilk '_' oncesi parcasi. Sadece rakam bekleriz;
# aksi halde asagidaki sorguya guvenilmez bir string girmis olur.
$byVersion = [ordered]@{}
foreach ($file in $migrationFiles) {
    $version = ($file.Name -split '_')[0]
    if ($version -notmatch '^\d+$') {
        throw "Gecersiz migrasyon adi (version rakam degil): $($file.Name)"
    }
    if ($byVersion.Contains($version)) {
        throw "Ayni version iki dosyada: $version"
    }
    $byVersion[$version] = $file
}

# --- Bekleyenleri TEK sorguda bul --------------------------------------------

$versionList = ($byVersion.Keys) -join ','
$query = @"
select v
from unnest(string_to_array('$versionList', ',')) v
where v not in (select version from supabase_migrations.schema_migrations)
order by v;
"@

$pending = @(psql $connString -t -A -c $query | Where-Object { $_ -ne '' })
if ($LASTEXITCODE -ne 0) { throw 'psql sorgusu basarisiz.' }

if ($pending.Count -eq 0) {
    Write-Host "Bekleyen migrasyon yok ($($byVersion.Count) dosyanin hepsi uygulanmis)."
    return
}

Write-Host "Bekleyen migrasyon: $($pending.Count) / $($byVersion.Count)"
foreach ($version in $pending) { Write-Host "  $($byVersion[$version].Name)" }

if (-not $Apply) {
    Write-Host ''
    Write-Host 'Uygulamak icin: pwsh scripts/db-migrations.ps1 -Apply'
    return
}

# --- Uygula: her biri kendi transaction'inda, ilk hatada dur ------------------

foreach ($version in $pending) {
    $file = $byVersion[$version]
    Write-Host ''
    Write-Host "-> $($file.Name)"

    psql $connString -v ON_ERROR_STOP=1 --single-transaction -f $file.FullName
    if ($LASTEXITCODE -ne 0) {
        throw "Migrasyon basarisiz, durduruldu: $($file.Name)"
    }

    # CLI'in gecmisi ile tutarli kalmasi icin kaydi biz yaziyoruz.
    $name = $file.BaseName.Substring($version.Length).TrimStart('_')
    $record = "insert into supabase_migrations.schema_migrations (version, name) " +
              "values ('$version', '$($name.Replace("'", "''"))') on conflict (version) do nothing;"
    psql $connString -v ON_ERROR_STOP=1 -c $record | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Migrasyon uygulandi ama gecmise yazilamadi: $($file.Name)"
    }
}

Write-Host ''
Write-Host "Tamam: $($pending.Count) migrasyon uygulandi."
