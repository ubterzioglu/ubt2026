export interface GuideFile {
  language: "TR" | "EN";
  title: string;
  href: string;
  pages: number;
  sizeLabel: string;
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  files: readonly GuideFile[];
}
