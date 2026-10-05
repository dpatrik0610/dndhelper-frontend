/**
 * :shortcode: emoji (the common Slack-style "iamcal" set from emojibase: :joy:, :+1:, :fire:, :crossed_swords:).
 * The 48 kB table loads on first use, not with the page.
 */
export interface Shortcode {
  name: string;
  emoji: string;
}

export interface ShortcodeTable {
  /** By name, for prefix search. */
  list: Shortcode[];
  byName: Map<string, string>;
}

/** Name characters, as in the set (e.g. "+1", "e-mail", "crossed_swords"). */
const NAME = "[a-z0-9_+-]";
/** ":dra" right before the caret, after a space or at the start (so times like 10:30 don't trigger it). */
const QUERY = new RegExp(`(?:^|\\s):(${NAME}{2,})$`, "i");
/** ":dragon_face:" right before the caret, just closed. */
const CLOSED = new RegExp(`:(${NAME}+):$`, "i");
const ANY_CLOSED = new RegExp(`:(${NAME}+):`, "gi");

/** "1F44D" → 👍. Lone BMP symbols (❤, ⚔) get the emoji presentation selector so they draw in color. */
const toEmoji = (hexcode: string) => {
  const points = hexcode.split("-").map((h) => parseInt(h, 16));
  const emoji = String.fromCodePoint(...points);
  return points.length === 1 && points[0] < 0x1f000 ? emoji + "️" : emoji;
};

let table: Promise<ShortcodeTable> | null = null;

export function loadShortcodes(): Promise<ShortcodeTable> {
  table ??= import("emojibase-data/en/shortcodes/iamcal.json").then(({ default: data }) => {
    const list: Shortcode[] = [];
    for (const [hexcode, names] of Object.entries(data as Record<string, string | string[]>)) {
      const emoji = toEmoji(hexcode);
      for (const name of Array.isArray(names) ? names : [names]) list.push({ name, emoji });
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return { list, byName: new Map(list.map((s) => [s.name, s.emoji])) };
  });
  return table;
}

/** The ":query" being typed before the caret, with where its colon starts. */
export function shortcodeQuery(beforeCaret: string): { start: number; query: string } | null {
  const match = QUERY.exec(beforeCaret);
  return match ? { start: beforeCaret.length - match[1].length - 1, query: match[1].toLowerCase() } : null;
}

/** Names starting with the query first, then names containing it. */
export function suggestShortcodes({ list }: ShortcodeTable, query: string, limit = 8): Shortcode[] {
  const starts = list.filter((s) => s.name.startsWith(query));
  const contains = starts.length < limit ? list.filter((s) => !s.name.startsWith(query) && s.name.includes(query)) : [];
  return [...starts, ...contains].slice(0, limit);
}

/** If the text before the caret just closed a known ":name:", returns it with that shortcode replaced. */
export function replaceClosedShortcode({ byName }: ShortcodeTable, beforeCaret: string): string | null {
  const match = CLOSED.exec(beforeCaret);
  const emoji = match && byName.get(match[1].toLowerCase());
  return emoji ? beforeCaret.slice(0, match.index) + emoji : null;
}

/** Every known ":name:" in the text becomes its emoji; unknown ones stay as typed. */
export const replaceShortcodes = ({ byName }: ShortcodeTable, text: string) =>
  text.replace(ANY_CLOSED, (whole, name: string) => byName.get(name.toLowerCase()) ?? whole);
