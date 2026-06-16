import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBuildingStore,
  IconInbox,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { ShopWorkspace } from "./components/ShopWorkspace";
import { ShopListItem } from "./components/ShopListItem";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import styles from "@styles/InventoryDashboard.module.css";
import { useToken } from "@store/auth/authSelectors";
import { jwtDecode } from "jwt-decode";

export function ShopManager() {
  const {
    shops,
    selectedShopId,
    loading,
    loadShops,
    selectShop,
    createShop,
    updateShop,
    deleteShop,
  } = useAdminShopStore();

  const { selectedId: activeCampaignId } = useAdminCampaignStore();
  const token = useToken();

  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<{ id: string; name: string } | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (activeCampaignId) {
      void loadShops(activeCampaignId);
    }
  }, [activeCampaignId, loadShops]);

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const matchesSearch = (shop.name ?? "").toLowerCase().includes(searchQuery.trim().toLowerCase());
      return matchesSearch;
    });
  }, [shops, searchQuery]);

  const handleRename = (id: string, currentName: string) => {
    const next = prompt("Rename shop:", currentName || "Shop");
    if (next && next.trim()) {
      const shop = shops.find(s => s.id === id);
      if(shop) {
          void updateShop(id, { ...shop, name: next.trim() });
      }
    }
  };

  const triggerDeleteConfirm = (id: string, name: string) => {
    setShopToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (shopToDelete) {
      await deleteShop(shopToDelete.id);
      setDeleteConfirmOpen(false);
      setShopToDelete(null);
    }
  };

  const executeCreate = async () => {
    if (creating || !newShopName.trim() || !activeCampaignId) {
      if (!newShopName.trim()) {
        showNotification({
          title: "Validation Error",
          message: "Please enter a shop name.",
          color: SectionColor.Red,
        });
      }
      return;
    }

    setCreating(true);
    try {
        let currentUserId = "system";
        if(token) {
           const decoded: any = jwtDecode(token);
           currentUserId = decoded.nameid || decoded.sub || "system";
        }
        
      await createShop({
          name: newShopName.trim(),
          campaignId: activeCampaignId,
          ownerIds: [currentUserId],
          isOpened: false,
          priceMultiplier: 1.0,
      });

      setCreateModalOpen(false);
      setNewShopName("");
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
      color: "white"
    },
  };

  const handleRefresh = () => {
    if (activeCampaignId) void loadShops(activeCampaignId);
  };

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.splitLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Group gap="xs" mb="sm">
              <ThemeIcon variant="light" color="indigo" size="md" radius="sm">
                <IconBuildingStore size={16} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" c="white">Shops</Text>
                <Text size="xs" c="dimmed">{filteredShops.length} shown</Text>
              </div>
            </Group>

            <TextInput
              placeholder="Search shops..."
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="xs"
              mb="xs"
              styles={inputStyle}
            />

            <Group gap="xs" grow>
              <Button
                variant="filled"
                color="indigo"
                leftSection={<IconPlus size={14} />}
                onClick={() => setCreateModalOpen(true)}
                size="xs"
                disabled={!activeCampaignId}
              >
                Add Shop
              </Button>
              <Tooltip label="Refresh" withArrow>
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={handleRefresh}
                  loading={loading}
                  size="md"
                  disabled={!activeCampaignId}
                >
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
            {loading && filteredShops.length === 0 ? (
              <Group justify="center" py="xl">
                <Loader color="indigo" size="sm" />
              </Group>
            ) : filteredShops.length === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <IconInbox size={22} color="gray" />
                <Text c="dimmed" size="xs">No shops found.</Text>
              </Stack>
            ) : (
              <Stack gap={0}>
                  <div key="all">
                    <div className={styles.listGroupHeader}>
                      <span>All Shops</span>
                      <span className={styles.listGroupCount}>{filteredShops.length}</span>
                    </div>
                    {filteredShops.map((shop) => (
                      <ShopListItem
                        key={shop.id}
                        shop={shop}
                        isSelected={selectedShopId === shop.id}
                        onSelect={() => selectShop(shop.id!)}
                        onRename={() => handleRename(shop.id!, shop.name || "")}
                        onDelete={() => triggerDeleteConfirm(shop.id!, shop.name || "")}
                      />
                    ))}
                  </div>
              </Stack>
            )}
          </ScrollArea>
        </div>

        <div className={styles.workspaceArea}>
          <ShopWorkspace />
        </div>
      </div>

      <AdminGlassModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Shop"
        size="md"
        loading={creating}
      >
        <Stack gap="md">
          <TextInput
             label="Shop Name"
             placeholder="e.g. The Blacksmith, General Store..."
             value={newShopName}
             onChange={(e) => setNewShopName(e.currentTarget.value)}
             required
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
        title="Delete Shop"
        variant="danger"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="gray.2">
            Are you sure you want to delete{" "}
            <Text span fw={700} c="red.2">
              "{shopToDelete?.name}"
            </Text>
            ?
          </Text>
          <Text size="xs" c="red.4" fw={500}>
            This action is permanent and cannot be undone. Its inventory register will be orphaned.
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