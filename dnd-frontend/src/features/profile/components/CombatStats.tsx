import type React from "react";
import { SimpleGrid, Paper, Group, Text, Stack, Grid, ActionIcon } from "@mantine/core";
import {
  IconShield,
  IconTarget,
  IconRun,
  IconSword,
  IconArrowUp,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";

import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { SectionColor } from "@appTypes/SectionColor";
import { useIsMobile } from "@hooks/useIsMobile";

export function CombatStats() {
  const character = useCurrentCharacter()!;
  const { updateCharacter } = useCharacterCoreActions();
  const isMobile = useIsMobile();

  // Core Combat Stats (The Holy Trinity: AC, Initiative, Speed)
  const coreStats = [
    {
      label: "Armor Class",
      value: character.armorClass,
      color: "var(--theme-color-accent-secondary, #06b6d4)",
      icon: <IconShield size={isMobile ? 22 : 26} />,
      glowColor: "rgba(6, 182, 212, 0.15)",
    },
    {
      label: "Initiative",
      value: character.initiative >= 0 ? `+${character.initiative}` : character.initiative,
      color: "var(--theme-color-accent-primary, #f59e0b)",
      icon: <IconTarget size={isMobile ? 22 : 26} />,
      glowColor: "rgba(245, 158, 11, 0.15)",
    },
    {
      label: "Speed",
      value: `${character.speed} ft`,
      color: "var(--theme-color-accent-secondary, #10b981)",
      icon: <IconRun size={isMobile ? 22 : 26} />,
      glowColor: "rgba(16, 185, 129, 0.15)",
    },
  ];

  // Secondary & Passive Senses Stats
  const secondaryStats = [
    {
      label: "Proficiency",
      value: `+${character.proficiencyBonus}`,
      color: "var(--theme-color-accent-primary, #f59e0b)",
      icon: <IconSword size={16} />,
    },
    {
      label: "Passive Investigation",
      value: character.passiveInvestigation ?? 10,
      color: "var(--theme-color-accent-secondary, #a855f7)",
      icon: <IconEye size={16} />,
    },
    {
      label: "Size",
      value: character.size || "Medium",
      color: "var(--theme-color-text-secondary, #94a3b8)",
      icon: <IconArrowUp size={16} />,
    },
    {
      label: "Passive Perception",
      value: character.passivePerception ?? 10,
      color: "var(--theme-color-accent-secondary, #a855f7)",
      icon: <IconEye size={16} />,
    },
    {
      label: "Hit Dice",
      value: character.hitDice || "—",
      color: "var(--theme-color-accent-secondary, #06b6d4)",
      icon: <IconSword size={16} />,
    },
    {
      label: "Passive Insight",
      value: character.passiveInsight ?? 10,
      color: "var(--theme-color-accent-secondary, #a855f7)",
      icon: <IconEye size={16} />,
    },
  ];

  // Interactive Death Saves Click handlers
  const handleSuccessCircleClick = (index: number) => {
    const current = character.deathSavesSuccesses ?? 0;
    let next = index;
    if (current === index) {
      next = index - 1;
    }
    updateCharacter({
      ...character,
      deathSavesSuccesses: next,
    });
  };

  const handleFailureCircleClick = (index: number) => {
    const current = character.deathSavesFailures ?? 0;
    let next = index;
    if (current === index) {
      next = index - 1;
    }
    updateCharacter({
      ...character,
      deathSavesFailures: next,
    });
  };

  const handleResetDeathSaves = () => {
    updateCharacter({
      ...character,
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
    });
  };

  // Helper to render beautiful glowing indicator bubbles for Death Saves
  const renderDeathSaveBubbles = (
    type: "success" | "failure",
    count: number,
    onClick: (index: number) => void
  ) => {
    const isSuccess = type === "success";
    const activeColor = isSuccess
      ? "var(--theme-color-accent-secondary, #06b6d4)"
      : "var(--theme-color-accent-primary, #ef4444)";

    return (
      <Group gap="xs" justify="center" wrap="nowrap">
        {[1, 2, 3].map((index) => {
          const isActive = count >= index;
          return (
            <div
              key={index}
              onClick={() => onClick(index)}
              style={{
                width: isMobile ? "16px" : "18px",
                height: isMobile ? "16px" : "18px",
                borderRadius: "50%",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                background: isActive ? activeColor : "rgba(255, 255, 255, 0.03)",
                border: isActive
                  ? `2px solid ${activeColor}`
                  : "2px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.12))",
                boxShadow: isActive
                  ? `0 0 10px ${activeColor}, inset 0 1px 1px rgba(255, 255, 255, 0.2)`
                  : "inset 0 1px 1px rgba(255, 255, 255, 0.02)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.2)";
                if (!isActive) {
                  e.currentTarget.style.borderColor = activeColor;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1.0)";
                if (!isActive) {
                  e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.12))";
                }
              }}
            />
          );
        })}
      </Group>
    );
  };

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
      <Stack gap="md" style={{ padding: isMobile ? "0px" : "4px" }}>
        
        {/* TOP SECTION: The Core Combat Trinity (AC, Initiative, Speed) */}
        <SimpleGrid cols={3} spacing="xs">
          {coreStats.map((stat) => (
            <Paper
              key={stat.label}
              withBorder
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
                e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.04))";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
                e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.015))";
                e.currentTarget.style.boxShadow = "inset 0 1px 1px rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              style={{
                background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                borderRadius: "14px",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                padding: isMobile ? "10px 4px" : "18px 12px",
              }}
            >
              {/* Radial backdrop highlight */}
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: "-50%",
                  width: "200%",
                  height: "200%",
                  background: `radial-gradient(circle, ${stat.glowColor} 0%, transparent 60%)`,
                  opacity: 0.15,
                  pointerEvents: "none",
                }}
              />

              {/* Icon */}
              <span style={{ color: stat.color, marginBottom: isMobile ? "4px" : "6px", display: "flex", alignItems: "center" }}>
                {stat.icon}
              </span>

              {/* Stat Value */}
              <Text
                fw={900}
                style={{
                  fontSize: isMobile ? "18px" : "26px",
                  color: stat.color,
                  lineHeight: 1.1,
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                {stat.value}
              </Text>

              {/* Label */}
              <Text
                size="9px"
                fw={700}
                tt="uppercase"
                ta="center"
                style={{
                  color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.6))",
                  letterSpacing: "0.5px",
                  marginTop: "4px",
                }}
              >
                {stat.label}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>

        {/* MIDDLE SECTION: Split Layout with Interactive Death Saves & Secondary details */}
        <Grid gutter="xs" align="stretch">
          
          {/* Death Saves Control Block */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Paper
              withBorder
              p="md"
              style={{
                background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                borderRadius: "14px",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                minHeight: isMobile ? "auto" : "154px",
              }}
            >
              {/* Block Header */}
              <Group justify="space-between" align="center" mb="xs" wrap="nowrap">
                <Text
                  size="xs"
                  fw={800}
                  style={{
                    color: "var(--theme-color-text-primary, #fff)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Death Saves
                </Text>
                
                {/* Reset Trigger */}
                {((character.deathSavesSuccesses ?? 0) > 0 || (character.deathSavesFailures ?? 0) > 0) && (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="gray"
                    onClick={handleResetDeathSaves}
                    title="Reset Death Saves"
                    style={{ transition: "transform 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(90deg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
                  >
                    <IconRefresh size={14} />
                  </ActionIcon>
                )}
              </Group>

              {/* Rows stack */}
              <Stack gap="sm" style={{ flex: 1, justifyContent: "center" }}>
                
                {/* Successes row */}
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text
                    size="xs"
                    fw={700}
                    style={{
                      color: "var(--theme-color-accent-secondary, #06b6d4)",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Successes
                  </Text>
                  {renderDeathSaveBubbles("success", character.deathSavesSuccesses ?? 0, handleSuccessCircleClick)}
                </Group>

                {/* Micro divider */}
                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.04)" }} />

                {/* Failures row */}
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text
                    size="xs"
                    fw={700}
                    style={{
                      color: "var(--theme-color-accent-primary, #ef4444)",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Failures
                  </Text>
                  {renderDeathSaveBubbles("failure", character.deathSavesFailures ?? 0, handleFailureCircleClick)}
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Secondary Stats & Senses list (Flat List Table style) */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" style={{ height: "100%" }}>
              {secondaryStats.map((stat) => (
                <Paper
                  key={stat.label}
                  withBorder
                  p="xs"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.12))";
                    e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.03))";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.04))";
                    e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.01))";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  style={{
                    background: "var(--theme-bg-card, rgba(255, 255, 255, 0.01))",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                    borderRadius: "10px",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                  }}
                >
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ color: stat.color, display: "flex", alignItems: "center" }}>
                      {stat.icon}
                    </span>
                    <Text
                      size="xs"
                      fw={700}
                      truncate="end"
                      style={{
                        color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.65))",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      {stat.label}
                    </Text>
                  </Group>

                  <Text
                    size="sm"
                    fw={800}
                    style={{
                      color: stat.color,
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    }}
                  >
                    {stat.value}
                  </Text>
                </Paper>
              ))}
            </SimpleGrid>
          </Grid.Col>

        </Grid>
      </Stack>
    </ExpandableSection>
  );
}
