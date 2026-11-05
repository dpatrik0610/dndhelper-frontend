import type { Session } from "@appTypes/Session";

const byNumber = (a: Session, b: Session) => a.number - b.number;

export function groupSessions(sessions: Session[]) {
  const sorted = [...sessions].sort(byNumber);
  return {
    live: sorted.filter((s) => s.status === "Live"),
    upcoming: sorted.filter((s) => s.status === "Planned"),
    played: sorted.filter((s) => s.status === "Completed").reverse(),
  };
}

/** What the table cares about right now: the live session, else the last one played, else the next planned. */
export function featuredSession(sessions: Session[]): Session | null {
  const { live, upcoming, played } = groupSessions(sessions);
  return live[0] ?? played[0] ?? upcoming[0] ?? null;
}

/** The planned session that follows `current`: the lowest number above it, else the earliest planned one. */
export function nextPlanned(sessions: Session[], current?: Session | null): Session | null {
  const planned = sessions.filter((s) => s.status === "Planned" && s.id !== current?.id).sort(byNumber);
  return planned.find((s) => !current || s.number > current.number) ?? planned[0] ?? null;
}
