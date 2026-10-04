import { useState } from "react";
import type { RollResult } from "@appTypes/Roll";
import { tabletop } from "./useTabletopHub";

/** Short enough to feel instant, long enough for the dice to visibly tumble. */
const MIN_TUMBLE_MS = 450;

interface RollRequest {
  expressions: string[];
  label?: string;
  as?: string;
  private?: boolean;
}

/**
 * Rolls on the server (so it lands in everyone's log) and drives the shared <DiceResult /> animation
 * with the first roll of the entry: tumble while waiting, then land on the real faces.
 */
export function useTableRoll() {
  const [state, setState] = useState<{ result: RollResult | null; rolling: boolean; sides: number; count: number }>({
    result: null,
    rolling: false,
    sides: 20,
    count: 1,
  });

  const roll = async (request: RollRequest, sides: number, count = 1) => {
    setState({ result: null, rolling: true, sides, count });
    const [entry] = await Promise.all([tabletop.roll(request), new Promise((r) => setTimeout(r, MIN_TUMBLE_MS))]);
    setState({ result: entry?.rolls[0] ?? null, rolling: false, sides, count });
  };

  return { ...state, roll };
}

/** "1d20+3" / "1d20-1" / "1d20". */
export const d20With = (modifier: number) => `1d20${modifier > 0 ? `+${modifier}` : modifier < 0 ? `${modifier}` : ""}`;

export const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
