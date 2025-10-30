import {
  Group,
  NumberInput,
  Stack,
  Title,
  Divider,
  Tooltip,
  Badge,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { IconBrain } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import { useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";

interface AbilitiesSectionProps {
  form: UseFormReturnType<any>;
}

export function AbilitiesSection({ form }: AbilitiesSectionProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const abilityFields = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ] as const;

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

  // 🧮 Compute modifiers dynamically
  const modifiers = useMemo(() => {
    const scores = form.values.abilityScores || {};
    const calcMod = (val: number | undefined) =>
      val ? Math.floor((val - 10) / 2) : 0;

    return {
      strength: calcMod(scores.str ?? scores.strength),
      dexterity: calcMod(scores.dex ?? scores.dexterity),
      constitution: calcMod(scores.con ?? scores.constitution),
      intelligence: calcMod(scores.int ?? scores.intelligence),
      wisdom: calcMod(scores.wis ?? scores.wisdom),
      charisma: calcMod(scores.cha ?? scores.charisma),
    };
  }, [form.values.abilityScores]);

  return (
    <ExpandableSection
      title="Abilities & Spellcasting"
      icon={<IconBrain />}
      color={SectionColor.Teal}
      defaultOpen
    >
      <Stack gap={isMobile ? "sm" : "md"}>
        <Title order={isMobile ? 6 : 5} c="gray.2">
          Ability Scores
        </Title>

        {/* --- Ability Inputs + Modifiers (side by side, equal size) --- */}
        <SimpleGrid
          cols={isMobile ? 1 : 2}
          spacing={isMobile ? "sm" : "md"}
          verticalSpacing={isMobile ? "sm" : "md"}
        >
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
              <Group
                gap="xs"
                align="flex-end"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                {/* Ability Score Input */}
                <NumberInput
                  label={ability.charAt(0).toUpperCase() + ability.slice(1)}
                  min={1}
                  max={30}
                  {...form.getInputProps(`abilityScores.${ability.slice(0, 3)}`)}
                  styles={{
                    label: { fontWeight: 500 },
                    input: { textAlign: "center" },
                  }}
                  style={{ flex: 1 }}
                />

                {/* Modifier Input (readonly, same size & height) */}
                <NumberInput
                  label="Mod"
                  value={modifiers[ability]}
                  readOnly
                  styles={{
                    label: { textAlign: "center", fontWeight: 450, opacity: 0.8 },
                    input: {
                      textAlign: "center",
                      background: "#000f3a3d",
                      border: "1px solid rgba(0, 255, 255, 0.36)",
                    },
                  }}
                  style={{
                    width: "90px",
                  }}
                />
              </Group>
            </Tooltip>
          ))}
        </SimpleGrid>
        
        <Divider my="sm" label="Saving Throws" labelPosition="center" />

        {/* --- Saving Throws --- */}
        <Stack gap={isMobile ? "xs" : "sm"}>
          {(isMobile ? abilityFields : [abilityFields.slice(0, 3), abilityFields.slice(3)]).map(
            (group, idx) => (
              <Group key={idx} grow wrap={isMobile ? "wrap" : "nowrap"}>
                {(Array.isArray(group) ? group : [group]).map((ability) => (
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
                      styles={{
                        input: {
                          textAlign: "center",
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Group>
            )
          )}
        </Stack>

        <Divider my="sm" label="Spellcasting" labelPosition="center" />

        {/* --- Spellcasting --- */}
        <Group grow wrap={isMobile ? "wrap" : "nowrap"}>
          <Tooltip
            label="Spell Save DC = 8 + Proficiency Bonus + Spellcasting Ability Modifier"
            color="dark"
            withArrow
          >
            <NumberInput
              label="Spell Save DC"
              {...form.getInputProps("spellSaveDc")}
              style={{ flex: 1, minWidth: isMobile ? "100%" : 0 }}
            />
          </Tooltip>

          <Tooltip
            label="Spell Attack Bonus = Proficiency Bonus + Spellcasting Ability Modifier"
            color="dark"
            withArrow
          >
            <NumberInput
              label="Spell Attack Bonus"
              {...form.getInputProps("spellAttackBonus")}
              style={{ flex: 1, minWidth: isMobile ? "100%" : 0 }}
            />
          </Tooltip>
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
