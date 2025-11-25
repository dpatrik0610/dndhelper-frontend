import {
  SimpleGrid,
  Paper,
  ThemeIcon,
  Group,
} from "@mantine/core";
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
  const character = useCharacterStore((state) => state.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const stats = [
    { label: "Armor Class", value: character.armorClass, color: "blue", icon: <IconShield size={18} /> },
    { label: "Initiative", value: `+${character.initiative}`, color: "orange", icon: <IconTarget size={18} /> },
    { label: "Speed", value: `${character.speed} ft`, color: "green", icon: <IconRun size={18} /> },
    { label: "Proficiency", value: `+${character.proficiencyBonus}`, color: "grape", icon: <IconSword size={18} /> },
    { label: "Size", value: character.size, color: "gray", icon: <IconArrowUp size={18} /> },
    { label: "Death Saves – Successes", value: `${character.deathSavesSuccesses} / 3`, color: "teal", icon: <IconHeart size={18} /> },
    { label: "Death Saves – Failures", value: `${character.deathSavesFailures} / 3`, color: "red", icon: <IconHeart size={18} /> },
    { label: "Hit Dice", value: `${character.hitDice}`, color: "teal", icon: <IconSword size={18} /> },
    { label: "Passive Perception", value: `${character.passivePerception}`, color: "teal", icon: <IconEye size={18} /> },
    { label: "Passive Investigation", value: `${character.passiveInvestigation}`, color: "teal", icon: <IconEye size={18} /> },
    { label: "Passive Insight", value: `${character.passiveInsight}`, color: "teal", icon: <IconEye size={18} /> },
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
    >
      <SimpleGrid
        cols={isMobile ? 2 : 3}
        spacing="xs"
        verticalSpacing="xs"
        style={{
          padding: isMobile ? "4px" : "8px",
          position: "relative",
        }}
      >
        {stats.map((stat) => (
          <Paper
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
                <ThemeIcon
                  size="md"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: stat.color, to: "pink", deg: 135 }}
                >
                  {stat.icon}
                </ThemeIcon>

                <StatBox
                  variant="glass"
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
