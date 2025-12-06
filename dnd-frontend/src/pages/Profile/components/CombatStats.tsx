import type React from "react";
import { SimpleGrid, Paper, ThemeIcon, Group } from "@mantine/core";
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
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useMediaQuery } from "@mantine/hooks";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { SectionColor } from "../../../types/SectionColor";

export function CombatStats() {
  const character = useCharacterStore((s) => s.character)!;
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const persist = useCharacterStore((s) => s.persistCharacter);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    persist();
  };

  const deathSavePaperBase: React.CSSProperties = {
    cursor: "pointer",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,0,0,0.08))",
    transition: "all 0.2s ease",
    backdropFilter: "blur(8px)",
    padding: "4px 6px",
  };

  const handleDeathSaveHover =
    (type: "success" | "failure", entering: boolean) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (entering) {
        const color =
          type === "success"
            ? "0,200,160"
            : "255,90,90";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 0 10px rgba(${color},0.3), inset 0 0 6px rgba(${color},0.25)`;
      } else {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }
    };

  const deathSaveConfigs = [
    {
      type: "success" as const,
      iconColor: "teal",
      label: "Death Saves – Successes",
      labelColor: "#0fbba0",
      value: `${character.deathSavesSuccesses ?? 0} / 3`,
    },
    {
      type: "failure" as const,
      iconColor: "red",
      label: "Death Saves – Failures",
      labelColor: "#ff6b6b",
      value: `${character.deathSavesFailures ?? 0} / 3`,
    },
  ];

  return (
    <ExpandableSection
      title="Combat Statistics"
      icon={<span style={{ fontSize: "1.2rem" }}>⚔️</span>}
      color={SectionColor.Red}
      defaultOpen
      style={{
        background:
          "linear-gradient(145deg, rgba(48,0,0,0.35) 0%, rgba(90,0,40,0.4) 50%, rgba(25,0,40,0.4) 100%)",
        borderRadius: 12,
        border: "1px solid rgba(255, 70, 70, 0.25)",
        boxShadow:
          "inset 0 0 10px rgba(255,0,0,0.15), 0 0 18px rgba(255,70,70,0.2)",
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
      expandable={false}
    >
      {/* Death Saves on top (using StatBox) */}
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
                icon= {<IconHeart size={16} />}
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

      {/* Other combat stats */}
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
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,0,0,0.08))",
              border: "1px solid rgba(255,70,70,0.2)",
              boxShadow: "inset 0 0 4px rgba(255,80,80,0.15)",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(255,90,90,0.3), inset 0 0 6px rgba(255,90,90,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "inset 0 0 4px rgba(255,80,80,0.15)";
            }}
          >
            <Group gap="xs" justify="center" align="center">
              <StatBox
              icon={stat.icon}
                variant="elevated"
                label={stat.label}
                labelColor="#e66a05ff"
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
