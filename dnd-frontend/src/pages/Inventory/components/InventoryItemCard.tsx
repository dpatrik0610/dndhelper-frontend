import { Card, Grid, Text, Tooltip, ActionIcon, Group } from "@mantine/core";
import type { InventoryItem } from "../../../types/Inventory/InventoryItem";
import CustomBadge from "../../../components/common/CustomBadge";
import { SectionColor } from "../../../types/SectionColor";
import { IconTrash, IconArrowsRightLeft } from "@tabler/icons-react";

interface InventoryItemCardProps {
  item: InventoryItem;
  onRemove?: (equipmentId: string) => void;
  onMove?: (equipmentId: string) => void;
}

export function InventoryItemCard({ item, onRemove, onMove }: InventoryItemCardProps) {
  return (
    <Tooltip label={item.note || "No additional notes"} position="top-start" withArrow>
      <Card
        shadow="sm"
        padding="md"
        radius="md"
        style={{
          transition: "all 0.2s ease",
          background: "linear-gradient(145deg, rgba(25, 25, 25, 0.34), rgba(50, 50, 50, 0.44))",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Grid align="center" gutter="sm">
          {/* Item Name */}
          <Grid.Col span={6}>
            <Text fw={500}>{item.equipmentName || "Unnamed Item"}</Text>
            {item.quantity && item.quantity > 1 && (
              <CustomBadge
                hoverText={`Quantity: ${item.quantity}`}
                label={`× ${item.quantity}`}
                radius="sm"
                gradient={{ from: SectionColor.Grape, to: SectionColor.Violet, deg: 135 }}
                variant="gradient"
              />
            )}
          </Grid.Col>

          {/* Actions */}
          <Grid.Col span={6}>
            <Group justify="end" gap="xs">
              {onMove && (
                <ActionIcon
                  color="blue"
                  variant="light"
                  onClick={() => onMove(item.equipmentId!)}
                  title="Move to another inventory"
                >
                  <IconArrowsRightLeft size={16} />
                </ActionIcon>
              )}

              {onRemove && (
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => onRemove(item.equipmentId!)}
                  title="Remove item"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          </Grid.Col>

          {/* Optional Note */}
          {item.note && (
            <Grid.Col span={12}>
              <Text size="xs" c="dimmed" lineClamp={1}>
                {item.note}
              </Text>
            </Grid.Col>
          )}
        </Grid>
      </Card>
    </Tooltip>
  );
}
