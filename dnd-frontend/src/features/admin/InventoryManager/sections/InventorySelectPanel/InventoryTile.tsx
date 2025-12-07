import { Paper, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

interface InventoryTileProps {
  name: string;
  selected?: boolean;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export function InventoryTile({
  name,
  selected,
  onClick,
  onRename,
  onDelete,
}: InventoryTileProps) {
  return (
    <Paper
      onClick={onClick}
      radius="md"
      withBorder
      p="xs"
      style={{
        cursor: "pointer",
        minWidth: 160,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: selected
          ? "linear-gradient(135deg, rgba(140,100,255,0.35), rgba(60,20,120,0.4))"
          : "rgba(255,255,255,0.05)",
        border: selected
          ? "1px solid rgba(180,120,255,0.7)"
          : "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(6px)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) =>
        !selected &&
        (e.currentTarget.style.background =
          "rgba(255,255,255,0.08)")
      }
      onMouseLeave={(e) =>
        !selected &&
        (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
      }
    >
      <Text
        fw={500}
        size="sm"
        c={selected ? "violet.1" : "gray.1"}
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          paddingLeft: "0.3rem",
        }}
      >
        {name || "Unnamed"}
      </Text>

      <Group gap={2}>
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
    </Paper>
  );
}
