import React from "react";
import { Group, ActionIcon, Text, Badge, Tooltip, Stack } from "@mantine/core";
import { IconPencil, IconTrash, IconEye, IconCoins, IconFlame, IconScale } from "@tabler/icons-react";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { formatCostToDisplay } from "@utils/currencyConverter";
import GlassyBox from "./GlassyBox";
import styles from "@features/admin/ItemManager/ItemManager.module.css";

interface ItemListProps {
  items: Equipment[];
  onEdit: (item: Equipment) => void;
  onDelete: (item: Equipment) => void;
  onDetails: (item: Equipment) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onEdit, onDelete, onDetails }) => {
  // Map tier to custom class in CSS
  const getTierClass = (tier?: string) => {
    switch (tier) {
      case "Common": return styles.tierCommon;
      case "Uncommon": return styles.tierUncommon;
      case "Rare": return styles.tierRare;
      case "Very Rare": return styles.tierVeryRare;
      case "Legendary": return styles.tierLegendary;
      case "Artifact": return styles.tierArtifact;
      default: return styles.tierCommon;
    }
  };

  return (
    <GlassyBox className={styles.glassyBox}>
      <div className={styles.tableContainer}>
        <table className={styles.glassTable}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Item Name / Index</th>
              <th style={{ width: "15%" }}>Rarity Tier</th>
              <th style={{ width: "15%" }}>Cost</th>
              <th style={{ width: "15%" }}>Damage</th>
              <th style={{ width: "13%" }}>Weight</th>
              <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id || item.index} className={styles.glassRow}>
                {/* Name & Index */}
                <td>
                  <Group gap="xs" wrap="nowrap">
                    <Text
                      size="sm"
                      fw={700}
                      style={{ color: "white", cursor: "pointer" }}
                      onClick={() => onDetails(item)}
                    >
                      {item.name}
                    </Text>
                    <Group gap={4}>
                      {item.isCustom && (
                        <Badge variant="gradient" gradient={{ from: "teal", to: "cyan" }} size="xs" radius="sm">
                          Custom
                        </Badge>
                      )}
                      {item.isDeleted && (
                        <Badge color="red" size="xs" radius="sm">
                          Deleted
                        </Badge>
                      )}
                    </Group>
                  </Group>
                </td>

                {/* Rarity Tier */}
                <td>
                  <span className={`${styles.tierBadge} ${getTierClass(item.tier)}`}>
                    {item.tier || "Common"}
                  </span>
                </td>

                {/* Cost */}
                <td>
                  <Group gap="xs" wrap="nowrap">
                    <IconCoins size={16} color="#eab308" />
                    <Text size="sm" fw={600} c="amber.2">
                      {formatCostToDisplay(item.cost)}
                    </Text>
                  </Group>
                </td>

                {/* Damage */}
                <td>
                  {item.damage ? (
                    <Group gap="xs" wrap="nowrap">
                      <IconFlame size={16} color="#f87171" />
                      <Text size="sm" fw={600} c="red.2">
                        {item.damage.damageDice} {item.damage.damageType?.name || ""}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </td>

                {/* Weight */}
                <td>
                  {item.weight !== undefined ? (
                    <Group gap="xs" wrap="nowrap">
                      <IconScale size={16} color="#a7f3d0" />
                      <Text size="sm" c="teal.1">
                        {item.weight} lbs.
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </td>

                {/* Actions */}
                <td>
                  <Group justify="flex-end" gap="xs" wrap="nowrap">
                    <Tooltip label="View details" withArrow position="top">
                      <ActionIcon
                        size="md"
                        variant="subtle"
                        color="cyan.4"
                        onClick={() => onDetails(item)}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Edit item" withArrow position="top">
                      <ActionIcon
                        size="md"
                        variant="subtle"
                        color="grape.4"
                        onClick={() => onEdit(item)}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Delete item" withArrow position="top">
                      <ActionIcon
                        size="md"
                        variant="subtle"
                        color="red.5"
                        onClick={() => onDelete(item)}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <Stack align="center" gap="xs" py="xl" my="md">
            <Text size="sm" c="dimmed" fs="italic">
              No matching items found. Try relaxing your filters or create a new item!
            </Text>
          </Stack>
        )}
      </div>
    </GlassyBox>
  );
};

export default ItemList;
