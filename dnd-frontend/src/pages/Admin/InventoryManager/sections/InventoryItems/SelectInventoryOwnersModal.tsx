import {
  Modal,
  Stack,
  Group,
  Checkbox,
  Button,
  Text,
  ScrollArea,
} from "@mantine/core";
import { useAdminCharacterStore } from "../../../../../store/admin/useAdminCharacterStore";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import { useState, useEffect } from "react";
import { updateInventory } from "../../../../../services/inventoryService";
import { useAuthStore } from "../../../../../store/useAuthStore";
import { showNotification } from "../../../../../components/Notification/Notification";
import { SectionColor } from "../../../../../types/SectionColor";

export function SelectInventoryOwnersModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { characters, selectedId } = useAdminCharacterStore();
  const { selected, refreshInventories } = useAdminInventoryStore();
  const token = useAuthStore.getState().token!;
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
        await updateInventory(
            selected.id,
            { ...selected, characterIds: selectedOwners },
            token
        );
        
        await refreshInventories(selectedId!);
        
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
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Inventory Owners"
      centered
      size="lg"
      radius="md"
      styles={{
        header: {marginBottom: "1rem", background:"transparent"},
        content: {
          background: "linear-gradient(135deg, rgba(10,20,40,0.85), rgba(20,10,40,0.6))",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(8px)",
        },
        title: { color: "#a8e4ff", fontWeight: 600 },
      }}
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
    </Modal>
  );
}
