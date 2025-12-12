import { apiClient } from "@api/apiClient";
import { type RuleDetail, type RuleDetailResponse, type RuleListResponse } from "@appTypes/Rules/Rule";

const baseUrl = "/rules";

export interface RuleQueryOptions {
  category?: string;
  tag?: string;
  source?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

function buildQuery(params: RuleQueryOptions): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.append(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getRulesList(options: RuleQueryOptions = {}): Promise<RuleListResponse> {
  const query = buildQuery(options);
  const res = await apiClient<RuleListResponse | Record<string, unknown>>(`${baseUrl}${query}`, { method: "GET" });
  const rawItems = (res as RuleListResponse)?.items ?? (res as any)?.Items ?? [];
  const total = (res as RuleListResponse)?.total ?? (res as any)?.Total ?? 0;
  const nextCursor = (res as RuleListResponse)?.nextCursor ?? (res as any)?.NextCursor;

  return {
    items: Array.isArray(rawItems) ? rawItems.map(normalizeRuleDetailOrSnippet) : [],
    total,
    nextCursor,
  };
}

export async function getRuleDetail(slug: string): Promise<RuleDetail | null> {
  if (!slug?.trim()) throw new Error("Rule slug is required");
  try {
    const res = await apiClient<RuleDetailResponse | Record<string, unknown>>(
      `${baseUrl}/${encodeURIComponent(slug)}`,
      { method: "GET" },
    );
    const detail = (res as RuleDetailResponse)?.rule ?? (res as any)?.Rule;
    return detail ? normalizeRuleDetailOrSnippet(detail) : null;
  } catch (error) {
    console.error("Failed to fetch rule detail:", error);
    return null;
  }
}

export async function createRule(rule: RuleDetail, token: string): Promise<RuleDetail | null> {
  if (!rule) throw new Error("Rule payload is required");
  const res = await apiClient<RuleDetailResponse | Record<string, unknown>>(baseUrl, {
    method: "POST",
    body: rule,
    token,
  });
  const detail = (res as RuleDetailResponse)?.rule ?? (res as any)?.Rule;
  return detail ? normalizeRuleDetailOrSnippet(detail) : null;
}

function normalizeRuleSource(src: any) {
  if (!src) return undefined;
  return {
    title: src.title ?? src.Title ?? "",
    page: src.page ?? src.Page,
    edition: src.edition ?? src.Edition,
    url: src.url ?? src.Url,
  };
}

function normalizeRuleExample(example: any) {
  if (!example) return undefined;
  return {
    title: example.title ?? example.Title,
    description: example.description ?? example.Description ?? "",
    outcome: example.outcome ?? example.Outcome,
  };
}

function normalizeRuleReference(reference: any) {
  if (!reference) return undefined;
  return {
    type: reference.type ?? reference.Type ?? "",
    id: reference.id ?? reference.Id,
    name: reference.name ?? reference.Name ?? "",
    url: reference.url ?? reference.Url,
  };
}

function normalizeRuleDetailOrSnippet(raw: any): RuleDetail {
  const sources = (raw.sources ?? raw.Sources) as any[] | undefined;
  const examples = (raw.examples ?? raw.Examples) as any[] | undefined;
  const references = (raw.references ?? raw.References) as any[] | undefined;

  return {
    id: raw.id ?? raw.Id,
    slug: raw.slug ?? raw.Slug ?? "",
    title: raw.title ?? raw.Title ?? "",
    category: raw.category ?? raw.Category ?? "",
    summary: raw.summary ?? raw.Summary ?? "",
    tags: raw.tags ?? raw.Tags ?? [],
    updatedAt: raw.updatedAt ?? raw.UpdatedAt,
    source: normalizeRuleSource(raw.source ?? raw.Source),
    body: raw.body ?? raw.Body,
    sources: sources?.map(normalizeRuleSource).filter(Boolean),
    examples: examples?.map(normalizeRuleExample).filter(Boolean),
    references: references?.map(normalizeRuleReference).filter(Boolean),
    relatedRuleSlugs: raw.relatedRuleSlugs ?? raw.RelatedRuleSlugs,
  };
}
