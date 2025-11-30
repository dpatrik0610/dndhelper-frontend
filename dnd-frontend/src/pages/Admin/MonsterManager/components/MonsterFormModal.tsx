import { Button, Group, Modal, NumberInput, Stack, Switch, TextInput } from "@mantine/core";
import type { Monster } from "../../../../types/Monster";

interface MonsterFormModalProps {
  opened: boolean;
  isEditing: boolean;
  saving: boolean;
  monster: Monster;
  onChange: (updater: (prev: Monster) => Monster) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function MonsterFormModal({
  opened,
  isEditing,
  saving,
  monster,
  onChange,
  onClose,
  onSubmit,
}: MonsterFormModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit monster" : "Add monster"}
      centered
      overlayProps={{ blur: 6, color: "rgba(0,0,0,0.35)" }}
      styles={{
        content: {
          background: "rgba(30, 0, 0, 0.55)",
          border: "1px solid rgba(255, 100, 100, 0.4)",
          backdropFilter: "blur(10px)",
        },
        header: { background: "transparent", borderBottom: "none" },
      }}
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          value={monster.name ?? ""}
          onChange={(e) => onChange((prev) => ({ ...prev, name: e.currentTarget.value }))}
          classNames={{ input: "glassy-input" }}
          required
        />
        <TextInput
          label="Type"
          placeholder="e.g. Dragon"
          value={monster.type?.type ?? ""}
          onChange={(e) =>
            onChange((prev) => ({
              ...prev,
              type: { ...(prev.type ?? {}), type: e.currentTarget.value },
            }))
          }
          classNames={{ input: "glassy-input" }}
        />
        <NumberInput
          label="CR"
          value={monster.cr ?? undefined}
          onChange={(value) =>
            onChange((prev) => ({
              ...prev,
              cr: typeof value === "number" ? value : undefined,
            }))
          }
          min={0}
          classNames={{ input: "glassy-input" }}
        />
        <TextInput
          label="Source"
          value={monster.source ?? ""}
          onChange={(e) => onChange((prev) => ({ ...prev, source: e.currentTarget.value }))}
          classNames={{ input: "glassy-input" }}
        />
        <Switch
          label="Is NPC?"
          checked={!!monster.isNpc}
          onChange={(e) =>
            onChange((prev) => ({ ...prev, isNpc: e.currentTarget.checked }))
          }
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={onSubmit}>
            {isEditing ? "Save changes" : "Create"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
