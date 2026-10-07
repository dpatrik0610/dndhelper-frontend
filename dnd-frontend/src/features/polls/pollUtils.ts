import type { Poll } from "@appTypes/Poll";

/** Per-option color: a blend from the theme's primary to its secondary accent, so charts follow the theme. */
export const optionColor = (index: number, count: number) => {
  const primaryShare = count <= 1 ? 100 : Math.round(100 - (index * 100) / (count - 1));
  return `color-mix(in oklab, var(--theme-color-accent-primary) ${primaryShare}%, var(--theme-color-accent-secondary))`;
};

export const votesFor = (poll: Poll, optionId: string) => poll.tally?.[optionId] ?? 0;

/** Share of voters who picked the option (multi-choice polls can add up to more than 100%). */
export const percentFor = (poll: Poll, optionId: string) =>
  poll.voterCount ? Math.round((votesFor(poll, optionId) * 100) / poll.voterCount) : 0;

/** Ids of the leading options; empty while nobody has voted or results are hidden. */
export const leaderIds = (poll: Poll) => {
  const top = Math.max(0, ...poll.options.map((o) => votesFor(poll, o.id)));
  return top === 0 ? [] : poll.options.filter((o) => votesFor(poll, o.id) === top).map((o) => o.id);
};

export const timeLeft = (closesAt: string, now = Date.now()) => {
  const minutes = Math.max(0, Math.round((new Date(closesAt).getTime() - now) / 60000));
  if (minutes < 1) return "closing now";
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ${minutes % 60}m left`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h left`;
};

export const sameSelection = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id));
