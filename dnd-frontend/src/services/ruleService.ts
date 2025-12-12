import { apiClient } from "@api/apiClient";
import {
  type RuleDetail,
  type RuleDetailResponse,
  type RuleListResponse,
  type RuleSource,
  type RuleExample,
  type RuleReference,
} from "@appTypes/Rules/Rule";

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
  const rawItems = (res as RuleListResponse)?.items ?? (res as { Items?: unknown })?.Items ?? [];
  const total = (res as RuleListResponse)?.total ?? (res as { Total?: unknown })?.Total ?? 0;
  const nextCursorRaw = (res as RuleListResponse)?.nextCursor ?? (res as { NextCursor?: unknown })?.NextCursor;
  const nextCursor = typeof nextCursorRaw === "string" ? nextCursorRaw : undefined;

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
    const detail = (res as RuleDetailResponse)?.rule ?? (res as { Rule?: unknown })?.Rule;
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
  const detail = (res as RuleDetailResponse)?.rule ?? (res as { Rule?: unknown })?.Rule;
  return detail ? normalizeRuleDetailOrSnippet(detail) : null;
}

function normalizeRuleSource(src: unknown): RuleSource | undefined {
  if (!src || typeof src !== "object") return undefined;
  const s = src as Record<string, unknown>;
  return {
    title: (s.title as string) ?? (s.Title as string) ?? "",
    page: (s.page as string) ?? (s.Page as string),
    edition: (s.edition as string) ?? (s.Edition as string),
    url: (s.url as string) ?? (s.Url as string),
  };
}

function normalizeRuleExample(example: unknown): RuleExample | undefined {
  if (!example || typeof example !== "object") return undefined;
  const e = example as Record<string, unknown>;
  return {
    title: (e.title as string) ?? (e.Title as string),
    description: (e.description as string) ?? (e.Description as string) ?? "",
    outcome: (e.outcome as string) ?? (e.Outcome as string),
  };
}

function normalizeRuleReference(reference: unknown): RuleReference | undefined {
  if (!reference || typeof reference !== "object") return undefined;
  const r = reference as Record<string, unknown>;
  return {
    type: (r.type as string) ?? (r.Type as string) ?? "",
    id: (r.id as string) ?? (r.Id as string),
    name: (r.name as string) ?? (r.Name as string) ?? "",
    url: (r.url as string) ?? (r.Url as string),
  };
}

function normalizeRuleDetailOrSnippet(raw: unknown): RuleDetail {
  const data = raw as Record<string, unknown>;
  const sources = (data.sources ?? data.Sources) as unknown[] | undefined;
  const examples = (data.examples ?? data.Examples) as unknown[] | undefined;
  const references = (data.references ?? data.References) as unknown[] | undefined;
  const normalizedSources = sources?.map(normalizeRuleSource).filter((val): val is RuleSource => Boolean(val));
  const normalizedExamples = examples?.map(normalizeRuleExample).filter((val): val is RuleExample => Boolean(val));
  const normalizedReferences = references?.map(normalizeRuleReference).filter((val): val is RuleReference => Boolean(val));

  return {
    id: (data.id as string) ?? (data.Id as string),
    slug: (data.slug as string) ?? (data.Slug as string) ?? "",
    title: (data.title as string) ?? (data.Title as string) ?? "",
    category: (data.category as string) ?? (data.Category as string) ?? "",
    summary: (data.summary as string) ?? (data.Summary as string) ?? "",
    tags: (data.tags as string[]) ?? (data.Tags as string[]) ?? [],
    updatedAt: (data.updatedAt as string) ?? (data.UpdatedAt as string),
    source: normalizeRuleSource(data.source ?? data.Source),
    body: (data.body as string[]) ?? (data.Body as string[]),
    sources: normalizedSources,
    examples: normalizedExamples,
    references: normalizedReferences,
    relatedRuleSlugs: (data.relatedRuleSlugs as string[]) ?? (data.RelatedRuleSlugs as string[]),
  };
}
