import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Element, Root as HastRoot } from "hast";
import { select, selectAll } from "hast-util-select";
import type { Heading, Link, Nodes as MdastNodes, Root as MdastRoot } from "mdast";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import { headingSlug } from "../lib/heading-slug";

const DRIVE_FILE_ID = "1u0uvJZX_61CEDXVq0w2RhiZy9PuXickG";
const DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;
const SOURCE_SELECTOR = "#tam-plan .full-document";
const EXPECTED_HEADING = "Havacılık Bakım Eğitim Platformu";
const MIN_SECTION_HEADINGS = 20;
const TARGET_FILE = path.join(process.cwd(), "content", "projectair-plan.ts");
const EXPORT_NAME = "PROJECTAIR_PLAN_MARKDOWN";

class SyncError extends Error {}

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function downloadHtml(): Promise<string> {
  let response: Response;
  try {
    response = await fetch(DOWNLOAD_URL, { redirect: "follow" });
  } catch (error) {
    throw new SyncError(`Drive isteği başarısız: ${(error as Error).message}`);
  }

  const finalHost = new URL(response.url).hostname;
  if (finalHost === "accounts.google.com") {
    throw new SyncError(
      "Drive giriş sayfasına yönlendirdi. Dosya 'Bağlantıya sahip herkes: Görüntüleyen' olarak paylaşılmalı."
    );
  }
  if (!response.ok) {
    throw new SyncError(`Drive HTTP ${response.status} döndürdü.`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new SyncError(`Beklenmeyen içerik türü: ${contentType || "yok"}.`);
  }
  return response.text();
}

function textOf(node: MdastNodes | Element): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node) {
    return (node.children as (MdastNodes | Element)[]).map((child) => textOf(child)).join("");
  }
  return "";
}

function extractArticle(html: string): Element {
  const tree = unified().use(rehypeParse).parse(html) as HastRoot;
  const article = select(SOURCE_SELECTOR, tree);
  if (!article) {
    throw new SyncError(`İndirilen HTML'de '${SOURCE_SELECTOR}' bölümü yok; proje dokümanı değil.`);
  }
  const title = select("h2", article);
  if (!title || !textOf(title).includes(EXPECTED_HEADING)) {
    throw new SyncError(`Ana plan başlığı '${EXPECTED_HEADING}' bulunamadı.`);
  }
  const sections = selectAll("h3", article).length;
  if (sections < MIN_SECTION_HEADINGS) {
    throw new SyncError(`Ana planda yalnızca ${sections} bölüm başlığı var; içerik eksik görünüyor.`);
  }
  return article;
}

async function toMarkdown(article: Element): Promise<{ markdown: string; tree: MdastRoot }> {
  const hast: HastRoot = { type: "root", children: article.children };
  const processor = unified()
    .use(rehypeRemark)
    .use(remarkGfm, { tablePipeAlign: false })
    .use(remarkStringify, { bullet: "-", emphasis: "_", rule: "-", fences: true });
  const tree = (await processor.run(hast)) as MdastRoot;
  const markdown = processor.stringify(tree).trim() + "\n";
  return { markdown, tree };
}

function collect<T extends MdastNodes>(node: MdastNodes, type: T["type"], found: T[] = []): T[] {
  if (node.type === type) found.push(node as T);
  if ("children" in node) node.children.forEach((child) => collect(child as MdastNodes, type, found));
  return found;
}

function brokenAnchors(tree: MdastRoot): string[] {
  const ids = new Set(collect<Heading>(tree, "heading").map((heading) => headingSlug(textOf(heading))));
  return collect<Link>(tree, "link")
    .map((link) => link.url)
    .filter((url) => url.startsWith("#"))
    .map((url) => decodeURIComponent(url.slice(1)))
    .filter((id) => !ids.has(id));
}

function toModule(markdown: string): string {
  const body = markdown.replace(/`/g, '${"`"}').replace(/\$\{(?!"`"\})/g, '${"$"}{');
  return `export const ${EXPORT_NAME} = String.raw\`\n${body}\`;\n`;
}

async function main(): Promise<void> {
  const localFile = readArg("--file");
  const html = localFile ? await readFile(localFile, "utf8") : await downloadHtml();
  const article = extractArticle(html);
  const { markdown, tree } = await toMarkdown(article);

  const broken = brokenAnchors(tree);
  if (broken.length > 0) {
    console.warn(`Uyarı: hedefi olmayan ${broken.length} iç bağlantı: ${broken.join(", ")}`);
  }

  const next = toModule(markdown);
  const current = await readFile(TARGET_FILE, "utf8").catch(() => "");
  if (current === next) {
    console.log("Değişiklik yok; content/projectair-plan.ts güncel.");
    return;
  }
  await writeFile(TARGET_FILE, next, "utf8");
  console.log("content/projectair-plan.ts güncellendi.");
}

main().catch((error: unknown) => {
  const message = error instanceof SyncError ? error.message : String(error);
  console.error(`Senkronizasyon durdu, mevcut içerik korunuyor: ${message}`);
  process.exit(1);
});
