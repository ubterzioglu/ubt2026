import { readFileSync, writeFileSync } from "fs";

const data = JSON.parse(readFileSync("cvopt_participants_rows.json", "utf-8"));

function normalizeWhatsapp(num) {
  const stripped = num.replace(/[^\d+]/g, "");
  let digits = stripped.replace(/^\+0?/, "");
  const hasPlus = stripped.startsWith("+");

  if (hasPlus && digits.startsWith("90")) return "+" + digits;
  if (hasPlus && digits.startsWith("49")) return "+" + digits;
  if (hasPlus && digits.startsWith("40")) return "+" + digits;
  if (hasPlus && digits.startsWith("41")) return "+" + digits;
  if (hasPlus && digits.length >= 10) return "+" + digits;

  if (digits.startsWith("90") && digits.length >= 12) return "+" + digits;
  if (digits.startsWith("49") && digits.length >= 11) return "+" + digits;
  if (digits.startsWith("0") && digits.length >= 12) return "+49" + digits.slice(1);
  if (digits.startsWith("0") && digits.length === 11) return "+90" + digits.slice(1);
  if (digits.length === 10 && digits.startsWith("5")) return "+90" + digits;
  return "+" + digits;
}

function normalizeLinkedin(url) {
  let fixed = url;
  if (fixed.startsWith("httpshttps://")) fixed = "https://" + fixed.slice("httpshttps://".length);
  if (fixed.startsWith("httphttps://")) fixed = "https://" + fixed.slice("httphttps://".length);
  if (!fixed.match(/^https?:\/\//)) fixed = "https://" + fixed;
  return fixed;
}

function esc(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const seenWhatsapp = new Map();
const values = [];
const skipped = [];

for (const row of data) {
  const whatsapp = normalizeWhatsapp(row.whatsapp);
  const whatsappKey = whatsapp.replace(/[^\d]/g, "");

  if (seenWhatsapp.has(whatsappKey)) {
    skipped.push({
      name: row.name,
      id: row.id,
      whatsapp,
      duplicateOf: seenWhatsapp.get(whatsappKey)
    });
    continue;
  }
  seenWhatsapp.set(whatsappKey, row.id);

  const id = esc(row.id);
  const fullName = esc(row.name);
  const whatsappNumber = esc(whatsapp);
  const linkedinUrl = esc(normalizeLinkedin(row.linkedin));
  const status = esc(row.approved ? "approved" : "new");
  const cvReviewed = row.cv_ok ? "true" : "false";
  const linkedinReviewed = row.linkedin_ok ? "true" : "false";
  const createdAt = esc(row.created_at);
  const updatedAt = esc(row.updated_at);

  values.push(`  (${id}, ${fullName}, ${whatsappNumber}, ${linkedinUrl}, ${status}, ${cvReviewed}, ${linkedinReviewed}, ${createdAt}, ${updatedAt})`);
}

const sql = `INSERT INTO public.cv_review_requests
  (id, full_name, whatsapp_number, linkedin_url, status, cv_reviewed, linkedin_reviewed, created_at, updated_at)
VALUES
${values.join(",\n")}
ON CONFLICT (id) DO NOTHING;
`;

writeFileSync("insert_cvopt_to_review_requests.sql", sql, "utf-8");

console.log(`Done: ${values.length} rows written to insert_cvopt_to_review_requests.sql`);
if (skipped.length > 0) {
  console.log(`\nSkipped ${skipped.length} duplicate(s):`);
  skipped.forEach((s) =>
    console.log(`  - ${s.name} (${s.id}) duplicate WhatsApp ${s.whatsapp}, keeping ${s.duplicateOf}`)
  );
}
