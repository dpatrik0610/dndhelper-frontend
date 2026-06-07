import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconArchive,
  IconFilterOff,
  IconInbox,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import { InventoryWorkspace } from "./components/InventoryWorkspace";
import { InventoryListItem } from "./components/InventoryListItem";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import styles from "@styles/InventoryDashboard.module.css";

type InventoryGroup = {
  key: "multi" | "unowned" | "single";
  label: string;
  items: Inventory[];
};

function groupInventories(inventories: Inventory[]): InventoryGroup[] {
  const multi: Inventory[] = [];
  const unowned: Inventory[] = [];
  const single: Inventory[] = [];

  for (const inv of inventories) {
    const ownerCount = inv.characterIds?.length ?? 0;
    if (ownerCount === 0) unowned.push(inv);
    else if (ownerCount > 1) multi.push(inv);
    else single.push(inv);
  }

  const groups: InventoryGroup[] = [];
  if (multi.length > 0) groups.push({ key: "multi", label: "Multiple Owners", items: multi });
  if (unowned.length > 0) groups.push({ key: "unowned", label: "Unowned", items: unowned });
  if (single.length > 0) groups.push({ key: "single", label: "Single Owner", items: single });
  return groups;
}

export function InventoryDashboard() {
  const {
    inventories,
    selected,
    loading,
    loadAll,
    select,
    rename,
    remove,
    duplicate,
    create,
    refreshInventories,
  } = useAdminInventoryStore();

  const { characters, loadAll: loadCharacters } = useAdminCharacterStore();
  const { campaigns, selectedId: activeCampaignId } = useAdminCampaignStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampaignFilter, setSelectedCampaignFilter] = useState<string | null>("all");
  const [selectedCharacterFilter, setSelectedCharacterFilter] = useState<string | null>("all");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newInventoryName, setNewInventoryName] = useState("");
  const [newInventoryCharId, setNewInventoryCharId] = useState<string | null>("none");
  const [newInventoryCampaignId, setNewInventoryCampaignId] = useState<string | null>("none");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (activeCampaignId) {
      void loadCharacters(activeCampaignId);
    }
  }, [activeCampaignId, loadCharacters]);

  const campaignOptions = useMemo(() => {
    const list = campaigns.map((c) => ({ value: c.id!, label: c.name || "Unnamed Campaign" }));
    return [{ value: "all", label: "All Campaigns" }, ...list];
  }, [campaigns]);

  const characterOptions = useMemo(() => {
    const list = characters
      .filter((char) => selectedCampaignFilter === "all" || char.campaignId === selectedCampaignFilter)
      .map((char) => ({ value: char.id!, label: char.name || "Unnamed Character" }));
    return [{ value: "all", label: "All Characters" }, ...list];
  }, [characters, selectedCampaignFilter]);

  const filteredInventories = useMemo(() => {
    return inventories.filter((inv) => {
      const matchesSearch = (inv.name ?? "").toLowerCase().includes(searchQuery.trim().toLowerCase());
      if (!matchesSearch) return false;

      const isUnowned = !inv.characterIds || inv.characterIds.length === 0;

      if (selectedCharacterFilter !== "all" && selectedCharacterFilter !== null) {
        if (!inv.characterIds || !inv.characterIds.includes(selectedCharacterFilter)) {
          return false;
        }
      }

      if (selectedCampaignFilter !== "all" && selectedCampaignFilter !== null) {
        if (inv.campaignId && inv.campaignId !== selectedCampaignFilter) {
          return false;
        }
        if (!inv.campaignId && !isUnowned) {
          const linkedChars = characters.filter((c) => inv.characterIds?.includes(c.id!));
          const hasCampaignChar = linkedChars.some((c) => c.campaignId === selectedCampaignFilter);
          if (!hasCampaignChar) return false;
        }
      }

      return true;
    });
  }, [inventories, searchQuery, selectedCharacterFilter, selectedCampaignFilter, characters]);

  const inventoryGroups = useMemo(
    () => groupInventories(filteredInventories),
    [filteredInventories]
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCampaignFilter !== "all" ||
    selectedCharacterFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCampaignFilter("all");
    setSelectedCharacterFilter("all");
  };

  const handleRename = (id: string, currentName: string) => {
    const next = prompt("Rename inventory:", currentName || "Inventory");
    if (next && next.trim()) {
      void rename(id, next.trim());
    }
  };

  const handleDuplicate = (inventoryId: string) => {
    void duplicate(inventoryId);
  };

  const triggerDeleteConfirm = (id: string, name: string) => {
    setInventoryToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (inventoryToDelete) {
      await remove(inventoryToDelete.id);
      setDeleteConfirmOpen(false);
      setInventoryToDelete(null);
    }
  };

  const executeCreate = async () => {
    if (creating || !newInventoryName.trim()) {
      if (!newInventoryName.trim()) {
        showNotification({
          title: "Validation Error",
          message: "Please enter an inventory name.",
          color: SectionColor.Red,
        });
      }
      return;
    }

    setCreating(true);
    try {
      const charIds = newInventoryCharId && newInventoryCharId !== "none" ? [newInventoryCharId] : [];
      const campId = newInventoryCampaignId && newInventoryCampaignId !== "none" ? newInventoryCampaignId : activeCampaignId || null;

      const newInv = await create(charIds, newInventoryName.trim());

      if (campId && newInv.id) {
        await rename(newInv.id, newInventoryName.trim());
      }

      setCreateModalOpen(false);
      setNewInventoryName("");
      setNewInventoryCharId("none");
      setNewInventoryCampaignId("none");
    } catch (err) {
      showNotification({
        title: "Creation failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setCreating(false);
    }
  };

  const inputStyle = {
    input: {
      backgroundColor: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
  };

  const handleRefresh = () => {
    void refreshInventories();
    if (activeCampaignId) void loadCharacters(activeCampaignId);
  };

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.splitLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Group gap="xs" mb="sm">
              <ThemeIcon variant="light" color="indigo" size="md" radius="sm">
                <IconArchive size={16} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" c="white">Inventories</Text>
                <Text size="xs" c="dimmed">{filteredInventories.length} shown</Text>
              </div>
            </Group>

            <TextInput
              placeholder="Search inventoriesâ€¦"
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="xs"
              mb="xs"
              styles={inputStyle}
            />

            <Stack gap={6} mb="sm">
              <Select
                placeholder="Campaign"
                data={campaignOptions}
                value={selectedCampaignFilter}
                onChange={(val) => { setSelectedCampaignFilter(val); setSelectedCharacterFilter("all"); }}
                size="xs"
                styles={inputStyle}
                comboboxProps={{ withinPortal: true }}
              />
              <Select
                placeholder="Character"
                data={characterOptions}
                value={selectedCharacterFilter}
                onChange={setSelectedCharacterFilter}
                size="xs"
                styles={inputStyle}
                comboboxProps={{ withinPortal: true }}
              />
              {hasActiveFilters && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  leftSection={<IconFilterOff size={12} />}
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </Stack>

            <Group gap="xs" grow>
              <Button
                variant="filled"
                color="indigo"
                leftSection={<IconPlus size={14} />}
                onClick={() => setCreateModalOpen(true)}
                size="xs"
              >
                Add
              </Button>
              <Tooltip label="Refresh" withArrow>
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={handleRefresh}
                  loading={loading}
                  size="md"
                >
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
            {loading && filteredInventories.length === 0 ? (
              <Group justify="center" py="xl">
                <Loader color="indigo" size="sm" />
              </Group>
            ) : filteredInventories.length === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <IconInbox size={22} color="gray" />
                <Text c="dimmed" size="xs">No inventories found.</Text>
              </Stack>
            ) : (
              <Stack gap={0}>
                {inventoryGroups.map((group) => (
                  <div key={group.key}>
                    <div className={styles.listGroupHeader}>
                      <span>{group.label}</span>
                      <span className={styles.listGroupCount}>{group.items.length}</span>
                    </div>
                    {group.items.map((inv) => (
                      <InventoryListItem
                        key={inv.id}
                        inventory={inv}
                        isSelected={selected?.id === inv.id}
                        onSelect={() => select(inv.id!)}
                        onDuplicate={() => handleDuplicate(inv.id!)}
                        onRename={() => handleRename(inv.id!, inv.name || "")}
                        onDelete={() => triggerDeleteConfirm(inv.id!, inv.name || "")}
                      />
                    ))}
                  </div>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </div>

        <div className={styles.workspaceArea}>
          <InventoryWorkspace />
        </div>
      </div>

      <AdminGlassModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Inventory"
        size="md"
        loading={creating}
      >
        <Stack gap="md">
          <TextInput
            label="Inventory Name"
            placeholder="e.g. Bag of Holding, Dragon's Hoardâ€¦"
            value={newInventoryName}
            onChange={(e) => setNewInventoryName(e.currentTarget.value)}
            required
            styles={inputStyle}
          />
          <Select
            label="Associate with Character (Optional)"
            placeholder="Select owner characterâ€¦"
            value={newInventoryCharId}
            onChange={(val) => setNewInventoryCharId(val)}
            data={[
              { value: "none", label: "None (Unowned / Campaign-Wide)" },
              ...characters.map((c) => ({ value: c.id!, label: c.name || "Unnamed" })),
            ]}
            styles={inputStyle}
          />
          <Select
            label="Campaign Link"
            placeholder="Select campaignâ€¦"
            value={newInventoryCampaignId}
            onChange={(val) => setNewInventoryCampaignId(val)}
            data={[
              { value: "none", label: "Current Campaign / Default" },
              ...campaigns.map((c) => ({ value: c.id!, label: c.name || "Unnamed" })),
            ]}
            styles={inputStyle}
          />
          <Group justify="flex-end" mt="lg">
            <Button variant="subtle" color="gray" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="filled" color="indigo" onClick={executeCreate} loading={creating}>
              Create
            </Button>
          </Group>
        </Stack>
      </AdminGlassModal>

      <AdminGlassModal
        opened={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Inventory"
        variant="danger"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="gray.2">
            Are you sure you want to delete{" "}
            <Text span fw={700} c="red.2">
              "{inventoryToDelete?.name}"
            </Text>
            ?
          </Text>
          <Text size="xs" c="red.4" fw={500}>
            This action is permanent and cannot be undone. All contained items will be deleted.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" leftSection={<IconTrash size={14} />} onClick={executeDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </AdminGlassModal>
    </div>
  );
}
