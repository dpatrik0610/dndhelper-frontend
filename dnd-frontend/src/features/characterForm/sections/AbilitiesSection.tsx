import {
  Group,
  Stack,
  Divider,
  Select,
  Text,
  Box,
  ActionIcon,
} from "@mantine/core";
import { useMemo, useEffect, useState } from "react";

import {
  IconBrain,
  IconStarFilled,
  IconX,
  IconTrendingUp,
} from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";
import type { SavingThrows } from "@appTypes/Character/SavingThrows";
import { InfoIconPopover } from "@components/common/InfoIconPopover";
import {
  abilityTooltips,
  saveTooltips,
  DEFAULT_SKILLS,
} from "@features/characterForm/Tooltips/tooltips";
import { useIsMobile } from "@hooks/useIsMobile";

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

export function AbilitiesSection({ noBox = false }: { noBox?: boolean }) {
  const isMobile = useIsMobile();
  const characterForm = useCharacterFormStore((s) => s.characterForm);
  const setCharacterForm = useCharacterFormStore((s) => s.setCharacterForm);

  // Local state to track which exact single ability is currently shown
  const [selectedAbility, setSelectedAbility] = useState<AbilityKey>("str");

  const input = { input: "glassy-input", label: "glassy-label" };

  // Unified modifiers calculator
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

  // --- Spellcasting DC calculations (for background synchronization) ---
  const spellcastKey = characterForm.spellcastingAbility as SpellcastingAbility;
  const spellMod = spellcastKey !== "none" ? modifiers[spellcastKey] : null;
  const spellSaveDc = spellMod !== null ? 8 + prof + spellMod : 0;
  const spellAttackBonus = spellMod !== null ? prof + spellMod : 0;

  // --- Skills calculations ---
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

  // Auto-update characterForm.skills in the store when scores or proficiency bonus change
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

    // Safe change detection to completely prevent infinite rendering loops
    const hasChanges = updatedSkills.some((s, idx) => {
      const original = skills[idx];
      return s.value !== original.value || s.lastBase !== original.lastBase;
    });

    if (hasChanges) {
      setCharacterForm({ skills: updatedSkills });
    }
  }, [characterForm.abilityScores, characterForm.proficiencyBonus]);

  // Sync computed attributes in store
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

  // Define RPG groups
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

  // Retrieve the single active group to render
  const activeGroup = useMemo(() => {
    return abilityGroups.find((g) => g.key === selectedAbility)!;
  }, [selectedAbility, abilityGroups]);

  const activeGroupMod = modifiers[activeGroup.key];
  const displayMod = activeGroupMod >= 0 ? `+${activeGroupMod}` : activeGroupMod;
  const saveKey = saveKeyMap[activeGroup.longKey];

  // Filter skills belonging to this single selected ability
  const groupSkills = skills.filter((s) => {
    const def = DEFAULT_SKILLS.find((d) => d.name === s.name);
    return def && def.ability === activeGroup.key;
  });

  const content = (
    <Stack gap="lg">
      
      {/* 🔮 Dropdown Selector to switch between the 6 core stats */}
      <Select
        value={selectedAbility}
        onChange={(v) => setSelectedAbility(v as AbilityKey)}
        data={[
          { value: "str", label: "💪 Strength" },
          { value: "dex", label: "🏃 Dexterity" },
          { value: "con", label: "🛡️ Constitution" },
          { value: "int", label: "🧠 Intelligence" },
          { value: "wis", label: "👁️ Wisdom" },
          { value: "cha", label: "🗣️ Charisma" },
        ]}
        label="Select Core Ability"
        classNames={{
          input: "glassy-input",
          label: "glassy-label",
          dropdown: "glassy-dropdown",
          option: "glassy-option",
        }}
        styles={{
          label: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 300,
            letterSpacing: "2px",
            textTransform: "uppercase",
            fontSize: "11px",
            marginBottom: "6px",
            color: "var(--theme-color-text-secondary)",
          },
        }}
      />

      {/* Render Exactly ONE chosen Ability Card */}
      <Box
        key={activeGroup.key}
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* Card Header (Ability and Modifier Capsule) */}
        <Group justify="space-between" mb="lg">
          <Group gap={8}>
            <Text style={{ fontSize: isMobile ? "18px" : "20px" }}>{activeGroup.icon}</Text>
            <Text
              className="narrative-title"
              style={{
                fontSize: isMobile ? "13px" : "15px",
                letterSpacing: "2.5px",
                color: "var(--theme-color-text-primary, #fff)",
              }}
            >
              {activeGroup.label}
            </Text>
          </Group>
          
          {/* Soft, Highlighted modifier pill capsule */}
          <Box
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
              borderRadius: "14px",
              padding: "4px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Text
              className="narrative-title"
              style={{
                fontSize: "9px",
                letterSpacing: "1px",
                color: "var(--theme-color-text-secondary, #cbd5e1)",
              }}
            >
              Mod
            </Text>
            <Text
              fw={600}
              style={{
                fontSize: "14px",
                color: "var(--theme-color-accent-primary, #f59e0b)",
                opacity: 0.85,
              }}
            >
              {displayMod}
            </Text>
          </Box>
        </Group>

        {/* Row 1: Core Score & Saving Throw Modifier (with inline popover icons) */}
        <Group grow gap="md" align="flex-end" mb={groupSkills.length > 0 ? "lg" : 0}>
          
          {/* Score Input */}
          <Stack gap={0}>
            <FormNumberInput
              label={
                <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                  <span>{activeGroup.label} Score</span>
                  <InfoIconPopover title={activeGroup.label}>
                    {abilityTooltips[activeGroup.longKey]}
                  </InfoIconPopover>
                </Group>
              }
              min={1}
              max={30}
              classNames={input}
              value={characterForm.abilityScores[activeGroup.key]}
              onChange={(v) =>
                setCharacterForm({
                  abilityScores: {
                    ...characterForm.abilityScores,
                    [activeGroup.key]: v,
                  },
                })
              }
              styles={{ input: { textAlign: "center" } }}
            />
          </Stack>

          {/* Saving Throw Input */}
          <Stack gap={0}>
            <FormNumberInput
              label={
                <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                  <span>Saving Throw</span>
                  <InfoIconPopover title={`${activeGroup.label} Saving Throw`}>
                    {saveTooltips[activeGroup.longKey]}
                  </InfoIconPopover>
                </Group>
              }
              min={-20}
              max={30}
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

        </Group>

        {/* Row 2: Governed Skills list */}
        {groupSkills.length > 0 && (
          <>
            <Divider color="rgba(255,255,255,0.03)" my="md" />
            <Stack gap="xs">
              {groupSkills.map((s) => {
                const def = DEFAULT_SKILLS.find((d) => d.name === s.name);
                const base = calcBase(s);
                const shown = s.value ?? s.lastBase ?? base ?? 0;

                return (
                  <Group key={s.name} justify="space-between" align="center" wrap="nowrap">
                    
                    {/* Left: Star Check-Bubble + Skill Name + Info */}
                    <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                      <ActionIcon
                        onClick={() => {
                          const next = !s.proficient;
                          const b = calcBase({ ...s, proficient: next });
                          if (b === null) return;
                          setCharacterForm({
                            skills: skills.map((x) =>
                              x.name === s.name
                                ? x.value === x.lastBase
                                  ? { ...x, proficient: next, value: b, lastBase: b }
                                  : { ...x, proficient: next, lastBase: b }
                                : x
                            ),
                          });
                        }}
                        variant="unstyled"
                        aria-label={`Toggle proficiency for ${s.name}`}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                          background: s.proficient
                            ? "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))"
                            : "rgba(255, 255, 255, 0.01)",
                          border: s.proficient
                            ? "1px solid rgba(255, 255, 255, 0.2)"
                            : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                          boxShadow: s.proficient
                            ? "var(--theme-glow-shadow-primary)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!s.proficient) {
                            e.currentTarget.style.borderColor = "var(--theme-color-accent-primary)";
                            e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.04))";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!s.proficient) {
                            e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                          }
                        }}
                      >
                        {s.proficient && (
                          <IconStarFilled size={10} color="#fff" />
                        )}
                      </ActionIcon>

                      <Text
                        size="xs"
                        fw={s.proficient ? 700 : 500}
                        truncate="end"
                        style={{
                          color: s.proficient
                            ? "var(--theme-color-text-primary, #fff)"
                            : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                        }}
                      >
                        {s.name}
                      </Text>

                      {def && (
                        <InfoIconPopover title={s.name}>
                          {`${s.name} is governed by ${def.ability.toUpperCase()}.\n\n${def.desc}`}
                        </InfoIconPopover>
                      )}
                    </Group>

                    {/* Right: Mod Base + Number Input */}
                    <Group gap="xs" wrap="nowrap">
                      {!isMobile && (
                        <Text size="10px" c="dimmed" style={{ fontStyle: "italic" }}>
                          Base: {base! >= 0 ? `+${base}` : base}
                        </Text>
                      )}

                      <FormNumberInput
                        classNames={{ input: "glassy-input" }}
                        value={shown}
                        hideControls
                        style={{ width: 45 }}
                        styles={{ input: { textAlign: "center", padding: 0 } }}
                        onChange={(v) =>
                          setCharacterForm({
                            skills: skills.map((x) =>
                              x.name === s.name ? { ...x, value: v } : x
                            ),
                          })
                        }
                      />
                    </Group>

                  </Group>
                );
              })}
            </Stack>
          </>
        )}
      </Box>

      {/* Passive Senses Card */}
      <Box
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <Group gap="xs" mb="sm">
          <IconTrendingUp size={16} style={{ color: "var(--theme-color-accent-secondary)" }} />
          <Text
            className="narrative-title"
            style={{
              fontSize: "12px",
              letterSpacing: "1.5px",
              color: "var(--theme-color-text-primary, #fff)",
            }}
          >
            Passive Senses
          </Text>
        </Group>

        <Divider color="rgba(255,255,255,0.03)" mb="sm" />

        <Group grow wrap={isMobile ? "wrap" : "nowrap"} gap="md">
          <Stack gap={0}>
            <FormNumberInput
              label={
                <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                  <span>Passive Perception</span>
                  <InfoIconPopover title="Passive Perception">
                    10 + Wisdom modifier + proficiency bonus (if proficient in Perception).
                  </InfoIconPopover>
                </Group>
              }
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

          <Stack gap={0}>
            <FormNumberInput
              label={
                <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                  <span>Passive Insight</span>
                  <InfoIconPopover title="Passive Insight">
                    10 + Wisdom modifier + proficiency bonus (if proficient in Insight).
                  </InfoIconPopover>
                </Group>
              }
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

          <Stack gap={0}>
            <FormNumberInput
              label={
                <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                  <span>Passive Investigation</span>
                  <InfoIconPopover title="Passive Investigation">
                    10 + Intelligence modifier + proficiency bonus (if proficient in Investigation).
                  </InfoIconPopover>
                </Group>
              }
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
      </Box>

    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection
      title="Abilities & Skills"
      icon={<IconBrain />}
      color={SectionColor.Teal}
      defaultOpen
    >
      {content}
    </ExpandableSection>
  );
}
