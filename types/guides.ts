export type GuideLanguage = "tr" | "en";

export type GuideTone = "lime" | "cyan" | "pink" | "orange";

export type LocalizedText = Readonly<Record<GuideLanguage, string>>;

export interface GuideFile {
  href: string;
  pages: number;
  sizeLabel: string;
}

export interface Guide {
  id: string;
  tone: GuideTone;
  tag: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  files: Readonly<Record<GuideLanguage, GuideFile>>;
}

export interface GuidesCopy {
  languageLabel: string;
  eyebrow: string;
  titleLead: string;
  titleAccent: string;
  intro: string;
  statLabels: Readonly<{ guides: string; files: string; pages: string; price: string }>;
  priceValue: string;
  pagesUnit: string;
  openPdf: string;
  footer: string;
}
