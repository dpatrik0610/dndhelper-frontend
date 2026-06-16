import { useEffect, useState } from "react";
import { Container, SimpleGrid, Text, Center, Loader } from "@mantine/core";
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

import classes from "./styles/ShopkeeperPage.module.css";

export default function ShopkeeperPage() {
    const { shops, loadShops, loading, buyItem, submitSellRequest } = useShopStore();
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

    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [selectedDetailsEquipmentId, setSelectedDetailsEquipmentId] = useState<string | null>(null);
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [stealQuantity, setStealQuantity] = useState(1);

    const [sellQuantity, setSellQuantity] = useState(1);
    const [askedGp, setAskedGp] = useState<number>(0);
    const [askedSp, setAskedSp] = useState<number>(0);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);

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

            // Re-fetch inventories immediately to keep client responsive
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

            // Re-fetch player inventories safely without wiping shop stock!
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

    if (!activeCharacter) {
        return <Center mt="20vh"><Text c="dimmed">No active character selected.</Text></Center>;
    }

    if (loading && shops.length === 0) {
        return <Center mt="20vh"><Loader color="indigo" /></Center>;
    }

    return (
        <div className={classes.wrapper}>
            <Container fluid style={{ maxWidth: "100%" }} p={0}>
                {/* SHOP PLACARD HEADER */}
                <ShopkeeperHeader
                    visibleShops={visibleShops}
                    activeShop={activeShop || null}
                    selectedShopId={selectedShopId}
                    setSelectedShopId={setSelectedShopId}
                    handleRefresh={handleRefresh}
                    refreshing={refreshing}
                />

                {/* NO SHOPS AVAILABLE EMPTY STATE */}
                {visibleShops.length === 0 && <EmptyMarketplace />}

                {!activeShop && selectedShopId && (
                     <Text c="amber.5" size="xs" ta="center" py="xl">Loading shop stock...</Text>
                )}

                {activeShop && (
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
                        {/* MERCHANT SHELF (BUY) */}
                        <MerchantShelf
                            shopInventory={shopInventory}
                            equipments={equipments}
                            activeShop={activeShop}
                            handleDetailsOpen={handleDetailsOpen}
                            handleStealOpen={handleStealOpen}
                            handleBuyOpen={handleBuyOpen}
                        />

                        {/* YOUR SATCHEL (SELL) */}
                        <AdventureBag
                            activeCharacter={activeCharacter}
                            inventories={inventories}
                            playerInventory={playerInventory}
                            selectedInventoryId={selectedInventoryId}
                            setSelectedInventoryId={setSelectedInventoryId}
                            equipments={equipments}
                            handleDetailsOpen={handleDetailsOpen}
                            handleSellOpen={handleSellOpen}
                        />
                    </SimpleGrid>
                )}

                {/* BUY MODAL */}
                <BuyModal
                    opened={buyModalOpen}
                    onClose={() => setBuyModalOpen(false)}
                    buyQuantity={buyQuantity}
                    setBuyQuantity={setBuyQuantity}
                    executeBuy={executeBuy}
                    actionLoading={actionLoading}
                />

                {/* SELL MODAL */}
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

                {/* STEAL MODAL */}
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

                <EquipmentModal 
                    opened={detailsModalOpen} 
                    onClose={() => setDetailsModalOpen(false)} 
                    equipmentId={selectedDetailsEquipmentId} 
                />
            </Container>
        </div>
    );
}
