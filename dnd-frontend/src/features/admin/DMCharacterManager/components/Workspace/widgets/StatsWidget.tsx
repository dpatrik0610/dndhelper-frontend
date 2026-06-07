import { Grid, Paper, Stack, Title, Group, Text, Badge, SimpleGrid } from "@mantine/core";
import { IconChartBar, IconBrain, IconEye, IconSearch, IconEar, IconListCheck } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";
import type { AbilityScores } from "@appTypes/Character/AbilityScores";

export function StatsWidget({ character }: { character: Character }) {
  const glassTile = {
    background: "rgba(30, 20, 60, 0.45)",
    backdropFilter: "blur(8px) saturate(120%)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  const glassTileInner = {
    background: "rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const statBoxStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    padding: "8px 0",
    border: "1px solid rgba(255, 255, 255, 0.03)",
  };

  const getModifier = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

  const abilityKeys: { key: keyof AbilityScores, label: string, color: string }[] = [
    { key: 'str', label: 'STR', color: 'red' },
    { key: 'dex', label: 'DEX', color: 'teal' },
    { key: 'con', label: 'CON', color: 'orange' },
    { key: 'int', label: 'INT', color: 'blue' },
    { key: 'wis', label: 'WIS', color: 'green' },
    { key: 'cha', label: 'CHA', color: 'grape' },
  ];

  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Paper p="md" radius="md" style={glassTile}>
          <Title order={4} mb="md" c="white">
            <IconChartBar size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>
            Ability Scores & Saves
          </Title>
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="md">
            {abilityKeys.map(({ key, label, color }) => {
              const score = character.abilityScores?.[key] || 10;
              const mod = getModifier(score);
              const save = character.savingThrows?.[key] || 0;
              
              return (
                <Paper key={key} p="sm" radius="md" style={glassTileInner}>
                  <Group justify="space-between" mb="sm">
                    <Text fw={800} c="white" tt="uppercase" size="lg">{label}</Text>
                    <Badge size="lg" color={color} variant="filled">{formatMod(mod)}</Badge>
                  </Group>
                  <Group grow gap="xs">
                    <Stack gap={0} align="center" style={statBoxStyle}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Score</Text>
                      <Text fw={700} size="xl" c="white">{score}</Text>
                    </Stack>
                    <Stack gap={0} align="center" style={statBoxStyle}>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Save</Text>
                      <Text fw={700} size="xl" c="white">{formatMod(save)}</Text>
                    </Stack>
                  </Group>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Paper>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="md">
          <Paper p="md" radius="md" style={glassTile}>
            <Title order={4} mb="md" c="white">
              <IconBrain size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>
              Passives
            </Title>
            <Stack gap="sm">
              <Group justify="space-between" p="sm" style={glassTileInner} radius="md">
                <Group gap={8}>
                  <IconEye size={18} color="var(--mantine-color-teal-4)"/> 
                  <Text fw={600} c="white">Perception</Text>
                </Group>
                <Badge size="lg" variant="filled" color="teal" radius="sm">{character.passivePerception}</Badge>
              </Group>

              <Group justify="space-between" p="sm" style={glassTileInner} radius="md">
                <Group gap={8}>
                  <IconSearch size={18} color="var(--mantine-color-blue-4)"/> 
                  <Text fw={600} c="white">Investigation</Text>
                </Group>
                <Badge size="lg" variant="filled" color="blue" radius="sm">{character.passiveInvestigation}</Badge>
              </Group>

              <Group justify="space-between" p="sm" style={glassTileInner} radius="md">
                <Group gap={8}>
                  <IconEar size={18} color="var(--mantine-color-green-4)"/> 
                  <Text fw={600} c="white">Insight</Text>
                </Group>
                <Badge size="lg" variant="filled" color="green" radius="sm">{character.passiveInsight}</Badge>
              </Group>
            </Stack>
          </Paper>

          <Paper p="md" radius="md" style={glassTile}>
            <Title order={4} mb="md" c="white">Proficiencies</Title>
             <Group gap="xs">
                {character.proficiencies && character.proficiencies.length > 0 ? (
                  character.proficiencies.map(prof => (
                    <Badge key={prof} color="indigo" variant="light" size="md">{prof}</Badge>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">No proficiencies listed.</Text>
                )}
             </Group>
          </Paper>
        </Stack>
      </Grid.Col>

      <Grid.Col span={12}>
        <Paper p="md" radius="md" style={glassTile}>
          <Title order={4} mb="md" c="white">
            <IconListCheck size={18} style={{ verticalAlign: 'middle', marginRight: 8 }}/>
            Skills
          </Title>
          <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
            {character.skills?.map((skill, index) => (
              <Group key={index} justify="space-between" p="sm" style={glassTileInner} radius="md">
                <Text fw={600} c={skill.proficient ? "white" : "dimmed"}>{skill.name}</Text>
                <Badge 
                  size="lg" 
                  variant={skill.proficient ? "filled" : "light"} 
                  color={skill.proficient ? "indigo" : "gray"} 
                  radius="sm"
                >
                  {formatMod(skill.value)}
                </Badge>
              </Group>
            ))}
            {(!character.skills || character.skills.length === 0) && (
              <Text size="sm" c="dimmed">No skills data available.</Text>
            )}
          </SimpleGrid>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
