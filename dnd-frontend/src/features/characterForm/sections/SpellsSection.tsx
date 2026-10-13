import { useEffect, useMemo, useState } from "react";
import { Autocomplete, Group, Select, Stack } from "@mantine/core";
import { IconBook2, IconBrain, IconStarFilled, IconTrash } from "@tabler/icons-react";
import { useSpellStore } from "@store/spell/spellStore";
import { getSpellNames } from "@services/spellService";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import type { CharacterSpell } from "@appTypes/Character/CharacterSpell";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { InfoIconPopover } from "@components/common/InfoIconPopover";
import { FormGroup } from "@features/characterForm/components/FormGroup";
import { List, ListAddBar, ListEmpty, ListRow, RowAction } from "@features/characterForm/components/FormList";
import s from "@styles/CharacterForm.module.css";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
type SpellcastingAbility = AbilityKey | "none";

const ABILITY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "str", label: "Strength (STR)" },
  { value: "dex", label: "Dexterity (DEX)" },
  { value: "con", label: "Constitution (CON)" },
  { value: "int", label: "Intelligence (INT)" },
  { value: "wis", label: "Wisdom (WIS)" },
  { value: "cha", label: "Charisma (CHA)" },
];

const glass = { input: "glassy-input", label: "glassy-label" };
const readout = { input: { textAlign: "center" as const, fontWeight: 600, pointerEvents: "none" as const } };

const infoLabel = (label: string, info: string) => (
  <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
    <span>{label}</span>
    <InfoIconPopover title={label}>{info}</InfoIconPopover>
  </Group>
);

export function SpellsSection() {
  const spellNames = useSpellStore((state) => state.spellNames);
  const setSpellNames = useSpellStore((state) => state.setSpellNames);
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!spellNames?.length) getSpellNames().then(setSpellNames);
  }, [spellNames, setSpellNames]);

  const spells = useMemo(
    () =>
      (characterForm.spells ?? []).map((spell: CharacterSpell) =>
        typeof spell === "string" ? { spellId: spell, isPrepared: false } : spell
      ),
    [characterForm.spells]
  );

  const nameById = useMemo(() => new Map(spellNames.map((x) => [x.id, x.name])), [spellNames]);
  const queryId = spellNames.find((x) => x.name === query)?.id;

  const addSpell = () => {
    if (!queryId || spells.some((sp) => sp.spellId === queryId)) return;
    setCharacterForm({ spells: [...spells, { spellId: queryId, isPrepared: false }] });
    setQuery("");
  };

  const removeSpell = (spellId: string) =>
    setCharacterForm({ spells: spells.filter((sp) => sp.spellId !== spellId) });

  const togglePrepared = (spellId: string) =>
    setCharacterForm({
      spells: spells.map((sp) => (sp.spellId === spellId ? { ...sp, isPrepared: !sp.isPrepared } : sp)),
    });

  // Derived spellcasting numbers, written back so the profile can read them
  const spellcastKey = characterForm.spellcastingAbility as SpellcastingAbility;
  const spellMod =
    spellcastKey !== "none" ? Math.floor((characterForm.abilityScores[spellcastKey] - 10) / 2) : null;
  const prof = characterForm.proficiencyBonus ?? 0;
  const spellSaveDc = spellMod !== null ? 8 + prof + spellMod : 0;
  const spellAttackBonus = spellMod !== null ? prof + spellMod : 0;

  useEffect(() => {
    if (characterForm.spellSaveDc !== spellSaveDc || characterForm.spellAttackBonus !== spellAttackBonus) {
      setCharacterForm({ spellSaveDc, spellAttackBonus });
    }
  }, [spellSaveDc, spellAttackBonus, characterForm.spellSaveDc, characterForm.spellAttackBonus, setCharacterForm]);

  const preparedCount = spells.filter((sp) => sp.isPrepared).length;

  return (
    <Stack gap="xl">
      <FormGroup icon={<IconBook2 size={16} />} title="Spellbook" count={spells.length}>
        <ListAddBar onAdd={addSpell} disabled={!queryId}>
          <Autocomplete
            classNames={{ input: "glassy-input", dropdown: "glassy-dropdown" }}
            aria-label="Find a spell"
            placeholder="Search spells..."
            data={spellNames.filter((sp) => !spells.some((x) => x.spellId === sp.id)).map((x) => x.name)}
            value={query}
            onChange={setQuery}
          />
        </ListAddBar>

        {spells.length === 0 ? (
          <ListEmpty>No spells added yet.</ListEmpty>
        ) : (
          <>
            <div className={s.hint}>
              {preparedCount} of {spells.length} prepared
            </div>
            <List cols={2}>
              {spells.map((spell) => {
                const name = nameById.get(spell.spellId) ?? "Unknown spell";
                return (
                  <ListRow
                    key={spell.spellId}
                    title={name}
                    meta={
                      <button
                        type="button"
                        className={s.toggle}
                        data-active={spell.isPrepared || undefined}
                        aria-pressed={spell.isPrepared}
                        onClick={() => togglePrepared(spell.spellId)}
                      >
                        {spell.isPrepared && <IconStarFilled size={10} />}
                        {spell.isPrepared ? "Prepared" : "Prepare"}
                      </button>
                    }
                    actions={
                      <RowAction label={`Remove ${name}`} danger onClick={() => removeSpell(spell.spellId)}>
                        <IconTrash size={15} />
                      </RowAction>
                    }
                  />
                );
              })}
            </List>
          </>
        )}
      </FormGroup>

      <FormGroup icon={<IconBrain size={16} />} title="Spellcasting">
        <Select
          classNames={{ ...glass, dropdown: "glassy-dropdown", option: "glassy-option" }}
          label={infoLabel(
            "Spellcasting Ability",
            "The ability your character uses for spellcasting. It's determined by your class."
          )}
          value={characterForm.spellcastingAbility}
          data={ABILITY_OPTIONS}
          allowDeselect={false}
          onChange={(v) => setCharacterForm({ spellcastingAbility: (v ?? "none") as SpellcastingAbility })}
        />
        <Group grow gap="md">
          <FormNumberInput
            label={infoLabel("Spell Save DC", "8 + Proficiency Bonus + Spellcasting Ability Modifier")}
            classNames={glass}
            value={spellSaveDc}
            disabled
            hideControls
            onChange={() => {}}
            styles={readout}
          />
          <FormNumberInput
            label={infoLabel("Spell Attack Bonus", "Proficiency Bonus + Spellcasting Ability Modifier")}
            classNames={glass}
            value={spellAttackBonus}
            disabled
            hideControls
            onChange={() => {}}
            styles={readout}
          />
        </Group>
      </FormGroup>
    </Stack>
  );
}
