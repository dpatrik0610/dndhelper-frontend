import { useEffect, useState } from "react";
import { Container, SimpleGrid, Text, Center, Skeleton, Stack } from "@mantine/core";
import { CardGridSkeleton } from "@components/common/Skeletons";
import { useShopStore } from "@store/shop/shopStore";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { getInventory, getInventoriesByCharacter } from "@services/inventoryService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";

import { ShopkeeperHeader } from "./components/ShopkeeperHeader";
import { EmptyMarketplace } from "./components/EmptyMarketplace";
import { MerchantShelf } from "./components/MerchantShelf";
import { AdventureBag } from "./components/AdventureBag";
import { BuyModal } from "./components/BuyModal";
import { SellModal } from "./components/SellModal";
import { StealModal } from "./components/StealModal";
import { HaggleModal } from "./components/HaggleModal";
import { CounterOffersPanel } from "./components/CounterOffersPanel";
import { OfferPanel, OfferSummaryBar } from "./components/OfferPanel";
import { isCountered } from "@appTypes/Shop/Shop";
import { Switch } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";
import { convertCostToSilver } from "@utils/currencyConverter";
import { offerKey, type OfferLine, type OfferPicker } from "@features/shop/offer";

import classes from "./styles/ShopkeeperPage.module.css";

