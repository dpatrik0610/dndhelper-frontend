export enum RuleCategory {
  Core = "Core",
  Combat = "Combat",
  Magic = "Magic",
  Status = "Status",
  Equipment = "Equipment",
  Exploration = "Exploration",
  Downtime = "Downtime",
  Homebrew = "Homebrew",
}

export interface RuleSource {
  title: string;
  page?: string;
  edition?: string;
  url?: string;
}

export interface RuleExample {
  title?: string;
  description: string;
  outcome?: string;
}

export interface RuleReference {
  type: "spell" | "condition" | "item" | "feature" | "class" | "rule" | string;
  id?: string;
  name: string;
  url?: string;
}

export interface RuleSnippet {
  id?: string;
  slug: string;
  title: string;
  category: RuleCategory | string;
  summary: string;
  tags: string[];
  updatedAt?: string;
  source?: RuleSource;
}

export interface RuleDetail extends RuleSnippet {
  body?: string[];
  sources?: RuleSource[];
  examples?: RuleExample[];
  references?: RuleReference[];
  relatedRuleSlugs?: string[];
}

export interface RuleListResponse {
  items: RuleSnippet[];
  total: number;
  nextCursor?: string;
}

export interface RuleDetailResponse {
  rule: RuleDetail;
}
