import { Title, Grid } from "@mantine/core";
import {
  IconShield,
  IconHeart,
  IconTarget,
  IconRun,
  IconSword,
  IconArrowUp,
  IconSkull,
  IconEye,
} from "@tabler/icons-react";
import { StatBox } from "./StatBox";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useMediaQuery } from "@mantine/hooks";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { SectionColor } from "../../../types/SectionColor";

export function CombatStats() {
  const character = useCharacterStore((state) => state.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const stats = [
    { label: "Armor Class", value: character.armorClass, color: "blue", icon: <IconShield size={18} /> },
    { label: "Hit Points", value: `${character.hitPoints} / ${character.maxHitPoints}${character.temporaryHitPoints ? ` (+${character.temporaryHitPoints})` : ""}`, color: "red", icon: (character.hitPoints > 0 ? <IconHeart size={18} /> : <IconSkull size={18} />) },
    { label: "Initiative", value: `+${character.initiative}`, color: "orange", icon: <IconTarget size={18} /> },
    { label: "Speed", value: `${character.speed} ft`, color: "green", icon: <IconRun size={18} /> },
    { label: "Proficiency", value: `+${character.proficiencyBonus}`, color: "grape", icon: <IconSword size={18} /> },
    { label: "Size", value: character.size, color: "gray", icon: <IconArrowUp size={18} /> },
    { label: "Death Saves – Successes", value: `${character.deathSavesSuccesses} / 3`, color: "teal", icon: <IconHeart size={18} /> },
    { label: "Death Saves – Failures", value: `${character.deathSavesFailures} / 3`, color: "red", icon: <IconHeart size={18} /> },
    { label: "Hit Dice", value: `${character.hitDice}`, color: "teal", icon: <IconHeart size={18} /> },
    { label: "Passive Perception", value: `${character.passivePerception}`, color: "teal", icon: <IconEye size={18} /> },
    { label: "Passive Investigation", value: `${character.passiveInvestigation}`, color: "teal", icon: <IconEye size={18} /> },
    { label: "Passive Insight", value: `${character.passiveInsight}`, color: "teal", icon: <IconEye size={18} /> },
  ];

  return (
    <ExpandableSection
      title="Combat Statistics"
      icon={<span style={{ fontSize: "1.2rem" }}>⚔️</span>}
      color={SectionColor.Red}
      transparent
      defaultOpen
      style={{
        background: "linear-gradient(135deg, rgba(48, 0, 0, 0.37), rgba(29, 0, 66, 0.45))",
        boxShadow: "0 0 10px rgba(255, 60, 60, 0.2), inset 0 0 6px rgba(255, 0, 0, 0.15)",
        borderColor: "rgba(255, 60, 60, 0.3)",
        borderRadius: "10px",
        transition: "all 0.25s ease-in-out",
      }}
    >
      <Grid gutter="xs" justify="flex-start">
        {stats.map((stat) => (
          <Grid.Col key={stat.label} span={6}>
            <div
              style={{
                minHeight: isMobile ? "72px" : "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "yellow",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "6px",
                transition: "transform 0.2s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 0 8px rgba(255, 100, 100, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <StatBox
                size="xs"
                label={stat.label}
                value={stat.value}
                color={stat.color}
                icon={stat.icon}
                background="transparent"
                fullWidth
                style={{minWidth:"72px"}}
              />
            </div>
          </Grid.Col>
        ))}
      </Grid>
    </ExpandableSection>
  );
}
