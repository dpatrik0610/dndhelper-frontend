import { Stack, Select } from "@mantine/core";
import { useMemo, useEffect, useState } from "react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import type { SavingThrows } from "@appTypes/Character/SavingThrows";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";
import { useIsMobile } from "@hooks/useIsMobile";
import { AbilityCard } from "./components/AbilityCard";
import { PassiveSensesCard } from "./components/PassiveSensesCard";

type AbilityLong = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

const saveKeyMap: Record<AbilityLong, keyof SavingThrows> = {
  strength: "strength",
  dexterity: "dexterity",
  constitution: "constitution",
  intelligence: "intelligence",
  wisdom: "wisdom",
  charisma: "charisma",
};

export function AbilitiesSection() {
  const isMobile = useIsMobile();
  const characterForm = useCharacterFormStore((s) => s.characterForm);
  const setCharacterForm = useCharacterFormStore((s) => s.setCharacterForm);

  const [selectedAbility, setSelectedAbility] = useState<AbilityKey>("str");

  const modifiers = useMemo(() => {
    const s = characterForm.abilityScores;
    const M = (v: number) => {
      const num = Number(v) || 0;
      return Math.floor((num - 10) / 2);
    };
    return {
      str: M(s.str),
      dex: M(s.dex),
      con: M(s.con),
      int: M(s.int),
      wis: M(s.wis),
      cha: M(s.cha),
    };
  }, [characterForm.abilityScores]);

  const prof = characterForm.proficiencyBonus ?? 0;

  const skills = characterForm.skills ?? [];

  const calcBase = (s: { name: string; proficient?: boolean }) => {
    const d = DEFAULT_SKILLS.find((x) => x.name === s.name);
    if (!d) return null;
    return (
      modifiers[d.ability as AbilityKey] +
      (s.proficient ? characterForm.proficiencyBonus : 0)
    );
  };

  function hasSkillProficiency(name: string) {
    return skills.some((s) => s.name === name && s.proficient);
  }

  const passivePerception =
    10 +
    modifiers.wis +
    (hasSkillProficiency("Perception") ? prof : 0);

  const passiveInsight =
    10 +
    modifiers.wis +
    (hasSkillProficiency("Insight") ? prof : 0);

  const passiveInvestigation =
    10 +
    modifiers.int +
    (hasSkillProficiency("Investigation") ? prof : 0);

  useEffect(() => {
    if (!skills.length) return;

    const updatedSkills = skills.map((s) => {
      const b = calcBase(s);
      if (b === null) return s;

      // If user has not manually overridden the value, or it matches the previous base, update it
      const shouldUpdateValue = s.value === s.lastBase;
      return {
        ...s,
        lastBase: b,
        value: shouldUpdateValue ? b : s.value,
      };
    });

    const hasChanges = updatedSkills.some((s, idx) => {
      const original = skills[idx];
      return s.value !== original.value || s.lastBase !== original.lastBase;
    });

    if (hasChanges) {
      setCharacterForm({ skills: updatedSkills });
    }
  }, [characterForm.abilityScores, characterForm.proficiencyBonus]);

  useEffect(() => {
    if (
      characterForm.passivePerception !== passivePerception ||
      characterForm.passiveInsight !== passiveInsight ||
      characterForm.passiveInvestigation !== passiveInvestigation
    ) {
      setCharacterForm({
        passivePerception,
        passiveInsight,
        passiveInvestigation,
      });
    }
  }, [
    passivePerception,
    passiveInsight,
    passiveInvestigation,
    characterForm.passivePerception,
    characterForm.passiveInsight,
    characterForm.passiveInvestigation,
    setCharacterForm,
  ]);

  const abilityGroups = useMemo(
    () => [
      { key: "str" as AbilityKey, longKey: "strength" as AbilityLong, label: "Strength", icon: "💪" },
      { key: "dex" as AbilityKey, longKey: "dexterity" as AbilityLong, label: "Dexterity", icon: "🏃" },
      { key: "con" as AbilityKey, longKey: "constitution" as AbilityLong, label: "Constitution", icon: "🛡️" },
      { key: "int" as AbilityKey, longKey: "intelligence" as AbilityLong, label: "Intelligence", icon: "🧠" },
      { key: "wis" as AbilityKey, longKey: "wisdom" as AbilityLong, label: "Wisdom", icon: "👁️" },
      { key: "cha" as AbilityKey, longKey: "charisma" as AbilityLong, label: "Charisma", icon: "🗣️" },
    ],
    []
  );

  const activeGroup = useMemo(() => {
    return abilityGroups.find((g) => g.key === selectedAbility)!;
  }, [selectedAbility, abilityGroups]);

  const saveKey = saveKeyMap[activeGroup.longKey];

  return (
    <Stack gap="lg">
      
      <Select
        value={selectedAbility}
        onChange={(v) => setSelectedAbility(v as AbilityKey)}
        data={[
          { value: "str", label: "Strength" },
          { value: "dex", label: "Dexterity" },
          { value: "con", label: "Constitution" },
          { value: "int", label: "Intelligence" },
          { value: "wis", label: "Wisdom" },
          { value: "cha", label: "Charisma" },
        ]}
        label="Ability"
        allowDeselect={false}
        classNames={{
          input: "glassy-input",
          label: "glassy-label",
          dropdown: "glassy-dropdown",
          option: "glassy-option",
        }}
      />

      <AbilityCard
        activeGroup={activeGroup}
        modifiers={modifiers}
        skills={skills}
        characterForm={characterForm}
        setCharacterForm={setCharacterForm}
        calcBase={calcBase}
        isMobile={isMobile}
        saveKey={saveKey}
      />

      <PassiveSensesCard
        passivePerception={passivePerception}
        passiveInsight={passiveInsight}
        passiveInvestigation={passiveInvestigation}
        isMobile={isMobile}
      />

    </Stack>
  );
}
