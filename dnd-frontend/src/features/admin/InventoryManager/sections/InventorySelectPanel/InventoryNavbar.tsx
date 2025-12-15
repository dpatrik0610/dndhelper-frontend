import {
  Group,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import { IconPlus, IconReload } from "@tabler/icons-react";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { InventoryTile } from "./InventoryTile";

export function InventoryNavbar({ onCreate }: { onCreate: () => void }) {
  const {
    inventories,
    selected,
    select,
    rename,
    duplicate,
    remove,
    loadByCharacter,
  } = useAdminInventoryStore();
  const { selectedId: selectedCharId } = useAdminCharacterStore();

  return (
    <Box
      style={{
        width: "100%",
        padding: "0.5rem 1rem",
        background: "rgba(30, 0, 50, 0.4)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 12px rgba(100,0,255,0.15)",
      }}
    >
      <Group justify="space-between" align="center" gap="sm">
        {/* --- Scrollable tiles --- */}
        <ScrollArea
          style={{
            flex: 1,
            overflowX: "auto",
            whiteSpace: "nowrap",
            paddingBottom: "0.25rem",
          }}
          scrollbarSize={4}
          offsetScrollbars
        >
          <Group
            gap="sm"
            wrap="nowrap"
            style={{
              flexWrap: "nowrap",
              paddingRight: "0.5rem",
              minHeight: "64px",
            }}
          >
            {inventories.map((inv) => (
              <InventoryTile
                key={inv.id}
                name={inv.name ?? "Unnamed"}
                selected={selected?.id === inv.id}
                onClick={() => select(inv.id!)}
                onDuplicate={() => duplicate(inv.id!)}
                onRename={() => {
                  const newName = prompt("Rename inventory:", inv.name ?? "");
                  if (newName?.trim()) rename(inv.id!, newName.trim());
                }}
                onDelete={() => {
                  if (confirm("Delete this inventory permanently?"))
                    remove(inv.id!);
                }}
              />
            ))}
          </Group>
        </ScrollArea>

        {/* --- Actions --- */}
        <Group gap="xs" style={{ flexShrink: 0 }}>
          <Tooltip label="Create new inventory" withArrow>
            <ActionIcon
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: "violet", to: "cyan" }}
              onClick={onCreate}
              style={{
                boxShadow: "0 0 8px rgba(140,90,255,0.4)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Reload inventories" withArrow>
            <ActionIcon
              size="lg"
              radius="md"
              variant="light"
              color="cyan"
              onClick={() => selectedCharId && loadByCharacter(selectedCharId)}
            >
              <IconReload size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
}
