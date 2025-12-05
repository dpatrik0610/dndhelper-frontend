import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { EQUIPMENT_TIERS, type Equipment } from "../../types/Equipment/Equipment";
import { defaultEquipment } from "../../pages/Admin/ItemManager/defaultEquipment";
import { TagsInput } from "../../pages/Admin/InventoryManager/sections/InventoryItems/TagsInput";
import "../../styles/glassyInput.css";

interface EquipmentFormModalProps {
  opened: boolean;
  initial?: Equipment | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (equipment: Equipment) => Promise<void> | void;
  title?: string;
  submitLabel?: string;
  cancelLabel?: string;
}

export function EquipmentFormModal({
  opened,
  initial,
  saving = false,
  onClose,
  onSubmit,
  title,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: EquipmentFormModalProps) {
  const [draft, setDraft] = useState<Equipment>(defaultEquipment);

  // Reset draft when opening or when initial changes
  useEffect(() => {
    if (!opened) return;
    setDraft({
      ...defaultEquipment,
      ...(initial ?? {}),
      description: initial?.description ?? [],
      dmDescription: initial?.dmDescription ?? [],
      tags: initial?.tags ?? [],
    });
  }, [initial, opened]);

  const handleChange = <K extends keyof Equipment>(key: K, value: Equipment[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleDamageDiceChange = (value: string) => {
    setDraft((prev) => {
      const damageTypeName = prev.damage?.damageType?.name ?? "";
      return {
        ...prev,
        damage: value
          ? { damageDice: value, damageType: { name: damageTypeName } }
          : undefined,
      };
    });
  };

  const handleDamageTypeChange = (value: string) => {
    setDraft((prev) => {
      const damageDice = prev.damage?.damageDice ?? "";
      if (value || damageDice) {
        return {
          ...prev,
          damage: {
            damageDice,
            damageType: { name: value },
          },
        };
      }
      return { ...prev, damage: undefined };
    });
  };

  const handleSubmit = async () => {
    if (!draft.name.trim() || !draft.index.trim()) return;
    await onSubmit(draft);
  };

  const glass = { input: "glassy-input", label: "glassy-label" };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title ?? ""}
      centered
      size="lg"
      overlayProps={{ blur: 6, color: "rgba(0,0,0,0.45)" }}
      withCloseButton
      closeButtonProps={{
        radius: "xl",
      }}
      styles={{
        content: {
          background: "rgba(20, 0, 40, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(14px)",
        },
        header: { borderBottom: "none", background: "transparent" },
        title: { color: "white" },
      }}
    >
      <Stack gap="sm">
        <Group grow>
          <TextInput
            classNames={glass}
            label="Name"
            value={draft.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            required
          />
          <TextInput
            classNames={glass}
            label="Index"
            value={draft.index}
            onChange={(e) => handleChange("index", e.currentTarget.value)}
            required
          />
        </Group>

        <Textarea
          classNames={glass}
          label="Description"
          autosize
          minRows={2}
          value={draft.description?.join("\n") ?? ""}
          onChange={(e) => handleChange("description", e.currentTarget.value.split("\n"))}
        />

        <Textarea
          classNames={glass}
          label="DM Description"
          description="Private notes"
          autosize
          minRows={2}
          value={draft.dmDescription?.join("\n") ?? ""}
          onChange={(e) => handleChange("dmDescription", e.currentTarget.value.split("\n"))}
        />

        <Group grow>
          <NumberInput
            classNames={glass}
            label="Cost"
            min={0}
            value={draft.cost?.quantity ?? 0}
            onChange={(v) => handleChange("cost", { quantity: Number(v ?? 0), unit: draft.cost?.unit ?? "gp" })}
          />
          <TextInput
            classNames={glass}
            label="Unit"
            value={draft.cost?.unit ?? "gp"}
            onChange={(e) => handleChange("cost", { quantity: draft.cost?.quantity ?? 0, unit: e.currentTarget.value })}
          />
          <NumberInput
            classNames={glass}
            label="Weight (lb)"
            min={0}
            value={draft.weight ?? 0}
            onChange={(v) => handleChange("weight", Number(v ?? 0))}
          />
        </Group>

        <Group grow>
          <TextInput
            classNames={glass}
            label="Damage Dice"
            placeholder="1d8"
            value={draft.damage?.damageDice ?? ""}
            onChange={(e) => handleDamageDiceChange(e.currentTarget.value ?? "")}
          />
          <TextInput
            classNames={glass}
            label="Damage Type"
            placeholder="Slashing"
            value={draft.damage?.damageType?.name ?? ""}
            onChange={(e) => handleDamageTypeChange(e.currentTarget.value ?? "")}
          />
        </Group>

        <Group grow>
          <NumberInput
            classNames={glass}
            label="Range (normal)"
            min={0}
            value={draft.range?.normal ?? 0}
            onChange={(v) => handleChange("range", { normal: Number(v ?? 0), long: draft.range?.long ?? 0 })}
          />
          <NumberInput
            classNames={glass}
            label="Range (long)"
            min={0}
            value={draft.range?.long ?? 0}
            onChange={(v) => handleChange("range", { normal: draft.range?.normal ?? 0, long: Number(v ?? 0) })}
          />
        </Group>

        <Select
          classNames={glass}
          label="Tier"
          data={EQUIPMENT_TIERS.map((t) => ({ value: t, label: t }))}
          placeholder="Select tier"
          searchable
          clearable
          value={draft.tier ?? null}
          onChange={(v) => handleChange("tier", v ?? undefined)}
        />

        <TagsInput equipment={draft} handleChange={handleChange} />

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button leftSection={<IconDeviceFloppy size={14} />} onClick={() => void handleSubmit()} loading={saving}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
