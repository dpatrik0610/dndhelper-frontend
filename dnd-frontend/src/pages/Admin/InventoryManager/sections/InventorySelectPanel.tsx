import {
  Box, Group, Text, Title, Loader, ActionIcon, Tooltip,
  ScrollArea, SimpleGrid, Paper, Stack, Transition, TextInput
} from "@mantine/core";
import {
  IconArchive, IconPlus, IconTrash, IconReload, IconEdit, IconArrowBackUp
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAdminInventoryStore } from "../../../../store/admin/useAdminInventoryStore";
import { useAdminCharacterStore } from "../../../../store/admin/useAdminCharacterStore";
import { showNotification } from "../../../../components/Notification/Notification";
import { SectionColor } from "../../../../types/SectionColor";
import { ExpandableSection } from "../../../../components/ExpendableSection";
import { BaseModal } from "../../../../components/BaseModal";
import type { Inventory } from "../../../../types/Inventory/Inventory";
import "../../../../styles/glassyInput.css"

export function InventorySelectPanel() {
  const { inventories, selected, loading, loadByCharacter, select, create, rename, remove } = useAdminInventoryStore();
  const { selectedId: selectedCharId } = useAdminCharacterStore();

  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => { if (selectedCharId) loadByCharacter(selectedCharId); }, [selectedCharId, loadByCharacter]);

  if (!selectedCharId) return <Text c="dimmed" ta="center" mt="lg">Select a character first to view inventories.</Text>;
  if (loading) return <Group justify="center" mt="xl"><Loader color="grape" size="lg" /></Group>;

  const isSelected = (inv: Inventory) => selected?.id === inv.id;

  return (
    <Box>
      {selected ? (
        <Transition mounted transition="fade-up" duration={250} timingFunction="ease">
          {(styles) => (
            <Box style={{ ...styles, marginBottom: "1rem" }}>
              <Group justify="space-between">
                <Group>
                  <IconArchive size={22} color="var(--mantine-color-grape-4)" />
                  <Title order={3} c="grape.3">{selected?.name ?? "Unnamed Inventory"}</Title>
                </Group>
                <Tooltip label="Change inventory" color="dark" withArrow>
                  <ActionIcon variant="gradient" gradient={{ from: "grape", to: "violet" }} onClick={() => select(null)}>
                    <IconArrowBackUp size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
          )}
        </Transition>
      ) : (
        <ExpandableSection title="Inventories" color={SectionColor.Grape} icon={<IconArchive size={20} />} defaultOpen transparent>
          {!inventories.length ? (
            <Text c="dimmed" ta="center" mt="sm">No inventories found for this character.</Text>
          ) : (
            <ScrollArea h={260} type="hover">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" verticalSpacing="sm">
                {inventories.map((inv) => (
                  <Paper
                    key={inv.id}
                    p="sm"
                    radius="md"
                    withBorder
                    onClick={() => select(inv.id!)}
                    style={{
                      cursor: "pointer",
                      background: isSelected(inv)
                        ? "linear-gradient(135deg, rgba(155, 50, 255, 0.25), rgba(255, 100, 255, 0.15))"
                        : "rgba(255,255,255,0.02)",
                      border: isSelected(inv)
                        ? "1px solid var(--mantine-color-grape-5)"
                        : "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconArchive
                          size={20}
                          color={isSelected(inv) ? "var(--mantine-color-grape-4)" : "var(--mantine-color-gray-5)"}
                        />
                        <Text fw={600} size="sm" c="gray.1">{inv.name || "Unnamed"}</Text>
                      </Group>
                      <Group gap="xs">
                        <Tooltip label="Rename"><ActionIcon variant="subtle" color="grape"
                          onClick={(e) => { e.stopPropagation(); const newName = prompt("Enter new name:", inv.name ?? ""); if (newName) rename(inv.id!, newName); }}>
                          <IconEdit size={16} />
                        </ActionIcon></Tooltip>
                        <Tooltip label="Delete"><ActionIcon variant="subtle" color="red"
                          onClick={(e) => { e.stopPropagation(); if (confirm("Delete this inventory permanently?")) remove(inv.id!); }}>
                          <IconTrash size={16} />
                        </ActionIcon></Tooltip>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </SimpleGrid>
            </ScrollArea>
          )}

          <Group justify="flex-end" mt="md">
            <Tooltip label="Create new inventory"><ActionIcon variant="gradient" gradient={{ from: "grape", to: "violet" }} onClick={() => setCreateModal(true)}><IconPlus size={18} /></ActionIcon></Tooltip>
            <Tooltip label="Reload inventories"><ActionIcon variant="light" color="grape" onClick={() => selectedCharId && loadByCharacter(selectedCharId)}><IconReload size={18} /></ActionIcon></Tooltip>
          </Group>
        </ExpandableSection>
      )}

      <BaseModal
        opened={createModal}
        onClose={() => setCreateModal(false)}
        title="Create New Inventory"
        onSave={async () => {
          if (!selectedCharId || !newName) {
            showNotification({ title: "Error", message: "Name or character missing.", color: SectionColor.Red });
            return;
          }
          await create(selectedCharId, newName);
          setCreateModal(false);
          setNewName("");
        }}
        saveLabel="Create"
      >
        <Stack>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Inventory Name" placeholder="Enter name..." value={newName} onChange={(e) => setNewName(e.currentTarget.value)} styles={{}}/>
        </Stack>
      </BaseModal>
    </Box>
  );
}
