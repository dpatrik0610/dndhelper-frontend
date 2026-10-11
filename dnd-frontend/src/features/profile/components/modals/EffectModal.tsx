import { useEffect, useState } from "react";
import { ActionIcon, Autocomplete, Button, Group, NumberInput, Select, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { IconEye, IconPlus, IconTrash, IconWand } from "@tabler/icons-react";
import { BaseModal } from "@components/BaseModal";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";
import type { CharacterEffect, EffectSource, ModifierType, StatModifier } from "@appTypes/Character/Effect";
import { PROFICIENCY_OPTIONS, PROFICIENCY_OTHER, TARGET_OPTIONS, detectModifiers, situationsOf } from "@utils/effects";
import { useCurrentCharacter } from "@store/character/characterSelectors";

const SOURCES: { value: EffectSource; label: string }[] = [
  { value: "item", label: "Item" },
  { value: "potion", label: "Potion / consumable" },
  { value: "spell", label: "Spell" },
  { value: "feature", label: "Feature" },
  { value: "custom", label: "Other" },
];

const TYPES: { value: ModifierType; label: string }[] = [
  { value: "bonus", label: "Bonus (+/-)" },
  { value: "min", label: "At least" },
  { value: "set", label: "Set to" },
  { value: "advantage", label: "Advantage" },
  { value: "disadvantage", label: "Disadvantage" },
  { value: "proficiency", label: "Proficiency" },
  { value: "note", label: "Note" },
];

const hasNumber = (t: ModifierType) => t === "bonus" || t === "min" || t === "set";

// A proficiency is only in a save or a skill; any other target is cleared so the picker starts empty.
const changeType = (m: StatModifier, type: ModifierType): Partial<StatModifier> =>
  type === "proficiency" && !/^(save:|skill:|saves$)/.test(m.target) ? { type, target: "", text: undefined } : { type };

interface EffectModalProps {
  opened: boolean;
  /** Prefilled effect: detected modifiers when equipping, the stored one when editing. */
  initial: CharacterEffect | null;
  onClose: () => void;
  onSave: (effect: CharacterEffect) => void;
  onDelete?: () => void;
}

export function EffectModal({ opened, initial, onClose, onSave, onDelete }: EffectModalProps) {
  const [draft, setDraft] = useState<CharacterEffect | null>(initial);
  const [pasted, setPasted] = useState("");
  const [viewingItem, setViewingItem] = useState(false);
  const character = useCurrentCharacter();
  const situations = character ? situationsOf(character) : [];

  useEffect(() => {
    if (opened) {
      setDraft(initial);
      setPasted("");
      setViewingItem(false);
    }
  }, [opened, initial]);

  if (!draft) return null;

  const setMods = (modifiers: StatModifier[]) => setDraft({ ...draft, modifiers });
  const patchMod = (i: number, patch: Partial<StatModifier>) =>
    setMods(draft.modifiers.map((m, j) => (j === i ? { ...m, ...patch } : m)));

  const handleSave = () => {
    const modifiers = draft.modifiers
      .filter((m) => (m.type === "note" || (m.type === "proficiency" && !m.target) ? !!m.text?.trim() : !!m.target))
      .map((m) => ({ ...m, when: m.when?.trim() || undefined }));
    onSave({ ...draft, name: draft.name.trim() || "Effect", modifiers });
  };

  return (
    <BaseModal opened={opened} onClose={onClose} title={initial?.name ? `Effect: ${initial.name}` : "New effect"} onSave={handleSave}>
      <Stack gap="sm">
        <Group grow align="flex-end">
          <TextInput label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })} />
          <Select
            label="Source"
            data={SOURCES}
            value={draft.source}
            allowDeselect={false}
            onChange={(v) => v && setDraft({ ...draft, source: v as EffectSource })}
            comboboxProps={{ zIndex: 3000 }}
          />
        </Group>

        {draft.equipmentId && (
          <Group>
            <Button size="xs" variant="subtle" leftSection={<IconEye size={14} />} onClick={() => setViewingItem(true)}>
              View item
            </Button>
          </Group>
        )}

        <Text size="sm" fw={600}>
          What it changes
        </Text>
        {draft.modifiers.length === 0 ? (
          <Text size="xs" c="dimmed">
            Nothing detected. Add a change below, or paste the item's text to detect it.
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            Leave “Always” for a change that always counts, or name a situation (Swamp, Raging…) to make it count only while that is on.
          </Text>
        )}
        {draft.modifiers.map((m, i) => (
          <Group key={i} gap="xs" wrap="wrap" align="flex-end">
            <Select
              aria-label="Type"
              data={TYPES}
              value={m.type}
              allowDeselect={false}
              w={140}
              onChange={(v) => v && patchMod(i, changeType(m, v as ModifierType))}
              comboboxProps={{ zIndex: 3000 }}
            />
            {m.type === "note" ? (
              <TextInput aria-label="Note" style={{ flex: 1 }} value={m.text ?? ""} onChange={(e) => patchMod(i, { text: e.currentTarget.value })} />
            ) : m.type === "proficiency" ? (
              <>
                <Select
                  aria-label="Proficient in"
                  placeholder="Proficient in…"
                  data={PROFICIENCY_OPTIONS}
                  value={m.target || (m.text !== undefined ? PROFICIENCY_OTHER : null)}
                  searchable
                  style={{ flex: 1 }}
                  onChange={(v) => patchMod(i, v === PROFICIENCY_OTHER ? { target: "", text: m.text ?? "" } : { target: v ?? "", text: undefined })}
                  comboboxProps={{ zIndex: 3000 }}
                />
                {!m.target && m.text !== undefined && (
                  <TextInput
                    aria-label="Weapon, armor or tool"
                    placeholder="e.g. Heavy armor, Thieves' tools"
                    style={{ flex: 1 }}
                    value={m.text}
                    onChange={(e) => patchMod(i, { text: e.currentTarget.value })}
                  />
                )}
              </>
            ) : (
              <Select
                aria-label="Applies to"
                placeholder="Applies to…"
                data={TARGET_OPTIONS}
                value={m.target || null}
                searchable
                style={{ flex: 1 }}
                onChange={(v) => patchMod(i, { target: v ?? "" })}
                comboboxProps={{ zIndex: 3000 }}
              />
            )}
            {hasNumber(m.type) && (
              <NumberInput aria-label="Value" w={80} value={m.value ?? 0} onChange={(v) => patchMod(i, { value: Number(v) || 0 })} />
            )}
            <Autocomplete
              aria-label="Only when"
              placeholder="Always"
              w={130}
              data={situations}
              value={m.when ?? ""}
              onChange={(v) => patchMod(i, { when: v })}
              comboboxProps={{ zIndex: 3000 }}
            />
            <ActionIcon variant="subtle" color="red" size="lg" aria-label="Remove change" onClick={() => setMods(draft.modifiers.filter((_, j) => j !== i))}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}
        <Group>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={() => setMods([...draft.modifiers, { target: "", type: "bonus", value: 1 }])}>
            Add change
          </Button>
        </Group>

        <Textarea
          label="Detect from text"
          description="Paste a description (e.g. “+2 bonus to Constitution saving throws”) and the changes are filled in."
          autosize
          minRows={2}
          value={pasted}
          onChange={(e) => setPasted(e.currentTarget.value)}
        />
        <Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconWand size={14} />}
            disabled={!pasted.trim()}
            onClick={() => setMods([...draft.modifiers, ...detectModifiers({ description: [pasted] })])}
          >
            Detect
          </Button>
        </Group>

        <Textarea label="Note" autosize minRows={1} value={draft.note ?? ""} onChange={(e) => setDraft({ ...draft, note: e.currentTarget.value })} />

        {onDelete && (
          <Group justify="flex-end">
            <Button color="red" variant="subtle" leftSection={<IconTrash size={14} />} onClick={onDelete}>
              Remove effect
            </Button>
          </Group>
        )}
      </Stack>

      {/* The item's own details window opens over the editor. */}
      <EquipmentModal opened={viewingItem} onClose={() => setViewingItem(false)} equipmentId={draft.equipmentId ?? null} />
    </BaseModal>
  );
}
