import { ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { Shop } from "@appTypes/Shop/Shop";
import styles from "@styles/InventoryDashboard.module.css";
import classes from "@features/admin/ShopManager/ShopManager.module.css";

interface ShopListItemProps {
  shop: Shop;
  pending: number;
  isSelected: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function ShopListItem({ shop, pending, isSelected, onSelect, onRename, onDelete }: ShopListItemProps) {
  const initials = (shop.name || "SH")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ""}`} onClick={onSelect}>
      <div className={styles.listItemAvatar}>{initials}</div>

      <div className={styles.listItemInfo}>
        <span className={styles.listItemName}>{shop.name || "Unnamed Shop"}</span>
        <span className={styles.listItemMeta}>
          <span>×{shop.priceMultiplier.toFixed(2)}</span>
          {pending > 0 && (
            <>
              <span>·</span>
              <span className={classes.pendingDot}>{pending} pending</span>
            </>
          )}
        </span>
      </div>

      <div className={styles.listItemActions}>
        <Tooltip label="Rename" withArrow>
          <ActionIcon variant="subtle" color="gray" size="xs" aria-label="Rename" onClick={(e) => { e.stopPropagation(); onRename(); }}>
            <IconEdit size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete" withArrow>
          <ActionIcon variant="subtle" color="red" size="xs" aria-label="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <IconTrash size={12} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}
