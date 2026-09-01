import { useState, useMemo } from "react";
import {
  Grid,
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Box,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import { RadarChart } from "@mantine/charts";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { AbilityScore } from "./AbilityScore";
import { StatBox } from "./StatBox";
import AbilityScoreTooltip from "./AbilityScoreToolTip";
import { useIsMobile } from "@hooks/useIsMobile";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export function AbilityScores() {
  const character = useCurrentCharacter()!;
  const isMobile = useIsMobile();
  const [opened, setOpened] = useState(false);

  const skills = character.skills || [];

  const abilities = useMemo(() => [
    { key: "str" as const, name: "Strength", short: "STR", saveKey: "strength" as const, icon: "💪" },
    { key: "dex" as const, name: "Dexterity", short: "DEX", saveKey: "dexterity" as const, icon: "🏃" },
    { key: "con" as const, name: "Constitution", short: "CON", saveKey: "constitution" as const, icon: "🛡️" },
    { key: "int" as const, name: "Intelligence", short: "INT", saveKey: "intelligence" as const, icon: "🧠" },
    { key: "wis" as const, name: "Wisdom", short: "WIS", saveKey: "wisdom" as const, icon: "👁️" },
    { key: "cha" as const, name: "Charisma", short: "CHA", saveKey: "charisma" as const, icon: "🗣️" },
  ], []);

  // Enrich skills with their short ability name and sort alphabetically for a premium layout
  const enrichedSkills = useMemo(() => {
    return skills.map((s) => {
      const def = DEFAULT_SKILLS.find((d) => d.name === s.name);
      return {
        ...s,
        ability: def ? def.ability.toUpperCase().slice(0, 3) : "STR",
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [skills]);

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

  const getMod = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

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
        padding: "20px",
      }}
      expandable={false}
    >
      <Stack gap="lg">
        
        {/* COMPACT DUAL-PANEL GRID LAYOUT */}
        <Grid gutter="xl" align="flex-start">
          
          {/* LEFT PANEL: The 6 Core Attributes Grid */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Text
                size="xs"
                fw={400}
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--theme-color-text-secondary)",
                }}
              >
                Attributes & Saves
              </Text>

              <SimpleGrid cols={{ base: 3, md: 1 }} spacing="xs">
                {abilities.map((ab) => {
                  const score = character.abilityScores[ab.key];
                  const mod = getMod(score);

                  return (
                    <Paper
                      key={ab.key}
                      withBorder
                      p="xs"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.12))";
                        e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.04))";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1), var(--theme-glow-shadow-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
                        e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.015))";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      style={{
                        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
                        borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                        borderRadius: "10px",
                        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        minHeight: isMobile ? "92px" : "105px",
                        padding: "12px",
                      }}
                    >
                      {/* Name + Icon */}
                      <Group justify="space-between" w="100%" wrap="nowrap" style={{ width: "100%" }}>
                        <Text size="10px" fw={700} style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))", letterSpacing: "1px" }}>
                          {ab.short}
                        </Text>
                        <Text size="12px" style={{ opacity: 0.8 }}>{ab.icon}</Text>
                      </Group>

                      {/* Modifier */}
                      <Text
                        fw={700}
                        style={{
                          fontSize: isMobile ? "22px" : "26px",
                          color: "var(--theme-color-accent-primary, #f59e0b)",
                          lineHeight: 1,
                          margin: "4px 0",
                        }}
                      >
                        {mod >= 0 ? `+${mod}` : mod}
                      </Text>

                      {/* Base Score Capsule */}
                      <Text
                        size="12px"
                        fw={700}
                        style={{
                          background: "rgba(255, 255, 255, 0.04)",
                          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          color: "rgba(255, 255, 255, 0.85)",
                          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                          letterSpacing: "0.5px",
                        }}
                      >
                        {score} BASE
                      </Text>
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Grid.Col>

          {/* RIGHT PANEL: Unified Master Skills List Table (Alphabetized, Space-Efficient) */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="md">
              <Text
                size="xs"
                fw={400}
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "var(--theme-color-text-secondary)",
                }}
              >
                Character Skills Modifiers
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" style={{ width: "100%" }}>
                {enrichedSkills.map((skill) => {
                  const isProf = !!skill.proficient;

                  const rowBg = isProf
                    ? "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.05))"
                    : "rgba(255, 255, 255, 0.01)";
                  const rowBorder = isProf
                    ? "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.25))"
                    : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))";
                  const rowShadow = isProf
                    ? "var(--theme-glow-shadow-primary)"
                    : "none";

                  return (
                    <Group
                      key={skill.name}
                      justify="space-between"
                      align="center"
                      wrap="nowrap"
                      p="6px 12px"
                      style={{
                        background: rowBg,
                        border: rowBorder,
                        borderRadius: "8px",
                        boxShadow: rowShadow,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isProf
                          ? "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.08))"
                          : "var(--theme-bg-hover, rgba(255,255,255,0.04))";
                        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = rowBg;
                        e.currentTarget.style.borderColor = isProf
                          ? "var(--theme-border-glow, rgba(245, 158, 11, 0.25))"
                          : "var(--theme-border-subtle, rgba(255, 255, 255, 0.04))";
                      }}
                    >
                      <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                        {/* Gold Star if proficient, or a clean subtle empty circle */}
                        {isProf ? (
                          <span
                            style={{
                              color: "var(--theme-color-accent-primary, #f59e0b)",
                              filter: "drop-shadow(0 0 3px var(--theme-border-glow, rgba(245, 158, 11, 0.4)))",
                              fontSize: "14px",
                              cursor: "default",
                            }}
                          >
                            ★
                          </span>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "14px" }}>○</span>
                        )}

                        <Text
                          size="sm"
                          fw={isProf ? 700 : 500}
                          truncate="end"
                          style={{
                            color: isProf
                              ? "var(--theme-color-text-primary, #fff)"
                              : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                          }}
                        >
                          {skill.name}
                        </Text>

                        {/* Small attribute tag badge */}
                        <Badge
                          size="xs"
                          variant="transparent"
                          style={{
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                            color: "var(--theme-color-text-secondary, #cbd5e1)",
                            fontSize: "8px",
                            fontWeight: 400,
                            padding: "2px 4px",
                            height: "auto",
                          }}
                        >
                          {skill.ability}
                        </Badge>
                      </Group>

                      {/* Right side modifier text */}
                      <Text
                        size="sm"
                        fw={700}
                        style={{
                          color: isProf
                            ? "var(--theme-color-accent-primary, #f59e0b)"
                            : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                        }}
                      >
                        {skill.value >= 0 ? `+${skill.value}` : skill.value}
                      </Text>
                    </Group>
                  );
                })}
              </SimpleGrid>
            </Stack>
          </Grid.Col>

        </Grid>

        {/* COLLAPSIBLE RADAR CHART TOGGLER */}
        <Button
          fullWidth
          onClick={() => setOpened((o) => !o)}
          style={{
            background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            color: "var(--theme-color-accent-primary, #fff)",
            fontWeight: 700,
            transition: "all 0.2s ease",
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontSize: "11px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            height: "40px",
            marginTop: "12px",
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
          {opened ? "Hide Radar Chart" : "Show Radar Chart"}
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
                filter: "drop-shadow(0 0 6px var(--theme-border-glow))",
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
