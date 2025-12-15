import { Badge, Group, Paper, Table, Text, Title } from "@mantine/core";
import { useCharacterStore } from "@store/useCharacterStore";
import { EXPERIENCE_TABLE, getLevelForExperience } from "@utils/experienceTable";

export function ExperienceTableCard() {
  const character = useCharacterStore((s) => s.character);
  const currentXpLevel = character ? getLevelForExperience(character.experience).level : null;

  return (
    <Paper
      withBorder
      p="md"
      mt="sm"
      style={{
        background: "linear-gradient(135deg, rgba(30,0,40,0.35), rgba(10,0,20,0.4))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
      }}
    >
      <Group justify="space-between" align="baseline">
        <Title order={4} c="white">
          Experience & Leveling
        </Title>
        <Text size="sm" c="rgba(255,255,255,0.7)">
          Official 5e progression
        </Text>
      </Group>

      <Text size="sm" c="rgba(255,255,255,0.8)" mt={4}>
        {character
          ? `You have ${character.experience.toLocaleString()} XP (This places you at level ${currentXpLevel ?? "?"} in the table below).`
          : "Select a character to highlight your current XP."}
      </Text>
        <Table verticalSpacing="xs" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Level</Table.Th>
              <Table.Th>XP</Table.Th>
              <Table.Th>Prof. Bonus</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {EXPERIENCE_TABLE.map((row) => {
              const isCurrent = currentXpLevel === row.level;
              return (
                <Table.Tr
                  key={row.level}
                  bg={isCurrent ? "rgba(255,140,0,0.08)" : undefined}
                  style={{ transition: "background 220ms ease" }}
                >
                  <Table.Td>
                    <Group gap="xs">
                      <Text c="white" fw={600}>
                        {row.level}
                      </Text>
                      {isCurrent && (
                        <Badge color="orange" variant="light" size="xs">
                          Current XP
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text c="white">{row.experience.toLocaleString()} XP</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c="white">+{row.proficiencyBonus}</Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
    </Paper>
  );
}
