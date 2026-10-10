import { useState } from "react";
import { Stack, Group, Text, Autocomplete, Select, Button, ActionIcon } from "@mantine/core";
import { IconBolt, IconPlus, IconTrash } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { FormNumberInput } from "@components/common/FormNumberInput";
import {
  CLASS_RESOURCE_PRESETS,
  type ClassResource,
  type ResourceRecharge,
} from "@appTypes/Character/ClassResource";

const RECHARGE_OPTIONS = [
  { value: "short", label: "Short Rest" },
  { value: "long", label: "Long Rest" },
  { value: "none", label: "Manual" },
];

export function ClassResourcesSection({ noBox = false }: { noBox?: boolean }) {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const resources = characterForm.classResources ?? [];
  const [newName, setNewName] = useState("");

  const update = (index: number, patch: Partial<ClassResource>) => {
    setCharacterForm({
      classResources: resources.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, ...patch };
        next.max = Math.max(next.max, 0);
        next.current = Math.min(Math.max(next.current, 0), next.max);
        return next;
      }),
    });
  };

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const preset = CLASS_RESOURCE_PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());
    setCharacterForm({
      classResources: [...resources, { name, current: 0, max: 0, recharge: preset?.recharge ?? "long" }],
    });
    setNewName("");
  };

  const remove = (index: number) =>
    setCharacterForm({ classResources: resources.filter((_, i) => i !== index) });

  const content = (
    <Stack gap="md">
      <Group align="flex-end" gap="xs" wrap="nowrap">
        <Autocomplete
          flex={1}
          classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown" }}
          leftSection={<IconBolt size={18} />}
          label="Class Resource"
          placeholder="Ki Points, Sorcery Points, or type your own..."
          data={CLASS_RESOURCE_PRESETS.map((p) => p.name).filter(
            (n) => !resources.some((r) => r.name.toLowerCase() === n.toLowerCase())
          )}
          value={newName}
          onChange={setNewName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button
          className="glass-btn-primary"
          onClick={add}
          disabled={!newName.trim()}
          leftSection={<IconPlus size={14} />}
          style={{ textTransform: "uppercase", letterSpacing: "1px", fontSize: "10px", height: "36px" }}
        >
          Add
        </Button>
      </Group>

      {resources.length === 0 && (
        <Text size="sm" c="dimmed" ta="center">
          No class resources yet.
        </Text>
      )}

      {resources.map((r, i) => (
        <Group
          key={i}
          justify="space-between"
          align="center"
          wrap="wrap"
          gap="xs"
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.01)",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
          }}
        >
          <Text
            className="narrative-title"
            style={{ fontSize: "11px", letterSpacing: "2px", color: "var(--theme-color-text-primary, #fff)", flex: 1 }}
          >
            {r.name}
          </Text>

          <Group gap="xs" align="center" wrap="nowrap">
            <FormNumberInput
              hideControls
              min={0}
              max={r.max}
              value={r.current}
              classNames={{ input: "glassy-input" }}
              style={{ width: 55 }}
              styles={{ input: { textAlign: "center", padding: 0 } }}
              onChange={(v) => update(i, { current: v ?? 0 })}
            />
            <Text size="sm" style={{ opacity: 0.35, fontWeight: 300 }}>/</Text>
            <FormNumberInput
              hideControls
              min={0}
              value={r.max}
              classNames={{ input: "glassy-input" }}
              style={{ width: 55 }}
              styles={{ input: { textAlign: "center", padding: 0 } }}
              onChange={(v) => update(i, { max: v ?? 0 })}
            />
            <Select
              w={120}
              allowDeselect={false}
              classNames={{ input: "glassy-input", dropdown: "glassy-dropdown", option: "glassy-option" }}
              data={RECHARGE_OPTIONS}
              value={r.recharge}
              onChange={(v) => v && update(i, { recharge: v as ResourceRecharge })}
              aria-label={`${r.name} recharge`}
            />
            <ActionIcon variant="subtle" color="red" aria-label={`Delete ${r.name}`} onClick={() => remove(i)}>
              <IconTrash size={15} />
            </ActionIcon>
          </Group>
        </Group>
      ))}
    </Stack>
  );

  if (noBox) return content;

  return (
    <ExpandableSection title="Class Resources" icon={<IconBolt />} color={SectionColor.Teal} defaultOpen>
      {content}
    </ExpandableSection>
  );
}
