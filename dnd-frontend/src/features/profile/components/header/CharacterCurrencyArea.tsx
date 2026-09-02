import { Box, Group, Text } from "@mantine/core";
import { IconCoin } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import type { Character } from "@appTypes/Character/Character";

interface Props {
  character?: Pick<Character, "currencies">;
  containerStyle?: CSSProperties;
}

function CoinPill({ label, amount, gradient, glow }: { label: string; amount: number; gradient: string; glow: string }) {
  return (
    <Group
      gap="xs"
      align="center"
      wrap="nowrap"
      justify="space-between"
      style={{
        background: "rgba(0, 0, 0, 0.25)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.05))",
        borderRadius: "20px",
        padding: "4px 10px",
        height: "32px",
        boxShadow: "inset 0 1px 1px rgba(0,0,0,0.4)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Group gap="xs" align="center" wrap="nowrap" style={{ overflow: "hidden", flex: 1 }}>
        <Box
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: gradient,
            boxShadow: `0 0 6px ${glow}`,
            flexShrink: 0,
          }}
        />
        <Text
          size="xs"
          fw={850}
          style={{
            fontSize: "10px",
            color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.6))",
            letterSpacing: "0.5px",
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
          }}
        >
          {label}
        </Text>
      </Group>
      <Text
        size="xs"
        fw={900}
        style={{
          fontSize: "12px",
          color: "var(--theme-color-text-primary, #ffffff)",
          fontFamily: "var(--font-sans)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {amount}
      </Text>
    </Group>
  );
}

export function CharacterCurrencyArea({ character, containerStyle }: Props) {
  const currencies = character?.currencies ?? [];
  
  // 1. Filter out zero currencies and construct display config
  const activeCoins = currencies
    .filter((c) => (c.amount ?? 0) > 0)
    .map((c) => {
      const code = c.currencyCode.toLowerCase();
      
      const presets: Record<string, { gradient: string; glow: string }> = {
        gp: { gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)", glow: "rgba(245, 158, 11, 0.3)" },
        pp: { gradient: "linear-gradient(135deg, #a78bfa, #c084fc)", glow: "rgba(167, 139, 250, 0.3)" },
        sp: { gradient: "linear-gradient(135deg, #cbd5e1, #94a3b8)", glow: "rgba(203, 213, 225, 0.3)" },
        cp: { gradient: "linear-gradient(135deg, #fb923c, #ea580c)", glow: "rgba(234, 88, 12, 0.3)" },
        ep: { gradient: "linear-gradient(135deg, #2dd4bf, #0d9488)", glow: "rgba(13, 148, 136, 0.3)" },
      };
      
      const style = presets[code] || {
        gradient: "linear-gradient(135deg, #38bdf8, #0284c7)",
        glow: "rgba(14, 165, 233, 0.3)",
      };
      
      return {
        label: c.currencyCode.toUpperCase(),
        amount: c.amount ?? 0,
        gradient: style.gradient,
        glow: style.glow,
      };
    });

  // 2. Sort coins by standard D&D value hierarchy (PP > GP > EP > SP > CP)
  const order: Record<string, number> = { pp: 0, gp: 1, ep: 2, sp: 3, cp: 4 };
  activeCoins.sort((a, b) => {
    const orderA = order[a.label.toLowerCase()] ?? 99;
    const orderB = order[b.label.toLowerCase()] ?? 99;
    return orderA - orderB;
  });

  // 3. Slice to first 4 active coins to guarantee perfect 2x2 grid symmetry and prevent overflow
  const displayedCoins = activeCoins.slice(0, 4);

  return (
    <Box
      style={{
        width: "100%",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "12px",
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: 12,
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.02)",
        ...containerStyle,
      }}
    >
      <Group justify="space-between" align="center" style={{ width: "100%", marginBottom: "4px" }}>
        <Text size="10px" fw={800} style={{ letterSpacing: "1px", textTransform: "uppercase", color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.6))" }}>
          Coin Pouch
        </Text>
        <IconCoin size={14} color="var(--theme-color-accent-primary, #f59e0b)" />
      </Group>

      {displayedCoins.length === 0 ? (
        <Text size="xs" c="dimmed" style={{ fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>
          Pouch is empty
        </Text>
      ) : (
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            width: "100%",
          }}
        >
          {displayedCoins.map((coin) => (
            <CoinPill
              key={coin.label}
              label={coin.label}
              amount={coin.amount}
              gradient={coin.gradient}
              glow={coin.glow}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
