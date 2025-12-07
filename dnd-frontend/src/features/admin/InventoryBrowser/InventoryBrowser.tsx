import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Box,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconRefresh, IconSearch } from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { InventoryTile } from "../InventoryManager/sections/InventorySelectPanel/InventoryTile";
import { InventoryHeader } from "../InventoryManager/sections/InventoryItems/InventoryHeader";
import { AdminCurrencyBox } from "../components/AdminCurrencyBox";
import { InventoryItemsPanel } from "../InventoryManager/sections/InventoryItems/InventoryItemsPanel";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";

export function InventoryBrowser() {
  const {
    inventories,
    selected,
    loading,
    loadAll,
    select,
    rename,
    remove,
    refreshInventories,
  } = useAdminInventoryStore();
  const { loadAll: loadCharacters } = useAdminCharacterStore();
  const { selectedId: campaignId } = useAdminCampaignStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (campaignId) {
      void loadCharacters(campaignId);
    }
  }, [campaignId, loadCharacters]);

  const filteredInventories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventories;
    return inventories.filter((inv) => (inv.name ?? "").toLowerCase().includes(q));
  }, [inventories, query]);

  const handleRename = (id: string, currentName: string) => {
    const next = prompt("Rename inventory:", currentName || "Inventory");
    if (next && next.trim()) {
      void rename(id, next.trim());
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete inventory "${name || "Unnamed"}"? This cannot be undone.`)) {
      void remove(id);
    }
  };

  return (
    <Box style={{ width: "100%", margin: "0 auto" }}>
      <Stack gap="md">
        <Paper
          withBorder
          radius="md"
          p="md"
          style={{
            background: "linear-gradient(145deg, rgba(40,0,60,0.5), rgba(15,0,35,0.45))",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Stack gap="sm">
            <Box
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <TextInput
                placeholder="Search inventories by name..."
                leftSection={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                style={{ flex: 1, minWidth: 220 }}
              />
              <Tooltip label="Refresh inventories and characters">
                <ActionIcon
                  variant="light"
                  color="violet"
                  onClick={() => {
                    void refreshInventories();
                    if (campaignId) void loadCharacters(campaignId);
                  }}
                  loading={loading}
                  size="lg"
                >
                  {loading ? <Loader size={16} /> : <IconRefresh size={16} />}
                </ActionIcon>
              </Tooltip>
            </Box>

            <ScrollArea h={220} offsetScrollbars>
              {filteredInventories.length === 0 ? (
                <Text c="dimmed" size="sm">
                  No inventories match your search.
                </Text>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
                  {filteredInventories.map((inv) => (
                    <InventoryTile
                      key={inv.id}
                      name={inv.name || "Unnamed"}
                      selected={selected?.id === inv.id}
                      onClick={() => select(inv.id!)}
                      onRename={() => handleRename(inv.id!, inv.name || "")}
                      onDelete={() => handleDelete(inv.id!, inv.name || "")}
                    />
                  ))}
                </SimpleGrid>
              )}
            </ScrollArea>
          </Stack>
        </Paper>

        {selected ? (
          <Paper
            p="sm"
            radius="md"
            withBorder
            style={{
              display: "flex",
              flexDirection: "column",
              background:
                "linear-gradient(145deg, rgba(50,0,90,0.55), rgba(20,0,40,0.45))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 15px rgba(150,50,255,0.15)",
            }}
          >
            <InventoryHeader />
            <AdminCurrencyBox />
            <InventoryItemsPanel />
          </Paper>
        ) : (
          <Paper
            withBorder
            radius="md"
            p="lg"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px dashed rgba(255,255,255,0.12)",
              textAlign: "center",
            }}
          >
            <Text c="dimmed">Select an inventory to manage its contents and owners.</Text>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
