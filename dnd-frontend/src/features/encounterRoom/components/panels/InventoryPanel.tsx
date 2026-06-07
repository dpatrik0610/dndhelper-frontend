import { useEffect, useState } from "react";
import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { getInventory } from "@services/inventoryService";
import { useAuthStore } from "@store/auth/authStore";
import type { Inventory } from "@appTypes/Inventory/Inventory";

interface InventoryPanelProps {
  inventoryIds: string[];
}

export function InventoryPanel({ inventoryIds }: InventoryPanelProps) {
  const token = useAuthStore((state) => state.token);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  useEffect(() => {
    if (!token || inventoryIds.length === 0) {
      setInventories([]);
      return;
    }
    let active = true;
    void Promise.all(inventoryIds.map((id) => getInventory(id, token))).then((items) => {
      if (active) setInventories(items);
    });
    return () => {
      active = false;
    };
  }, [inventoryIds, token]);

  return (
    <Paper withBorder p="sm" radius="sm" bg="rgba(15, 23, 42, 0.94)">
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={700}>Inventories</Text>
          <Badge>{inventoryIds.length}</Badge>
        </Group>
        {inventories.length === 0 ? (
          <Text size="sm" c="dimmed">No linked inventories.</Text>
        ) : (
          inventories.map((inventory) => (
            <Paper key={inventory.id} p="xs" radius="sm" withBorder bg="rgba(255,255,255,0.03)">
              <Text size="sm" fw={700}>{inventory.name ?? "Inventory"}</Text>
              <Text size="xs" c="dimmed">{inventory.items?.length ?? 0} items</Text>
            </Paper>
          ))
        )}
      </Stack>
    </Paper>
  );
}
