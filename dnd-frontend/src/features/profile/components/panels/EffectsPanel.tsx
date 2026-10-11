import { useMemo, useState } from "react";
import { ActionIcon, Button, Chip, Group, Menu, Stack, Table, Text, TextInput, ThemeIcon } from "@mantine/core";
import {
  IconDots,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { BaseModal } from "@components/BaseModal";
import { SectionColor } from "@appTypes/SectionColor";
import type { CharacterEffect, StatModifier } from "@appTypes/Character/Effect";
import { useCharacterCoreActions, useCurrentCharacter, useEffectiveStats } from "@store/character/characterSelectors";
import { TARGET_OPTIONS, describeModifier, modifierApplies, newEffectId, signed, situationsOf, targetLabel, type AppliedEffect } from "@utils/effects";
import { useEffectActions } from "@features/profile/hooks/useEffectActions";
import { EffectModal } from "@features/profile/components/modals/EffectModal";
import { EffectSigil } from "@features/profile/components/EffectSigil";
import { EFFECT_SOURCES } from "@features/profile/components/effectSources";

// Stable fallback, so the changes memo does not recompute every render.
const NO_SITUATIONS: string[] = [];

// Summary rows follow the order of the target picker: abilities, saves, skills, combat.
const TARGET_ORDER = new Map(TARGET_OPTIONS.flatMap((g) => g.items).map((item, i) => [item.value, i]));

const PANEL_STYLE = {
  background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
  backdropFilter: "blur(24px) saturate(130%)",
  WebkitBackdropFilter: "blur(24px) saturate(130%)",
  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
  borderRadius: "16px",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
  padding: "16px",
};

const changeLabel = (m: StatModifier) => {
  switch (m.type) {
    case "bonus": return signed(m.value ?? 0);
    case "set": return `= ${m.value ?? 0}`;
    case "min": return `≥ ${m.value ?? 0}`;
    case "advantage": return "Advantage";
    case "disadvantage": return "Disadvantage";
    case "note": return m.text ?? "";
  }
};

/** Effects grouped like a VTT effects sheet (active, conditions, inactive), then every resulting change in one table. */
export function EffectsPanel() {
  const fx = useEffectiveStats();
  const { effects, saveEffect, removeEffect } = useEffectActions();
  const [editing, setEditing] = useState<CharacterEffect | null>(null);
  const [removing, setRemoving] = useState<CharacterEffect | null>(null);
  const [showQuiet, setShowQuiet] = useState(false);
  const [newSituation, setNewSituation] = useState("");
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const situations = character ? situationsOf(character) : [];
  const activeSituations = character?.activeSituations ?? NO_SITUATIONS;

  // A new situation starts switched on: that is what keeps it listed until a change uses it.
  const addSituation = () => {
    const label = newSituation.trim();
    if (!label) return;
    if (!activeSituations.some((s) => s.toLowerCase() === label.toLowerCase())) {
      updateCharacter({ activeSituations: [...activeSituations, label] });
    }
    setNewSituation("");
  };

  const active = effects.filter((e) => e.active);
  const inactive = effects.filter((e) => !e.active);
  const conditions = fx?.effects.filter((e) => e.source === "condition") ?? [];

  // Situational changes stay listed while their situation is off, greyed, so the player sees what it would do.
  const changes = useMemo(
    () =>
      (fx?.effects ?? [])
        .flatMap((e) =>
          e.modifiers.filter((m) => m.type !== "note").map((m) => ({ m, source: e.name, applies: modifierApplies({ activeSituations }, m) }))
        )
        .sort((a, b) => (TARGET_ORDER.get(a.m.target) ?? 999) - (TARGET_ORDER.get(b.m.target) ?? 999) || Number(b.applies) - Number(a.applies)),
    [fx, activeSituations]
  );

  const startNew = () => setEditing({ id: newEffectId(), name: "", source: "potion", active: true, modifiers: [] });

  const row = (effect: AppliedEffect) => {
    const { label, Icon, color } = EFFECT_SOURCES[effect.source];
    const stored = effect.source === "condition" ? null : (effect as CharacterEffect);
    const summary = effect.modifiers.map(describeModifier).filter(Boolean).join(" · ");

    return (
      <Group key={effect.id} wrap="nowrap" gap="sm" align="flex-start" py={8} style={{ borderTop: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))" }}>
        <EffectSigil
          Icon={Icon}
          color={color}
          name={effect.name}
          active={effect.active}
          onToggle={stored ? (active) => saveEffect({ ...stored, active }) : undefined}
        />

        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="nowrap">
            <Text size="sm" fw={600} truncate="end" c={effect.active ? undefined : "dimmed"}>
              {effect.name}
            </Text>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {label}
            </Text>
          </Group>
          <Text size="xs" c={summary ? undefined : "dimmed"} style={{ opacity: 0.85 }}>
            {summary || "No stat changes"}
          </Text>
          {stored?.note && (
            <Text size="xs" c="dimmed" fs="italic">
              {stored.note}
            </Text>
          )}
          {!stored && (
            <Text size="xs" c="dimmed">
              Ends when the condition is removed from the character.
            </Text>
          )}
          {stored?.auto && (
            <Text size="xs" c="dimmed">
              Worn from the inventory you wear. Move the item out to unequip it.
            </Text>
          )}
        </Stack>

        {stored && (
          <Group gap={4} wrap="nowrap">
            <Menu position="bottom-end" withinPortal classNames={{ dropdown: "glassy-dropdown" }}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label={`Actions for ${stored.name}`}>
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => setEditing(stored)}>
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={stored.active ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                  onClick={() => saveEffect({ ...stored, active: !stored.active })}
                >
                  {stored.active ? "Turn off" : "Turn on"}
                </Menu.Item>
                {/* It would come straight back while the item is in the worn inventory. */}
                {!stored.auto && (
                  <>
                    <Menu.Divider />
                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => setRemoving(stored)}>
                      Remove
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}
      </Group>
    );
  };

  // Worn bags fill up with swords and tinderboxes that change nothing; keep them out of the way, one click from editing.
  const section = (title: string, list: AppliedEffect[]) => {
    if (!list.length) return null;
    const changing = list.filter((e) => e.modifiers.length > 0);
    const quiet = list.length - changing.length;
    return (
      <Stack gap={0}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 1 }} pb={4}>
          {title} ({changing.length})
        </Text>
        {(showQuiet ? list : changing).map(row)}
        {quiet > 0 && (
          <Button variant="subtle" color="gray" size="compact-xs" mt={6} style={{ alignSelf: "flex-start" }} onClick={() => setShowQuiet(!showQuiet)}>
            {showQuiet ? "Hide items with no stat changes" : `Show ${quiet} item${quiet === 1 ? "" : "s"} with no stat changes`}
          </Button>
        )}
      </Stack>
    );
  };

  const nothing = !effects.length && !conditions.length;

  return (
    <Stack gap="md">
      <ExpandableSection
        title="Effects"
        color={SectionColor.Teal}
        defaultOpen
        expandable={false}
        style={PANEL_STYLE}
        rightSection={
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={(e) => {
              e.stopPropagation();
              startNew();
            }}
          >
            Add effect
          </Button>
        }
      >
        {nothing ? (
          <Stack align="center" gap={6} py="lg">
            <ThemeIcon variant="light" color="teal" size={44} radius="xl" aria-hidden>
              <IconSparkles size={24} />
            </ThemeIcon>
            <Text fw={600}>No active effects</Text>
            <Text size="sm" c="dimmed" ta="center" maw={420}>
              Equip an item from the Inventories tab, add a condition, or add a potion or spell effect here. Base stats are never changed.
            </Text>
          </Stack>
        ) : (
          <Stack gap="lg">
            {/* Always shown, so situations can be found before any change uses one. */}
            <Stack gap={6}>
              <Text size="sm" fw={600}>
                Situation right now
              </Text>
              <Group gap={6}>
                <Chip.Group multiple value={activeSituations} onChange={(next) => updateCharacter({ activeSituations: next })}>
                  {situations.map((s) => (
                    <Chip key={s} value={s} size="sm" color="teal" variant="outline">
                      {s}
                    </Chip>
                  ))}
                </Chip.Group>
                <TextInput
                  size="xs"
                  w={190}
                  placeholder="Add a situation, e.g. Swamp"
                  aria-label="Add a situation"
                  value={newSituation}
                  onChange={(e) => setNewSituation(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSituation();
                  }}
                  rightSection={
                    <ActionIcon size="sm" variant="subtle" aria-label="Add situation" disabled={!newSituation.trim()} onClick={addSituation}>
                      <IconPlus size={14} />
                    </ActionIcon>
                  }
                />
              </Group>
              <Text size="xs" c="dimmed">
                {situations.length
                  ? "Changes marked “when …” only count while their situation is on. Switched-off situations no change uses disappear."
                  : "Add one here, then pick it in a change's “When” field in the effect editor. That change only counts while the situation is on."}
              </Text>
            </Stack>
            {section("Active", active)}
            {section("Conditions", conditions)}
            {section("Inactive", inactive)}
          </Stack>
        )}
      </ExpandableSection>

      {changes.length + (fx?.notes.length ?? 0) > 0 && (
        <ExpandableSection title="Stat changes" color={SectionColor.Cyan} defaultOpen expandable={false} style={PANEL_STYLE}>
          <Stack gap="sm">
            {changes.length > 0 && (
              <Table.ScrollContainer minWidth={460}>
                <Table verticalSpacing={6} highlightOnHover highlightOnHoverColor="var(--theme-bg-hover, rgba(255, 255, 255, 0.04))">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Applies to</Table.Th>
                      <Table.Th>Change</Table.Th>
                      <Table.Th>Result</Table.Th>
                      <Table.Th>Source</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {changes.map(({ m, source, applies }, i) => {
                      const stat = fx?.stats[m.target];
                      const result = !applies
                        ? `Only when ${m.when}`
                        : !stat
                          ? "—"
                          : m.type === "advantage" || m.type === "disadvantage"
                            ? stat.roll === "normal" ? "Cancelled out" : stat.roll[0].toUpperCase() + stat.roll.slice(1)
                            : `${stat.base} → ${stat.value}`;
                      return (
                        <Table.Tr key={i} style={applies ? undefined : { opacity: 0.45 }}>
                          <Table.Td>
                            {targetLabel(m.target)}
                            {m.when && applies && (
                              <Text span size="xs" c="dimmed">
                                {" "}
                                ({m.when})
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td fw={600} c={m.type === "disadvantage" || (m.value ?? 0) < 0 ? "red.4" : m.type === "set" || m.type === "min" ? undefined : "green.4"}>
                            {changeLabel(m)}
                          </Table.Td>
                          <Table.Td>{result}</Table.Td>
                          <Table.Td c="dimmed">{source}</Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}

            {fx && fx.notes.length > 0 && (
              <Stack gap={4}>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: 1 }}>
                  Other effects
                </Text>
                {fx.notes.map((n, i) => (
                  <Text key={i} size="sm">
                    {n.detail} <Text span size="xs" c="dimmed">· {n.source}</Text>
                  </Text>
                ))}
              </Stack>
            )}

            <Text size="xs" c="dimmed">
              Ability score changes also carry over to saves, skills, initiative and max HP. Hover any number on the Skills or Stats tab for its full breakdown.
            </Text>
          </Stack>
        </ExpandableSection>
      )}

      <EffectModal
        opened={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSave={(effect) => {
          saveEffect(effect);
          setEditing(null);
        }}
        onDelete={editing && !editing.auto && effects.some((e) => e.id === editing.id) ? () => (setRemoving(editing), setEditing(null)) : undefined}
      />

      <BaseModal
        opened={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove effect"
        size="sm"
        saveLabel="Remove"
        onSave={() => {
          if (removing) removeEffect(removing.id);
          setRemoving(null);
        }}
      >
        <Text size="sm">
          Remove <b>{removing?.name}</b>? Its changes stop applying. To keep it for later, turn it off instead.
        </Text>
      </BaseModal>
    </Stack>
  );
}
