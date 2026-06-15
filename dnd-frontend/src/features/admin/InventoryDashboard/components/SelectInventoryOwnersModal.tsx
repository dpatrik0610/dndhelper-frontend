import { getAuthTokenSafe } from "@store/auth/authUtils";
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
import {
  updateInventory,
  assignInventoryToCharacter,
} from "@services/inventoryService";

import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import {
  ensureInventoryLinkedToCharacter,
  removeInventoryFromCharacter,
} from "@utils/inventorySync";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";

export function SelectInventoryOwnersModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { characters, selectedId } = useAdminCharacterStore();
  const { selected, refreshInventories } = useAdminInventoryStore();
  const token = getAuthTokenSafe()!;
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
    const currentOwners = selected.characterIds ?? [];
    const addedOwners = selectedOwners.filter((id) => !currentOwners.includes(id));
    const removedOwners = currentOwners.filter((id) => !selectedOwners.includes(id));
    const targetRefreshCharacter = selectedId || selectedOwners[0] || currentOwners[0];
    const invId = selected.id;

    try {
      if (addedOwners.length > 0) {
        await Promise.all(
          addedOwners.map(async (ownerId) => {
            await assignInventoryToCharacter(invId, ownerId, token);
            await ensureInventoryLinkedToCharacter(ownerId, invId, token);
          })
        );
      }

      if (removedOwners.length > 0) {
        await Promise.all(
          removedOwners.map(async (ownerId) => {
            await removeInventoryFromCharacter(ownerId, invId, token);
          })
        );
      }

      await updateInventory(
        selected.id,
        { ...selected, characterIds: selectedOwners },
        token
      );

      if (targetRefreshCharacter) {
        await refreshInventories(targetRefreshCharacter);
      }

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
            gradient={{ from: "teal", to: "cyan" }}
            onClick={handleSave}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
}
