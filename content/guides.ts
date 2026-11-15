import type { Guide } from "@/types/guides";

export const guides = [
  {
    id: "150-skills",
    title: "150 Skills for Claude Code, Kilo Code and Codex",
    description: "Claude Code, Kilo Code ve Codex için 150 skill: kurulum ve kullanım rehberi.",
    files: [
      {
        language: "TR",
        title: "Claude Code, Kilo Code ve Codex için 150 skill",
        href: "/guides/150-skill-rehberi-tr.pdf",
        pages: 80,
        sizeLabel: "0.7 MB"
      },
      {
        language: "EN",
        title: "150 Skills for Claude Code, Kilo Code, and Codex",
        href: "/guides/150-skills-guide-en.pdf",
        pages: 80,
        sizeLabel: "0.7 MB"
      }
    ]
  },
  {
    id: "chatgpt",
    title: "ChatGPT Cheat Sheet",
    description: "ChatGPT'den daha net, daha hızlı ve daha kullanışlı sonuç almak için temelden ileriye özet.",
    files: [
      {
        language: "TR",
        title: "ChatGPT Cheat Sheet · Temel ve İleri Seviye",
        href: "/guides/chatgpt-cheat-sheet-tr.pdf",
        pages: 20,
        sizeLabel: "3.5 MB"
      },
      {
        language: "EN",
        title: "ChatGPT Cheat Sheet · From Basics to Advanced",
        href: "/guides/chatgpt-cheat-sheet-en.pdf",
        pages: 20,
        sizeLabel: "1.2 MB"
      }
    ]
  },
  {
    id: "claude",
    title: "Claude Cheat Sheet",
    description: "Uzun metin, analiz ve yazı işlerinde Claude'dan en iyi verimi almak için pratik özet.",
    files: [
      {
        language: "TR",
        title: "Claude Cheat Sheet · Temel ve İleri Seviye",
        href: "/guides/claude-cheat-sheet-tr.pdf",
        pages: 20,
        sizeLabel: "3.5 MB"
      },
      {
        language: "EN",
        title: "Claude Cheat Sheet · From Basics to Advanced",
        href: "/guides/claude-cheat-sheet-en.pdf",
        pages: 20,
        sizeLabel: "1.2 MB"
      }
    ]
  },
  {
    id: "gemini",
    title: "Gemini Cheat Sheet",
    description: "Google uygulamalarıyla birlikte Gemini'yi etkili kullanmak için pratik özet.",
    files: [
      {
        language: "TR",
        title: "Gemini Cheat Sheet · Temel ve İleri Seviye",
        href: "/guides/gemini-cheat-sheet-tr.pdf",
        pages: 20,
        sizeLabel: "3.5 MB"
      },
      {
        language: "EN",
        title: "Gemini Cheat Sheet · From Basics to Advanced",
        href: "/guides/gemini-cheat-sheet-en.pdf",
        pages: 20,
        sizeLabel: "1.2 MB"
      }
    ]
  }
] as const satisfies readonly Guide[];
