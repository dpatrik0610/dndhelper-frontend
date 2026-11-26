export interface Rule {
  id: string;
  campaignId: string | null;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  source?: string | null;
  updatedAt?: string;
}

export type RuleInput = Pick<Rule, "title" | "category" | "tags" | "content" | "source">;
