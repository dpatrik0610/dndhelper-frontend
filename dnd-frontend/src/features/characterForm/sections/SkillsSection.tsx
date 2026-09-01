import {
  Group, Stack, TextInput, ActionIcon, Text, Switch, Box, Divider, Button
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";

import {
  IconAutomaticGearbox, IconTrash, IconPlus, IconStarFilled, IconX,
} from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";
import { InfoIconPopover } from "@components/common/InfoIconPopover";
import { useIsMobile } from "@hooks/useIsMobile";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export function SkillsSection({ noBox = false }: { noBox?: boolean }) {
  const characterForm = useCharacterFormStore(s => s.characterForm);
  const setCharacterForm = useCharacterFormStore(s => s.setCharacterForm);

  const isMobile = useIsMobile();
  const [newSkill, setNewSkill] = useState("");

  const skills = characterForm.skills ?? [];
  const scores = characterForm.abilityScores;

  const mods = useMemo(() => {
    const M = (v: number) => Math.floor((v - 10) / 2);
    return {
      str: M(scores.str), dex: M(scores.dex), con: M(scores.con),
      int: M(scores.int), wis: M(scores.wis), cha: M(scores.cha)
    };
  }, [scores]);

  const calcBase = (s: { name: string; proficient?: boolean }) => {
    const d = DEFAULT_SKILLS.find(x => x.name === s.name);
    if (!d) return null;
    return mods[d.ability as AbilityKey] +
      (s.proficient ? characterForm.proficiencyBonus : 0);
  };

  // Initialize defaults
  useEffect(() => {
    if (skills.length) return;
    setCharacterForm({
      skills: DEFAULT_SKILLS.map(s => {
        const base = mods[s.ability as AbilityKey];
        return { name: s.name, value: base, lastBase: base, proficient: false };
      }),
    });
  }, []);

  // Update when stats change
  useEffect(() => {
    if (!skills.length) return;
    setCharacterForm({
      skills: skills.map(s => {
        const b = calcBase(s);
        return b === null
          ? s
          : s.value === s.lastBase
            ? { ...s, value: b, lastBase: b }
            : { ...s, lastBase: b };
      }),
    });
  }, [characterForm.abilityScores, characterForm.proficiencyBonus]);

  const addSkill = () => {
    const name = newSkill.trim();
    if (!name || skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    setCharacterForm({
      skills: [...skills, { name, value: 0, lastBase: 0, proficient: false }]
    });
    setNewSkill("");
  };

  const removeSkill = (name: string) =>
    !DEFAULT_SKILLS.some(s => s.name === name) &&
    setCharacterForm({ skills: skills.filter(s => s.name !== name) });

  // Define RPG groups
  const groups = useMemo(() => [
    { key: "str" as AbilityKey, label: "Strength Skills", icon: "💪" },
    { key: "dex" as AbilityKey, label: "Dexterity Skills", icon: "🏃" },
    { key: "int" as AbilityKey, label: "Intelligence Skills", icon: "🧠" },
    { key: "wis" as AbilityKey, label: "Wisdom Skills", icon: "👁️" },
    { key: "cha" as AbilityKey, label: "Charisma Skills", icon: "🗣️" },
  ], []);

  const content = (
    <Stack gap="lg">

      {/* Add Custom Skill */}
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <TextInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          placeholder="Add new custom skill..."
          value={newSkill}
          onChange={e => setNewSkill(e.currentTarget.value)}
          style={{ flexGrow: 1 }}
          label="Custom Skill Builder"
        />
        <Button
          onClick={addSkill}
          className="glass-btn-primary"
          leftSection={<IconPlus size={14} />}
          style={{
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontWeight: 300,
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontSize: "10px",
            height: "36px",
          }}
        >
          Add
        </Button>
      </Group>

      {!skills.length ? (
        <Text c="dimmed" size="sm" fs="italic" ta="center">Loading skills...</Text>
      ) : (
        <Stack gap="md">
          {/* Loop through attributes and render groups */}
          {groups.map(g => {
            // Get skills belonging to this group
            const groupSkills = skills.filter(s => {
              const def = DEFAULT_SKILLS.find(d => d.name === s.name);
              return def && def.ability === g.key;
            });

            if (!groupSkills.length) return null;

            const groupMod = mods[g.key];
            const displayMod = groupMod >= 0 ? `+${groupMod}` : groupMod;

            return (
              <Box
                key={g.key}
                style={{
                  background: "rgba(255, 255, 255, 0.015)",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                  borderRadius: "10px",
                  padding: "12px 16px",
                }}
              >
                {/* Group Header */}
                <Group justify="space-between" mb="xs" border-bottom="1px solid rgba(255,255,255,0.04)">
                  <Group gap={6}>
                    <Text size="xs">{g.icon}</Text>
                    <Text
                      className="narrative-title"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "1.5px",
                        color: "var(--theme-color-text-secondary, #fff)",
                      }}
                    >
                      {g.label}
                    </Text>
                  </Group>
                  <Text
                    className="narrative-title"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "1px",
                      color: "var(--theme-color-accent-primary, #f59e0b)",
                    }}
                  >
                    Base Mod: {displayMod}
                  </Text>
                </Group>

                <Divider color="rgba(255,255,255,0.03)" mb="sm" />

                {/* Group Skill Rows */}
                <Stack gap="xs">
                  {groupSkills.map(s => {
                    const def = DEFAULT_SKILLS.find(d => d.name === s.name);
                    const base = calcBase(s);
                    const shown = s.value ?? s.lastBase ?? base ?? 0;

                    return (
                      <Group key={s.name} justify="space-between" align="center" wrap="nowrap">
                        
                        {/* Left Side: Circular RPG Check-Bubble + Name */}
                        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                          <ActionIcon
                            onClick={() => {
                              const next = !s.proficient;
                              const b = calcBase({ ...s, proficient: next });
                              if (b === null) return;
                              setCharacterForm({
                                skills: skills.map(x =>
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
                            size="sm"
                            fw={s.proficient ? 700 : 500}
                            truncate="end"
                            style={{
                              color: s.proficient
                                ? "var(--theme-color-text-primary, #fff)"
                                : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                              transition: "color 0.2s ease",
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

                        {/* Right Side: Mod + Number Input */}
                        <Group gap="sm" wrap="nowrap">
                          {!isMobile && (
                            <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                              Base: {base! >= 0 ? `+${base}` : base}
                            </Text>
                          )}

                          <FormNumberInput
                            classNames={{ input: "glassy-input" }}
                            value={shown}
                            hideControls
                            style={{ width: 45 }}
                            styles={{ input: { textAlign: "center", padding: 0 } }}
                            onChange={v =>
                              setCharacterForm({
                                skills: skills.map(x => 
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
              </Box>
            );
          })}

          {/* Custom Skills Group */}
          {skills.filter(s => !DEFAULT_SKILLS.some(d => d.name === s.name)).length > 0 && (
            <Box
              style={{
                background: "rgba(255, 255, 255, 0.015)",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                borderRadius: "10px",
                padding: "12px 16px",
              }}
            >
              {/* Header */}
              <Group justify="space-between" mb="xs">
                <Group gap={6}>
                  <Text size="xs">✨</Text>
                  <Text
                    className="narrative-title"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "1.5px",
                      color: "var(--theme-color-text-secondary, #fff)",
                    }}
                  >
                    Custom / Other Skills
                  </Text>
                </Group>
              </Group>

              <Divider color="rgba(255,255,255,0.03)" mb="sm" />

              {/* Rows */}
              <Stack gap="xs">
                {skills
                  .filter(s => !DEFAULT_SKILLS.some(d => d.name === s.name))
                  .map(s => {
                    const shown = s.value ?? s.lastBase ?? 0;

                    return (
                      <Group key={s.name} justify="space-between" align="center" wrap="nowrap">
                        
                        {/* Circular RPG Check-Bubble + Name */}
                        <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                          <ActionIcon
                            onClick={() => {
                              const next = !s.proficient;
                              setCharacterForm({
                                skills: skills.map(x =>
                                  x.name === s.name ? { ...x, proficient: next } : x
                                ),
                              });
                            }}
                            variant="unstyled"
                            aria-label={`Toggle custom proficiency for ${s.name}`}
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
                                ? "1px solid rgba(255, 255, 255, 0.15)"
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
                            size="sm"
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
                        </Group>

                        {/* Input + Trash Icon */}
                        <Group gap="sm" wrap="nowrap">
                          <FormNumberInput
                            classNames={{ input: "glassy-input" }}
                            value={shown}
                            hideControls
                            style={{ width: 45 }}
                            styles={{ input: { textAlign: "center", padding: 0 } }}
                            onChange={v =>
                              setCharacterForm({
                                skills: skills.map(x => 
                                  x.name === s.name ? { ...x, value: v } : x
                                ),
                              })
                            }
                          />

                          <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => removeSkill(s.name)}
                            size="sm"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>

                      </Group>
                    );
                  })}
              </Stack>
            </Box>
          )}

        </Stack>
      )}

    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection
      title="Skills"
      icon={<IconAutomaticGearbox />}
      color={SectionColor.White}
      defaultOpen
    >
      {content}
    </ExpandableSection>
  );
}
