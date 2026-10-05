import type { Note } from "@appTypes/Note";

const TAG_REGEX = /#[a-zA-Z0-9_-]+/g;

/** The note's Markdown body (stored one line per entry). */
export const noteBody = (note: Note) => (note.lines ?? []).join("\n");

/** #tags written anywhere in the title or body, lowercased and without the #. */
export const noteTags = (note: Note) => {
  const matches = `${note.title ?? ""} ${noteBody(note)}`.match(TAG_REGEX) ?? [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "3 hours ago", "yesterday", "just now". */
export const timeAgo = (date: string) => {
  const seconds = (Date.parse(date) - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
};

const fileName = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").replace(/--+/g, "-") || "note";

/** Saves the note as a .md file, title as the first heading (the format Import reads back). */
export const downloadNote = (note: Note) => {
  const title = note.title || "Untitled";
  const blob = new Blob([`# ${title}\n\n${noteBody(note)}`], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName(title)}.md`;
  link.click();
  URL.revokeObjectURL(url);
};
