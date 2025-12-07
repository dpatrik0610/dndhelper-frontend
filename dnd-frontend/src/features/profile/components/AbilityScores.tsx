import { useState, useMemo } from "react";
import {
  Grid,
  Paper,
  Stack,
  Group,
  Text,
  Progress,
  Button,
  Box,
} from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { RadarChart } from "@mantine/charts";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterStore } from "@store/useCharacterStore";
import { AbilityScore } from "./AbilityScore";
import { StatBox } from "./StatBox";
import AbilityScoreTooltip from "./AbilityScoreToolTip";

export function AbilityScores() {
  const character = useCharacterStore((state) => state.character)!;
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

  const skills = character.skills || [];

  const abilityConfigs = [
    {
      id: "str",
      label: "Strength",
      scoreKey: "str" as const,
      saveKey: "strength" as const,
      skills: ["Athletics"],
    },
    {
      id: "dex",
      label: "Dexterity",
      scoreKey: "dex" as const,
      saveKey: "dexterity" as const,
      skills: ["Acrobatics", "Sleight of Hand", "Stealth"],
    },
    {
      id: "con",
      label: "Constitution",
      scoreKey: "con" as const,
      saveKey: "constitution" as const,
      skills: ["Willpower"],
    },
    {
      id: "int",
      label: "Intelligence",
      scoreKey: "int" as const,
      saveKey: "intelligence" as const,
      skills: ["Arcana", "History", "Investigation", "Nature", "Religion"],
    },
    {
      id: "wis",
      label: "Wisdom",
      scoreKey: "wis" as const,
      saveKey: "wisdom" as const,
      skills: [
        "Animal Handling",
        "Insight",
        "Medicine",
        "Perception",
        "Survival",
      ],
    },
    {
      id: "cha",
      label: "Charisma",
      scoreKey: "cha" as const,
      saveKey: "charisma" as const,
      skills: ["Deception", "Intimidation", "Performance", "Persuasion"],
    },
  ];

  const radarData = useMemo(
    () => [
      { ability: "STR", score: character.abilityScores.str },
      { ability: "DEX", score: character.abilityScores.dex },
      { ability: "CON", score: character.abilityScores.con },
      { ability: "INT", score: character.abilityScores.int },
      { ability: "WIS", score: character.abilityScores.wis },
      { ability: "CHA", score: character.abilityScores.cha },
    ],
    [character.abilityScores]
  );

  return (
    <ExpandableSection
      title="Ability Scores & Skills"
      color={SectionColor.Violet}
      defaultOpen
      transparent
      icon={<span style={{ fontSize: "1.2rem" }}>💪</span>}
      style={{
        background:
          "linear-gradient(135deg, rgba(36, 0, 33, 0.23), rgba(56, 27, 0, 0.36))",
        boxShadow:
          "0 0 10px rgba(51, 0, 73, 0.2), inset 0 0 6px rgba(51, 17, 82, 0.56)",
        borderColor: "rgba(185, 30, 216, 0.34)",
        borderRadius: "10px",
        transition: "all 0.25s ease-in-out",
      }}
      expandable={false}
    >
      <Stack gap="md">
        {abilityConfigs.map((cfg) => {
          const score = character.abilityScores[cfg.scoreKey];
          const save = character.savingThrows[cfg.saveKey];
          const relatedSkills = skills.filter((s) =>
            cfg.skills.includes(s.name)
          );

          return (
            <Paper
              key={cfg.id}
              withBorder
              radius="md"
              p="sm"
              style={{
                background:
                  "linear-gradient(135deg, rgba(12,10,25,0.85), rgba(25,10,25,0.8))",
                border: "1px solid rgba(200,150,255,0.25)",
                boxShadow: "0 0 10px rgba(120,60,200,0.25)",
              }}
            >
              <Grid align="stretch" gutter="md">
                {/* Left: ability card */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Stack gap={6}>
                    <AbilityScore
                      name={cfg.label.toUpperCase()}
                      score={score}
                    />

                    <StatBox
                      label={`${cfg.label.slice(0, 3).toUpperCase()} Save`}
                      value={
                        save >= 0 ? `+${save.toString()}` : save.toString()
                      }
                      size="xs"
                      color="yellow"
                    />
                  </Stack>
                </Grid.Col>

                {/* Right: related skills bars */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                  {relatedSkills.length ? (
                    <Stack gap={6}>
                      {relatedSkills.map((skill) => {
                        const val = Math.min(Math.max(skill.value, 0), 15);
                        const percent = (val / 15) * 100;
                        const isProf = !!skill.proficient;

                        const barGradient = isProf
                          ? "linear-gradient(90deg, #ffb347, #ff0844)"
                          : "linear-gradient(90deg, #a19361ff, #816a29ff)";

                        return (
                          <Box
                            key={skill.name}
                            style={{
                              transition: "transform .2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(-1px)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(0)")
                            }
                          >
                            <Group
                              justify="space-between"
                              align="center"
                              mb={4}
                            >
                              <Text
                                size="sm"
                                c="gray.1"
                                fw={500}
                                style={{ display: "flex", gap: 4 }}
                              >
                                {isProf && (
                                  <span
                                    style={{
                                      color: "#FFD43B",
                                      filter:
                                        "drop-shadow(0 0 3px #FFD43B90)",
                                    }}
                                  >
                                    ★
                                  </span>
                                )}
                                {skill.name}
                              </Text>
                              <Text
                                size="sm"
                                fw={600}
                                style={{
                                  color: isProf
                                    ? theme.colors.cyan[4]
                                    : theme.colors.gray[5],
                                }}
                              >
                                {skill.value >= 0
                                  ? `+${skill.value}`
                                  : skill.value}
                              </Text>
                            </Group>

                            <Progress
                              radius="xl"
                              size="sm"
                              value={percent}
                              styles={{
                                root: {
                                  background: "rgba(255,255,255,0.06)",
                                },
                                section: {
                                  background: barGradient,
                                  boxShadow: isProf
                                    ? "0 0 6px rgba(255, 0, 0, 0.6)"
                                    : "none",
                                  transition: "width .4s ease",
                                },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Text size="xs" c="dimmed">
                      No related skills.
                    </Text>
                  )}
                </Grid.Col>
              </Grid>
            </Paper>
          );
        })}

        {/* Radar chart toggle */}
        <Button
          fullWidth
          mt="md"
          variant="light"
          color={SectionColor.Cyan}
          onClick={() => setOpened((o) => !o)}
        >
          {opened ? "Hide Chart" : "Show Chart"}
        </Button>

        {opened && (
          <div style={{ minHeight: "35vh", width: "100%" }}>
            <RadarChart
              h="35vh"
              w="100%"
              data={radarData}
              dataKey="ability"
              series={[{ name: "score", color: "cyan.6", opacity: 0 }]}
              withDots
              textColor="white.0"
              withTooltip
              tooltipProps={{ content: <AbilityScoreTooltip /> }}
              radarProps={{
                stroke: "cyan",
                fill: "linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,128,128,0.4))",
                filter:
                  "drop-shadow(0 0 6px rgba(0, 255, 255, 0.26))",
                strokeWidth: 2,
              }}
              dotProps={{
                r: 6,
                stroke: "white",
                strokeWidth: 2,
                fill: "cyan",
              }}
              gridColor="gray.5"
              withPolarAngleAxis
            />
          </div>
        )}
      </Stack>
    </ExpandableSection>
  );
}
