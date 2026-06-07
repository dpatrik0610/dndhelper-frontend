import { Grid, Paper, Stack, Title, Text, Group, Badge, ScrollArea } from "@mantine/core";
import { IconBook, IconWorld, IconMask } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";

export function RoleplayWidget({ character }: { character: Character }) {
  const glassTile = {
    background: "rgba(30, 20, 60, 0.45)",
    backdropFilter: "blur(8px) saturate(120%)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="md">
          <Paper p="md" radius="md" style={glassTile}>
             <Title order={4} mb="md" c="white"><IconBook size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>Background</Title>
             <Group mb="xs">
               <Text fw={600} size="sm" c="dimmed">Background:</Text>
               <Text size="sm">{character.background || 'Unknown'}</Text>
             </Group>
             <Group mb="xs">
               <Text fw={600} size="sm" c="dimmed">Alignment:</Text>
               <Text size="sm">{character.alignment || 'Unknown'}</Text>
             </Group>
             <Group>
               <Text fw={600} size="sm" c="dimmed">Faith/Faction:</Text>
               {/* Simplified mapping for factions if needed, for now just placeholder or skip */}
               <Text size="sm">N/A</Text>
             </Group>
          </Paper>

          <Paper p="md" radius="md" style={glassTile}>
            <Title order={4} mb="md" c="white"><IconWorld size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>Languages & Senses</Title>
            <Text fw={600} size="sm" c="dimmed" mb={4}>Languages</Text>
            <Group gap="xs" mb="md">
              {character.languages && character.languages.length > 0 ? (
                character.languages.map(lang => (
                  <Badge key={lang} color="cyan" variant="light">{lang}</Badge>
                ))
              ) : (
                <Text size="sm" c="dimmed">None</Text>
              )}
            </Group>

            <Text fw={600} size="sm" c="dimmed" mb={4}>Senses</Text>
             <Group gap="xs">
              {/* Assuming senses are part of features or a specific field, defaulting to placeholder if not explicit */}
              <Badge color="grape" variant="light">Darkvision 60ft</Badge> {/* Placeholder: requires data structure parsing if real */}
             </Group>
          </Paper>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper p="md" radius="md" style={{ ...glassTile, height: '100%' }}>
          <Title order={4} mb="md" c="white"><IconMask size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>Traits & Ideals</Title>
          <ScrollArea style={{ height: 300 }} offsetScrollbars>
            <Stack gap="md">
              <div>
                <Text fw={700} c="dimmed" size="sm" mb={4}>Personality Traits</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{character.personalityTraits || 'Not specified.'}</Text>
              </div>
              <div>
                <Text fw={700} c="dimmed" size="sm" mb={4}>Ideals</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{character.ideals || 'Not specified.'}</Text>
              </div>
              <div>
                <Text fw={700} c="dimmed" size="sm" mb={4}>Bonds</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{character.bonds || 'Not specified.'}</Text>
              </div>
              <div>
                <Text fw={700} c="dimmed" size="sm" mb={4}>Flaws</Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{character.flaws || 'Not specified.'}</Text>
              </div>
            </Stack>
          </ScrollArea>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
