import type { Note } from "@appTypes/Note";

const TAG_REGEX = /#[a-zA-Z0-9_-]+/g;

/** The note's Markdown body (stored one line per entry). */
export const noteBody = (note: Note) => (note.lines ?? []).join("\n");

/** #tags written anywhere in the title or body, lowercased and without the #. */
export const noteTags = (note: Note) => {
  const matches = `${note.title ?? ""} ${noteBody(note)}`.match(TAG_REGEX) ?? [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
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
