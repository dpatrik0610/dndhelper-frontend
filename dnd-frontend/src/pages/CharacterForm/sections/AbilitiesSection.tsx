import { Group, Stack, Title, Divider, SimpleGrid, Select } from "@mantine/core";
import { useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { IconBrain } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import { FormNumberInput } from "../../../components/common/FormNumberInput";
import type { SavingThrows } from "../../../types/Character/SavingThrows";
import { InfoIconPopover } from "../../../components/common/InfoIconPopover";
import "../../../styles/glassyInput.css";
import { abilityTooltips, saveTooltips } from "../Tooltips/tooltips";

const map = {
  strength: "str",
  dexterity: "dex",
  constitution: "con",
  intelligence: "int",
  wisdom: "wis",
  charisma: "cha",
} as const;

type AbilityLong = keyof typeof map;
type AbilityShort = (typeof map)[AbilityLong];
type AbilityKey = AbilityShort;
type SpellcastingAbility = AbilityKey | "none";

const saveKeyMap: Record<AbilityLong, keyof SavingThrows> = {
  strength: "strength",
  dexterity: "dexterity",
  constitution: "constitution",
  intelligence: "intelligence",
  wisdom: "wisdom",
  charisma: "charisma",
};

export function AbilitiesSection() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const characterForm = useCharacterFormStore(s => s.characterForm);
  const setCharacterForm = useCharacterFormStore(s => s.setCharacterForm);

  const abilityFields = Object.keys(map) as AbilityLong[];
  const input = { input: "glassy-input", label: "glassy-label" };

  const modifiers = useMemo(() => {
    const s = characterForm.abilityScores;
    const M = (v: number) => Math.floor((v - 10) / 2);
    return {
      strength: M(s.str),
      dexterity: M(s.dex),
      constitution: M(s.con),
      intelligence: M(s.int),
      wisdom: M(s.wis),
      charisma: M(s.cha),
    };
  }, [characterForm.abilityScores]);

  const spellcastKey = characterForm.spellcastingAbility as SpellcastingAbility;

  const spellMod =
    spellcastKey !== "none"
      ? Math.floor((characterForm.abilityScores[spellcastKey] - 10) / 2)
      : null;

  const prof = characterForm.proficiencyBonus ?? 0;
  const spellSaveDc = spellMod !== null ? 8 + prof + spellMod : 0;
  const spellAttackBonus = spellMod !== null ? prof + spellMod : 0;

  return (
    <ExpandableSection
      title="Abilities & Spellcasting"
      icon={<IconBrain />}
      color={SectionColor.Teal}
      defaultOpen
    >
      <Stack gap={isMobile ? "sm" : "md"}>

        <Title order={isMobile ? 6 : 5} c="gray.2">Ability Scores</Title>

        <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? "sm" : "md"}>
          {abilityFields.map(a => {
            const short: AbilityShort = map[a];

            return (
              <Stack key={a} gap={4} style={{ width: "100%" }}>
                <InfoIconPopover title={a.charAt(0).toUpperCase() + a.slice(1)}>
                  {abilityTooltips[a]}
                </InfoIconPopover>

                <Group gap="xs" align="flex-end" wrap="nowrap">
                  <FormNumberInput
                    label={a.charAt(0).toUpperCase() + a.slice(1)}
                    min={1}
                    max={30}
                    classNames={input}
                    value={characterForm.abilityScores[short]}
                    onChange={v =>
                      setCharacterForm({
                        abilityScores: { ...characterForm.abilityScores, [short]: v },
                      })
                    }
                    styles={{ input: { textAlign: "center" } }}
                    style={{ flex: 1 }}
                  />

                  <FormNumberInput
                    label="Mod"
                    classNames={input}
                    value={modifiers[a]}
                    min={-30}
                    max={30}
                    disabled
                    hideControls
                    onChange={() => {}}
                    styles={{
                      input: {
                        textAlign: "center",
                        border: "1px solid rgba(100,255,100,0.45)",
                        color: "#8fe7ff",
                        pointerEvents: "none",
                      },
                    }}
                    style={{ width: "90px" }}
                  />
                </Group>
              </Stack>
            );
          })}
        </SimpleGrid>

        <Divider my="sm" label="Saving Throws" labelPosition="center" />

        <Stack gap={isMobile ? "sm" : "md"}>
          {(isMobile ? abilityFields : [abilityFields.slice(0, 3), abilityFields.slice(3)]).map((list, i) => (
            <Group key={i} grow wrap="wrap">
              {(Array.isArray(list) ? list : [list]).map(a => {
                const saveKey = saveKeyMap[a];

                return (
                  <Stack key={a} gap={4} style={{ width: isMobile ? "100%" : "48%" }}>
                    <InfoIconPopover title={`${a.charAt(0).toUpperCase() + a.slice(1)} Save`}>
                      {saveTooltips[a]}
                    </InfoIconPopover>

                    <FormNumberInput
                      label={`${a.charAt(0).toUpperCase() + a.slice(1)} Save`}
                      classNames={input}
                      value={characterForm.savingThrows[saveKey]}
                      onChange={v =>
                        setCharacterForm({
                          savingThrows: { ...characterForm.savingThrows, [saveKey]: v },
                        })
                      }
                      styles={{ input: { textAlign: "center" } }}
                    />
                  </Stack>
                );
              })}
            </Group>
          ))}
        </Stack>

        <Divider my="sm" label="Spellcasting" labelPosition="center" />

        <Stack gap={isMobile ? "sm" : "md"}>

          <Stack gap={4} style={{ flex: 1 }}>
            <InfoIconPopover title="Spellcasting Ability">
              Please select the ability that your character uses for spellcasting. It's determined by your class.<br /><br /> For fighters with the Arcane Archer or Eldritch Knight archetypes, select Intelligence (INT).<br /><br /> If your character does not cast spells, select "None".
            </InfoIconPopover>

            <Select
              classNames={input}
              label="Spellcasting Ability"
              value={characterForm.spellcastingAbility}
              data={[
                { value: "none", label: "None" },
                { value: "str", label: "Strength (STR)" },
                { value: "dex", label: "Dexterity (DEX)" },
                { value: "con", label: "Constitution (CON)" },
                { value: "int", label: "Intelligence (INT)" },
                { value: "wis", label: "Wisdom (WIS)" },
                { value: "cha", label: "Charisma (CHA)" },
              ]}
              onChange={v =>
                setCharacterForm({ spellcastingAbility: (v ?? "none") as SpellcastingAbility })
              }
            />
          </Stack>

          <Stack gap={4} style={{ flex: 1 }}>
            <InfoIconPopover title="Spell Save DC">
              Spell Save DC is the target number a creature must meet or beat on a saving throw to resist your spell’s effect.<br /><br />
              <strong>Spell Save DC = 8 + Proficiency Bonus + Spellcasting Ability Modifier</strong>
            </InfoIconPopover>
            <FormNumberInput
              label="Spell Save DC"
              classNames={input}
              value={spellSaveDc}
              disabled
              hideControls
              onChange={() => {}}
              styles={{
                input: {
                  textAlign: "center",
                  border: "1px solid rgba(150,255,150,0.35)",
                  color: "#c4faff",
                  pointerEvents: "none",
                },
              }}
            />
          </Stack>

          <Stack gap={4} style={{ flex: 1 }}>
            <InfoIconPopover title="Spell Attack Bonus">
              Spell Attack Bonus = Proficiency Bonus + Spellcasting Ability Modifier
            </InfoIconPopover>
            <FormNumberInput
              label="Spell Attack Bonus"
              classNames={input}
              value={spellAttackBonus}
              disabled
              hideControls
              onChange={() => {}}
              styles={{
                input: {
                  textAlign: "center",
                  border: "1px solid rgba(150,150,255,0.35)",
                  color: "#c4d4ff",
                  pointerEvents: "none",
                },
              }}
            />
          </Stack>

        </Stack>

      </Stack>
    </ExpandableSection>
  );
}
