import { IconAutomaticGearbox, IconStarFilled, IconSearch } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpandableSection";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { SectionColor } from "../../../types/SectionColor";
import {
  Box,
  Group,
  Text,
  Stack,
  Progress,
  useMantineTheme,
  Paper,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useState, useMemo } from "react";
import { DividerWithLabel } from "../../../components/common/DividerWithLabel";

export function SkillsPanel() {
  const theme = useMantineTheme();
  const character = useCharacterStore((s) => s.character);
  const skills = character?.skills || [];
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 150);

  const groups: Record<string, string[]> = {
    Strength: ["Athletics"],
    Dexterity: ["Acrobatics", "Sleight of Hand", "Stealth"],
    Constitution: ["Willpower"],
    Intelligence: ["Arcana", "History", "Investigation", "Nature", "Religion"],
    Wisdom: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
    Charisma: ["Deception", "Intimidation", "Performance", "Persuasion"],
  };

  // Filter skills by search query
  const grouped = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return Object.entries(groups)
      .map(([ability, names]) => ({
        ability,
        list: skills.filter(
          (s) => names.includes(s.name) && (!q || s.name.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.list.length);
  }, [skills, debouncedSearch]);

  return (
    <ExpandableSection
      title="Skills Overview"
      icon={<IconAutomaticGearbox />}      
      defaultOpen
      style={{
        background: "linear-gradient(135deg, rgba(56, 18, 0, 0.36), rgba(104, 7, 0, 0.36))",
        boxShadow: "0 0 10px rgba(51, 0, 73, 0.2), inset 0 0 6px rgba(51, 17, 82, 0.56)",
        borderColor: "rgba(216, 98, 30, 0.34)",
        borderRadius: "10px",
        transition: "all 0.25s ease-in-out",
      }}
    >
      <TextInput
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        placeholder="Search skills..."
        leftSection={<IconSearch size={16} />}
        variant="filled"
        size="sm"
        mb="md"
        styles={{
          input: {
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white",
          },
        }}
      />

      {grouped.length ? (
        <Stack gap="lg">
          {grouped.map(({ ability, list }) => (
            <Box key={ability}>
              <DividerWithLabel label={ability} color="rgba(172, 63, 0, 0.74)" thickness="2px" marginY="0.5rem" />
              <Paper
                withBorder
                radius="md"
                p="sm"
                style={{
                  background: "linear-gradient(145deg, rgba(20, 10, 10, 0.85), rgba(25,25,45,0.7))",
                  border: "1px solid rgba(255, 136, 0, 0.1)",
                  boxShadow: "0 0 10px rgba(255, 81, 0, 0.08)",
                  transition: "transform .2s ease, box-shadow .3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 18px rgba(255, 136, 0, 0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 10px rgba(0,255,255,0.08)")}
              >
                <Stack gap="xs">
                  {list.map((skill) => {
                    const val = Math.min(Math.max(skill.value, 0), 10);
                    const percent = (val / 15) * 100;
                    const color = skill.proficient ? "linear-gradient(90deg, #ffb347, #ff0844)" : "linear-gradient(90deg, #a19361ff, #816a29ff)";
                    return (
                      <Box
                        key={skill.name}
                        style={{ transition: "transform .2s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      >
                        <Group justify="space-between" align="center" mb={4}>
                          <Group gap={4}>
                            {skill.proficient && (
                              <IconStarFilled size={12} color="#FFD43B" style={{ filter: "drop-shadow(0 0 3px #FFD43B90)" }} />
                            )}
                            <Text size="sm" c="gray.1" fw={500}>
                              {skill.name}
                            </Text>
                          </Group>
                          <Text size="sm" fw={600} style={{ color: skill.proficient ? theme.colors.cyan[4] : theme.colors.gray[5] }}>
                            {skill.value >= 0 ? `+${skill.value}` : skill.value}
                          </Text>
                        </Group>
                        <Progress
                          radius="xl"
                          size="sm"
                          value={percent}
                          style={{ transition: "all .4s ease" }}
                          styles={{
                            root: { background: "rgba(255,255,255,0.06)" },
                            section: { background: color, boxShadow: skill.proficient ? "0 0 6px rgba(255, 0, 0, 0.6)" : "none" },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Box>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed" ta="center">
          No skills found.
        </Text>
      )}
    </ExpandableSection>
  );
}
