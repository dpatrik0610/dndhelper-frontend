import type { Note } from "./engine";

type Shown = Note & { id: number; ms: number };

const MAX = 4;
let list: Shown[] = [];
export const notes = () => list;
let seq = 0;
const subs = new Set<() => void>();
const emit = () => {
  for (const f of subs) f();
};
export const subscribe = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};

const readMs = (n: Note) => Math.min(14000, 4000 + ((n.title?.length ?? 0) + n.text.length) * 60);

export function pushNote(n: Note) {
  const shown = { ...n, id: ++seq, ms: readMs(n) };
  list = [...list.filter((s) => s.title !== n.title || s.text !== n.text), shown].slice(-MAX);
  emit();
  setTimeout(() => {
    list = list.filter((s) => s.id !== shown.id);
    emit();
  }, shown.ms);
}
