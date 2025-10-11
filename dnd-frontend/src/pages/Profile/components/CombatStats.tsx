import { Paper, Title, Grid } from "@mantine/core";
import { IconShield, IconHeart, IconTarget, IconRun, IconSword, IconArrowUp } from "@tabler/icons-react";
import { StatBox } from "./StatBox";
import { ExpandableSection } from "./ExpendableSection";
import type { Character } from "../../../types/Character/Character";

export function CombatStats({character}: { character: Character }) {
  return (
    <ExpandableSection title="Combat Statistics" transparent={true} defaultOpen icon={<span style={{ fontSize: "1.2rem" }}>⚔️</span>} color="red">
      <Title order={3} size="h3" mb="md">Combat Statistics</Title>
      <Grid gutter="xs" justify="flex-start" bg={"transparent"}>
        {[
          { label: "Armor Class", value: character.armorClass, color: "blue", icon: <IconShield size={18} /> },
          { label: "Hit Points", value: `${character.hitPoints} / ${character.maxHitPoints}${character.temporaryHitPoints ? ` (+${character.temporaryHitPoints})` : ""}`, color: "red", icon: <IconHeart size={18} /> },
          { label: "Initiative", value: `+${character.initiative}`, color: "orange", icon: <IconTarget size={18} /> },
          { label: "Speed", value: `${character.speed} ft`, color: "green", icon: <IconRun size={18} /> },
          { label: "Proficiency", value: `+${character.proficiencyBonus}`, color: "indigo", icon: <IconSword size={18} /> },
          { label: "Size", value: character.size, color: "gray", icon: <IconArrowUp size={18} /> },
          { label: "Death Saves Successes", value: `${character.deathSavesSuccesses} / 3`, color: "green", icon: <IconHeart size={18} /> },
          { label: "Death Saves Failures", value: `${character.deathSavesFailures} / 3`, color: "red", icon: <IconHeart size={18} /> },
        ].map((stat) => (
          <Grid.Col
            key={stat.label}
            span={6} // 2 per row on small screens by default
            style={{ minWidth: 160 }} // ensures wrapping on mobile
          >
            <StatBox
              size="xs"
              label={stat.label}
              value={stat.value}
              color={stat.color}
              icon={stat.icon}
              background="transparent"
            />
          </Grid.Col>
        ))}
      </Grid>
    </ExpandableSection>
  );
}
