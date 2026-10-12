import { Box, Group, Text } from "@mantine/core";
import { IconCoin } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import type { Character } from "@appTypes/Character/Character";
import { coinInfo, sortCurrencies } from "@utils/currency";

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
  
  const coins = sortCurrencies(currencies.filter((c) => c.amount > 0)).map((c) => ({
    ...coinInfo(c.type),
    amount: c.amount,
  }));

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

      {coins.length === 0 ? (
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
          {coins.map((coin) => (
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
