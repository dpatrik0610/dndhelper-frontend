import { Card, Grid, Text, ActionIcon, Group, Badge } from "@mantine/core";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import CustomBadge from "@components/common/CustomBadge";
import { SectionColor } from "@appTypes/SectionColor";
import { IconTrash, IconArrowsRightLeft, IconZoom, IconStarFilled } from "@tabler/icons-react";
import { useState } from "react";
import { EquipmentModal } from "./EquipmentModal";
import { useIsMobile } from "@hooks/useIsMobile";

interface InventoryItemCardProps {
  item: InventoryItem;
  onRemove?: (equipmentId: string) => void;
  onMove?: (equipmentId: string) => void;
}

export function InventoryItemCard({ item, onRemove, onMove }: InventoryItemCardProps) {
  const [modalOpened, setModalOpened] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Card
      shadow="sm"
      padding={isMobile ? "md" : "sm"}
      radius="md"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
        e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.05))";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2), var(--theme-glow-shadow-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
        e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.02))";
        e.currentTarget.style.boxShadow = "none";
      }}
      style={{
        transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.02))",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
      }}
    >
      <EquipmentModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        equipmentId={item.equipmentId!}
      />
      <Grid align="center" gutter={isMobile ? "sm" : "xs"}>
        
        {/* Name + Quantity (With inline glassmorphism) */}
        <Grid.Col span={12}>
          <Group
            justify="space-between"
            align="center"
            wrap="nowrap"
            gap="xs"
            style={{ minWidth: 0 }}
          >
            {/* Item Title in cinematic RPG style */}
            <Text
              fw={500}
              size={isMobile ? "md" : "sm"}
              style={{
                minWidth: 0,
                flex: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--theme-color-text-primary, #fff)",
                textShadow: "0 0 10px var(--theme-border-glow, rgba(255,255,255,0.05))",
              }}
            >
              {item.equipmentName || "Unnamed Item"}
            </Text>

            {/* Themed Frosted Glass Quantity Badge */}
            {item.quantity && item.quantity > 1 && (
              <CustomBadge
                hoverText={`Quantity: ${item.quantity}`}
                label={`x ${item.quantity}`}
                style={{
                  flexShrink: 0,
                  background: "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  boxShadow: "var(--theme-glow-shadow-primary)",
                  color: "#fff",
                  fontWeight: 600,
                }}
                radius="sm"
                variant="transparent"
              />
            )}
          </Group>
        </Grid.Col>

        {/* Action Controls Row (Using themed frosted glass buttons) */}
        <Grid.Col span={12}>
          {isMobile ? (
          <Group
            justify="space-between"
            gap={6}
            wrap="nowrap"
            style={{ width: "100%" }}
          >
            {/* Zoom / View Details button */}
            <ActionIcon
              variant="unstyled"
              onClick={() => setModalOpened(true)}
              title="View Details"
              style={{
                flex: 1,
                minWidth: 0,
                flexBasis: 0,
                height: "36px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                transition: "all 0.2s ease",
                color: "var(--theme-color-text-secondary, #cbd5e1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-color-accent-primary, #f59e0b)";
                e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255,255,255,0.04))";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                e.currentTarget.style.color = "var(--theme-color-text-secondary, #cbd5e1)";
              }}
            >
              <IconZoom size={18} />
            </ActionIcon>

            {/* Move to another inventory button */}
            {onMove && (
              <ActionIcon
                variant="unstyled"
                onClick={() => onMove(item.equipmentId!)}
                title="Move to another inventory"
                style={{
                  flex: 1,
                  minWidth: 0,
                  flexBasis: 0,
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                  transition: "all 0.2s ease",
                  color: "var(--theme-color-accent-secondary, #06b6d4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-color-accent-secondary, #06b6d4)";
                  e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255,255,255,0.04))";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                  e.currentTarget.style.color = "var(--theme-color-accent-secondary, #06b6d4)";
                }}
              >
                <IconArrowsRightLeft size={18} />
              </ActionIcon>
            )}

            {/* Delete / Remove button */}
            {onRemove && (
              <ActionIcon
                variant="unstyled"
                onClick={() => onRemove(item.equipmentId!)}
                title="Remove item"
                style={{
                  flex: 1,
                  minWidth: 0,
                  flexBasis: 0,
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                  transition: "all 0.2s ease",
                  color: "#fca5a5",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                  e.currentTarget.style.color = "#fca5a5";
                }}
              >
                <IconTrash size={18} />
              </ActionIcon>
            )}
          </Group>
          ) : (
            <Group justify="flex-end" gap="sm" wrap="wrap">
              {/* Desktop Zoom button */}
              <ActionIcon
                variant="unstyled"
                onClick={() => setModalOpened(true)}
                title="View Details"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                  transition: "all 0.2s ease",
                  color: "var(--theme-color-text-secondary, #cbd5e1)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-color-accent-primary, #f59e0b)";
                  e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255,255,255,0.04))";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                  e.currentTarget.style.color = "var(--theme-color-text-secondary, #cbd5e1)";
                }}
              >
                <IconZoom size={16} />
              </ActionIcon>

              {/* Desktop Move button */}
              {onMove && (
                <ActionIcon
                  variant="unstyled"
                  onClick={() => onMove(item.equipmentId!)}
                  title="Move to another inventory"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                    transition: "all 0.2s ease",
                    color: "var(--theme-color-accent-secondary, #06b6d4)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-color-accent-secondary, #06b6d4)";
                    e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255,255,255,0.04))";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                    e.currentTarget.style.color = "var(--theme-color-accent-secondary, #06b6d4)";
                  }}
                >
                  <IconArrowsRightLeft size={16} />
                </ActionIcon>
              )}

              {/* Desktop Remove button */}
              {onRemove && (
                <ActionIcon
                  variant="unstyled"
                  onClick={() => onRemove(item.equipmentId!)}
                  title="Remove item"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                    transition: "all 0.2s ease",
                    color: "#fca5a5",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ef4444";
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                    e.currentTarget.style.color = "#fca5a5";
                  }}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Grid.Col>

        {/* Optional Note (Styled with secondary text colors) */}
        {item.note && (
          <Grid.Col span={12}>
            <Text size="xs" style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))", fontStyle: "italic" }} lineClamp={1}>
              {item.note}
            </Text>
          </Grid.Col>
        )}

        {/* Frosted Glass Tags List */}
        {(item.tags?.length ?? 0) > 0 && (
          <Grid.Col span={12}>
            <Group gap={6} wrap="wrap">
              {item.tags!.map((tag) => (
                <Badge
                  key={tag}
                  size="xs"
                  variant="transparent"
                  radius="sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                    color: "var(--theme-color-text-secondary, #cbd5e1)",
                    fontSize: "9px",
                    fontWeight: 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "3px 6px",
                    height: "auto",
                  }}
                >
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
