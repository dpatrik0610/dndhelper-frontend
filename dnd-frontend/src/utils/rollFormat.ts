import type { RollResult } from "@appTypes/Roll";

type ExpressionParts = Pick<RollResult, "expression" | "numberOfDice" | "sides" | "modifier">;

type RollsParts = Pick<RollResult, "rolls">;

export function formatRollExpression({ expression, numberOfDice, sides, modifier }: ExpressionParts) {
  if (expression && expression.trim().length > 0) return expression;
  const base = `${numberOfDice}d${sides}`;
  if (!modifier) return base;
  return `${base}${modifier > 0 ? "+" : ""}${modifier}`;
}

export function formatRollsList({ rolls }: RollsParts) {
  if (!rolls || rolls.length === 0) return "-";
  return rolls.join(", ");
}
