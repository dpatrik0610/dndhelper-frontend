import {
  Card,
  Group,
  Text,
  Badge,
  Tooltip,
  ActionIcon,
  Stack,
  Divider,
  Transition,
} from "@mantine/core";
import {
  IconTrash,
  IconArrowsExchange,
  IconSwords,
  IconCoin,
  IconWeight,
  IconEdit,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import { ItemModal } from "./ItemModal";
import { getEquipmentById } from "../../../../../services/equipmentService";
import { useAuthStore } from "../../../../../store/useAuthStore";
import type { Equipment } from "../../../../../types/Equipment/Equipment";
import { MoveItemModal } from "./MoveItemModal";
import "../../../../../styles/itemCard.css";

interface ItemCardProps {
  itemId: string;
}

export function ItemCard({ itemId }: ItemCardProps) {
  const { selected, deleteItem, incrementItemQuantity, decrementItemQuantity } = useAdminInventoryStore();
  const [editOpen, setEditOpen] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const token = useAuthStore.getState().token!;

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await getEquipmentById(itemId, token);
        setEquipment(data ?? null);
      } catch {
        setEquipment(null);
      }
    };
    fetchEquipment();
  }, [itemId, token]);

  const item = selected?.items?.find((x) => x.equipmentId === itemId);
  const quantity = item?.quantity ?? 1;

  const handleDelete = () => item && deleteItem(item);
  const handleMoveItem = () => item && setMoveModal(true);

  if (!equipment)
    return (
      <Card
        radius="md"
        withBorder
        p="md"
        h="100%"
        style={{
          background: "rgba(40,0,60,0.4)",
          border: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          flex: 1,
        }}
      >
        <Text c="red.5" size="sm">
          Equipment not found or removed.
        </Text>
      </Card>
    );

  return (
    <>
      <Transition mounted transition="pop" duration={180} timingFunction="ease-out">
        {(styles) => (
          <Card
            radius="md"
            withBorder
            p="md"
            className="item-card"
            style={{
              ...styles,
              flex: "1 1 0",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background:
                "linear-gradient(135deg, rgba(60,0,90,0.45), rgba(20,0,40,0.35))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Stack gap="xs" style={{ flexGrow: 1 }}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Text fw={600} size="lg" c="grape.2" lineClamp={1}>
                  {equipment.name ?? "Unnamed Equipment"}
                </Text>

                <Group gap={4} wrap="nowrap">
                  <Tooltip label="Move item">
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="grape"
                      onClick={handleMoveItem}
                    >
                      <IconArrowsExchange size={14} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Edit item">
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="blue"
                      onClick={() => setEditOpen(true)}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Delete item">
                    <ActionIcon
                      size="sm"
                      variant="light"
                      color="red"
                      onClick={handleDelete}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              <Group gap="xs" wrap="wrap">
                {equipment.damage && (
                  <Badge color="red" variant="light" leftSection={<IconSwords size={12} />}>
                    {equipment.damage.damageDice} {equipment.damage.damageType.name}
                  </Badge>
                )}
                {equipment.cost && (
                  <Badge color="yellow" variant="light" leftSection={<IconCoin size={12} />}>
                    {equipment.cost.quantity} {equipment.cost.unit}
                  </Badge>
                )}
                {equipment.weight && (
                  <Badge color="gray" variant="light" leftSection={<IconWeight size={12} />}>
                    {equipment.weight} lb
                  </Badge>
                )}
              </Group>

              <Divider color="rgba(255,255,255,0.1)" />

              <Stack gap={4} style={{ flexGrow: 1 }}>
                {equipment.description && (
                  <Text size="xs" c="grape.2" fs="italic" lineClamp={3}>
                    {equipment.description.join(" ")}
                  </Text>
                )}
              </Stack>
              
              <Group justify="space-between" align="center" mt="auto">
                <Text size="xs" c="dimmed">
                  Quantity: {quantity}
                </Text>

                <Group gap={4}>
                  <ActionIcon size="xs" variant="light" color="red" onClick={() => decrementItemQuantity(itemId)}>
                    –
                  </ActionIcon>
                  <ActionIcon size="xs" variant="light" color="green" onClick={() => incrementItemQuantity(itemId)}>
                    +
                  </ActionIcon>
                </Group>
              </Group>

            </Stack>
          </Card>
        )}
      </Transition>

      <ItemModal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        equipmentId={itemId}
        editMode
      />

      <MoveItemModal
        opened={moveModal}
        onClose={() => setMoveModal(false)}
        itemId={itemId}
      />
    </>
  );
}
