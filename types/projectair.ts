export interface ProjectairFact {
  term: string;
  description: string;
}

export interface ProjectairTile {
  title: string;
  body?: string;
  items?: readonly string[];
  status?: string;
}

export interface ProjectairNote {
  title: string;
  body: string;
  tone: "info" | "pending";
  links?: readonly ProjectairLink[];
}

export interface ProjectairLink {
  label: string;
  href: string;
}

export interface ProjectairSection {
  id: string;
  number: string;
  kicker: string;
  title: string;
  intro?: readonly string[];
  facts?: readonly ProjectairFact[];
  tiles?: readonly ProjectairTile[];
  flow?: readonly string[];
  outro?: readonly string[];
  note?: ProjectairNote;
}

export interface ProjectairDocument {
  eyebrow: string;
  version: string;
  title: string;
  summary: string;
  phases: readonly string[];
  sections: readonly ProjectairSection[];
  filesFolder: ProjectairLink;
  files: readonly ProjectairLink[];
  footer: string;
}
