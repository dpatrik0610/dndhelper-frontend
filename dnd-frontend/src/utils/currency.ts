import type { Currency } from "@appTypes/Currency";

export interface CoinInfo {
  label: string;
  name: string;
  gradient: string;
  glow: string;
  /** Mantine colour for badges. */
  color: string;
  standard: boolean;
}

/** D&D coins, most valuable first. Anything else is a custom currency. */
const STANDARD: Record<string, Omit<CoinInfo, "label" | "standard">> = {
  pp: { name: "Platinum", color: "violet", gradient: "linear-gradient(135deg, #a78bfa, #c084fc)", glow: "rgba(167, 139, 250, 0.3)" },
  gp: { name: "Gold", color: "yellow", gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "rgba(245, 158, 11, 0.3)" },
  ep: { name: "Electrum", color: "teal", gradient: "linear-gradient(135deg, #2dd4bf, #0d9488)", glow: "rgba(13, 148, 136, 0.3)" },
  sp: { name: "Silver", color: "gray", gradient: "linear-gradient(135deg, #cbd5e1, #94a3b8)", glow: "rgba(203, 213, 225, 0.3)" },
  cp: { name: "Copper", color: "orange", gradient: "linear-gradient(135deg, #fb923c, #ea580c)", glow: "rgba(234, 88, 12, 0.3)" },
};

export const STANDARD_COINS = Object.keys(STANDARD);

const key = (type: string) => type.trim().toLowerCase();

export const sameCurrency = (a: string, b: string) => key(a) === key(b);

export function coinInfo(type: string): CoinInfo {
  const std = STANDARD[key(type)];
  if (std) return { ...std, label: key(type).toUpperCase(), standard: true };
  return {
    name: type.trim(),
    label: type.trim(),
    color: "cyan",
    gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
    glow: "rgba(14, 165, 233, 0.3)",
    standard: false,
  };
}

/** Standard coins in value order, then custom currencies alphabetically. */
export function sortCurrencies(list: Currency[]): Currency[] {
  const rank = (t: string) => {
    const i = STANDARD_COINS.indexOf(key(t));
    return i === -1 ? STANDARD_COINS.length : i;
  };
  return [...list].sort((a, b) => rank(a.type) - rank(b.type) || a.type.localeCompare(b.type));
}

/** "5 GP, 20 SP, 3 Mammon". Zero stacks are skipped. */
export function formatCurrencies(list: Currency[] | undefined, separator = ", "): string {
  return sortCurrencies((list ?? []).filter((c) => c.amount > 0))
    .map((c) => `${c.amount} ${coinInfo(c.type).label}`)
    .join(separator);
}

/** Adds `delta` (may be negative) to the matching stack; empty stacks are dropped. */
export function adjustCurrency(list: Currency[], type: string, delta: number): Currency[] {
  const existing = list.find((c) => sameCurrency(c.type, type));
  const next = existing
    ? list.map((c) => (c === existing ? { ...c, amount: c.amount + delta } : c))
    : [...list, { type: type.trim(), amount: delta }];
  return next.filter((c) => c.amount > 0);
}

/** Currency names to offer in a picker: standard coins plus any custom ones in `lists`. */
export function currencySuggestions(...lists: (Currency[] | undefined)[]): string[] {
  const out = [...STANDARD_COINS];
  for (const c of lists.flatMap((l) => l ?? [])) {
    if (!out.some((t) => sameCurrency(t, c.type))) out.push(c.type);
  }
  return out;
}
