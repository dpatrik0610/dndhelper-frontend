import { useMemo } from "react";

export function useRulesPalette() {
  const palette = useMemo(
    () => ({
      border: "rgba(140, 120, 255, 0.35)",
      cardBg: "rgba(20, 18, 40, 0.65)",
      textDim: "rgba(220, 220, 255, 0.7)",
    }),
    [],
  );

  const cardStyle = useMemo(
    () => ({
      background: palette.cardBg,
      borderColor: palette.border,
    }),
    [palette],
  );

  return { palette, cardStyle };
}
