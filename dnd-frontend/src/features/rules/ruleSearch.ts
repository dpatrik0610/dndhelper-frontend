export interface RuleQuery {
  terms: string[];
  tags: string[];
  categories: string[];
}

interface Searchable {
  title: string;
  category: string;
  tags: string[];
  content: string;
}

export interface RuleHit<T> {
  rule: T;
  score: number;
  snippet?: string;
}

const TOKEN = /(\w+):"([^"]*)"|(\w+):(\S+)|"([^"]*)"|(\S+)/g;
const TAG_KEYS = new Set(["tag", "tags", "t"]);
const CATEGORY_KEYS = new Set(["cat", "category", "in", "c"]);

export function parseQuery(input: string): RuleQuery {
  const query: RuleQuery = { terms: [], tags: [], categories: [] };
  for (const m of input.matchAll(TOKEN)) {
    const key = (m[1] ?? m[3])?.toLowerCase();
    const value = (m[2] ?? m[4] ?? m[5] ?? m[6] ?? "").trim().toLowerCase();
    if (!value) continue;
    if (key && TAG_KEYS.has(key)) query.tags.push(value);
    else if (key && CATEGORY_KEYS.has(key)) query.categories.push(value);
    else if (!key && value.startsWith("#") && value.length > 1) query.tags.push(value.slice(1));
    else query.terms.push(key ? `${key}:${value}` : value);
  }
  return query;
}

export const plainText = (markdown: string) =>
  markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~|]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function excerpt(markdown: string, length = 140) {
  const text = plainText(markdown);
  return text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")}…` : text;
}

function snippetAround(text: string, index: number, termLength: number) {
  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + termLength + 80);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

function termScore(rule: Searchable, title: string, term: string, body: string) {
  if (title === term) return 12;
  if (title.startsWith(term)) return 8;
  if (title.includes(term)) return 5;
  if (rule.tags.some((t) => t.toLowerCase().includes(term))) return 3;
  if (rule.category.toLowerCase().includes(term)) return 2;
  return body.includes(term) ? 1 : 0;
}

export function searchRules<T extends Searchable>(rules: T[], input: string): RuleHit<T>[] {
  const query = parseQuery(input);
  const hits: RuleHit<T>[] = [];

  for (const rule of rules) {
    const category = rule.category.toLowerCase();
    if (query.categories.length && !query.categories.some((c) => category.includes(c))) continue;
    const tags = rule.tags.map((t) => t.toLowerCase());
    if (!query.tags.every((q) => tags.some((t) => t.includes(q)))) continue;

    const title = rule.title.toLowerCase();
    const text = query.terms.length ? plainText(rule.content) : "";
    const body = text.toLowerCase();
    let score = 0;
    let missed = false;
    for (const term of query.terms) {
      const s = termScore(rule, title, term, body);
      if (s === 0) {
        missed = true;
        break;
      }
      score += s;
    }
    if (missed) continue;

    const first = query.terms.find((t) => !title.includes(t) && body.includes(t));
    hits.push({ rule, score, snippet: first ? snippetAround(text, body.indexOf(first), first.length) : undefined });
  }

  return query.terms.length ? hits.sort((a, b) => b.score - a.score || a.rule.title.localeCompare(b.rule.title)) : hits;
}
