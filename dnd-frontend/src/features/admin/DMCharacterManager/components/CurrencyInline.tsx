import { useState } from "react";
import { Group, NumberInput, Text, ActionIcon, Tooltip, Stack, Box } from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons-react";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import type { Currency } from "@appTypes/Currency";

interface CurrencyInlineProps {
  characterId: string;
  currencies: Currency[];
}

export const CurrencyInline: React.FC<CurrencyInlineProps> = ({ characterId, currencies }) => {
  const modifyCurrency = useAdminCharacterStore((s) => s.modifyCurrency);
  const [local, setLocal] = useState<Record<string, number>>(
    Object.fromEntries(currencies.map((c) => [c.currencyCode, c.amount]))
  );

  const handleChange = (code: string, value: number) => {
    if (value === undefined) return;
    const delta = value - (local[code] ?? 0);
    if (delta === 0) return;
    modifyCurrency(characterId, code, delta);
    setLocal((prev) => ({ ...prev, [code]: value }));
  };

  const handleAdjust = (code: string, delta: number) => {
    modifyCurrency(characterId, code, delta);
    setLocal((prev) => ({ ...prev, [code]: (prev[code] ?? 0) + delta }));
  };

  return (
    <Box
      style={{
        maxHeight: 200,     // max height for scrolling
        overflowY: "auto",  // enable vertical scroll
      }}
    >
      <Stack gap="xs">
        {currencies.map((c) => (
          <Group key={c.currencyCode} lts={2} align="center">
            <Text size="sm">{c.currencyCode.toUpperCase()}:</Text>
            <NumberInput
              size="xs"
              value={local[c.currencyCode] ?? 0}
              onChange={(v) => handleChange(c.currencyCode, typeof v === "number" ? v : Number(v) || 0)}
              min={0}
              styles={{ input: { width: 60 } }}
            />
            <Tooltip label={`+1 ${c.currencyCode}`}>
              <ActionIcon size="xs" variant="light" onClick={() => handleAdjust(c.currencyCode, +1)}>
                <IconPlus size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={`-1 ${c.currencyCode}`}>
              <ActionIcon size="xs" variant="light" onClick={() => handleAdjust(c.currencyCode, -1)}>
                <IconMinus size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ))}
      </Stack>
    </Box>
  );
};
