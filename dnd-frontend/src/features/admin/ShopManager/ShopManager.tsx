import { useCallback, useEffect, useMemo, useState } from "react";
import { ActionIcon, Button, Group, Loader, ScrollArea, Stack, Text, TextInput, ThemeIcon, Tooltip } from "@mantine/core";
import { IconBuildingStore, IconInbox, IconPlus, IconRefresh, IconSearch } from "@tabler/icons-react";
import { isOpenRequest, type Shop } from "@appTypes/Shop/Shop";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { BaseModal } from "@components/BaseModal";
import { ShopWorkspace } from "./components/ShopWorkspace";
import { ShopListItem } from "./components/ShopListItem";
import styles from "@styles/InventoryDashboard.module.css";

type NameDialog = { mode: "create" } | { mode: "rename"; shop: Shop };

const inputStyle = {
  input: {
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
};

export function ShopManager() {
  const { shops, sellRequests, selectedShopId, loading, loadShops, loadSellRequests, selectShop, createShop, updateShop, deleteShop } = useAdminShopStore();
  const { loadAll: loadCharacters } = useAdminCharacterStore();
  const { selectedId: activeCampaignId } = useCampaignStore();
  const userId = useCurrentUserId();

  const [searchQuery, setSearchQuery] = useState("");
  const [nameDialog, setNameDialog] = useState<NameDialog | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    if (!activeCampaignId) return;
    void loadShops(activeCampaignId);
    void loadSellRequests(activeCampaignId);
    void loadCharacters(activeCampaignId);
  }, [activeCampaignId, loadShops, loadSellRequests, loadCharacters]);

  useEffect(refresh, [refresh]);

  const pendingByShop = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of sellRequests) if (isOpenRequest(r)) counts[r.shopId] = (counts[r.shopId] ?? 0) + 1;
    return counts;
  }, [sellRequests]);

  const groups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const visible = shops
      .filter((s) => (s.name ?? "").toLowerCase().includes(q))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    return [
      { key: "open", label: "Open", items: visible.filter((s) => s.isOpened) },
      { key: "closed", label: "Closed", items: visible.filter((s) => !s.isOpened) },
    ].filter((g) => g.items.length > 0);
  }, [shops, searchQuery]);

  const shownCount = groups.reduce((n, g) => n + g.items.length, 0);

  const openNameDialog = (dialog: NameDialog) => {
    setNameInput(dialog.mode === "rename" ? dialog.shop.name : "");
    setNameDialog(dialog);
  };

  const submitName = async () => {
    const name = nameInput.trim();
    if (!nameDialog || !name || !activeCampaignId) return;
    setBusy(true);
    try {
      if (nameDialog.mode === "rename") {
        await updateShop(nameDialog.shop.id!, { ...nameDialog.shop, name });
      } else {
        await createShop({ name, campaignId: activeCampaignId, ownerIds: userId ? [userId] : [], isOpened: false, priceMultiplier: 1 });
      }
      setNameDialog(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!shopToDelete) return;
    setBusy(true);
    try {
      await deleteShop(shopToDelete.id!);
      setShopToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.splitLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Group gap="xs" mb="sm">
              <ThemeIcon variant="light" color="neon" size="md" radius="sm">
                <IconBuildingStore size={16} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" c="white">Shops</Text>
                <Text size="xs" c="dimmed">{shownCount} shown</Text>
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

            <Group gap="xs" wrap="nowrap">
              <Button
                style={{ flex: 1 }}
                className="glass-btn-primary"
                leftSection={<IconPlus size={14} />}
                onClick={() => openNameDialog({ mode: "create" })}
                size="xs"
                disabled={!activeCampaignId}
              >
                New Shop
              </Button>
              <Tooltip label="Refresh" withArrow>
                <ActionIcon variant="light" color="gray" onClick={refresh} loading={loading} size="md" disabled={!activeCampaignId} aria-label="Refresh">
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
            {loading && shownCount === 0 ? (
              <Group justify="center" py="xl">
                <Loader color="neon" size="sm" />
              </Group>
            ) : shownCount === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <IconInbox size={22} color="gray" />
                <Text c="dimmed" size="xs">{shops.length === 0 ? "No shops yet." : "No shops match."}</Text>
              </Stack>
            ) : (
              groups.map((group) => (
                <div key={group.key}>
                  <div className={styles.listGroupHeader}>
                    <span>{group.label}</span>
                    <span className={styles.listGroupCount}>{group.items.length}</span>
                  </div>
                  {group.items.map((shop) => (
                    <ShopListItem
                      key={shop.id}
                      shop={shop}
                      pending={pendingByShop[shop.id!] ?? 0}
                      isSelected={selectedShopId === shop.id}
                      onSelect={() => selectShop(shop.id!)}
                      onRename={() => openNameDialog({ mode: "rename", shop })}
                      onDelete={() => setShopToDelete(shop)}
                    />
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        <div className={styles.workspaceArea}>
          <ShopWorkspace />
        </div>
      </div>

      <BaseModal
        opened={!!nameDialog}
        onClose={() => setNameDialog(null)}
        title={nameDialog?.mode === "rename" ? "Rename Shop" : "New Shop"}
        size="sm"
        loading={busy}
        onSave={submitName}
        saveLabel={nameDialog?.mode === "rename" ? "Save" : "Create"}
      >
        <TextInput
          label="Shop name"
          placeholder="e.g. The Gilded Anvil"
          value={nameInput}
          onChange={(e) => setNameInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && void submitName()}
          data-autofocus
          required
          styles={inputStyle}
        />
        {nameDialog?.mode === "create" && (
          <Text size="xs" c="dimmed" mt="xs">
            New shops start closed with a ×1.00 markup and their own register inventory.
          </Text>
        )}
      </BaseModal>

      <BaseModal
        opened={!!shopToDelete}
        onClose={() => setShopToDelete(null)}
        title="Delete Shop"
        size="sm"
        loading={busy}
        onSave={confirmDelete}
        saveLabel="Delete"
      >
        <Text size="sm">
          Delete <b>{shopToDelete?.name}</b>? This can't be undone, and its register inventory will be left orphaned.
        </Text>
      </BaseModal>
    </div>
  );
}
