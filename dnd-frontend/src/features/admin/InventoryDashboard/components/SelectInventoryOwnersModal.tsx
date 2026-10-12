import {
  Stack,
  Group,
  Checkbox,
  Button,
  Text,
  ScrollArea,
} from "@mantine/core";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useState, useEffect } from "react";
import { setInventoryCharacters } from "@services/inventoryService";

import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";

export function SelectInventoryOwnersModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { characters } = useAdminCharacterStore();
  const { selected, applyInventoryUpdate } = useAdminInventoryStore();

  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);

  useEffect(() => {
    if (opened && selected)
      setSelectedOwners(selected.characterIds ?? []);
  }, [opened, selected]);

  const toggleOwner = (id: string) =>
    setSelectedOwners((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSave = async () => {
    if (!selected?.id) return;

    try {
      applyInventoryUpdate(await setInventoryCharacters(selected.id, selectedOwners));

      showNotification({
        title: "Owners updated",
        message: "Inventory ownership updated successfully.",
        color: SectionColor.Green,
      });
      onClose();
    } catch (err) {
      showNotification({
        title: "Error updating owners",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  return (
    <AdminGlassModal
      opened={opened}
      onClose={onClose}
      title="Manage Inventory Owners"
      size="lg"
    >
      <Stack gap="md">
        <ScrollArea h={300}>
          <Stack gap="xs">
            {characters.map((c) => (
              <Group key={c.id} justify="space-between">
                <Text c="white">{c.name}</Text>
                <Checkbox
                  checked={selectedOwners.includes(c.id!)}
                  onChange={() => toggleOwner(c.id!)}
                />
              </Group>
            ))}
          </Stack>
        </ScrollArea>

        <Group justify="flex-end" mt="md">
          <Button variant="light" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: "neon", to: "electric" }}
            onClick={handleSave}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
}
