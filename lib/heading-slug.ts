export function headingSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}
