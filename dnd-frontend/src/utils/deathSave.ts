import type { Character } from "@appTypes/Character/Character";

export interface DeathSaveOutcome {
  patch: Partial<Character>;
  /** What happened, for the roller. */
  message: string;
  color: "teal" | "green" | "orange" | "red";
}

/**
 * 5e death save from the d20: 20 → back up at 1 HP, 1 → two failures, 10+ succeeds, else fails.
 * Three successes stabilise (both counts reset), three failures is death (counts stay so the sheet shows it).
 */
export function deathSave(natural: number, c: Pick<Character, "deathSavesSuccesses" | "deathSavesFailures">): DeathSaveOutcome {
  const reset = { deathSavesSuccesses: 0, deathSavesFailures: 0 };
  if (natural === 20) return { patch: { ...reset, hitPoints: 1 }, message: "Natural 20! Back on your feet with 1 HP.", color: "teal" };

  if (natural >= 10) {
    const successes = Math.min(3, (c.deathSavesSuccesses ?? 0) + 1);
    return successes === 3
      ? { patch: reset, message: "Third success: stable at 0 HP.", color: "green" }
      : { patch: { deathSavesSuccesses: successes }, message: `Success (${successes}/3).`, color: "green" };
  }

  const failures = Math.min(3, (c.deathSavesFailures ?? 0) + (natural === 1 ? 2 : 1));
  const how = natural === 1 ? "Natural 1: two failures" : "Failure";
  return {
    patch: { deathSavesFailures: failures },
    message: failures === 3 ? `${how}. Third failure: dead.` : `${how} (${failures}/3).`,
    color: failures === 3 ? "red" : "orange",
  };
}
