# .env.local -> .env.production (repo kokunde, .gitignore'da).
#
# Sadece uygulamanin RUNTIME'da okudugu degiskenler tasinir. DB_PASS ve
# SUPABASE_ACCESS_TOKEN bilerek disarida birakilir: ikisi de CLI/migration
# icindir, uygulama onlari hic okumaz, ve sunucuya konmalari o makine ele
# gecerse veritabanina dogrudan psql erisimi ve CLI yetkisi de verir.
#
#   pwsh scripts/build-prod-env.ps1
#
# Cikti asla commitlenmez (.gitignore) ve degerler ekrana basilmaz -
# sadece hangi degiskenin dolu/bos oldugu raporlanir.

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$src = Join-Path $repoRoot '.env.local'
$out = Join-Path $repoRoot '.env.production'

if (-not (Test-Path $src)) { throw "Bulunamadi: $src" }

$vals = @{}
foreach ($line in Get-Content $src) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $vals[$Matches[1]] = $Matches[2].Trim()
    }
}

# Service finder saglayicilarinin anahtarlari process.env[secret_ref] ile
# DINAMIK okunuyor (lib/finder/run-job.ts), yani kodda statik process.env.X
# olarak gecmiyorlar. Listeyi elle tutuyoruz; kaynagi:
#   select provider_key, secret_ref from service_finder_provider_configs
$sections = [ordered]@{
    'Supabase' = @(
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
    )
    'Pano kapilari (APPOINTMENT_ADMIN_ACCESS_KEY ayni zamanda super admin)' = @(
        'APPOINTMENT_ADMIN_ACCESS_KEY',
        'DESIREMAPTODO_ADMIN_ACCESS_KEY',
        'BATUBT_ADMIN_ACCESS_KEY',
        'BAKCAKANAT_PASSWORD',
        'DETRBRIDGE',
        'UBT_UBTSA_PASSWORD',
        'UBTSA_PASSWORD',
        'ZELIFS_PASSWORD'
    )
    'Service finder saglayicilari' = @(
        'TAVILY_API_KEY',
        'TAVILY_API_KEY_2',
        'TAVILY_API_KEY_3',
        'SERPAPI_API_KEY',
        'GEMINI_API_KEY',
        'GEMINI_API_KEY_2'
    )
}

$optional = @(
    'RESEND_API_KEY',
    'APPOINTMENT_NOTIFICATION_TO',
    'APPOINTMENT_NOTIFICATION_FROM',
    'APPOINTMENT_NOTIFICATION_REPLY_TO'
)

$lines = @(
    '# Uretim ortami - scripts/build-prod-env.ps1 tarafindan uretildi.',
    '# DB_PASS ve SUPABASE_ACCESS_TOKEN bilerek YOK (CLI/migration icin).',
    ''
)
$missing = @()

foreach ($section in $sections.Keys) {
    $lines += "# --- $section"
    foreach ($name in $sections[$section]) {
        if ($vals.ContainsKey($name) -and $vals[$name]) {
            $lines += "$name=$($vals[$name])"
        } else {
            $lines += "$name="
            $missing += $name
        }
    }
    $lines += ''
}

$lines += '# --- E-posta (opsiyonel; yoksa gonderim sessizce atlanir)'
foreach ($name in $optional) {
    if ($vals.ContainsKey($name) -and $vals[$name]) { $lines += "$name=$($vals[$name])" }
    else { $lines += "# $name=" }
}

Set-Content -Path $out -Value $lines -Encoding utf8

Write-Host "yazildi: $out"
Write-Host ''
foreach ($l in $lines) {
    if ($l -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $state = if ($Matches[2]) { 'dolu' } else { 'BOS  <-- doldur' }
        Write-Host ("  {0,-40} {1}" -f $Matches[1], $state)
    }
}
if ($missing) {
    Write-Host ''
    Write-Host "Eksik: $($missing -join ', ')"
}
