import {
  Group, NumberInput, Stack, TextInput, ActionIcon, Text, SimpleGrid, Switch, Tooltip,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconAutomaticGearbox, IconTrash, IconPlus, IconStarFilled, IconX,
} from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import CustomBadge from "../../../components/common/CustomBadge";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import "../styles/glassyInput.css";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

const DEFAULT_SKILLS = [
  { name: "Acrobatics", ability: "dex", desc: "Perform flips and balance-related stunts." },
  { name: "Animal Handling", ability: "wis", desc: "Calm or control animals and mounts." },
  { name: "Arcana", ability: "int", desc: "Knowledge of magic and magical history." },
  { name: "Athletics", ability: "str", desc: "Climbing, jumping, and physical feats of strength." },
  { name: "Deception", ability: "cha", desc: "Lying, disguises, and misleading others." },
  { name: "History", ability: "int", desc: "Knowledge of historical events and lore." },
  { name: "Insight", ability: "wis", desc: "Read emotions and intentions." },
  { name: "Intimidation", ability: "cha", desc: "Use fear or presence to influence others." },
  { name: "Investigation", ability: "int", desc: "Deduce clues and hidden details." },
  { name: "Medicine", ability: "wis", desc: "Diagnose and stabilize injuries." },
  { name: "Nature", ability: "int", desc: "Knowledge of terrain, plants, and wildlife." },
  { name: "Perception", ability: "wis", desc: "Spot traps, ambushes, or hidden things." },
  { name: "Performance", ability: "cha", desc: "Musical or theatrical skill." },
  { name: "Persuasion", ability: "cha", desc: "Convince, negotiate, or charm others." },
  { name: "Religion", ability: "int", desc: "Knowledge of deities and divine rites." },
  { name: "Sleight of Hand", ability: "dex", desc: "Pickpocketing and manual tricks." },
  { name: "Stealth", ability: "dex", desc: "Sneaking and hiding unseen." },
  { name: "Survival", ability: "wis", desc: "Tracking, foraging, and enduring the wilds." },
] as const;

