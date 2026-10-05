import type { CSSProperties } from "react";
import { Group, Tooltip } from "@mantine/core";
import { IconArrowsRightLeft, IconTrash } from "@tabler/icons-react";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import type { EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import { SectionColor } from "@appTypes/SectionColor";
import { tierTheme } from "./styles/equipmentTheme";
import classes from "./InventoryItemCard.module.css";

interface InventoryItemCardProps {
  item: InventoryItem;
  details?: EquipmentUserResponse;
  /** "row" is the dense one-line list entry, "card" the grid tile with tags. */
  layout: "row" | "card";
  onOpen: (equipmentId: string) => void;
  onRemove: (item: InventoryItem) => void;
  onMove: (equipmentId: string) => void;
}

export function InventoryItemCard({ item, details, layout, onOpen, onRemove, onMove }: InventoryItemCardProps) {
  const name = item.equipmentName || details?.name || "Unnamed Item";
  const quantity = item.quantity ?? 1;
  // "dark" (Common) is unreadable as text on the dark cards.
  const accent = tierTheme(details?.tier).accent;
  const accentColor = accent === SectionColor.Dark ? SectionColor.Gray : accent;

  const stats = [
    details?.weight ? `${details.weight} lb${quantity > 1 ? " ea" : ""}` : null,
    details?.damage ? `${details.damage.damageDice} ${details.damage.damageType.name}` : null,
    details?.range?.normal ? `${details.range.normal}${details.range.long ? `/${details.range.long}` : ""} ft` : null,
  ].filter(Boolean);
  const hasMeta = !!details?.tier || stats.length > 0;
  const tags = layout === "card" ? item.tags ?? [] : [];

  return (
    <div
      className={layout === "row" ? `${classes.item} ${classes.row}` : classes.item}
      style={{ "--tier-accent": `var(--mantine-color-${accentColor}-5)` } as CSSProperties}
    >
      <button
        type="button"
        className={classes.main}
        onClick={() => item.equipmentId && onOpen(item.equipmentId)}
        aria-label={`Show details for ${name}`}
      >
        <Group gap="xs" wrap="nowrap" w="100%">
          <span className={classes.name}>{name}</span>
          {quantity > 1 && <span className={classes.quantity}>×{quantity}</span>}
        </Group>

        {hasMeta && (
          <span className={classes.meta}>
            {details?.tier && <span className={classes.tier}>{details.tier}</span>}
            {details?.tier && stats.length > 0 && " · "}
            {stats.join(" · ")}
          </span>
        )}

        {item.note && <span className={`${classes.meta} ${classes.note}`}>{item.note}</span>}
      </button>

      {tags.length > 0 && (
        <Group gap={6}>
          {tags.map((tag) => (
            <span key={tag} className={classes.tag}>
              {tag}
            </span>
          ))}
        </Group>
      )}

      <div className={classes.actions}>
        <Tooltip label="Move">
          <button
            type="button"
            className={`${classes.action} ${classes.move}`}
            onClick={() => item.equipmentId && onMove(item.equipmentId)}
            aria-label={`Move ${name}`}
          >
            <IconArrowsRightLeft size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Remove">
          <button
            type="button"
            className={`${classes.action} ${classes.remove}`}
            onClick={() => onRemove(item)}
            aria-label={`Remove ${name}`}
          >
            <IconTrash size={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
