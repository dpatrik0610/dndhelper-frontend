import {
  Group,
  NumberInput,
  Stack,
  TextInput,
  ActionIcon,
  Text,
  SimpleGrid,
  Switch,
  Tooltip,
} from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import {
  IconAutomaticGearbox,
  IconTrash,
  IconPlus,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import { useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import type { UseFormReturnType } from "@mantine/form";
import CustomBadge from "../../../components/common/CustomBadge";

interface AbilityScores {
  str: number; dex: number; con: number; int: number; wis: number; cha: number;
}

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

interface SkillsSectionProps { form: UseFormReturnType<any>; }

export function SkillsSection({ form }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const scores = form.values.abilityScores ?? {};

  // 🎲 Calculate ability modifiers
  const mods = useMemo(() => {
    const calc = (v: number) => Math.floor((v - 10) / 2);
    return {
      str: calc(scores.str), dex: calc(scores.dex), con: calc(scores.con),
      int: calc(scores.int), wis: calc(scores.wis), cha: calc(scores.cha),
    };
  }, [scores]);

  // 🧮 Get base (min) skill value = ability mod + proficiency (if any)
  const getBase = (s: any) => {
    const base = DEFAULT_SKILLS.find(d => d.name === s.name);
    const mod = base ? mods[base.ability as keyof AbilityScores] : 0;
    const prof = s.proficient ? (form.values.proficiencyBonus ?? 0) : 0;
    return mod + prof;
  };

  // 🧩 Initialize default skills
  useEffect(() => {
    if (!form.values.skills?.length) {
      form.setFieldValue("skills", DEFAULT_SKILLS.map(s => ({ name: s.name, value: 0, proficient: false })));
    }
  }, [form.values.skills]);

  // ➕ Add new skill
  const addSkill = () => {
    const name = newSkill.trim();
    if (!name || form.values.skills.some((s: any) => s.name.toLowerCase() === name.toLowerCase())) return;
    form.setFieldValue("skills", [...form.values.skills, { name, value: 0, proficient: false }]);
    setNewSkill("");
  };

  // ❌ Remove skill
  const removeSkill = (name: string) =>
    !DEFAULT_SKILLS.some(s => s.name === name) &&
    form.setFieldValue("skills", form.values.skills.filter((s: any) => s.name !== name));

  const skills = form.values.skills ?? [];

  return (
    <ExpandableSection title="Skills" icon={<IconAutomaticGearbox />} color={SectionColor.White} defaultOpen>
      <Stack>
        <Group>
          <TextInput
            placeholder="Add new skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.currentTarget.value)}
            style={{ flexGrow: 1 }}
          />
          <ActionIcon color="teal" variant="filled" onClick={addSkill}><IconPlus size={16} /></ActionIcon>
        </Group>

        {skills.length === 0 ? (
          <Text c="dimmed" size="sm">No skills yet.</Text>
        ) : (
          <SimpleGrid cols={isMobile ? 1 : 2} spacing="xs">
            {skills.map((s: any) => {
              const def = DEFAULT_SKILLS.find(d => d.name === s.name);
              const base = getBase(s);
              return (
                <Tooltip
                  key={s.name}
                  label={def ? `${def.name} (${def.ability.toUpperCase()}) — ${def.desc}` : "Custom skill"}
                  withArrow color="dark" maw={250}
                >
                  <Group
                    gap="xs"
                    align="center"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 6,
                      padding: "6px 8px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  >
                    <CustomBadge label={s.name} style={{ flex: 1 }} c={SectionColor.Teal} variant="transparent" fullWidth />

                    <NumberInput
                      value={s.value || base}
                      min={base}
                      onChange={(v) => {
                        const val = Math.max(Number(v) || base, base);
                        form.setFieldValue("skills", skills.map((x: any) =>
                          x.name === s.name ? { ...x, value: val } : x
                        ));
                      }}
                      style={{ width: 70 }}
                      size={isMobile ? "xs" : "sm"}
                    />

                    <Switch
                      size="md"
                      checked={s.proficient}
                      onChange={(e) => {
                        form.setFieldValue("skills", skills.map((x: any) =>
                          x.name === s.name ? { ...x, proficient: e.currentTarget.checked } : x
                        ));
                      }}
                      thumbIcon={
                        s.proficient
                          ? <IconStarFilled size={16} color="var(--mantine-color-yellow-6)" />
                          : <IconX size={16} color="var(--mantine-color-red-6)" />
                      }
                    />

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
