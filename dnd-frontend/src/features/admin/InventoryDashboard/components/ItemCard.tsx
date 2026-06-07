import { useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowsExchange,
  IconCoin,
  IconEdit,
  IconSearch,
  IconSwords,
  IconTrash,
  IconWeight,
} from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAuthStore } from "@store/auth/authStore";
import { getEquipmentById } from "@services/equipmentService";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { ItemModal } from "./ItemModal";
import { MoveItemModal } from "./MoveItemModal";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";
import styles from "@styles/InventoryDashboard.module.css";

interface ItemCardProps {
  itemId: string;
}

export function ItemCard({ itemId }: ItemCardProps) {
  const { selected, deleteItem, updateItem } = useAdminInventoryStore();
  const token = useAuthStore.getState().token!;

  const [editOpen, setEditOpen] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [equipment, setEquipment] = useState<Equipment | null>(null);

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
  const [inputVal, setInputVal] = useState<number>(quantity);

  useEffect(() => {
    setInputVal(quantity);
  }, [quantity]);

  const handleQuantityChange = async (value: number | string) => {
    const nextVal = typeof value === "number" ? value : parseInt(value, 10);
    if (isNaN(nextVal) || nextVal < 1) return;
    setInputVal(nextVal);

    if (item && selected?.id) {
      await updateItem({ ...item, quantity: nextVal });
    }
  };

  const executeDelete = () => {
    if (item) {
      void deleteItem(item);
      setDeleteWarningOpen(false);
    }
  };

  if (!equipment) {
    return (
      <div className={styles.itemCardSkeleton}>
        <Text c="red.4" size="xs">
          Item not found globally.
        </Text>
      </div>
    );
  }

  return (
    <>
      <div className={styles.itemCard}>
        {/* Header: name + action icons */}
        <div className={styles.itemCardHeader}>
          <span className={styles.itemCardName}>
            {equipment.name ?? "Unnamed"}
          </span>

          <div className={styles.itemCardActions}>
            <Tooltip label="Inspect" withArrow>
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setInspectOpen(true)}>
                <IconSearch size={12} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Move" withArrow>
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setMoveModal(true)}>
                <IconArrowsExchange size={12} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit" withArrow>
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setEditOpen(true)}>
                <IconEdit size={12} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Remove" withArrow>
              <ActionIcon size="xs" variant="subtle" color="red" onClick={() => setDeleteWarningOpen(true)}>
                <IconTrash size={12} />
              </ActionIcon>
            </Tooltip>
          </div>
        </div>

        {/* Stat badges */}
        <div className={styles.itemCardBadges}>
          {equipment.damage && (
            <Badge color="red" variant="light" size="xs" radius="sm" leftSection={<IconSwords size={10} />}>
              {equipment.damage.damageDice}
            </Badge>
          )}
          {equipment.cost && (
            <Badge color="yellow" variant="light" size="xs" radius="sm" leftSection={<IconCoin size={10} />}>
              {equipment.cost.quantity} {equipment.cost.unit}
            </Badge>
          )}
          {equipment.weight && (
            <Badge color="gray" variant="light" size="xs" radius="sm" leftSection={<IconWeight size={10} />}>
              {equipment.weight} lb
            </Badge>
          )}
        </div>

        {/* Description snippet */}
        {equipment.description && (
          <p className={styles.itemCardDesc}>
            {equipment.description.join(" ")}
          </p>
        )}

        {/* Footer: quantity control */}
        <div className={styles.itemCardFooter}>
          <span className={styles.itemCardQtyLabel}>Qty</span>
          <NumberInput
            size="xs"
            value={inputVal}
            onChange={handleQuantityChange}
            min={1}
            max={999}
            style={{ width: 64 }}
            styles={{
              input: {
                backgroundColor: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
                color: "white",
                fontSize: "11px",
                height: "24px",
                minHeight: "24px",
                borderRadius: "6px",
              },
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <ItemModal opened={editOpen} onClose={() => setEditOpen(false)} equipmentId={itemId} editMode />
      <MoveItemModal opened={moveModal} onClose={() => setMoveModal(false)} itemId={itemId} />
      <EquipmentModal opened={inspectOpen} onClose={() => setInspectOpen(false)} equipmentId={itemId} />

      {/* Delete confirmation */}
      <Modal
        opened={deleteWarningOpen}
        onClose={() => setDeleteWarningOpen(false)}
        title="Remove Item"
        centered
        radius="md"
        styles={{
          content: { background: "rgba(40,12,18,0.96)", border: "1px solid rgba(255,100,100,0.2)", backdropFilter: "blur(20px)" },
          title: { color: "#fca5a5", fontWeight: 700 },
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="gray.2">
            Remove <Text span fw={700} c="red.2">"{equipment.name}"</Text> from this inventory?
          </Text>
          <Text size="xs" c="red.4">
            This action permanently deletes the item stack from the inventory.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setDeleteWarningOpen(false)}>
              Cancel
            </Button>
            <Button color="red" leftSection={<IconTrash size={14} />} onClick={executeDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
