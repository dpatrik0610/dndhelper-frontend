import { Box, Group, Text, ThemeIcon } from "@mantine/core";
import { IconCoin } from "@tabler/icons-react";
import type { CSSProperties } from "react";
import type { Character } from "@appTypes/Character/Character";

interface Props {
  character?: Pick<Character, "currencies">;
  containerStyle?: CSSProperties;
}

export function CharacterCurrencyArea({ character, containerStyle }: Props) {
  const currencies = character?.currencies ?? [];
  const visibleCurrencies = currencies.filter((c) => (c.amount ?? 0) > 0);

  const palette = {
    gp: { color: "yellow", bg: "linear-gradient(90deg, rgba(255,210,70,0.14), rgba(255,170,60,0.12))" },
    sp: { color: "gray", bg: "linear-gradient(90deg, rgba(190,190,200,0.12), rgba(130,130,150,0.10))" },
    cp: { color: "orange", bg: "linear-gradient(90deg, rgba(255,190,130,0.14), rgba(255,130,80,0.12))" },
    pp: { color: "violet", bg: "linear-gradient(90deg, rgba(190,150,255,0.14), rgba(130,100,210,0.12))" },
    ep: { color: "teal", bg: "linear-gradient(90deg, rgba(110,220,210,0.14), rgba(60,150,150,0.12))" },
    default: { color: "cyan", bg: "linear-gradient(90deg, rgba(150,230,255,0.14), rgba(90,170,210,0.12))" },
  } as const;

  const currencyStyle = (code: string) => {
    const key = code.toLowerCase() as keyof typeof palette;
    return palette[key] ?? palette.default;
  };

  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "10px",
        gap: 8,
        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
        ...containerStyle,
      }}
    >
      <Group align="center" gap="xs" wrap="nowrap">
        <ThemeIcon variant="light" color="yellow" size="sm" radius="md">
          <IconCoin size={16} />
        </ThemeIcon>
        <Text size="sm" fw={700} c="white">
          Owned Currency
        </Text>
      </Group>

      {visibleCurrencies.length === 0 ? (
        <Text c="rgba(255,255,255,0.75)" size="sm">
          You don't have any currencies.
        </Text>
      ) : (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {visibleCurrencies.slice(0, 3).map((currency) => {
            const style = currencyStyle(currency.currencyCode);
            return (
              <Group
                key={`${currency.type}-${currency.currencyCode}`}
                gap={8}
                align="center"
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: style.bg,
                  boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
                  minHeight: 32,
                  justifyContent: "space-between",
                }}
              >
                <Group gap={6} align="center">
                  <ThemeIcon variant="light" color={style.color} size="sm" radius="md">
                    <IconCoin size={14} />
                  </ThemeIcon>
                  <Text size="xs" fw={700} c="white">
                    {currency.currencyCode.toUpperCase()}
                  </Text>
                </Group>
                <Text size="sm" fw={800} c="white">
                  {currency.amount}
                </Text>
              </Group>
            );
          })}
          {visibleCurrencies.length > 3 && (
            <Text size="xs" c="rgba(255,255,255,0.7)">
              +{visibleCurrencies.length - 3} more
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
