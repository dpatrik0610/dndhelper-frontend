import type { MiningQuest, OreCounts, QuestNeed } from "@services/miningService";

export const MAX_ACTIVE = 3;

export const isActive = (q: MiningQuest) => q.due !== null;

export const msLeft = (q: MiningQuest, now: number) => (q.due ? Date.parse(q.due) - now : q.minutes * 60_000);

export const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};

export const opensIn = (q: MiningQuest, now: number) => (q.opens && !isActive(q) ? Math.max(0, Date.parse(q.opens) - now) : 0);

export const limitText = (minutes: number) => (minutes % 60 ? `${minutes} min` : `${minutes / 60} h`);

export const needDone = (n: QuestNeed) => n.done >= n.count;

export const questDone = (q: MiningQuest) => q.needs.every(needDone);

export const handedIn = (q: MiningQuest): OreCounts =>
  Object.fromEntries(q.needs.filter((n) => n.kind !== "kill").map((n) => [n.key, n.count]));

export const shortOf = (q: MiningQuest, ores: OreCounts) =>
  Object.entries(handedIn(q)).filter(([key, n]) => (ores[key] ?? 0) < n);

export const questProgress = (q: MiningQuest) =>
  q.needs.reduce((a, n) => a + Math.min(1, n.done / n.count), 0) / Math.max(1, q.needs.length);

export const lapsed = (before: MiningQuest[] | undefined, after: MiningQuest[]) =>
  (before ?? []).filter((b) => isActive(b) && !after.some((q) => q.id === b.id));

export const newlyDone = (before: MiningQuest[] | undefined, after: MiningQuest[]) =>
  after.filter((q) => isActive(q) && questDone(q) && !before?.some((b) => b.id === q.id && questDone(b)));
