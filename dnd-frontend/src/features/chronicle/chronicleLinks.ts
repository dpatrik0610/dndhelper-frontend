/** Obsidian-style [[Title]] / [[Title|alias]] links, resolved by title (case-insensitive) against the entries we can see. */

export interface Linkable {
  id: string;
  title: string;
  content: string;
}

export interface WikiLink {
  target: string;
  alias: string | null;
}

const LINK = /\[\[([^\]\n|]+)(?:\|([^\]\n]+))?\]\]/g;
/** Mirrors ChronicleService.StripSecrets: an unclosed %% hides the rest. */
const SECRET = /%%([\s\S]*?)(?:%%|$)/g;

const key = (title: string) => title.trim().toLowerCase();

export const parseLinks = (content: string): WikiLink[] =>
  [...content.matchAll(LINK)].map((m) => ({
    target: m[1].trim(),
    alias: m[2]?.trim() || null,
  }));

export type TitleIndex<T extends Linkable> = Map<string, T>;

/** First entry wins when two share a title. */
export function titleIndex<T extends Linkable>(entries: T[]): TitleIndex<T> {
  const index = new Map<string, T>();
  for (const e of entries)
    if (!index.has(key(e.title))) index.set(key(e.title), e);
  return index;
}

export const resolveLink = <T extends Linkable>(
  target: string,
  index: TitleIndex<T>,
): T | null => index.get(key(target)) ?? null;

/** Distinct entries this one links to, in order of first mention, without itself. */
export function outgoing<T extends Linkable>(
  entry: T,
  index: TitleIndex<T>,
): T[] {
  const seen = new Set<string>([entry.id]);
  const out: T[] = [];
  for (const link of parseLinks(entry.content)) {
    const target = resolveLink(link.target, index);
    if (target && !seen.has(target.id)) {
      seen.add(target.id);
      out.push(target);
    }
  }
  return out;
}

export const backlinks = <T extends Linkable>(
  entry: T,
  entries: T[],
  index: TitleIndex<T>,
): T[] =>
  entries.filter(
    (e) =>
      e.id !== entry.id && outgoing(e, index).some((t) => t.id === entry.id),
  );

/** Undirected, deduplicated [a, b] pairs for the graph. */
export function linkEdges<T extends Linkable>(
  entries: T[],
  index: TitleIndex<T>,
): [string, string][] {
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  for (const e of entries)
    for (const t of outgoing(e, index)) {
      const pair: [string, string] = e.id < t.id ? [e.id, t.id] : [t.id, e.id];
      const k = pair.join("|");
      if (!seen.has(k)) {
        seen.add(k);
        edges.push(pair);
      }
    }
  return edges;
}

export const sameTitle = (a: string, b: string) => key(a) === key(b);

export const renameLinks = (content: string, from: string, to: string) =>
  content.replace(LINK, (whole, target: string, alias?: string) =>
    sameTitle(target, from)
      ? `[[${to}${alias ? `|${alias.trim()}` : ""}]]`
      : whole,
  );

export interface MissingLink {
  title: string;
  count: number;
}

export function missingLinks<T extends Linkable>(
  entries: T[],
  index: TitleIndex<T>,
): MissingLink[] {
  const found = new Map<string, MissingLink>();
  for (const e of entries) {
    const seen = new Set<string>();
    for (const { target } of parseLinks(e.content)) {
      const k = key(target);
      if (index.has(k) || seen.has(k)) continue;
      seen.add(k);
      const hit = found.get(k);
      if (hit) hit.count++;
      else found.set(k, { title: target, count: 1 });
    }
  }
  return [...found.values()].sort(
    (a, b) => b.count - a.count || a.title.localeCompare(b.title),
  );
}

export const INTERNAL_LINK = "#chronicle/";
export const NEW_LINK = "#chronicle-new/";

const encode = (s: string) =>
  encodeURIComponent(s).replace(/\(/g, "%28").replace(/\)/g, "%29");
const escapeLabel = (s: string) => s.replace(/([[\]\\])/g, "\\$1");

/**
 * Markdown ready for MarkdownRenderer. Links become #chronicle/<id> anchors; unknown titles become #chronicle-new/<title>
 * for the DM (click to create) and plain text for players. %%secrets%% show as a "DM only" note for the DM and vanish
 * for everyone else.
 */
export function toMarkdown<T extends Linkable>(
  content: string,
  index: TitleIndex<T>,
  isDm: boolean,
): string {
  const withSecrets = content.replace(SECRET, (_, inner: string) => {
    const text = inner.trim();
    if (!isDm || !text) return "";
    if (!text.includes("\n")) return `_(DM only: ${text})_`;
    return `\n\n> **DM only**\n> ${text.split("\n").join("\n> ")}\n\n`;
  });

  return withSecrets.replace(
    LINK,
    (_, rawTarget: string, rawAlias?: string) => {
      const target = rawTarget.trim();
      const label = escapeLabel(rawAlias?.trim() || target);
      const hit = resolveLink(target, index);
      if (hit) return `[${label}](${INTERNAL_LINK}${hit.id})`;
      return isDm ? `[${label}](${NEW_LINK}${encode(target)})` : label;
    },
  );
}

export const decodeNewLink = (href: string) =>
  decodeURIComponent(href.slice(NEW_LINK.length));

export interface OutlineItem {
  level: number;
  text: string;
}

/** Plain text of a markdown fragment, as the rendered heading's textContent reads. */
export const plainText = (md: string) =>
  md
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\\([[\]\\])/g, "$1")
    .trim();

/** h1-h3 of rendered markdown (run toMarkdown first), skipping fenced code. */
export function parseOutline(markdown: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const m = !fenced && /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) items.push({ level: m[1].length, text: plainText(m[2]) });
  }
  return items;
}

/** Words in the rendered text, for the status bar. */
export const wordCount = (markdown: string) =>
  plainText(markdown)
    .split(/\s+/)
    .filter((w) => /\w/.test(w)).length;