export default function ShopkeeperPage() {
    const { shops, loadShops, loading, buyItem, submitSellRequest, myRequests, loadMyRequests, respondToCounterOffer } = useShopStore();
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const activeCharacter = useCurrentCharacter();
    const inventories = useInventoryStore(s => s.inventories);
    const setInventories = useInventoryStore(s => s.setInventories);
    const addInventory = useInventoryStore(s => s.addInventory);
    const updateInventory = useInventoryStore(s => s.updateInventory);
    const { loadAll, equipments } = useAdminEquipmentStore();

    const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
    const [buyModalOpen, setBuyModalOpen] = useState(false);
    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [stealModalOpen, setStealModalOpen] = useState(false);
    const [haggleModalOpen, setHaggleModalOpen] = useState(false);

    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [selectedDetailsEquipmentId, setSelectedDetailsEquipmentId] = useState<string | null>(null);
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [stealQuantity, setStealQuantity] = useState(1);

    const [sellQuantity, setSellQuantity] = useState(1);
    const [askedGp, setAskedGp] = useState<number>(0);
    const [askedSp, setAskedSp] = useState<number>(0);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);

    const isMobile = useIsMobile();
    const [mobileTab, setMobileTab] = useState<"merchant" | "bag" | "offer">("merchant");
    const [offerMode, setOfferMode] = useState(false);
    const [offerLines, setOfferLines] = useState<Record<string, OfferLine>>({});

    const selectShop = (id: string | null) => {
        setSelectedShopId(id);
        setOfferLines({});
    };

    const offerPicker: OfferPicker = {
        picked: (side, equipmentId, sourceInventoryId) => offerLines[offerKey(side, equipmentId, sourceInventoryId)]?.quantity ?? 0,
        set: (line) => setOfferLines(prev => {
            const key = offerKey(line.side, line.equipmentId, line.sourceInventoryId);
            const next = { ...prev };
            const quantity = line.max != null ? Math.min(line.quantity, line.max) : line.quantity;
            if (quantity > 0) next[key] = { ...line, quantity };
            else delete next[key];
            return next;
        }),
    };

    const visibleShops = shops.filter(s => s.isOpened);
    const activeShop = selectedShopId ? visibleShops.find(s => s.id === selectedShopId) : null;
    const shopInventory = activeShop?.inventoryId ? inventories.find(i => i.id === activeShop.inventoryId) : null;

    useEffect(() => {
        if (activeCharacter?.campaignId) {
            loadShops(activeCharacter.campaignId);
        }
        if (equipments.length === 0) {
            loadAll();
        }
    }, [activeCharacter?.campaignId, loadShops, loadAll, equipments.length]);

    useEffect(() => {
        if (activeCharacter?.id) {
            void loadMyRequests(activeCharacter.id);
        }
    }, [activeCharacter?.id, loadMyRequests]);

    useEffect(() => {
        if (activeCharacter?.id) {
            getInventoriesByCharacter(activeCharacter.id)
                .then(data => setInventories(data))
                .catch(err => console.error("Failed to load player inventories", err));
        }
    }, [activeCharacter?.id, setInventories]);

    useEffect(() => {
        if (activeShop?.inventoryId) {
            getInventory(activeShop.inventoryId).then(data => {
                const exists = useInventoryStore.getState().inventories.some(i => i.id === data.id);
                if (exists) {
                    updateInventory({ ...data, id: data.id! });
                } else {
                    addInventory(data);
                }
            }).catch(err => {
                console.error("Failed to load shop inventory", err);
            });
        }
    }, [activeShop?.inventoryId, addInventory, updateInventory]);

    useEffect(() => {
        if (activeCharacter?.inventoryIds && activeCharacter.inventoryIds.length > 0 && !selectedInventoryId) {
            setSelectedInventoryId(activeCharacter.inventoryIds[0]);
        }
    }, [activeCharacter?.inventoryIds, selectedInventoryId]);

    useEffect(() => {
        if (visibleShops.length > 0 && !selectedShopId) {
            setSelectedShopId(visibleShops[0].id!);
        }
    }, [visibleShops, selectedShopId]);

    useEffect(() => {
        if (selectedShopId && !visibleShops.some(s => s.id === selectedShopId)) {
            setSelectedShopId(null);
        }
    }, [selectedShopId, visibleShops]);

    const playerInventory = selectedInventoryId ? inventories.find(i => i.id === selectedInventoryId) : null;

    const refreshPlayerInventories = async () => {
        if (!activeCharacter?.id) return;
        try {
            const data = await getInventoriesByCharacter(activeCharacter.id);
            data.forEach(inv => {
                const exists = useInventoryStore.getState().inventories.some(i => i.id === inv.id);
                if (exists) {
                    updateInventory({ ...inv, id: inv.id! });
                } else {
                    addInventory(inv);
                }
            });
        } catch (err) {
            console.error("Failed to refresh player inventories", err);
        }
    };

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        if (!activeCharacter) return;
        setRefreshing(true);
        try {
            if (activeCharacter.campaignId) {
                await loadShops(activeCharacter.campaignId);
            }
            await refreshPlayerInventories();
            if (activeShop?.inventoryId) {
                const data = await getInventory(activeShop.inventoryId);
                const exists = useInventoryStore.getState().inventories.some(i => i.id === data.id);
                if (exists) {
                    updateInventory({ ...data, id: data.id! });
                } else {
                    addInventory(data);
                }
            }
            showNotification({ title: "Shopkeeper Refreshed", message: "Shops and inventories updated successfully.", color: SectionColor.Green });
        } catch (err) {
            console.error("Failed to refresh shopkeeper data", err);
            showNotification({ title: "Refresh Failed", message: "Failed to update shops and inventories.", color: SectionColor.Red });
        } finally {
            setRefreshing(false);
        }
    };

    const handleDetailsOpen = (equipmentId: string) => {
         setSelectedDetailsEquipmentId(equipmentId);
         setDetailsModalOpen(true);
    };

    const handleBuyOpen = (equipmentId: string) => {
         setSelectedEquipmentId(equipmentId);
         setBuyQuantity(1);
         setBuyModalOpen(true);
    };

    const handleSellOpen = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId);
        setSellQuantity(1);
        setAskedGp(0);
        setAskedSp(0);
        setSellModalOpen(true);
   };

    const executeBuy = async () => {
        if(!activeShop || !selectedEquipmentId || !activeCharacter) return;
        setActionLoading(true);
        const success = await buyItem(activeShop.id!, {
             buyerCharacterId: activeCharacter.id!,
             equipmentId: selectedEquipmentId,
             quantity: buyQuantity
        });
        if(success) {
            showNotification({ title: "Purchase Complete", message: "Item added to your bag.", color: SectionColor.Green });
            setBuyModalOpen(false);

            if (activeShop?.inventoryId) {
                getInventory(activeShop.inventoryId).then(data => updateInventory({ ...data, id: data.id! })).catch(console.error);
            }
            void refreshPlayerInventories();
        }
        setActionLoading(false);
    };

    const executeSell = async () => {
        if(!activeShop || !selectedEquipmentId || !activeCharacter) return;
        setActionLoading(true);
        try {
            const totalOfferedPriceGp = askedGp + (askedSp / 100);
            await submitSellRequest({
                campaignId: activeCharacter.campaignId!,
                shopId: activeShop.id!,
                characterId: activeCharacter.id!,
                equipmentId: selectedEquipmentId,
                sourceInventoryId: selectedInventoryId || undefined,
                quantity: sellQuantity,
                offeredPriceGp: totalOfferedPriceGp
            });
            showNotification({ title: "Request Sent", message: "Item placed in escrow awaiting DM approval.", color: SectionColor.Green });
            setSellModalOpen(false);

            void refreshPlayerInventories();
        } catch(e) {
            // Error handled in store
        }
        setActionLoading(false);
    };

    const handleStealOpen = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId);
        setStealQuantity(1);
        setStealModalOpen(true);
    };

    const executeSteal = async () => {
        if(!activeShop || !selectedEquipmentId || !activeCharacter) return;
        setActionLoading(true);
        try {
            await submitSellRequest({
                campaignId: activeCharacter.campaignId!,
                shopId: activeShop.id!,
                characterId: activeCharacter.id!,
                equipmentId: selectedEquipmentId,
                sourceInventoryId: selectedInventoryId || undefined,
                quantity: stealQuantity,
                offeredPriceGp: 0,
                isSteal: true
            });
            showNotification({ title: "Steal Attempt Placed", message: "Your steal request has been logged. DM approval is required.", color: SectionColor.Orange });
            setStealModalOpen(false);

            if (activeShop?.inventoryId) {
                getInventory(activeShop.inventoryId).then(data => updateInventory({ ...data, id: data.id! })).catch(console.error);
            }
        } catch(e) {
            // Error handled in store
        }
        setActionLoading(false);
    };

    const handleHaggleOpen = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId);
        setHaggleModalOpen(true);
    };

    const executeHaggle = async (quantity: number, offeredPriceGp: number) => {
        if(!activeShop || !selectedEquipmentId || !activeCharacter) return;
        setActionLoading(true);
        try {
            await submitSellRequest({
                campaignId: activeCharacter.campaignId!,
                shopId: activeShop.id!,
                characterId: activeCharacter.id!,
                equipmentId: selectedEquipmentId,
                sourceInventoryId: selectedInventoryId || undefined,
                quantity,
                offeredPriceGp,
                isHaggle: true
            });
            showNotification({ title: "Offer Made", message: "The shopkeeper is considering your offer.", color: SectionColor.Green });
            setHaggleModalOpen(false);
        } catch(e) {
            showNotification({ title: "Offer Refused", message: e instanceof Error ? e.message : "Could not place your offer.", color: SectionColor.Red });
        }
        setActionLoading(false);
    };

    const offerList = Object.values(offerLines);
    const offerFairValueSp = offerList.reduce((sum, line) => {
        const baseSp = convertCostToSilver(equipments.find(e => e.id === line.equipmentId)?.cost);
        return line.side === "want"
            ? sum + Math.round(baseSp * (activeShop?.priceMultiplier ?? 1)) * line.quantity
            : sum - baseSp * line.quantity;
    }, 0);

    const executeTrade = async (offeredPriceGp: number) => {
        if (!activeShop || !activeCharacter || offerList.length === 0) return false;
        setActionLoading(true);
        try {
            const toTradeItem = (line: OfferLine) => ({ equipmentId: line.equipmentId, quantity: line.quantity, sourceInventoryId: line.sourceInventoryId });
            await submitSellRequest({
                campaignId: activeCharacter.campaignId!,
                shopId: activeShop.id!,
                characterId: activeCharacter.id!,
                sourceInventoryId: selectedInventoryId || undefined,
                quantity: 1,
                offeredPriceGp,
                isTrade: true,
                giveItems: offerList.filter(l => l.side === "give").map(toTradeItem),
                wantItems: offerList.filter(l => l.side === "want").map(toTradeItem),
            });
            showNotification({ title: "Offer Sent", message: "The shopkeeper is looking over your offer.", color: SectionColor.Green });
            setOfferLines({});
            setOfferMode(false);
            void refreshPlayerInventories();
            return true;
        } catch (e) {
            showNotification({ title: "Offer Refused", message: e instanceof Error ? e.message : "Could not send your offer.", color: SectionColor.Red });
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const handleCounterResponse = async (id: string, accept: boolean) => {
        setRespondingId(id);
        if (await respondToCounterOffer(id, accept)) {
            showNotification({ title: accept ? "Deal!" : "Counter Declined", message: accept ? "The trade went through." : "You walked away from the deal.", color: accept ? SectionColor.Green : SectionColor.Orange });
            void refreshPlayerInventories();
            if (activeShop?.inventoryId) {
                getInventory(activeShop.inventoryId).then(data => updateInventory({ ...data, id: data.id! })).catch(console.error);
            }
        }
        setRespondingId(null);
    };

    const tab = mobileTab === "offer" && !offerMode ? "merchant" : mobileTab;
    const tabs = offerMode ? (["merchant", "bag", "offer"] as const) : (["merchant", "bag"] as const);
    const tabLabel = { merchant: "Merchant", bag: "Your bag", offer: `Offer${offerList.length ? ` (${offerList.length})` : ""}` };

    if (!activeCharacter) {
        return <Center mt="20vh"><Text c="dimmed">No active character selected.</Text></Center>;
    }

    if (loading && shops.length === 0) {
        return (
            <Stack gap="md" p="xs">
                <Skeleton h={72} radius="md" />
                <CardGridSkeleton count={2} cols={{ base: 1, md: 2 }} height={420} />
            </Stack>
        );
    }

    return (
        <div className={classes.wrapper}>
            <Container fluid style={{ maxWidth: "100%" }} p={0}>
                <ShopkeeperHeader
                    visibleShops={visibleShops}
                    activeShop={activeShop || null}
                    selectedShopId={selectedShopId}
                    setSelectedShopId={selectShop}
                    handleRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                <CounterOffersPanel
                    requests={myRequests.filter(isCountered)}
                    shops={shops}
                    equipments={equipments}
                    busyId={respondingId}
                    onRespond={handleCounterResponse}
                />

                {visibleShops.length === 0 && <EmptyMarketplace />}

                {!activeShop && selectedShopId && (
                    <CardGridSkeleton count={2} cols={{ base: 1, md: 2 }} height={420} />
                )}

                {activeShop && (
                    <>
                        <div className={classes.toolbar}>
                            {isMobile && (
                                <div className={classes.tabs} role="tablist" aria-label="Shelves">
                                    {tabs.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            role="tab"
                                            aria-selected={tab === t}
                                            className={`${tab === t ? "glass-btn-primary" : "glass-btn-secondary"} ${classes.tab}`}
                                            onClick={() => setMobileTab(t)}
                                        >
                                            {tabLabel[t]}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <Switch
                                label="Offer mode"
                                checked={offerMode}
                                onChange={e => setOfferMode(e.currentTarget.checked)}
                                classNames={{ root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" }}
                                styles={{ label: { color: "var(--theme-color-text-primary, #fff)", fontSize: 13 } }}
                                className={classes.offerSwitch}
                            />
                        </div>

                        {offerMode && (!isMobile || tab === "offer") && (
                            <OfferPanel
                                lines={offerList}
                                equipments={equipments}
                                priceMultiplier={activeShop.priceMultiplier}
                                fairValueSp={offerFairValueSp}
                                busy={actionLoading}
                                onSet={offerPicker.set}
                                onClear={() => setOfferLines({})}
                                onSubmit={executeTrade}
                            />
                        )}

                        {(!isMobile || tab !== "offer") && (
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                            {(!isMobile || tab === "merchant") && (
                                <MerchantShelf
                                    shopInventory={shopInventory}
                                    equipments={equipments}
                                    activeShop={activeShop}
                                    handleDetailsOpen={handleDetailsOpen}
                                    handleStealOpen={handleStealOpen}
                                    handleBuyOpen={handleBuyOpen}
                                    handleHaggleOpen={handleHaggleOpen}
                                    offer={offerMode ? offerPicker : undefined}
                                />
                            )}

                            {(!isMobile || tab === "bag") && (
                                <AdventureBag
                                    activeCharacter={activeCharacter}
                                    inventories={inventories}
                                    playerInventory={playerInventory}
                                    selectedInventoryId={selectedInventoryId}
                                    setSelectedInventoryId={setSelectedInventoryId}
                                    equipments={equipments}
                                    handleDetailsOpen={handleDetailsOpen}
                                    handleSellOpen={handleSellOpen}
                                    offer={offerMode ? offerPicker : undefined}
                                />
                            )}
                        </SimpleGrid>
                        )}

                        {offerMode && isMobile && tab !== "offer" && (
                            <OfferSummaryBar lines={offerList} onView={() => setMobileTab("offer")} />
                        )}
                    </>
                )}

                <BuyModal
                    opened={buyModalOpen}
                    onClose={() => setBuyModalOpen(false)}
                    buyQuantity={buyQuantity}
                    setBuyQuantity={setBuyQuantity}
                    executeBuy={executeBuy}
                    actionLoading={actionLoading}
                />

                <SellModal
                    opened={sellModalOpen}
                    onClose={() => setSellModalOpen(false)}
                    selectedEquipmentId={selectedEquipmentId}
                    equipments={equipments}
                    playerInventory={playerInventory}
                    sellQuantity={sellQuantity}
                    setSellQuantity={setSellQuantity}
                    askedGp={askedGp}
                    setAskedGp={setAskedGp}
                    askedSp={askedSp}
                    setAskedSp={setAskedSp}
                    executeSell={executeSell}
                    actionLoading={actionLoading}
                />

                <StealModal
                    opened={stealModalOpen}
                    onClose={() => setStealModalOpen(false)}
                    selectedEquipmentId={selectedEquipmentId}
                    equipments={equipments}
                    shopInventory={shopInventory}
                    stealQuantity={stealQuantity}
                    setStealQuantity={setStealQuantity}
                    executeSteal={executeSteal}
                    actionLoading={actionLoading}
                />

                <HaggleModal
                    opened={haggleModalOpen}
                    onClose={() => setHaggleModalOpen(false)}
                    selectedEquipmentId={selectedEquipmentId}
                    equipments={equipments}
                    shopInventory={shopInventory}
                    priceMultiplier={activeShop?.priceMultiplier ?? 1}
                    executeHaggle={executeHaggle}
                    actionLoading={actionLoading}
                />

                <EquipmentModal
                    opened={detailsModalOpen} 
                    onClose={() => setDetailsModalOpen(false)} 
                    equipmentId={selectedDetailsEquipmentId} 
                />
            </Container>
        </div>
    );
}
