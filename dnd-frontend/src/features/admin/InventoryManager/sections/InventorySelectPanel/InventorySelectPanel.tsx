import { Box, Loader, Group, Text, Paper, Stack, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { InventoryNavbar } from "./InventoryNavbar";
import { BaseModal } from "@components/BaseModal";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

export function InventorySelectPanel() {
  const { loading, loadByCharacter, create } = useAdminInventoryStore();
  const { selectedId: selectedCharId } = useAdminCharacterStore();
  const [ createModal, setCreateModal ] = useState(false);
  const [ newName, setNewName ] = useState("");

  useEffect(() => {
    if (selectedCharId) loadByCharacter(selectedCharId);
  }, [selectedCharId, loadByCharacter]);

  if (!selectedCharId)
    return (
      <Paper
        mt="md"
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "linear-gradient(145deg, rgba(30,0,50,0.5), rgba(10,0,20,0.4))",
          backdropFilter: "blur(10px)",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Text c="dimmed" size="sm">
          Select a character first to view inventories.
        </Text>
      </Paper>
    );

  if (loading)
    return (
      <Group justify="center" mt="xl">
        <Loader color="grape" size="lg" />
      </Group>
    );

  return (
    <Box w="100%">
      <InventoryNavbar onCreate={() => setCreateModal(true)} />

      <BaseModal
        opened={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Inventory"
        onSave={async () => {
          if (!selectedCharId || !newName.trim()) {
            showNotification({
              title: "Error",
              message: "Please enter a name.",
              color: SectionColor.Red,
            });
            return;
          }
          await create([selectedCharId], newName.trim());
          setCreateModal(false);
          setNewName("");
        }}
        saveLabel="Create"
      >
        <Stack>
          <TextInput
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            label="Inventory Name"
            placeholder="Enter name..."
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
        </Stack>
      </BaseModal>
    </Box>
  );
}

