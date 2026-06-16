import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCoin, IconEdit, IconTrash } from "@tabler/icons-react";
import type { Shop } from "@appTypes/Shop/Shop";
import styles from "@styles/InventoryDashboard.module.css";
import { SectionColor } from "@appTypes/SectionColor";

interface ShopListItemProps {
  shop: Shop;
  isSelected: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ShopListItem({
  shop,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: ShopListItemProps) {
  const isOpened = shop.isOpened;
  const initials = (shop.name || "SH")
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
          {shop.name || "Unnamed Shop"}
        </span>
        <span className={styles.listItemMeta}>
          <span>{isOpened ? "Open" : "Closed"}</span>
            <IconCoin size={14} color={SectionColor.Orange} />
          <span>x{shop.priceMultiplier.toFixed(2)}</span>
        </span>
      </div>

      <div className={styles.listItemActions}>
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