import type React from "react";
import { SimpleGrid, Paper, Group } from "@mantine/core";
import {
  IconShield,
  IconHeart,
  IconTarget,
  IconRun,
  IconSword,
  IconArrowUp,
  IconEye,
} from "@tabler/icons-react";
import { StatBox } from "./StatBox";
import { ExpandableSection } from "@components/ExpandableSection";

import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { SectionColor } from "@appTypes/SectionColor";
import { useIsMobile } from "@hooks/useIsMobile";

export function CombatStats() {
  const character = useCurrentCharacter()!;
  const { updateCharacter } = useCharacterCoreActions();
  const isMobile = useIsMobile();

  const stats = [
    { label: "Armor Class", value: character.armorClass, color: "blue", icon: <IconShield size={18} /> },
    { label: "Initiative", value: `+${character.initiative}`, color: "orange", icon: <IconTarget size={18} /> },
    { label: "Speed", value: `${character.speed} ft`, color: "green", icon: <IconRun size={18} /> },
    { label: "Proficiency", value: `+${character.proficiencyBonus}`, color: "grape", icon: <IconSword size={18} /> },
    { label: "Size", value: character.size, color: "gray", icon: <IconArrowUp size={18} /> },
    { label: "Hit Dice", value: `${character.hitDice}`, color: "teal", icon: <IconSword size={18} /> },
    { label: "Passive Perception", value: `${character.passivePerception}`, color: "teal", icon: <IconEye size={18} /> },
    { label: "Passive Investigation", value: `${character.passiveInvestigation}`, color: "teal", icon: <IconEye size={18} /> },
    { label: "Passive Insight", value: `${character.passiveInsight}`, color: "teal", icon: <IconEye size={18} /> },
  ];

  const handleDeathSaveClick = (type: "success" | "failure") => {
    const label = type === "success" ? "success" : "failure";
    if (!window.confirm(`Add 1 death save ${label}?`)) return;

    const updated = { ...character };

    if (type === "success") {
      updated.deathSavesSuccesses = Math.min(
        3,
        (character.deathSavesSuccesses ?? 0) + 1
      );
    } else {
      updated.deathSavesFailures = Math.min(
        3,
        (character.deathSavesFailures ?? 0) + 1
      );
    }

    updateCharacter(updated);
  };

  const deathSavePaperBase: React.CSSProperties = {
    cursor: "pointer",
    borderRadius: 12,
    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
    background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
    transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
    backdropFilter: "blur(8px)",
    padding: "4px 6px",
  };

  const handleDeathSaveHover =
    (type: "success" | "failure", entering: boolean) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (entering) {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)";
      } else {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
        e.currentTarget.style.boxShadow = "none";
      }
    };

  const deathSaveConfigs = [
    {
      type: "success" as const,
      iconColor: "teal",
      label: "Death Saves - Successes",
      labelColor: "var(--theme-color-accent-secondary, #06b6d4)",
      value: `${character.deathSavesSuccesses ?? 0} / 3`,
    },
    {
      type: "failure" as const,
      iconColor: "red",
      label: "Death Saves - Failures",
      labelColor: "var(--theme-color-accent-primary, #ef4444)",
      value: `${character.deathSavesFailures ?? 0} / 3`,
    },
  ];

  return (
    <ExpandableSection
      title="Combat Statistics"
      color={SectionColor.Red}
      defaultOpen
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        borderRadius: 16,
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
      expandable={false}
    >
      <SimpleGrid
        cols={2}
        spacing="xs"
        mb="xs"
        style={{ paddingInline: isMobile ? 4 : 8, paddingTop: 4 }}
      >
        {deathSaveConfigs.map((ds) => (
          <Paper
            key={ds.type}
            style={deathSavePaperBase}
            onClick={() => handleDeathSaveClick(ds.type)}
            onMouseEnter={handleDeathSaveHover(ds.type, true)}
            onMouseLeave={handleDeathSaveHover(ds.type, false)}
          >
            <Group gap="xs" justify="center" align="center">
              <StatBox
                icon={<IconHeart size={16} />}
                variant="glass"
                label={ds.label}
                labelColor={ds.labelColor}
                value={ds.value}
                color={ds.iconColor}
                background="transparent"
                size="sm"
                hoverEffect={false}
                fullWidth
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              />
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid
        cols={isMobile ? 2 : 3}
        spacing="xs"
        verticalSpacing="xs"
        style={{
          padding: isMobile ? "4px" : "8px",
        }}
      >
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            radius="md"
            p="xs"
            style={{
              background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
              borderRadius: "12px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <Group gap="xs" justify="center" align="center">
              <StatBox
                icon={stat.icon}
                variant="elevated"
                label={stat.label}
                labelColor="var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))"
                value={stat.value}
                color={stat.color}
                background="transparent"
                size="sm"
                hoverEffect={false}
                fullWidth
                style={{
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              />
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
    </ExpandableSection>
  );
}
