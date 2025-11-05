import {
  Box,
  Group,
  Text,
  Title,
  Loader,
  ScrollArea,
  Table,
  NumberInput,
  TextInput,
  ActionIcon,
  Tooltip,
  Button,
  Modal,
  Stack,
} from "@mantine/core";
import {
  IconTrash,
  IconPlus,
  IconCheck,
  IconSword,
} from "@tabler/icons-react";
import { useState } from "react";
import { useAdminInventoryStore } from "../../../../store/admin/useAdminInventoryStore";
import type { Equipment } from "../../../../types/Equipment/Equipment";
import { showNotification } from "../../../../components/Notification/Notification";
import { SectionColor } from "../../../../types/SectionColor";
import type { InventoryItem } from "../../../../types/Inventory/InventoryItem";

export function InventoryItemsPanel() {
  const {
    selected,
    loading,
    refreshSelected,
    addItem,
    updateItem,
    deleteItem,
  } = useAdminInventoryStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Equipment>({
    index: "",
    name: "",
    description: [],
    cost: { quantity: 0, unit: "gp" },
    damage: undefined,
    range: undefined,
    weight: 0,
    isCustom: true,
    isDeleted: false,
  });

  if (!selected)
    return (
      <Text c="dimmed" ta="center" mt="lg">
        Select an inventory to view its contents.
      </Text>
    );

  if (loading)
    return (
      <Group justify="center" mt="xl">
        <Loader color="grape" size="lg" />
      </Group>
    );

  const items : InventoryItem [] = selected.items ?? [];

  return (
    <Box>
      {/* --- HEADER --- */}
      <Group justify="space-between" mb="md">
        <Title order={3} c="grape.3">
          Inventory Items
        </Title>

        <Group gap="xs">
          <Tooltip label="Refresh" withArrow>
            <ActionIcon color="grape" variant="light" onClick={refreshSelected}>
              <IconCheck size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add new item" withArrow>
            <ActionIcon
              color="grape"
              variant="gradient"
              gradient={{ from: "grape", to: "violet" }}
              onClick={() => setModalOpen(true)}
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* --- ITEM TABLE --- */}
      {!items.length ? (
        <Text c="dimmed" ta="center" mt="sm">
          No items in this inventory.
        </Text>
      ) : (
        <ScrollArea h={400} type="hover">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th w={100}>Quantity</Table.Th>
                <Table.Th>Note</Table.Th>
                <Table.Th w={60}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.equipmentId}>
                  <Table.Td>{item.equipmentName}</Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={item.quantity ?? 1}
                      onChange={(v) =>
                        updateItem({ ...item, quantity: Number(v) })
                      }
                      min={0}
                      maw={80}
                    />
                  </Table.Td>
                  <Table.Td>
                    <TextInput
                      value={item.note ?? ""}
                      onChange={(e) =>
                        updateItem({
                          ...item,
                          note: e.currentTarget.value,
                        })
                      }
                    />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => deleteItem(item)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      {/* --- ADD NEW ITEM MODAL --- */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Equipment"
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Longsword"
            value={newEquipment.name}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, name: e.currentTarget.value })
            }
          />
          <TextInput
            label="Index"
            placeholder="longsword"
            value={newEquipment.index}
            onChange={(e) =>
              setNewEquipment({ ...newEquipment, index: e.currentTarget.value })
            }
          />
          <Group grow>
            <NumberInput
              label="Cost"
              value={newEquipment.cost?.quantity ?? 0}
              min={0}
              onChange={(v) =>
                setNewEquipment({
                  ...newEquipment,
                  cost: {
                    ...newEquipment.cost,
                    quantity: Number(v),
                    unit: newEquipment.cost?.unit ?? "gp",
                  },
                })
              }
            />
            <TextInput
              label="Unit"
              value={newEquipment.cost?.unit ?? "gp"}
              onChange={(e) =>
                setNewEquipment({
                  ...newEquipment,
                  cost: {
                    ...newEquipment.cost,
                    unit: e.currentTarget.value,
                    quantity: newEquipment.cost?.quantity ?? 0,
                  },
                })
              }
            />
          </Group>
          <NumberInput
            label="Weight (lb)"
            value={newEquipment.weight ?? 0}
            min={0}
            onChange={(v) =>
              setNewEquipment({ ...newEquipment, weight: Number(v) })
            }
          />
          <TextInput
            label="Damage Dice"
            placeholder="1d8"
            value={newEquipment.damage?.damageDice ?? ""}
            onChange={(e) =>
              setNewEquipment({
                ...newEquipment,
                damage: e.currentTarget.value
                  ? {
                      damageDice: e.currentTarget.value,
                      damageType: newEquipment.damage?.damageType ?? {
                        name: "Physical",
                      },
                    }
                  : undefined,
              })
            }
          />
          <TextInput
            label="Damage Type"
            placeholder="Slashing"
            value={newEquipment.damage?.damageType?.name ?? ""}
            onChange={(e) =>
              setNewEquipment({
                ...newEquipment,
                damage: {
                  damageDice: newEquipment.damage?.damageDice || "",
                  damageType: { name: e.currentTarget.value },
                },
              })
            }
          />
          <Group justify="flex-end" mt="sm">
            <Button
              color="gray"
              variant="light"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="grape"
              leftSection={<IconSword size={16} />}
              onClick={async () => {
                if (!newEquipment.name) {
                  showNotification({
                    title: "Error",
                    message: "Equipment must have a name.",
                    color: SectionColor.Red,
                  });
                  return;
                }
                await addItem(newEquipment);
                showNotification({
                  title: "Item created",
                  message: `${newEquipment.name} added successfully.`,
                  color: SectionColor.Green,
                });
                setModalOpen(false);
                setNewEquipment({
                  index: "",
                  name: "",
                  description: [],
                  cost: { quantity: 0, unit: "gp" },
                  isCustom: true,
                  isDeleted: false,
                });
              }}
            >
              Add Item
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
