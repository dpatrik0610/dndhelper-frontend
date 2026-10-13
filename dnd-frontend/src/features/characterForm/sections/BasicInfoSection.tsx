import { Stack, Group, TextInput, Select, Switch, Text, Button } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { ClassLevel } from "@appTypes/Character/Character";
import { RowAction } from "@features/characterForm/components/FormList";
import { classHitDice, mainClassLevel } from "@utils/hitDice";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { InfoIconPopover } from "@components/common/InfoIconPopover";
import { useEffect } from "react";
import { getLevelForExperience } from "@utils/experienceTable";

const ALIGNMENTS = [
  "Lawful Good","Neutral Good","Chaotic Good",
  "Lawful Neutral","True Neutral","Chaotic Neutral",
  "Lawful Evil","Neutral Evil","Chaotic Evil",
];

const HIT_DIE_OPTIONS = [6, 8, 10, 12].map((n) => ({ value: String(n), label: `d${n}` }));
const NEW_CLASS: ClassLevel = { name: "", level: 1, hitDie: 8 };

export function BasicInfoSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const cls = { input: "glassy-input", label: "glassy-label" };
  const selectCls = { ...cls, dropdown: "glassy-dropdown", option: "glassy-option" };
  const multiclass = !!characterForm.isMulticlass;
  const multiclasses = characterForm.multiclasses ?? [];
  const mainLevel = mainClassLevel(characterForm);
  // Every class row shares these columns, so the main and extra classes line up.
  const rowGrid = { display: "grid", gap: 8, alignItems: "end", gridTemplateColumns: `minmax(0, 1fr) 64px 84px${multiclass ? " 28px" : ""}` };

  const toggleMulticlass = (on: boolean) =>
    setCharacterForm({ isMulticlass: on, ...(on && !multiclasses.length && { multiclasses: [NEW_CLASS] }) });

  const updateClass = (index: number, patch: Partial<ClassLevel>) =>
    setCharacterForm({ multiclasses: multiclasses.map((m, i) => (i === index ? { ...m, ...patch } : m)) });

  // label helper
  const L = (label: string, info: string | null = null) => (
    <Group gap={4} align="center" wrap="nowrap">
      <span>{label}</span>
      {info && <InfoIconPopover title={label}>{info}</InfoIconPopover>}
    </Group>
  );

  // Auto-compute Level and Proficiency Bonus from Experience (XP)
  useEffect(() => {
    const xp = characterForm.experience ?? 0;
    const progression = getLevelForExperience(xp);
    if (
      progression.level !== characterForm.level ||
      progression.proficiencyBonus !== characterForm.proficiencyBonus
    ) {
      setCharacterForm({
        level: progression.level,
        proficiencyBonus: progression.proficiencyBonus,
      });
    }
  }, [characterForm.experience, characterForm.level, characterForm.proficiencyBonus]);

  return (
    <Stack gap={8}>

      {/* NAME */}
      <TextInput
        classNames={cls}
        label={L("Name", "Your character's chosen name.")}
        required
        value={characterForm.name}
        onChange={(e) => setCharacterForm({ name: e.currentTarget.value })}
      />

      {/* RACE + BACKGROUND + ALIGNMENT */}
      <Group grow gap={8}>
        <TextInput
          classNames={cls}
          label={L("Race", "Determines innate traits and abilities.")}
          value={characterForm.race}
          onChange={(e) => setCharacterForm({ race: e.currentTarget.value })}
        />

        <TextInput
          classNames={cls}
          label={L("Background", "Your life before adventuring.")}
          value={characterForm.background}
          onChange={(e) => setCharacterForm({ background: e.currentTarget.value })}
        />

        <Select
          data={ALIGNMENTS}
          label="Alignment"
          value={characterForm.alignment}
          onChange={(v) => setCharacterForm({ alignment: v! })}
          classNames={selectCls}
        />
      </Group>

      {/* PROGRESSION: XP (EDITABLE), LEVEL (AUTO), PROF BONUS (AUTO) */}
      <Group grow gap={8}>
        <FormNumberInput
          classNames={cls}
          label={L("Experience Points (XP)", "Your total accumulated experience. Level and Proficiency Bonus will auto-compute.")}
          min={0}
          value={characterForm.experience}
          onChange={(v) => setCharacterForm({ experience: v })}
        />

        <TextInput
          classNames={cls}
          label="Calculated Level"
          value={`Level ${characterForm.level}`}
          readOnly
          disabled
          styles={{ input: { opacity: 0.85, fontWeight: 600, color: "var(--theme-color-accent-primary)" } }}
        />

        <TextInput
          classNames={cls}
          label="Proficiency Bonus"
          value={`+${characterForm.proficiencyBonus}`}
          readOnly
          disabled
          styles={{ input: { opacity: 0.85, fontWeight: 600, color: "var(--theme-color-accent-secondary)" } }}
        />
      </Group>

      {/* CLASSES: the main class keeps whatever levels the other classes leave */}
      <Stack gap={8} mt="lg">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text className="narrative-title" data-themed style={{ fontSize: 16 }}>
            Classes
          </Text>
          <Switch
            label="Multiclass"
            checked={multiclass}
            onChange={(e) => toggleMulticlass(e.currentTarget.checked)}
            classNames={{ root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" }}
            styles={{ label: { color: "#fff", fontSize: "13px" } }}
          />
        </Group>

        <div style={rowGrid}>
          <TextInput
            classNames={cls}
            label={L(multiclass ? "Main Class" : "Class", "Defines your combat role and progression.")}
            placeholder="Fighter"
            value={characterForm.characterClass}
            onChange={(e) => setCharacterForm({ characterClass: e.currentTarget.value })}
          />
          <TextInput
            classNames={cls}
            label={L("Level", multiclass ? "Your level minus the other classes' levels." : "Same as your character level.")}
            value={mainLevel}
            readOnly
            disabled
            error={mainLevel < 1}
            styles={{ input: { opacity: 0.85, fontWeight: 600, textAlign: "center", color: "var(--theme-color-accent-primary)" } }}
          />
          <Select
            data={HIT_DIE_OPTIONS}
            label={L("Hit Die", "One per class level, spent on short rests.")}
            placeholder="Pick"
            allowDeselect={false}
            value={characterForm.hitDie ? String(characterForm.hitDie) : null}
            onChange={(v) => v && setCharacterForm({ hitDie: Number(v) })}
            classNames={selectCls}
          />
          {multiclass && <span />}
        </div>

        {multiclass &&
          multiclasses.map((m, i) => (
            <div key={i} style={rowGrid}>
              <TextInput
                classNames={cls}
                placeholder="Class name"
                aria-label={`Class ${i + 2}`}
                autoFocus={!m.name}
                value={m.name}
                onChange={(e) => updateClass(i, { name: e.currentTarget.value })}
              />
              <FormNumberInput
                classNames={cls}
                min={1}
                max={20}
                hideControls
                value={m.level}
                onChange={(v) => updateClass(i, { level: v })}
                styles={{ input: { textAlign: "center" } }}
              />
              <Select
                data={HIT_DIE_OPTIONS}
                allowDeselect={false}
                aria-label={`${m.name || "Class"} hit die`}
                value={String(m.hitDie)}
                onChange={(v) => v && updateClass(i, { hitDie: Number(v) })}
                classNames={selectCls}
              />
              <RowAction label={`Remove ${m.name || "class"}`} danger onClick={() => setCharacterForm({ multiclasses: multiclasses.filter((_, j) => j !== i) })}>
                <IconTrash size={15} />
              </RowAction>
            </div>
          ))}

        <Group justify="space-between" gap={8}>
          {multiclass ? (
            <Button
              className="glass-btn-secondary"
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={() => setCharacterForm({ multiclasses: [...multiclasses, NEW_CLASS] })}
            >
              Add class
            </Button>
          ) : (
            <span />
          )}
          <Text size="xs" c={mainLevel < 1 ? "red" : "dimmed"}>
            {mainLevel < 1
              ? `The other classes use all ${characterForm.level} levels; the main class needs at least one.`
              : `Hit dice: ${classHitDice(characterForm) || "pick a hit die"}`}
          </Text>
        </Group>
      </Stack>

      {/* INSPIRATION */}
      <FormNumberInput
        classNames={cls}
        label={L("Inspiration", "Spend for advantage on a roll.")}
        value={characterForm.inspiration}
        onChange={(v) => setCharacterForm({ inspiration: v })}
      />

    </Stack>
  );
}
