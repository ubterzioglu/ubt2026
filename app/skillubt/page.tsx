import { readFile } from "node:fs/promises";
import path from "node:path";

const README_PATH = path.join(
  process.cwd(),
  "public",
  "skillubt",
  "requirements-interview-package",
  "README.html"
);

export default async function SkillUbtPage() {
  const html = await readFile(README_PATH, "utf8");
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
