import {
  Group, Stack, TextInput, ActionIcon, Text, SimpleGrid, Switch,
} from "@mantine/core";
import { useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconAutomaticGearbox, IconTrash, IconPlus, IconStarFilled, IconX,
} from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import CustomBadge from "@components/common/CustomBadge";
import { useCharacterFormStore } from "@store/useCharacterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { DEFAULT_SKILLS } from "../Tooltips/tooltips";
import { InfoIconPopover } from "@components/common/InfoIconPopover";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export function SkillsSection() {
  const characterForm = useCharacterFormStore(s => s.characterForm);
  const setCharacterForm = useCharacterFormStore(s => s.setCharacterForm);

  const isMobile = useMediaQuery("(max-width: 768px)");
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

  return (
    <ExpandableSection
      title="Skills"
      icon={<IconAutomaticGearbox />}
      color={SectionColor.White}
      defaultOpen
    >
      <Stack gap={isMobile ? 6 : "md"}>

        {/* Add Skill */}
        <Group gap={isMobile ? 6 : "xs"}>
          <TextInput
            classNames={{ input: "glassy-input" }}
            placeholder="Add new skill..."
            value={newSkill}
            onChange={e => setNewSkill(e.currentTarget.value)}
            style={{ flexGrow: 1, fontSize: isMobile ? 12 : 14 }}
          />
          <ActionIcon
            color="teal"
            variant="filled"
            onClick={addSkill}
            size={isMobile ? "sm" : "md"}
          >
            <IconPlus size={isMobile ? 14 : 16} />
          </ActionIcon>
        </Group>

        {!skills.length ? (
          <Text c="dimmed" size="sm">No skills yet.</Text>
        ) : (
          <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? 6 : "xs"}>
            {skills.map(s => {
              const def = DEFAULT_SKILLS.find(d => d.name === s.name);
              const base = calcBase(s);
              const shown = s.value ?? s.lastBase ?? base ?? 0;

              return (
                <Group
                  key={s.name}
                  align="center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 6,
                    padding: isMobile ? "2px 8px" : "6px 8px",
                  }}
                >
                  {/* LABEL */}
                  <CustomBadge
                    label={s.name}
                    fullWidth
                    style={{
                      flex: 1,
                      fontSize: isMobile ? 10 : 12,
                      padding: isMobile ? "2px 6px" : undefined,
                    }}
                    c={SectionColor.Teal}
                    variant="transparent"
                  />

                  {/* INFO ICON */}
                  <InfoIconPopover title={s.name}>
                    {def
                      ? `${s.name} is based on ${def.ability.toUpperCase()}.\n\n${def.desc}`
                      : "Custom skill (no base ability)."}
                  </InfoIconPopover>

                  {/* BASE */}
                  <Stack gap={0} align="center" style={{ width: isMobile ? 30 : 40 }}>
                    <Text size={isMobile ? "xs" : "sm"} c="gray.4">Base</Text>
                    <Text
                      size={isMobile ? "xs" : "sm"}
                      c={def ? "teal.3" : "gray.5"}
                      style={{ opacity: def ? 0.85 : 0.35, fontWeight: 600 }}
                    >
                      {def ? (base! >= 0 ? `+${base}` : base) : "–"}
                    </Text>
                  </Stack>

                  {/* NUMBER INPUT — tightened */}
                  <FormNumberInput
                    classNames={{ input: "glassy-input" }}
                    value={shown}
                    hideControls
                    style={{
                      width: 45,
                      fontSize: isMobile ? 12 : 14,
                    }}
                    onChange={v =>
                      setCharacterForm({
                        skills: skills.map(x => 
                          x.name === s.name ? { ...x, value: v } : x
                        ),
                      })
                    }
                  />

                  {/* PROFICIENCY SWITCH */}
                  <Switch
                    size={isMobile ? "sm" : "md"}
                    checked={s.proficient}
                    onChange={e => {
                      const next = e.currentTarget.checked;
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
                    classNames={{
                      root: "sq-switch",
                      track: "sq-switch-track",
                      thumb: "sq-switch-thumb",
                    }}
                    thumbIcon={
                      s.proficient
                        ? <IconStarFilled size={isMobile ? 12 : 14} color="gold" />
                        : <IconX size={isMobile ? 12 : 14} color="crimson" />
                    }
                  />

                  {/* REMOVE CUSTOM */}
                  {!def && (
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => removeSkill(s.name)}
                      size={isMobile ? "sm" : "md"}
                    >
                      <IconTrash size={isMobile ? 14 : 16} />
                    </ActionIcon>
                  )}
                </Group>
              );
            })}
          </SimpleGrid>
        )}

      </Stack>
    </ExpandableSection>
  );
}
