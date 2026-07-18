// /dmscraper bölümlerinin paylaştığı küçük biçimleyiciler.

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin"
  }).format(date);
}

export function formatUsd(value: number): string {
  return `$${(Math.round(value * 10_000) / 10_000).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}`;
}
