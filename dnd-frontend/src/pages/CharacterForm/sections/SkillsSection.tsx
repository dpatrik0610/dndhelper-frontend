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
import { IconAutomaticGearbox, IconTrash, IconPlus } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import { useState, useEffect } from "react";

// 🧠 Default D&D 5e skills + associated ability
const DEFAULT_SKILLS: { name: string; ability: string; description: string }[] = [
  { name: "Acrobatics", ability: "Dexterity", description: "Perform flips, rolls, and balance-related stunts." },
  { name: "Animal Handling", ability: "Wisdom", description: "Calm or control animals and mounts." },
  { name: "Arcana", ability: "Intelligence", description: "Knowledge of magic, spells, and magical history." },
  { name: "Athletics", ability: "Strength", description: "Climbing, jumping, and physical feats of strength." },
  { name: "Deception", ability: "Charisma", description: "Lying, disguises, and misleading others." },
  { name: "History", ability: "Intelligence", description: "Knowledge of historical events and lore." },
  { name: "Insight", ability: "Wisdom", description: "Read emotions, intentions, and motives of others." },
  { name: "Intimidation", ability: "Charisma", description: "Use fear or presence to influence others." },
  { name: "Investigation", ability: "Intelligence", description: "Deduce clues, details, and hidden objects." },
  { name: "Medicine", ability: "Wisdom", description: "Stabilize creatures and diagnose injuries." },
  { name: "Nature", ability: "Intelligence", description: "Knowledge of terrain, plants, and wildlife." },
  { name: "Perception", ability: "Wisdom", description: "Spotting traps, ambushes, and hidden things." },
  { name: "Performance", ability: "Charisma", description: "Musical or theatrical expression and skill." },
  { name: "Persuasion", ability: "Charisma", description: "Convincing, negotiating, or diplomacy." },
  { name: "Religion", ability: "Intelligence", description: "Knowledge of deities, rites, and divine lore." },
  { name: "Sleight of Hand", ability: "Dexterity", description: "Pickpocketing and manual dexterity tricks." },
  { name: "Stealth", ability: "Dexterity", description: "Sneaking, hiding, and moving unseen." },
  { name: "Survival", ability: "Wisdom", description: "Tracking, foraging, and surviving harsh terrain." },
];

interface SkillsSectionProps {
  form: UseFormReturnType<any>;
}

export function SkillsSection({ form }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");

  // 🧩 Preload default skills if none exist
  useEffect(() => {
    if (!form.values.skills || form.values.skills.length === 0) {
      const preloaded = DEFAULT_SKILLS.map((s) => ({
        name: s.name,
        value: 0,
        proficient: false,
      }));
      form.setFieldValue("skills", preloaded);
    }
  }, [form.values.skills]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const exists = form.values.skills.some(
      (s: any) => s.name.toLowerCase() === newSkill.trim().toLowerCase()
    );
    if (exists) return;

    const updated = [
      ...form.values.skills,
      { name: newSkill.trim(), value: 0, proficient: false },
    ];
    form.setFieldValue("skills", updated);
    setNewSkill("");
  };

  const removeSkill = (name: string) => {
    // ❌ Prevent removing default skills
    if (DEFAULT_SKILLS.some((s) => s.name === name)) return;
    const updated = form.values.skills.filter((s: any) => s.name !== name);
    form.setFieldValue("skills", updated);
  };

  return (
    <ExpandableSection
      title="Skills"
      icon={<IconAutomaticGearbox />}
      color={SectionColor.White}
      defaultOpen
    >
      <Stack>
        <Group>
          <TextInput
            placeholder="Add new skill..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.currentTarget.value)}
            style={{ flexGrow: 1 }}
          />
          <ActionIcon color="teal" variant="filled" onClick={addSkill}>
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        {(!form.values.skills || form.values.skills.length === 0) ? (
          <Text c="dimmed" size="sm">
            No skills yet.
          </Text>
        ) : (
          <SimpleGrid cols={3} spacing="xs">
            {form.values.skills.map((skill: any) => {
              const base = DEFAULT_SKILLS.find((s) => s.name === skill.name);
              return (
                <Tooltip
                  key={skill.name}
                  label={base ? `${base.name} (${base.ability}) — ${base.description}` : "Custom skill"}
                  multiline
                  maw={250}
                  withArrow
                  color="dark"
                  transitionProps={{ transition: "fade", duration: 150 }}
                >
                  <Group
                    align="center"
                    gap="xs"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 6,
                      padding: "4px 6px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)")
                    }
                  >
                    <TextInput
                      value={skill.name}
                      onChange={(e) => {
                        const updated = form.values.skills.map((s: any) =>
                          s.name === skill.name
                            ? { ...s, name: e.currentTarget.value }
                            : s
                        );
                        form.setFieldValue("skills", updated);
                      }}
                      style={{ flex: 1 }}
                      readOnly={!!base} // 🧱 Default skills can’t be renamed
                    />
                    <NumberInput
                      value={skill.value}
                      onChange={(val) => {
                        const updated = form.values.skills.map((s: any) =>
                          s.name === skill.name
                            ? { ...s, value: val ?? 0 }
                            : s
                        );
                        form.setFieldValue("skills", updated);
                      }}
                      style={{ width: 70 }}
                    />
                    <Switch
                      size="xs"
                      checked={skill.proficient}
                      onChange={(e) => {
                        const updated = form.values.skills.map((s: any) =>
                          s.name === skill.name
                            ? { ...s, proficient: e.currentTarget.checked }
                            : s
                        );
                        form.setFieldValue("skills", updated);
                      }}
                      title="Proficient"
                    />
                    {!base && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeSkill(skill.name)}
                      >
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
