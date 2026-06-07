import { useState } from "react";
import { Grid, Paper, Stack, Title, Group, Text, NumberInput, Button, Divider, ThemeIcon } from "@mantine/core";
import { IconCoins, IconPlus, IconMinus } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";

export function ResourceWidget({ character }: { character: Character }) {
  const { modifyCurrency } = useAdminCharacterStore();
  
  // State for currency modifications
  const [currencyDeltas, setCurrencyDeltas] = useState<Record<string, number | "">>({
    cp: "", sp: "", ep: "", gp: "", pp: ""
  });

  const glassTile = {
    background: "rgba(30, 20, 60, 0.45)",
    backdropFilter: "blur(8px) saturate(120%)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  const getCurrencyAmount = (code: string) => {
    return character.currencies?.find(c => c.currencyCode === code)?.amount || 0;
  };

  const handleCurrencyChange = (code: string, delta: number) => {
    modifyCurrency(character.id!, code, delta);
    setCurrencyDeltas(prev => ({ ...prev, [code]: "" }));
  };

  const currencies = [
    { code: 'cp', label: 'Copper', color: 'orange.9' },
    { code: 'sp', label: 'Silver', color: 'gray.4' },
    { code: 'ep', label: 'Electrum', color: 'indigo.4' },
    { code: 'gp', label: 'Gold', color: 'yellow.5' },
    { code: 'pp', label: 'Platinum', color: 'gray.2' },
  ];

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper p="md" radius="md" style={glassTile}>
          <Title order={4} mb="md" c="white"><IconCoins size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>Currencies</Title>
          <Stack gap="md">
            {currencies.map(({ code, label, color }) => {
              const currentAmount = getCurrencyAmount(code);
              const delta = currencyDeltas[code];
              
              return (
                <div key={code}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="sm">
                      <ThemeIcon color={color} variant="light" size="md" radius="xl">
                        <Text fw={800} size="xs" c="white">{code.toUpperCase()}</Text>
                      </ThemeIcon>
                      <Text fw={600}>{label}</Text>
                    </Group>
                    <Text fw={700} size="lg">{currentAmount}</Text>
                  </Group>
                  <Group align="flex-end">
                    <NumberInput 
                      placeholder="Amount"
                      value={delta}
                      onChange={(val) => setCurrencyDeltas(prev => ({ ...prev, [code]: val as number | '' }))}
                      min={0}
                      style={{ flex: 1 }}
                      size="sm"
                      classNames={{ input: "glassy-input glassy-input--orange" }}
                    />
                    <Button 
                      color="red" 
                      variant="light" 
                      size="sm"
                      onClick={() => handleCurrencyChange(code, -Number(delta))} 
                      disabled={!delta || Number(delta) <= 0 || Number(delta) > currentAmount}
                    >
                      <IconMinus size={14} />
                    </Button>
                    <Button 
                      color="green" 
                      variant="light" 
                      size="sm"
                      onClick={() => handleCurrencyChange(code, Number(delta))} 
                      disabled={!delta || Number(delta) <= 0}
                    >
                      <IconPlus size={14} />
                    </Button>
                  </Group>
                  <Divider my="sm" color="rgba(255,255,255,0.1)" />
                </div>
              );
            })}
          </Stack>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        {/* Placeholder for Spell Slots or other resources if needed later. 
            Currently, spell slots might be too complex for a quick DM override without spell components,
            but keeping the column open for future expansion. */}
        <Paper p="md" radius="md" style={glassTile}>
          <Title order={4} mb="md" c="white">Other Resources</Title>
          <Text size="sm" c="dimmed">Spell slots and class-specific resources (like Ki points, Sorcery points) will appear here in a future update.</Text>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
