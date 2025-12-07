import { Group, Paper, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

interface InventoryPillProps {
  name: string;
  selected?: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function InventoryPill({
  name,
  selected,
  onClick,
  onRename,
  onDelete,
}: InventoryPillProps) {
  return (
    <Paper
      p="xs"
      radius="xl"
      withBorder
      onClick={onClick}
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.2s ease",
        background: selected
          ? "linear-gradient(145deg, rgba(160,80,255,0.35), rgba(60,0,120,0.45))"
          : "rgba(255,255,255,0.05)",
        border: selected
          ? "1px solid rgba(180,100,255,0.7)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: selected
          ? "0 0 8px rgba(160,80,255,0.3)"
          : "0 0 6px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) =>
        !selected &&
        (e.currentTarget.style.background =
          "linear-gradient(145deg, rgba(120,60,200,0.25), rgba(50,0,90,0.3))")
      }
      onMouseLeave={(e) =>
        !selected &&
        (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
      }
    >
      <Group gap={4} align="center" justify="space-between" style={{ flex: 1 }}>
        <Text
          fw={500}
          size="sm"
          c={selected ? "violet.1" : "gray.1"}
          style={{
            textTransform: "capitalize",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name || "Unnamed"}
        </Text>

        <Group gap={2} wrap="nowrap">
          <Tooltip label="Rename">
            <ActionIcon
              variant="subtle"
              color="violet"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onRename();
              }}
            >
              <IconEdit size={13} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              color="red"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <IconTrash size={13} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}
