import { useEffect, useState } from "react";
import { Loader, NumberInput, ScrollArea, SimpleGrid, Stack, Switch, Text } from "@mantine/core";
import { IconBuildingStore, IconInbox } from "@tabler/icons-react";
import { BaseModal } from "@components/BaseModal";
import { isOpenRequest, type SellRequest } from "@appTypes/Shop/Shop";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { getInventory } from "@services/inventoryService";
import { MetaPanel } from "@features/admin/InventoryDashboard/components/MetaPanel";
import { ItemsPanel } from "@features/admin/InventoryDashboard/components/ItemsPanel";
import { formatSilverToDisplay } from "@utils/currencyConverter";
import { RequestCard } from "./RequestCard";
import styles from "@styles/InventoryDashboard.module.css";
import classes from "@features/admin/ShopManager/ShopManager.module.css";

export function ShopWorkspace() {
  const { selectedShopId, shops, updateShop, toggleShopOpen, sellRequests, approveSellRequest, rejectSellRequest, counterSellRequest } = useAdminShopStore();
  const { equipments, loadAll: loadEquipments } = useAdminEquipmentStore();
  const { selected: selectedInventory, setSelected: setSelectedInventory } = useAdminInventoryStore();
  const { loadInventoryById } = useAdminCurrencyStore();
  const { characters } = useAdminCharacterStore();

  const [counterRequestId, setCounterRequestId] = useState<string | null>(null);
  const [counterGp, setCounterGp] = useState(0);
  const [counterSp, setCounterSp] = useState(0);
  const [counterShopPays, setCounterShopPays] = useState(false);
  const [counterBusy, setCounterBusy] = useState(false);

  const shop = shops.find((s) => s.id === selectedShopId);
  const [markup, setMarkup] = useState<number | string>(shop?.priceMultiplier ?? 1);

  useEffect(() => {
    setMarkup(shop?.priceMultiplier ?? 1);
  }, [shop?.id, shop?.priceMultiplier]);

  useEffect(() => {
    if (equipments.length === 0) void loadEquipments();
  }, [equipments.length, loadEquipments]);

  useEffect(() => {
    if (!shop?.inventoryId) {
      setSelectedInventory(null);
      return;
    }
    getInventory(shop.inventoryId)
      .then((data) => {
        setSelectedInventory(data);
        void loadInventoryById(shop.inventoryId!);
      })
      .catch((err) => {
        console.error("Failed to fetch shop inventory", err);
        setSelectedInventory(null);
      });
  }, [shop?.inventoryId, loadInventoryById, setSelectedInventory]);

  if (!shop) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateInner}>
          <IconBuildingStore size={36} stroke={1.3} />
          <Text size="sm" c="dimmed" maw={280}>
            Select a shop from the sidebar to manage its settings and stock.
          </Text>
        </div>
      </div>
    );
  }

  const requests = sellRequests.filter((r) => r.shopId === shop.id && isOpenRequest(r));
  const counterTarget = sellRequests.find((r) => r.id === counterRequestId);

  const commitMarkup = () => {
    const next = Number(markup);
    if (!Number.isFinite(next) || next <= 0) {
      setMarkup(shop.priceMultiplier);
      return;
    }
    if (next !== shop.priceMultiplier) void updateShop(shop.id!, { ...shop, priceMultiplier: next });
  };

  const openCounter = (req: SellRequest) => {
    const totalSp = Math.round(Math.abs(req.offeredPriceGp) * 100);
    setCounterShopPays(!!req.isTrade && req.offeredPriceGp < 0);
    setCounterGp(Math.floor(totalSp / 100));
    setCounterSp(totalSp % 100);
    setCounterRequestId(req.id!);
  };

  const submitCounter = async () => {
    if (!counterRequestId) return;
    setCounterBusy(true);
    const amountGp = counterGp + counterSp / 100;
    if (await counterSellRequest(counterRequestId, counterShopPays ? -amountGp : amountGp)) {
      setCounterRequestId(null);
    }
    setCounterBusy(false);
  };

  return (
    <div className={styles.workspacePanel}>
      <div className={styles.metaBar}>
        <Text fw={700} size="sm" c="white" className={styles.metaBarTitle}>
          {shop.name || "Unnamed Shop"}
        </Text>

        <span className={styles.metaBarRule} />

        <label className={`${styles.metaChip} ${classes.statusChip}`}>
          <span className={styles.metaChipLabel}>Status</span>
          <Switch
            size="xs"
            checked={shop.isOpened}
            onChange={(e) => void toggleShopOpen(shop.id!, e.currentTarget.checked)}
            classNames={{ root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" }}
            aria-label="Open to players"
          />
          <span className={classes.statusText} data-open={shop.isOpened || undefined}>
            {shop.isOpened ? "Open to players" : "Closed"}
          </span>
        </label>

        <div className={styles.metaChip}>
          <span className={styles.metaChipLabel}>Markup</span>
          <NumberInput
            className={classes.markupInput}
            size="xs"
            value={markup}
            onChange={setMarkup}
            onBlur={commitMarkup}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            min={0.1}
            max={5}
            step={0.1}
            decimalScale={2}
            prefix="×"
            hideControls
            aria-label="Price multiplier"
          />
        </div>

        {requests.length > 0 && (
          <span className={classes.pendingCount}>{requests.length} pending</span>
        )}
      </div>

      <div className={classes.columns}>
        <section className={classes.pane}>
          <div className={styles.itemsPanelHeader}>
            <span className={styles.itemsPanelTitle}>Requests ({requests.length})</span>
          </div>
          <ScrollArea className={styles.itemsPanelBody} offsetScrollbars>
            {requests.length === 0 ? (
              <div className={styles.itemsEmpty}>
                <IconInbox size={32} stroke={1.2} />
                <Text size="xs" c="dimmed" maw={220} ta="center">
                  No open requests. Player sells, haggles, trades and steal attempts land here.
                </Text>
              </div>
            ) : (
              <div className={classes.requestList}>
                {requests.map((req) => {
                  const char = characters.find((c) => c.id === req.characterId);
                  return (
                    <RequestCard
                      key={req.id}
                      request={req}
                      equipment={equipments.find((e) => e.id === req.equipmentId)}
                      characterName={char?.name ?? "Unknown"}
                      chaScore={char?.abilityScores?.cha ?? 10}
                      priceMultiplier={shop.priceMultiplier}
                      onCounter={() => openCounter(req)}
                      onReject={() => void rejectSellRequest(req.id!)}
                      onApprove={() => void approveSellRequest(req.id!)}
                    />
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </section>

        <section className={classes.pane}>
          {shop.inventoryId && selectedInventory?.id === shop.inventoryId ? (
            <>
              <MetaPanel />
              <ItemsPanel />
            </>
          ) : (
            <div className={styles.itemsEmpty}>
              <Loader color="neon" size="sm" />
            </div>
          )}
        </section>
      </div>

      <BaseModal
        opened={!!counterTarget}
        onClose={() => setCounterRequestId(null)}
        title="Counter Offer"
        size="sm"
        loading={counterBusy}
        onSave={submitCounter}
        saveLabel="Send Counter"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {counterTarget?.isTrade
              ? `The player offered a trade where ${(counterTarget.offeredPriceGp ?? 0) < 0 ? "the shop pays" : "they pay"}`
              : counterTarget?.isHaggle ? "The player wants to buy for" : "The player wants to sell for"}{" "}
            <b>{formatSilverToDisplay(Math.round(Math.abs(counterTarget?.offeredPriceGp ?? 0) * 100))}</b>. Name your price; they can accept or walk away.
          </Text>
          {counterTarget?.isTrade && (
            <SimpleGrid cols={2} spacing="xs">
              <button type="button" className={!counterShopPays ? "glass-btn-primary" : "glass-btn-secondary"} onClick={() => setCounterShopPays(false)} aria-pressed={!counterShopPays}>
                Player pays
              </button>
              <button type="button" className={counterShopPays ? "glass-btn-primary" : "glass-btn-secondary"} onClick={() => setCounterShopPays(true)} aria-pressed={counterShopPays}>
                Shop pays
              </button>
            </SimpleGrid>
          )}
          <SimpleGrid cols={2} spacing="xs">
            <NumberInput label="Gold (gp)" value={counterGp} onChange={(v) => setCounterGp(Number(v) || 0)} min={0} />
            <NumberInput label="Silver (sp)" value={counterSp} onChange={(v) => setCounterSp(Number(v) || 0)} min={0} max={99} />
          </SimpleGrid>
        </Stack>
      </BaseModal>
    </div>
  );
}
