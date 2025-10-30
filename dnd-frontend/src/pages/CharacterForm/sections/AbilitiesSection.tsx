import {
  Group,
  NumberInput,
  Stack,
  Title,
  Divider,
  Tooltip,
} from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconBrain } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";

interface AbilitiesSectionProps {
  form: UseFormReturnType<any>;
}

export function AbilitiesSection({ form }: AbilitiesSectionProps) {
  const abilityFields = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

  const abilityTooltips: Record<string, string> = {
    strength: "Measures physical power. Modifier = (STR - 10) / 2 (rounded down).",
    dexterity: "Agility, reflexes, and balance. Modifier = (DEX - 10) / 2.",
    constitution: "Endurance and vitality. Modifier = (CON - 10) / 2.",
    intelligence: "Reasoning and memory. Modifier = (INT - 10) / 2.",
    wisdom: "Perception and insight. Modifier = (WIS - 10) / 2.",
    charisma: "Personality and leadership. Modifier = (CHA - 10) / 2.",
  };

  const saveTooltips: Record<string, string> = {
    strength: "STR Save = STR Modifier + Proficiency (if proficient).",
    dexterity: "DEX Save = DEX Modifier + Proficiency (if proficient).",
    constitution: "CON Save = CON Modifier + Proficiency (if proficient).",
    intelligence: "INT Save = INT Modifier + Proficiency (if proficient).",
    wisdom: "WIS Save = WIS Modifier + Proficiency (if proficient).",
    charisma: "CHA Save = CHA Modifier + Proficiency (if proficient).",
  };

  return (
    <ExpandableSection
      title="Abilities & Spellcasting"
      icon={<IconBrain />}
      color={SectionColor.Teal}
      defaultOpen
    >
      <Stack>
        <Title order={5} c="gray.2">
          Ability Scores
        </Title>
        <Group grow>
          {abilityFields.map((ability) => (
            <Tooltip
              key={ability}
              label={abilityTooltips[ability]}
              color="dark"
              withArrow
              multiline
              maw={250}
              transitionProps={{ transition: "fade", duration: 150 }}
            >
              <NumberInput
                label={ability.charAt(0).toUpperCase() + ability.slice(1)}
                min={1}
                max={30}
                {...form.getInputProps(`abilityScores.${ability}`)}
              />
            </Tooltip>
          ))}
        </Group>

        <Divider my="sm" label="Saving Throws" labelPosition="center" />

        <Group grow>
          {abilityFields.map((ability) => (
            <Tooltip
              key={`${ability}-save`}
              label={saveTooltips[ability]}
              color="dark"
              withArrow
              multiline
              maw={250}
              transitionProps={{ transition: "fade", duration: 150 }}
            >
              <NumberInput
                label={`${ability.charAt(0).toUpperCase() + ability.slice(1)} Save`}
                {...form.getInputProps(`savingThrows.${ability}`)}
              />
            </Tooltip>
          ))}
        </Group>

        <Divider my="sm" label="Spellcasting" labelPosition="center" />

        <Group grow>
          <Tooltip
            label="Spell Save DC = 8 + Proficiency Bonus + Spellcasting Ability Modifier"
            color="dark"
            withArrow
          >
            <NumberInput label="Spell Save DC" {...form.getInputProps("spellSaveDc")} />
          </Tooltip>

          <Tooltip
            label="Spell Attack Bonus = Proficiency Bonus + Spellcasting Ability Modifier"
            color="dark"
            withArrow
          >
            <NumberInput
              label="Spell Attack Bonus"
              {...form.getInputProps("spellAttackBonus")}
            />
          </Tooltip>
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
