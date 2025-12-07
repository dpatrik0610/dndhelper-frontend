import { Card, Grid, Text, ActionIcon, Group, Badge } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import CustomBadge from "@components/common/CustomBadge";
import { SectionColor } from "@appTypes/SectionColor";
import { IconTrash, IconArrowsRightLeft, IconZoom } from "@tabler/icons-react";
import { useState } from "react";
import { EquipmentModal } from "./EquipmentModal";

interface InventoryItemCardProps {
  item: InventoryItem;
  onRemove?: (equipmentId: string) => void;
  onMove?: (equipmentId: string) => void;
}

export function InventoryItemCard({ item, onRemove, onMove }: InventoryItemCardProps) {
  const [modalOpened, setModalOpened] = useState(false);
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Card
      shadow="sm"
      padding={isMobile ? "md" : "sm"}
      radius="md"
      style={{
        transition: "all 0.2s ease",
        background: "linear-gradient(135deg, rgba(48, 27, 14, 0.82), rgba(120, 53, 15, 0.7))",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <EquipmentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        equipmentId={item.equipmentId!}
      />
      <Grid align="center" gutter={isMobile ? "sm" : "xs"}>
        {/* Name + Quantity */}
        <Grid.Col span={12}>
          <Group
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="xs"
            style={{ minWidth: 0 }}
          >
            <Text
              fw={500}
              lineClamp={1}
              size={isMobile ? "md" : "sm"}
              style={{ minWidth: 0 }}
            >
              {item.equipmentName || "Unnamed Item"}
            </Text>
            {item.quantity && item.quantity > 1 && (
              <CustomBadge
                hoverText={`Quantity: ${item.quantity}`}
                label={`x ${item.quantity}`}
                radius="sm"
                gradient={{ from: SectionColor.Grape, to: SectionColor.Violet, deg: 135 }}
                variant="gradient"
              />
            )}
          </Group>
        </Grid.Col>

        {/* Actions row */}
        <Grid.Col span={12}>
          {isMobile ? (
          <Group
            justify="space-between"
            gap={4}
            wrap="nowrap"
            style={{ width: "100%" }}
          >
            <ActionIcon
              variant="light"
              color="gray"
              size="md"
              radius="md"
              onClick={() => setModalOpened(true)}
              title="View Details"
              style={{ flex: 1, minWidth: 0, flexBasis: 0 }}
            >
              <IconZoom size={18} />
            </ActionIcon>

              {onMove && (
              <ActionIcon
                variant="light"
                color="blue"
                size="md"
                radius="md"
                onClick={() => onMove(item.equipmentId!)}
                title="Move to another inventory"
                style={{ flex: 1, minWidth: 0, flexBasis: 0 }}
              >
                <IconArrowsRightLeft size={18} />
              </ActionIcon>
            )}

              {onRemove && (
              <ActionIcon
                variant="light"
                color="red"
                size="md"
                radius="md"
                onClick={() => onRemove(item.equipmentId!)}
                title="Remove item"
                style={{ flex: 1, minWidth: 0, flexBasis: 0 }}
              >
                <IconTrash size={18} />
              </ActionIcon>
            )}
          </Group>
          ) : (
            <Group justify="flex-end" gap="xs" wrap="wrap">
              <ActionIcon variant="subtle" onClick={() => setModalOpened(true)} title="View Details">
                <IconZoom size={16} />
              </ActionIcon>

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
          )}
        </Grid.Col>

        {/* Optional Note */}
        {item.note && (
          <Grid.Col span={12}>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {item.note}
            </Text>
          </Grid.Col>
        )}

        {(item.tags?.length ?? 0) > 0 && (
          <Grid.Col span={12}>
            <Group gap={6} wrap="wrap">
              {item.tags!.map((tag) => (
                <Badge key={tag} size="xs" variant="light" color="grape" radius="sm">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Grid.Col>
        )}
      </Grid>
    </Card>
  );
}
