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
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { AbilityScore } from "./AbilityScore";
import { StatBox } from "./StatBox";
import AbilityScoreTooltip from "./AbilityScoreToolTip";

export function AbilityScores() {
  const character = useCurrentCharacter()!;
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
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
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
                background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
                borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Grid align="stretch" gutter="md">
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

                <Grid.Col span={{ base: 12, md: 8 }}>
                  {relatedSkills.length ? (
                    <Stack gap={6}>
                      {relatedSkills.map((skill) => {
                        const val = Math.min(Math.max(skill.value, 0), 15);
                        const percent = (val / 15) * 100;
                        const isProf = !!skill.proficient;

                        const barGradient = isProf
                          ? "var(--theme-gradient-primary)"
                          : "linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.15))";

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
                                      color: "var(--theme-color-accent-primary, #FFD43B)",
                                      filter:
                                        "drop-shadow(0 0 3px var(--theme-border-glow, #FFD43B90))",
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
                                    ? "var(--theme-color-accent-primary, #06b6d4)"
                                    : "var(--theme-color-text-secondary, #cbd5e1)",
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
                                  background: "rgba(0, 0, 0, 0.25)",
                                },
                                section: {
                                  background: barGradient,
                                  boxShadow: isProf
                                    ? "var(--theme-glow-shadow-primary)"
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

        <Button
          fullWidth
          mt="md"
          variant="light"
          color={SectionColor.Cyan}
          onClick={() => setOpened((o) => !o)}
          style={{
            background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            color: "var(--theme-color-accent-primary, #fff)",
            fontWeight: 700,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.08))";
            e.currentTarget.style.boxShadow = "var(--theme-glow-shadow-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.04))";
            e.currentTarget.style.boxShadow = "none";
          }}
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
              series={[{ name: "score", color: "var(--theme-color-accent-primary)", opacity: 0.15 }]}
              withDots
              textColor="rgba(255, 255, 255, 0.8)"
              withTooltip
              tooltipProps={{ content: <AbilityScoreTooltip /> }}
              radarProps={{
                stroke: "var(--theme-color-accent-primary)",
                fill: "var(--theme-gradient-active)",
                filter:
                  "drop-shadow(0 0 6px var(--theme-border-glow))",
                strokeWidth: 2,
              }}
              dotProps={{
                r: 6,
                stroke: "#fff",
                strokeWidth: 2,
                fill: "var(--theme-color-accent-primary)",
              }}
              gridColor="rgba(255, 255, 255, 0.15)"
              withPolarAngleAxis
            />
          </div>
        )}
      </Stack>
    </ExpandableSection>
  );
}
