import type { Cost } from "@appTypes/Equipment/Equipment";

export interface CurrencyValue {
  gp: number;
  sp: number;
}

/**
 * Converts a Cost object ({ quantity, unit }) into total silver pieces (sp).
 * Custom rules: 1 gp = 100 sp.
 */
export function convertCostToSilver(cost?: Cost | null): number {
  if (!cost) return 0;
  const unit = (cost.unit ?? "gp").toLowerCase().trim();
  const quantity = cost.quantity;

  return unit === "sp" ? quantity : quantity * 100;
}

/**
 * Break down total silver pieces into gold and silver components.
 * 100 sp = 1 gp.
 */
export function breakDownSilver(totalSp: number): CurrencyValue {
  const gp = Math.floor(totalSp / 100);
  const sp = totalSp % 100;
  return { gp, sp };
}

/**
 * Formats a total silver piece amount into a readable string (e.g. 550 -> "5 gp 50 sp").
 * If showDetailed is true, always shows both gp and sp if there is gold (e.g. "5 gp 0 sp" or "5 gp 50 sp").
 * Otherwise, simplifies 500 -> "5 gp" and 50 -> "5 sp".
 */
export function formatSilverToDisplay(totalSp: number, showDetailed = false): string {
  if (totalSp === 0) return "0 sp";

  const { gp, sp } = breakDownSilver(totalSp);

  if (gp === 0) {
    return `${sp} sp`;
  }

  if (sp === 0 && !showDetailed) {
    return `${gp} gp`;
  }

  return `${gp} gp ${sp} sp`;
}

/**
 * Formats a Cost object ({ quantity, unit }) directly to a display cost, applying the custom conversion multiplier.
 */
export function formatCostToDisplay(cost?: Cost | null, multiplier = 1.0, showDetailed = false): string {
  if (!cost) return "Free";
  const baseSp = convertCostToSilver(cost);
  const finalSp = Math.round(baseSp * multiplier);
  return formatSilverToDisplay(finalSp, showDetailed);
}
