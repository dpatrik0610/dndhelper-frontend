import type { RuleInput } from "@appTypes/Rules/Rule";

type Raw = Record<string, unknown>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const strings = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

function sourceOf(v: unknown) {
  if (typeof v === "string") return v.trim();
  if (!v || typeof v !== "object") return "";
  const title = str((v as Raw).title);
  const page = str((v as Raw).page);
  return title && page ? `${title} p.${page}` : title;
}

export function toRuleInput(raw: unknown): RuleInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const title = str(r.title);
  if (!title) return null;

  const summary = str(r.summary);
  const body = strings(r.body).filter((p) => p !== summary);
  const content = str(r.content) || [summary, ...body].filter(Boolean).join("\n\n");

  return {
    title,
    category: str(r.category) || "General",
    tags: strings(r.tags),
    content,
    source: sourceOf(r.source),
  };
}
