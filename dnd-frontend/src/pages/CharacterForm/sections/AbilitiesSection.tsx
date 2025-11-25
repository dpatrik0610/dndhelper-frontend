import {
  Group,
  Stack,
  Title,
  Divider,
  SimpleGrid,
  Select,
} from "@mantine/core";
import { useMemo, useEffect } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { IconBrain, IconStar, IconStarFilled } from "@tabler/icons-react";
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
  const characterForm = useCharacterFormStore((s) => s.characterForm);
  const setCharacterForm = useCharacterFormStore((s) => s.setCharacterForm);

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

  // --- Passive Senses: Perception / Insight / Investigation ---

  const skills = characterForm.skills ?? [];

  function hasSkillProficiency(name: string) {
    return skills.some((s) => s.name === name && s.proficient);
  }

  const passivePerception =
    10 +
    modifiers.wisdom +
    (hasSkillProficiency("Perception") ? prof : 0);

  const passiveInsight =
    10 +
    modifiers.wisdom +
    (hasSkillProficiency("Insight") ? prof : 0);

  const passiveInvestigation =
    10 +
    modifiers.intelligence +
    (hasSkillProficiency("Investigation") ? prof : 0);

  useEffect(() => {
    if (
      characterForm.spellSaveDc !== spellSaveDc ||
      characterForm.spellAttackBonus !== spellAttackBonus ||
      characterForm.passivePerception !== passivePerception ||
      characterForm.passiveInsight !== passiveInsight ||
      characterForm.passiveInvestigation !== passiveInvestigation
    ) {
      setCharacterForm({
        spellSaveDc,
        spellAttackBonus,
        passivePerception,
        passiveInsight,
        passiveInvestigation,
      });
    }
  }, [
    spellSaveDc,
    spellAttackBonus,
    passivePerception,
    passiveInsight,
    passiveInvestigation,
    characterForm.spellSaveDc,
    characterForm.spellAttackBonus,
    characterForm.passivePerception,
    characterForm.passiveInsight,
    characterForm.passiveInvestigation,
    setCharacterForm,
  ]);

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

        <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? "sm" : "md"}>
          {abilityFields.map((a) => {
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
                    onChange={(v) =>
                      setCharacterForm({
                        abilityScores: {
                          ...characterForm.abilityScores,
                          [short]: v,
                        },
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
          {(isMobile
            ? abilityFields
            : [abilityFields.slice(0, 3), abilityFields.slice(3)]
          ).map((list, i) => (
            <Group key={i} grow wrap="wrap">
              {(Array.isArray(list) ? list : [list]).map((a) => {
                const saveKey = saveKeyMap[a];

                return (
                  <Stack
                    key={a}
                    gap={4}
                    style={{ width: isMobile ? "100%" : "48%" }}
                  >
                    <InfoIconPopover
                      title={`${a.charAt(0).toUpperCase() + a.slice(1)} Save`}
                    >
                      {saveTooltips[a]}
                    </InfoIconPopover>

                    <FormNumberInput
                      label={`${a.charAt(0).toUpperCase() + a.slice(1)} Save`}
                      classNames={input}
                      value={characterForm.savingThrows[saveKey]}
                      onChange={(v) =>
                        setCharacterForm({
                          savingThrows: {
                            ...characterForm.savingThrows,
                            [saveKey]: v,
                          },
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

        {/* Passive senses */}
        <Divider my="sm" label="Passive Senses" labelPosition="center" />

        <Group grow wrap="wrap">
          <Stack gap={4} style={{ width: isMobile ? "100%" : "32%" }}>
            <InfoIconPopover title="Passive Perception">
              10 + Wisdom modifier + proficiency bonus (if proficient in
              Perception).
            </InfoIconPopover>
            <FormNumberInput
              label={`Passive Perception ${hasSkillProficiency("Perception") ? `⭐` : ""}`}
              classNames={input}
              value={passivePerception}
              disabled
              hideControls
              onChange={() => {}}
              styles={{
                input: {
                  textAlign: "center",
                  border: "1px solid rgba(255,255,150,0.35)",
                  color: "#fff8c4",
                  pointerEvents: "none",
                },
              }}
            />
          </Stack>

          <Stack gap={4} style={{ width: isMobile ? "100%" : "32%" }}>
            <InfoIconPopover title="Passive Insight">
              10 + Wisdom modifier + proficiency bonus (if proficient in
              Insight).
            </InfoIconPopover>
            <FormNumberInput
              label={`Passive Insight ${hasSkillProficiency("Insight") ? `⭐` : ""}`}
              classNames={input}
              value={passiveInsight}
              disabled
              hideControls
              onChange={() => {}}
              styles={{
                input: {
                  textAlign: "center",
                  border: "1px solid rgba(150,255,255,0.35)",
                  color: "#c4faff",
                  pointerEvents: "none",
                },
              }}
            />
          </Stack>

          <Stack gap={4} style={{ width: isMobile ? "100%" : "32%" }}>
            <InfoIconPopover title="Passive Investigation">
              10 + Intelligence modifier + proficiency bonus (if proficient in
              Investigation).
            </InfoIconPopover>
            <FormNumberInput
              label={`Passive Investigation ${hasSkillProficiency("Investigation") ? `⭐` : ""}`}
              classNames={input}
              value={passiveInvestigation}
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
        </Group>

        <Divider my="sm" label="Spellcasting" labelPosition="center" />

        <Stack gap={isMobile ? "sm" : "md"}>
          <Stack gap={4} style={{ flex: 1 }}>
            <InfoIconPopover title="Spellcasting Ability">
              Please select the ability that your character uses for
              spellcasting. It's determined by your class.
              <br />
              <br />
              For fighters with the Arcane Archer or Eldritch Knight
              archetypes, select Intelligence (INT).
              <br />
              <br />
              If your character does not cast spells, select "None".
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
              onChange={(v) =>
                setCharacterForm({
                  spellcastingAbility: (v ?? "none") as SpellcastingAbility,
                })
              }
            />
          </Stack>

          <Stack gap={4} style={{ flex: 1 }}>
            <InfoIconPopover title="Spell Save DC">
              Spell Save DC is the target number a creature must meet or beat on
              a saving throw to resist your spell’s effect.
              <br />
              <br />
              <strong>
                Spell Save DC = 8 + Proficiency Bonus + Spellcasting Ability
                Modifier
              </strong>
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
              Spell Attack Bonus = Proficiency Bonus + Spellcasting Ability
              Modifier
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
