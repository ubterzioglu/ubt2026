export const revalidate = 86400;

const SECURITY_TXT = `Contact: mailto:ubterzioglu@gmail.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, de, tr
Canonical: https://ubterzioglu.de/.well-known/security.txt
Policy: https://ubterzioglu.de/privacy
`;

export function GET() {
  return new Response(SECURITY_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
