import { useMemo } from "react";
import type { Skill } from "@appTypes/Character/Skill";
import {
  Grid,
  Paper,
  Stack,
  Group,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCurrentCharacter, useEffectiveStats } from "@store/character/characterSelectors";
import { EffectHint, RollMark } from "@features/profile/components/EffectHint";
import { changedColor } from "@utils/effects";
import { useIsMobile } from "@hooks/useIsMobile";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";
import CustomBadge from "@components/common/CustomBadge";

// Stable fallback, so the skills memo below doesn't recompute on every render.
const NO_SKILLS: Skill[] = [];

export function AbilityScores() {
  const character = useCurrentCharacter()!;
  const { stats } = useEffectiveStats()!;
  const isMobile = useIsMobile();

  const skills = character.skills ?? NO_SKILLS;

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
                  const stat = stats[ab.key];
                  const mod = getMod(stat.value);

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
                      <EffectHint stat={stat}>
                        <Text
                          fw={700}
                          style={{
                            fontSize: isMobile ? "22px" : "26px",
                            color: changedColor(stat) ?? "var(--theme-color-accent-primary, #f59e0b)",
                            lineHeight: 1,
                            margin: "4px 0",
                          }}
                        >
                          {mod >= 0 ? `+${mod}` : mod}
                        </Text>
                      </EffectHint>

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
                        {stat.value === stat.base ? `${stat.base} BASE` : `${stat.base} → ${stat.value}`}
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
                Saving Throws
              </Text>

              <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="xs" style={{ width: "100%" }}>
                {abilities.map((ab) => {
                  const saveStat = stats[`save:${ab.key}`];
                  const save = saveStat.value;
                  return (
                    <Group
                      key={ab.saveKey}
                      justify="space-between"
                      wrap="nowrap"
                      p="6px 10px"
                      style={{
                        background: "rgba(255, 255, 255, 0.01)",
                        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                        borderRadius: "8px",
                      }}
                    >
                      <Text size="xs" fw={700} style={{ color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))", letterSpacing: "1px" }}>
                        {ab.short}
                      </Text>
                      <EffectHint stat={saveStat}>
                        <RollMark roll={saveStat.roll} />
                        <Text size="sm" fw={700} style={{ color: changedColor(saveStat) ?? "var(--theme-color-accent-primary, #f59e0b)" }}>
                          {save >= 0 ? `+${save}` : save}
                        </Text>
                      </EffectHint>
                    </Group>
                  );
                })}
              </SimpleGrid>

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

              <div style={{ width: "100%", columns: isMobile ? 1 : 2, columnGap: "var(--mantine-spacing-xs)" }}>
                {enrichedSkills.map((skill) => {
                  const isProf = !!skill.proficient;
                  const skillStat = stats[`skill:${skill.name}`];
                  const skillValue = skillStat?.value ?? skill.value;

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
                        breakInside: "avoid",
                        marginBottom: "var(--mantine-spacing-xs)",
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
                              color: "#121214",
                              filter: "drop-shadow(0 0 2px rgba(0, 0, 0, 0.2))",
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
                              ? "#121214"
                              : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                          }}
                        >
                          {skill.name}
                        </Text>

                        {/* Small attribute tag badge */}
                        <CustomBadge
                          size="xs"
                          variant="themed"
                          label={skill.ability}
                          style={{
                            fontSize: "8px",
                            fontWeight: isProf ? 700 : 400,
                            padding: "2px 4px",
                            height: "auto",
                            ...(isProf ? {
                              background: "rgba(18, 18, 20, 0.15)",
                              border: "1px solid rgba(18, 18, 20, 0.18)",
                              color: "#121214",
                              textShadow: "none",
                              boxShadow: "none",
                            } : undefined),
                          }}
                        />
                      </Group>

                      {/* Right side modifier text */}
                      <EffectHint stat={skillStat}>
                        <RollMark roll={skillStat?.roll} />
                        <Text
                          size="sm"
                          fw={700}
                          style={{
                            // Green/red would be unreadable on the gold proficient row; the dotted hint still marks it.
                            color: isProf
                              ? "#121214"
                              : changedColor(skillStat) ?? "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                          }}
                        >
                          {skillValue >= 0 ? `+${skillValue}` : skillValue}
                        </Text>
                      </EffectHint>
                    </Group>
                  );
                })}
              </div>
            </Stack>
          </Grid.Col>

        </Grid>

      </Stack>
    </ExpandableSection>
  );
}