export function SkillsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const [newSkill, setNewSkill] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const skills = characterForm.skills ?? [];
  const scores = characterForm.abilityScores ?? {};

  // 🧮 ability modifiers
  const mods = useMemo(() => {
    const calc = (v: number) => Math.floor((v - 10) / 2);
    return {
      str: calc(scores.str), dex: calc(scores.dex), con: calc(scores.con),
      int: calc(scores.int), wis: calc(scores.wis), cha: calc(scores.cha),
    };
  }, [scores]);

  // 🎲 base = ability mod + proficiency (if proficient)
  const getBase = (s: { name: string; proficient?: boolean }) => {
    const def = DEFAULT_SKILLS.find(d => d.name === s.name);
    const mod = def ? mods[def.ability as AbilityKey] : 0;
    const prof = s.proficient ? (characterForm.proficiencyBonus ?? 0) : 0;
    return mod + prof;
  };

  // 🧩 init if empty
  useEffect(() => {
    if (!skills.length) {
      const seeded = DEFAULT_SKILLS.map(ds => {
        const base = getBase({ name: ds.name, proficient: false });
        return { name: ds.name, value: base, lastBase: base, proficient: false };
      });
      setCharacterForm({ skills: seeded });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ♻️ recalc when ability/proficiency change; update if user hasn't overridden (value === lastBase)
  useEffect(() => {
    if (!skills.length) return;

    let changed = false;
    const updated = skills.map(s => {
      const newBase = getBase(s);
      const shouldFollow = (s as any).lastBase === undefined || s.value === (s as any).lastBase;
      if (shouldFollow) {
        if (s.value !== newBase || (s as any).lastBase !== newBase) changed = true;
        return { ...s, value: newBase, lastBase: newBase };
      } else {
        if ((s as any).lastBase !== newBase) changed = true;
        return { ...s, lastBase: newBase };
      }
    });

    if (changed) setCharacterForm({ skills: updated });
  }, [characterForm.abilityScores, characterForm.proficiencyBonus]); // auto-sync on deps

  // ➕ add custom skill (starts as non-proficient with base=0, follows future base only if user hasn't edited)
  const addSkill = () => {
    const name = newSkill.trim();
    if (!name || skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    const base = 0;
    setCharacterForm({ skills: [...skills, { name, value: base, lastBase: base, proficient: false }] });
    setNewSkill("");
  };

  // ❌ remove custom skill
  const removeSkill = (name: string) => {
    if (DEFAULT_SKILLS.some(s => s.name === name)) return; // lock core skills from removal
    setCharacterForm({ skills: skills.filter(s => s.name !== name) });
  };

  return (
    <ExpandableSection title="Skills" icon={<IconAutomaticGearbox />} color={SectionColor.White} defaultOpen>
      <Stack>
        <Group>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} placeholder="Add new skill..." value={newSkill} onChange={(e) => setNewSkill(e.currentTarget.value)} style={{ flexGrow: 1 }} />
          <ActionIcon color="teal" variant="filled" onClick={addSkill}><IconPlus size={16} /></ActionIcon>
        </Group>

        {(!skills || skills.length === 0) ? (
          <Text c="dimmed" size="sm">No skills yet.</Text>
        ) : (
          <SimpleGrid cols={isMobile ? 1 : 2} spacing="xs">
            {skills.map((s) => {
              const def = DEFAULT_SKILLS.find(d => d.name === s.name);
              const base = getBase(s);
              const shown = s.value ?? (s as any).lastBase ?? base;

              return (
                <Tooltip key={s.name} label={def ? `${def.name} (${def.ability.toUpperCase()}) — ${def.desc}` : "Custom skill"} withArrow color="dark" maw={250} multiline>
                  <Group
                    gap="xs" align="center"
                    style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "6px 8px", transition: "background 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  >
                    <CustomBadge label={s.name} style={{ flex: 1 }} c={SectionColor.Teal} variant="transparent" fullWidth />

                    {/* Value (manual edits become overrides) */}
                    <NumberInput
                      classNames={{ input: "glassy-input", label: "glassy-label" }}
                      value={shown} min={base} size={isMobile ? "xs" : "sm"} style={{ width: 70 }}
                      onChange={(v) => {
                        const val = typeof v === "number" && !isNaN(v) ? Math.max(v, base) : base;
                        setCharacterForm({
                          skills: skills.map(x => x.name === s.name ? { ...x, value: val } : x),
                        });
                      }}
                    />

                    {/* Proficiency toggle (recalc base; follow if not overridden) */}
                    <Switch
                      size="md"
                      checked={s.proficient}
                      onChange={(e) => {
                        const nextProficient = e.currentTarget.checked;
                        const newBase = (() => {
                          const def = DEFAULT_SKILLS.find(d => d.name === s.name);
                          const mod = def ? mods[def.ability as AbilityKey] : 0;
                          const prof = nextProficient ? (characterForm.proficiencyBonus ?? 0) : 0;
                          return mod + prof;
                        })();

                        setCharacterForm({
                          skills: skills.map(x => {
                            if (x.name !== s.name) return x;
                            const wasFollowing = (x as any).lastBase === undefined || x.value === (x as any).lastBase;
                            return wasFollowing
                              ? { ...x, proficient: nextProficient, lastBase: newBase, value: newBase }
                              : { ...x, proficient: nextProficient, lastBase: newBase };
                          }),
                        });
                      }}
                      classNames={{ root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" }}
                      thumbIcon={s.proficient ? <IconStarFilled size={14} color="gold" /> : <IconX size={14} color="crimson" />}
                    />

                    {/* Remove (custom only) */}
                    {!def && (
                      <ActionIcon color="red" variant="light" onClick={() => removeSkill(s.name)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                </Tooltip>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </ExpandableSection>
  );
}
