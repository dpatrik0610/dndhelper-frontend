import { useEffect, useState } from "react";
import { Container, Title, Text, SimpleGrid, Card, Group, Stack, Button, Select, NumberInput, Modal, Loader, Center, Box, Divider, Badge, ActionIcon, ThemeIcon } from "@mantine/core";
import { IconBuildingStore, IconSearch, IconCoins } from "@tabler/icons-react";
import { useShopStore } from "@store/shop/shopStore";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { getInventory, getInventoriesByCharacter } from "@services/inventoryService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { CharacterCurrencyArea } from "@features/profile/components/CharacterCurrencyArea";
import { formatCostToDisplay } from "@utils/currencyConverter";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";

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

    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [selectedDetailsEquipmentId, setSelectedDetailsEquipmentId] = useState<string | null>(null);
    const [buyQuantity, setBuyQuantity] = useState(1);

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
        if (visibleShops.length === 1 && selectedShopId !== visibleShops[0].id) {
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

    if (!activeCharacter) {
        return <Center mt="20vh"><Text c="dimmed">No active character selected.</Text></Center>;
    }

    if (loading && shops.length === 0) {
        return <Center mt="20vh"><Loader color="indigo" /></Center>;
    }

    return (
        <div style={{
            margin: "-16px",
            minHeight: "100vh",
            padding: "16px 8px",
            background: "radial-gradient(circle at 50% 20%, #1e1b18 0%, #0a0807 100%)",
            color: "#e2e8f0",
            fontFamily: "inherit"
        }}>
            <Container fluid style={{ maxWidth: "100%" }} p={0}>
                {/* SHOP PLACARD HEADER */}
                <Card p="xs" mb="xs" bg="rgba(24, 20, 18, 0.65)" style={{ border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                    <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                        <Group gap="xs">
                            <ThemeIcon size="lg" variant="light" color="yellow" radius="md">
                                <IconBuildingStore size={22} />
                            </ThemeIcon>
                            <div>
                                <Title order={2} c="white" size="h3" style={{ textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "inherit" }}>The Shopkeeper</Title>
                                <Text size="xs" c="amber.5">A quiet marketplace to trade your gear</Text>
                            </div>
                        </Group>
                        {activeCharacter && (
                            <Box bg="rgba(0,0,0,0.3)" p="xs" style={{ borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                                <Group gap="xs">
                                    <IconCoins size={16} color="#fbbf24" />
                                    <CharacterCurrencyArea
                                        character={activeCharacter}
                                        containerStyle={{
                                            background: "transparent",
                                            border: "none",
                                            boxShadow: "none",
                                            padding: 0,
                                        }}
                                    />
                                </Group>
                            </Box>
                        )}
                    </Group>
                </Card>

                {/* NO SHOPS AVAILABLE EMPTY STATE */}
                {visibleShops.length === 0 && (
                    <Center style={{ minHeight: "60vh" }}>
                        <Stack align="center" gap="sm" style={{ maxWidth: 360, textAlign: "center" }}>
                            <ThemeIcon size="xl" variant="light" color="orange" radius="xl" style={{ border: "1px solid rgba(234, 88, 12, 0.2)" }}>
                                <IconBuildingStore size={26} />
                            </ThemeIcon>
                            <Text fw={700} size="md" c="white" style={{ textTransform: "uppercase", letterSpacing: 1 }}>The Marketplace is Quiet</Text>
                            <Text size="xs" c="dimmed">
                                There are no open shops in this campaign at the moment. Trade stalls will appear here once DMs open them.
                            </Text>
                        </Stack>
                    </Center>
                )}

                {/* SHOP SELECTION TILES */}
                {visibleShops.length > 1 && (
                    <Box mb="sm">
                        <Text size="xs" fw={700} c="amber.5" mb="xs" style={{ letterSpacing: 1, textTransform: "uppercase" }}>Select a Shop to Visit</Text>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="xs">
                            {shops.map(s => {
                                const isSelected = s.id === selectedShopId;
                                return (
                                    <Card 
                                        key={s.id}
                                        p="xs"
                                        bg={isSelected ? "rgba(245, 158, 11, 0.15)" : "rgba(20, 17, 15, 0.5)"}
                                        onClick={() => setSelectedShopId(s.id!)}
                                        withBorder
                                        style={{ 
                                            cursor: "pointer", 
                                            borderColor: isSelected ? "#f59e0b" : "rgba(255,255,255,0.05)",
                                            boxShadow: isSelected ? "0 0 10px rgba(245, 158, 11, 0.2)" : "none",
                                            transition: "all 0.2s ease",
                                            borderRadius: 6
                                        }}
                                    >
                                        <Group justify="space-between" align="center" wrap="nowrap">
                                            <div style={{ overflow: "hidden" }}>
                                                <Text fw={600} c="white" size="xs" lineClamp={1}>{s.name}</Text>
                                                <Text size="xs" c="dimmed" lineClamp={1}>{s.description || "Trade items on the shelf."}</Text>
                                            </div>
                                            {isSelected && <Badge color="yellow" variant="filled" size="xs">Visiting</Badge>}
                                        </Group>
                                    </Card>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                )}

                {!activeShop && selectedShopId && (
                     <Text c="amber.5" size="xs" ta="center" py="xl">Loading shop stock...</Text>
                )}

                {activeShop && (
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xs">
                        {/* MERCHANT SHELF (BUY) */}
                        <Card p="xs" bg="rgba(15, 12, 10, 0.45)" style={{ border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}>
                            <Title order={3} c="amber.5" mb="xs" size="h5" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Merchant Shelves</Title>
                            {(!shopInventory || !shopInventory.items || shopInventory.items.length === 0) ? (
                                <Text c="dimmed" size="xs" py="md">The merchant's shelves are currently bare.</Text>
                            ) : (
                                <Stack gap="xs">
                                    {shopInventory.items.map((item: any) => {
                                        const eqData = equipments.find((e: any) => e.id === item.equipmentId);
                                        if(!eqData) return null;

                                        const displayCost = formatCostToDisplay(eqData.cost, activeShop.priceMultiplier);

                                        return (
                                            <Card key={item.equipmentId} bg="rgba(0,0,0,0.3)" p="xs" style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6 }}>
                                                <Group justify="space-between" wrap="nowrap" gap="xs">
                                                    <div style={{ overflow: "hidden" }}>
                                                        <Text fw={600} c="white" size="sm" lineClamp={1}>{item.equipmentName || eqData.name}</Text>
                                                        <Group gap="xs">
                                                            <Text size="xs" c="dimmed">Stock: {item.quantity}</Text>
                                                            <Badge size="xs" color="yellow" variant="outline" style={{ border: "1px solid rgba(245,158,11,0.3)" }}>
                                                                {displayCost}
                                                            </Badge>
                                                        </Group>
                                                    </div>
                                                    <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                                                        <ActionIcon size="md" variant="subtle" color="amber" onClick={() => handleDetailsOpen(item.equipmentId!)} title="Inspect properties">
                                                            <IconSearch size={18} />
                                                        </ActionIcon>
                                                        <Button 
                                                            size="xs" 
                                                            variant="filled" 
                                                            color="yellow" 
                                                            onClick={() => handleBuyOpen(item.equipmentId!)}
                                                            styles={{ root: { backgroundColor: "#fbbf24", color: "#1e1b18", fontWeight: 700, "&:hover": { backgroundColor: "#f59e0b" } } }}
                                                        >
                                                            Buy
                                                        </Button>
                                                    </Group>
                                                </Group>
                                            </Card>
                                        )
                                    })}
                                </Stack>
                            )}
                        </Card>

                        {/* YOUR SATCHEL (SELL) */}
                        <Card p="xs" bg="rgba(15, 12, 10, 0.45)" style={{ border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}>
                             <Group justify="space-between" mb="xs" wrap="nowrap" gap="xs">
                                 <Title order={3} c="amber.5" size="h5" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Your Adventure Bag</Title>
                                 {(activeCharacter?.inventoryIds && activeCharacter.inventoryIds.length > 1) && (() => {
                                     const selectData = activeCharacter.inventoryIds
                                         .map(id => {
                                             const inv = inventories.find(i => i.id === id);
                                             return inv ? { value: id, label: inv.name } : null;
                                         })
                                         .filter((opt): opt is { value: string; label: string } => opt !== null);

                                     if (selectData.length <= 1) return null;

                                     return (
                                         <Select
                                             size="xs"
                                             data={selectData}
                                             value={selectedInventoryId}
                                             onChange={setSelectedInventoryId}
                                             styles={{
                                                 input: { backgroundColor: "rgba(0,0,0,0.35)", color: "white", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", height: "24px" }
                                             }}
                                         />
                                     );
                                 })()}
                             </Group>
                             {(!playerInventory || !playerInventory.items || playerInventory.items.length === 0) ? (
                                <Text c="dimmed" size="xs" py="md">Your satchel is empty.</Text>
                            ) : (
                                <Stack gap="xs">
                                    {playerInventory.items.map((item: any) => {
                                         const eqData = equipments.find((e: any) => e.id === item.equipmentId);

                                         return (
                                             <Card key={item.equipmentId} bg="rgba(0,0,0,0.3)" p="xs" style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6 }}>
                                                 <Group justify="space-between" wrap="nowrap" gap="xs">
                                                     <div style={{ overflow: "hidden" }}>
                                                         <Text fw={600} c="white" size="sm" lineClamp={1}>{item.equipmentName || eqData?.name}</Text>
                                                         <Text size="xs" c="dimmed">Carried: {item.quantity}</Text>
                                                     </div>
                                                     <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                                                         <ActionIcon size="md" variant="subtle" color="amber" onClick={() => handleDetailsOpen(item.equipmentId!)} title="Inspect properties">
                                                             <IconSearch size={18} />
                                                         </ActionIcon>
                                                         <Button 
                                                             size="xs" 
                                                             variant="filled" 
                                                             color="orange" 
                                                             onClick={() => handleSellOpen(item.equipmentId!)}
                                                             styles={{ root: { backgroundColor: "#ea580c", color: "white", fontWeight: 700, "&:hover": { backgroundColor: "#c2410c" } } }}
                                                         >
                                                             Sell
                                                         </Button>
                                                     </Group>
                                                 </Group>
                                             </Card>
                                         );
                                    })}
                                </Stack>
                            )}
                        </Card>
                    </SimpleGrid>
                )}

                {/* BUY MODAL */}
                <Modal 
                    opened={buyModalOpen} 
                    onClose={() => setBuyModalOpen(false)} 
                    title="Purchase Item" 
                    centered
                    styles={{
                        content: {
                            background: "rgba(22, 19, 17, 0.92)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.7)",
                            color: "white"
                        },
                        header: {
                            background: "transparent",
                            color: "white"
                        },
                        title: {
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            color: "white"
                        },
                        close: {
                            color: "rgba(255, 255, 255, 0.5)",
                            "&:hover": {
                                color: "white",
                                backgroundColor: "rgba(255, 255, 255, 0.05)"
                            }
                        }
                    }}
                >
                     <Stack gap="md">
                         <Text size="sm" c="gray.4">How many would you like to buy?</Text>
                         <NumberInput 
                             value={buyQuantity} 
                             onChange={(v) => setBuyQuantity(Number(v))} 
                             min={1} 
                             styles={{
                                 input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                             }}
                         />
                         <Button color="yellow" onClick={executeBuy} loading={actionLoading} styles={{ root: { backgroundColor: "#fbbf24", color: "#1e1b18", fontWeight: 700, "&:hover": { backgroundColor: "#f59e0b" } } }}>
                             Confirm Purchase
                         </Button>
                     </Stack>
                </Modal>

                 {/* SELL MODAL */}
                 <Modal 
                     opened={sellModalOpen} 
                     onClose={() => setSellModalOpen(false)} 
                     title="Offer Item for Sale" 
                     centered
                     styles={{
                         content: {
                             background: "rgba(22, 19, 17, 0.92)",
                             backdropFilter: "blur(20px)",
                             border: "1px solid rgba(245, 158, 11, 0.25)",
                             boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.7)",
                             color: "white"
                         },
                         header: {
                             background: "transparent",
                             color: "white"
                         },
                         title: {
                             fontWeight: 700,
                             fontSize: "1.1rem",
                             color: "white"
                         },
                         close: {
                             color: "rgba(255, 255, 255, 0.5)",
                             "&:hover": {
                                 color: "white",
                                 backgroundColor: "rgba(255, 255, 255, 0.05)"
                             }
                         }
                     }}
                 >
                     <Stack gap="md">
                         <Text size="sm" c="gray.4">
                             The item will be removed from your bag and placed in escrow until the DM approves or rejects the sale.
                         </Text>

                         <Divider color="rgba(245, 158, 11, 0.15)" />

                         <NumberInput 
                             label="Quantity to Sell" 
                             value={sellQuantity} 
                             onChange={(v) => setSellQuantity(Number(v))} 
                             min={1} 
                             styles={{
                                 input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                             }}
                         />

                         <SimpleGrid cols={2} spacing="xs">
                             <NumberInput 
                                 label="Asked Gold (gp)" 
                                 value={askedGp} 
                                 onChange={(v) => setAskedGp(Number(v))} 
                                 min={0}
                                 styles={{
                                     input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                                 }}
                             />
                             <NumberInput 
                                 label="Asked Silver (sp)" 
                                 value={askedSp} 
                                 onChange={(v) => setAskedSp(Number(v))} 
                                 min={0}
                                 max={99}
                                 styles={{
                                     input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(245, 158, 11, 0.1)" }
                                 }}
                             />
                         </SimpleGrid>

                         <Button color="orange" onClick={executeSell} loading={actionLoading} mt="sm" styles={{ root: { backgroundColor: "#ea580c", color: "white", fontWeight: 700, "&:hover": { backgroundColor: "#c2410c" } } }}>
                             Submit Offer
                         </Button>
                     </Stack>
                </Modal>

                <EquipmentModal 
                    opened={detailsModalOpen} 
                    onClose={() => setDetailsModalOpen(false)} 
                    equipmentId={selectedDetailsEquipmentId} 
                />
                </Container>
                </div>
                );
                }