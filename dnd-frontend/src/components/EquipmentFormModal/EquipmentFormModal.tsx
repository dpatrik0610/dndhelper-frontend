import { useEffect, useState } from "react";
import { Button, Group, ScrollArea, Stack } from "@mantine/core";

import { IconDeviceFloppy } from "@tabler/icons-react";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { defaultEquipment } from "@features/admin/ItemManager/defaultEquipment";

import { EquipmentBasicInfo } from "./EquipmentBasicInfo";
import { EquipmentCombat } from "./EquipmentCombat";
import { EquipmentDescription } from "./EquipmentDescription";
import { useIsMobile } from "@hooks/useIsMobile";

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
  const isMobile = useIsMobile();
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

  const handleSubmit = async () => {
    if (!draft.name.trim() || !draft.index.trim()) return;
    await onSubmit(draft);
  };

  return (
    <AdminGlassModal
      opened={opened}
      onClose={onClose}
      title={title ?? (initial ? "Edit Equipment" : "Add Equipment")}
      size="xl"
      fullScreen={isMobile}
      loading={saving}
      padding={0} // We will handle padding inside
    >
      <ScrollArea h={isMobile ? "calc(100dvh - 128px)" : "70vh"} offsetScrollbars style={{ padding: "0 16px 16px 16px" }}>
        <Stack gap="lg" mt="sm">
          <EquipmentBasicInfo draft={draft} handleChange={handleChange} />
          <EquipmentCombat draft={draft} handleChange={handleChange} />
          <EquipmentDescription draft={draft} handleChange={handleChange} />
        </Stack>
      </ScrollArea>

      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={() => void handleSubmit()}
            loading={saving}
            disabled={!draft.name.trim() || !draft.index.trim()}
            variant="gradient"
            gradient={{ from: "violet", to: "cyan", deg: 90 }}
          >
            {submitLabel}
          </Button>
        </Group>
      </div>
    </AdminGlassModal>
  );
}
