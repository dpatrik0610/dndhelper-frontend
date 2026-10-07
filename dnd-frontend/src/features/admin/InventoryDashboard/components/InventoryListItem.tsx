import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy, IconEdit, IconTrash } from "@tabler/icons-react";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import styles from "@styles/InventoryDashboard.module.css";

interface InventoryListItemProps {
  inventory: Inventory;
  isSelected: boolean;
  matchedItems?: InventoryItem[];
  onSelect: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function InventoryListItem({
  inventory,
  isSelected,
  matchedItems,
  onSelect,
  onDuplicate,
  onRename,
  onDelete,
}: InventoryListItemProps) {
  const isUnowned = !inventory.characterIds || inventory.characterIds.length === 0;
  const itemCount = inventory.items?.length ?? 0;
  const initials = (inventory.name || "UN")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ""}`}
      onClick={onSelect}
    >
      <div className={styles.listItemAvatar}>{initials}</div>

      <div className={styles.listItemInfo}>
        <span className={styles.listItemName}>
          {inventory.name || "Unnamed"}
        </span>
        <span className={styles.listItemMeta}>
          <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{isUnowned ? "Shared" : `${inventory.characterIds?.length} owner${(inventory.characterIds?.length ?? 0) !== 1 ? "s" : ""}`}</span>
        </span>
        {matchedItems && matchedItems.length > 0 && (
          <span className={styles.listItemMatches}>
            {matchedItems.map((item) => `${item.equipmentName ?? "Unnamed"} ×${item.quantity ?? 1}`).join(", ")}
          </span>
        )}
      </div>

      <div className={styles.listItemActions}>
        <Tooltip label="Duplicate" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          >
            <IconCopy size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Rename" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            onClick={(e) => { e.stopPropagation(); onRename(); }}
          >
            <IconEdit size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete" withArrow>
          <ActionIcon
            variant="subtle"
            color="red"
            size="xs"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}
