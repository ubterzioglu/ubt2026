import type { SourceState } from "@/types/source-state";

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

export type GuideEventType = "view" | "switch" | "open";

export interface GuideEvent {
  id: string;
  event: GuideEventType;
  guideId: string | null;
  language: GuideLanguage;
  visitorId: string;
  isNewVisitor: boolean;
  referrerHost: string | null;
  createdAt: string;
}

export interface GuideOpenCount {
  id: string;
  title: string;
  tr: number;
  en: number;
  total: number;
}

export interface GuideDailyCount {
  date: string;
  views: number;
  opens: number;
}

export interface GuideStats {
  views: number;
  uniqueVisitors: number;
  switches: number;
  opens: number;
  uniqueOpeners: number;
  last24hViews: number;
  last24hOpens: number;
  viewsByLanguage: Readonly<Record<GuideLanguage, number>>;
  opensByGuide: readonly GuideOpenCount[];
  referrers: readonly { host: string; count: number }[];
  daily: readonly GuideDailyCount[];
  recent: readonly GuideEvent[];
  firstEventAt: string | null;
}

export interface GuideStatsResult {
  source: SourceState;
  stats: GuideStats | null;
  errorMessage?: string;
}
