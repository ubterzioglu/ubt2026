import type { Guide, GuideLanguage, GuidesCopy } from "@/types/guides";

export const GUIDE_LANGUAGES = ["en", "tr"] as const satisfies readonly GuideLanguage[];

export const DEFAULT_GUIDE_LANGUAGE: GuideLanguage = "tr";

export const guidesCopy = {
  tr: {
    languageLabel: "Türkçe",
    eyebrow: "AI Rehberleri · Ücretsiz PDF",
    titleLead: "AI'ı konuşturmanın",
    titleAccent: "kısa yolu.",
    intro:
      "Prompt yazmayı bırak, sonuç almaya başla. ChatGPT, Claude ve Gemini için cheat sheet'ler, üstüne Claude Code, Kilo Code ve Codex için 150 skill. Direkt PDF.",
    statLabels: { guides: "rehber", files: "PDF", pages: "sayfa", price: "ücret" },
    priceValue: "0 TL",
    pagesUnit: "sayfa",
    openPdf: "PDF'i aç",
    footer: "İndir · paylaş · uygula"
  },
  en: {
    languageLabel: "English",
    eyebrow: "AI Guides · Free PDF",
    titleLead: "The shortcut to",
    titleAccent: "talking AI.",
    intro:
      "Stop wrestling with prompts, start getting results. Cheat sheets for ChatGPT, Claude and Gemini, plus 150 skills for Claude Code, Kilo Code and Codex. Straight to PDF.",
    statLabels: { guides: "guides", files: "PDFs", pages: "pages", price: "price" },
    priceValue: "Free",
    pagesUnit: "pages",
    openPdf: "Open PDF",
    footer: "Download · share · ship"
  }
} as const satisfies Readonly<Record<GuideLanguage, GuidesCopy>>;

export const guidesMarquee = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Claude Code",
  "Kilo Code",
  "Codex",
  "150 skills",
  "Free PDF"
] as const;

export const guides = [
  {
    id: "150-skills",
    tone: "lime",
    tag: { tr: "Dev mode", en: "Dev mode" },
    title: {
      tr: "Claude Code, Kilo Code ve Codex için 150 skill",
      en: "150 Skills for Claude Code, Kilo Code and Codex"
    },
    description: {
      tr: "Kodlama asistanların için 150 hazır skill: ne işe yaradıkları, nasıl kurulup kullanıldıkları.",
      en: "150 ready-made skills for your coding agents: what they do, how to install and use them."
    },
    files: {
      tr: { href: "/guides/150-skill-rehberi-tr.pdf", pages: 80, sizeLabel: "0.7 MB" },
      en: { href: "/guides/150-skills-guide-en.pdf", pages: 80, sizeLabel: "0.7 MB" }
    }
  },
  {
    id: "chatgpt",
    tone: "cyan",
    tag: { tr: "Günlük kullanım", en: "Daily driver" },
    title: { tr: "ChatGPT Cheat Sheet", en: "ChatGPT Cheat Sheet" },
    description: {
      tr: "ChatGPT'den daha net, daha hızlı ve daha kullanışlı sonuç almak için temelden ileriye özet.",
      en: "A quick reference for getting clearer, faster and more useful results from ChatGPT, from basics to advanced."
    },
    files: {
      tr: { href: "/guides/chatgpt-cheat-sheet-tr.pdf", pages: 20, sizeLabel: "3.5 MB" },
      en: { href: "/guides/chatgpt-cheat-sheet-en.pdf", pages: 20, sizeLabel: "1.2 MB" }
    }
  },
  {
    id: "claude",
    tone: "orange",
    tag: { tr: "Derin iş", en: "Deep work" },
    title: { tr: "Claude Cheat Sheet", en: "Claude Cheat Sheet" },
    description: {
      tr: "Uzun metin, analiz ve yazı işlerinde Claude'dan en iyi verimi almak için pratik özet.",
      en: "A quick reference for getting the most out of Claude for long documents, analysis and writing."
    },
    files: {
      tr: { href: "/guides/claude-cheat-sheet-tr.pdf", pages: 20, sizeLabel: "3.5 MB" },
      en: { href: "/guides/claude-cheat-sheet-en.pdf", pages: 20, sizeLabel: "1.2 MB" }
    }
  },
  {
    id: "gemini",
    tone: "pink",
    tag: { tr: "Google ekosistemi", en: "Google stack" },
    title: { tr: "Gemini Cheat Sheet", en: "Gemini Cheat Sheet" },
    description: {
      tr: "Google uygulamalarıyla birlikte Gemini'yi etkili kullanmak için pratik özet.",
      en: "A quick reference for using Gemini effectively with Google apps."
    },
    files: {
      tr: { href: "/guides/gemini-cheat-sheet-tr.pdf", pages: 20, sizeLabel: "3.5 MB" },
      en: { href: "/guides/gemini-cheat-sheet-en.pdf", pages: 20, sizeLabel: "1.2 MB" }
    }
  }
] as const satisfies readonly Guide[];
