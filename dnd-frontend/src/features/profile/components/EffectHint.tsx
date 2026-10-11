import { Stack, Text, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";
import type { RollMode, StatResult } from "@utils/effects";

/** Hovering (or tapping) a changed stat lists what changed it. Renders the children as-is when nothing did. */
export function EffectHint({ stat, children }: { stat?: StatResult; children: ReactNode }) {
  if (!stat?.why.length) return <>{children}</>;

  return (
    <Tooltip
      multiline
      w={280}
      withArrow
      zIndex={3000}
      events={{ hover: true, focus: true, touch: true }}
      label={
        <Stack gap={2}>
          <Text size="xs" c="dimmed">
            Sheet value: {stat.base}
          </Text>
          {stat.why.map((r, i) => (
            <Text key={i} size="xs">
              <b>{r.detail}</b> · {r.source}
            </Text>
          ))}
        </Stack>
      }
    >
      <span tabIndex={0} style={{ cursor: "help", display: "inline-flex", alignItems: "center", gap: 4, borderBottom: "1px dotted currentColor" }}>
        {children}
      </span>
    </Tooltip>
  );
}

export function RollMark({ roll }: { roll?: RollMode }) {
  if (!roll || roll === "normal") return null;
  const adv = roll === "advantage";

  return (
    <span
      aria-label={adv ? "Advantage" : "Disadvantage"}
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: 0.5,
        padding: "1px 4px",
        borderRadius: 4,
        lineHeight: 1.3,
        color: adv ? "#4ade80" : "#f87171",
        border: "1px solid currentColor",
        background: "rgba(0, 0, 0, 0.35)",
      }}
    >
      {adv ? "ADV" : "DIS"}
    </span>
  );
}

