import { useEffect, useState } from "react";
import { Container, Title, Text, SimpleGrid, Card, Group, Stack, Button, Select, NumberInput, Modal, Loader, Center, Box, Divider, Badge, ActionIcon, ThemeIcon, Menu, UnstyledButton } from "@mantine/core";
import { IconBuildingStore, IconSearch, IconChevronDown, IconDotsVertical, IconPackage, IconCoins } from "@tabler/icons-react";
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

                        {/* SHOP SELECTOR DROPDOWN */}
                        {visibleShops.length > 1 && (
                            <Box style={{ minWidth: "160px", maxWidth: "240px" }}>
                                <Menu shadow="md" width={240} position="bottom-end" styles={{
                                    dropdown: {
                                        backgroundColor: "#1c1917",
                                        border: "1px solid rgba(245, 158, 11, 0.2)",
                                        padding: "4px",
                                        borderRadius: "8px",
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
                                    },
                                    item: {
                                        backgroundColor: "transparent",
                                        padding: 0,
                                        "&[data-hovered]": {
                                            backgroundColor: "transparent"
                                        }
                                    }
                                }}>
                                    <Menu.Target>
                                        <UnstyledButton style={{
                                            backgroundColor: "rgba(245, 158, 11, 0.1)",
                                            border: "1px solid rgba(245, 158, 11, 0.25)",
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            transition: "all 0.2s ease",
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center"
                                        }}>
                                            <Group gap="xs" wrap="nowrap" align="center" justify="space-between" style={{ width: "100%" }}>
                                                <div style={{ textAlign: "left", lineHeight: 1.1 }}>
                                                    <Text fw={800} c="amber.5" style={{ letterSpacing: 0.8, fontSize: "9px", textTransform: "uppercase" }}>
                                                        {activeShop ? "VISITING" : "SELECT SHOP"}
                                                    </Text>
                                                    <Text fw={700} size="xs" c="white" lineClamp={1}>
                                                        {activeShop ? activeShop.name : "Choose Stall..."}
                                                    </Text>
                                                </div>
                                                <IconChevronDown size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                                            </Group>
                                        </UnstyledButton>
                                    </Menu.Target>

                                    <Menu.Dropdown>
                                        <Stack gap="xs" p={4}>
                                            {visibleShops.map(s => {
                                                const isSelected = s.id === selectedShopId;
                                                return (
                                                    <Menu.Item key={s.id} onClick={() => setSelectedShopId(s.id!)}>
                                                        <Card 
                                                            p="xs"
                                                            bg={isSelected ? "rgba(245, 158, 11, 0.15)" : "rgba(20, 17, 15, 0.5)"}
                                                            style={{ 
                                                                cursor: "pointer", 
                                                                width: "100%",
                                                                borderColor: isSelected ? "#f59e0b" : "rgba(255,255,255,0.05)",
                                                                boxShadow: isSelected ? "0 0 10px rgba(245, 158, 11, 0.2)" : "none",
                                                                transition: "all 0.2s ease",
                                                                borderRadius: 6,
                                                                border: "1px solid"
                                                            }}
                                                        >
                                                            <Group justify="space-between" align="center" wrap="nowrap">
                                                                <div style={{ overflow: "hidden" }}>
                                                                    <Text fw={700} c="white" size="xs" lineClamp={1}>{s.name}</Text>
                                                                    {s.description && (
                                                                        <Text size="xxs" c="dimmed" lineClamp={1}>{s.description}</Text>
                                                                    )}
                                                                </div>
                                                                {isSelected && (
                                                                    <Text fw={800} c="amber.5" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                                        Visiting
                                                                    </Text>
                                                                )}
                                                            </Group>
                                                        </Card>
                                                    </Menu.Item>
                                                );
                                            })}
                                        </Stack>
                                    </Menu.Dropdown>
                                </Menu>
                            </Box>
                        )}

                        {/* SINGLE SHOP PLACARD */}
                        {visibleShops.length === 1 && activeShop && (
                            <Box style={{
                                backgroundColor: "rgba(245, 158, 11, 0.08)",
                                border: "1px solid rgba(245, 158, 11, 0.18)",
                                padding: "8px 12px",
                                borderRadius: "6px",
                                minWidth: "120px",
                                maxWidth: "240px"
                            }}>
                                <div style={{ textAlign: "left", lineHeight: 1.1 }}>
                                    <Text fw={800} c="amber.5" style={{ letterSpacing: 0.8, fontSize: "9px", textTransform: "uppercase" }}>VISITING</Text>
                                    <Text fw={700} size="xs" c="white">{activeShop.name}</Text>
                                </div>
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
                                                <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                                                    <Group gap="sm" style={{ flex: "1 1 200px", overflow: "hidden" }} wrap="nowrap" align="center">
                                                        {/* [PRICE] Placard */}
                                                        <Box 
                                                            style={{ 
                                                                minWidth: "75px", 
                                                                textAlign: "center",
                                                                backgroundColor: "rgba(245, 158, 11, 0.12)",
                                                                border: "1px solid rgba(245, 158, 11, 0.25)",
                                                                borderRadius: "6px",
                                                                padding: "4px 8px",
                                                                flexShrink: 0
                                                            }}
                                                        >
                                                            <Text size="xs" fw={800} c="amber.5" style={{ whiteSpace: "nowrap" }}>
                                                                {displayCost}
                                                            </Text>
                                                        </Box>

                                                        {/* [NAME] */}
                                                        <div style={{ overflow: "hidden", flexGrow: 1 }}>
                                                            <Text fw={700} c="white" size="sm" lineClamp={1}>
                                                                {item.equipmentName || eqData.name}
                                                            </Text>
                                                        </div>

                                                        {/* [QUANTITY] Stock Badge */}
                                                        <Badge 
                                                            size="md" 
                                                            color="dark" 
                                                            variant="filled" 
                                                            style={{ 
                                                                color: SectionColor.Orange,
                                                                flexShrink: 0,
                                                                fontWeight: 800,
                                                                fontSize: "0.8rem",
                                                                padding: "4px 10px"
                                                            }}
                                                        >
                                                            {item.quantity} LEFT
                                                        </Badge>
                                                    </Group>

                                                    {/* ACTIONS */}
                                                    {/* Desktop Actions */}
                                                    <Group gap="xs" wrap="nowrap" visibleFrom="xs" style={{ flexShrink: 0, marginLeft: "auto" }}>
                                                        <ActionIcon size="md" variant="subtle" color="amber" onClick={() => handleDetailsOpen(item.equipmentId!)} title="Inspect properties">
                                                            <IconSearch size={18} />
                                                        </ActionIcon>
                                                        <Button 
                                                            size="xs" 
                                                            variant="light" 
                                                            color="red" 
                                                            onClick={() => handleStealOpen(item.equipmentId!)}
                                                            styles={{ root: { fontWeight: 700 } }}
                                                        >
                                                            Steal
                                                        </Button>
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

                                                    {/* Mobile 3-Dots Menu */}
                                                    <Box hiddenFrom="xs" style={{ flexShrink: 0, marginLeft: "auto" }}>
                                                        <Menu shadow="md" width={160} position="bottom-end" styles={{
                                                            dropdown: {
                                                                backgroundColor: "#1c1917",
                                                                border: "1px solid rgba(245, 158, 11, 0.2)",
                                                                padding: "4px",
                                                                borderRadius: "8px"
                                                            },
                                                            item: {
                                                                backgroundColor: "transparent",
                                                                "&[data-hovered]": {
                                                                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                                                                }
                                                            }
                                                        }}>
                                                            <Menu.Target>
                                                                <ActionIcon size="md" variant="subtle" color="amber">
                                                                    <IconDotsVertical size={18} />
                                                                </ActionIcon>
                                                            </Menu.Target>

                                                            <Menu.Dropdown>
                                                                <Stack gap="xs" p={4}>
                                                                    <Menu.Item 
                                                                        leftSection={<IconSearch size={14} color="#f59e0b" />} 
                                                                        onClick={() => handleDetailsOpen(item.equipmentId!)}
                                                                        style={{ color: "white", fontWeight: 600, fontSize: "12px" }}
                                                                    >
                                                                        Inspect
                                                                    </Menu.Item>
                                                                    <Menu.Item 
                                                                        leftSection={<IconPackage size={14} color="#ef4444" />} 
                                                                        onClick={() => handleStealOpen(item.equipmentId!)}
                                                                        style={{ color: "#f87171", fontWeight: 700, fontSize: "12px" }}
                                                                    >
                                                                        Steal
                                                                    </Menu.Item>
                                                                    <Menu.Item 
                                                                        leftSection={<IconBuildingStore size={14} color="#fbbf24" />} 
                                                                        onClick={() => handleBuyOpen(item.equipmentId!)}
                                                                        style={{ color: "#fbbf24", fontWeight: 700, fontSize: "12px" }}
                                                                    >
                                                                        Buy
                                                                    </Menu.Item>
                                                                </Stack>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Box>
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

                             {/* ACTIVE CHARACTER CURRENCY (Directly linked to their satchel/bag!) */}
                             {activeCharacter && (
                                <Box bg="rgba(0,0,0,0.22)" p="xs" mb="sm" style={{ borderRadius: 6, border: "1px solid rgba(255,255,255,0.04)" }}>
                                    <Group gap="xs" justify="center">
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
                             {(!playerInventory || !playerInventory.items || playerInventory.items.length === 0) ? (
                                <Text c="dimmed" size="xs" py="md">Your satchel is empty.</Text>
                            ) : (
                                <Stack gap="xs">
                                    {playerInventory.items.map((item: any) => {
                                         const eqData = equipments.find((e: any) => e.id === item.equipmentId);

                                         return (
                                             <Card key={item.equipmentId} bg="rgba(0,0,0,0.3)" p="xs" style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6 }}>
                                                 <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                                                     <Group gap="sm" style={{ flex: "1 1 200px", overflow: "hidden" }} wrap="nowrap" align="center">
                                                         {/* [QUANTITY] Owned Badge */}
                                                         <Badge 
                                                             size="md" 
                                                             color="dark" 
                                                             variant="filled"
                                                             style={{ 
                                                                 color: SectionColor.Orange,
                                                                 flexShrink: 0,
                                                                 fontWeight: 800,
                                                                 fontSize: "0.8rem",
                                                                 padding: "4px 10px"
                                                             }}
                                                         >
                                                             {item.quantity} Owned
                                                         </Badge>
                                                         {/* [NAME] */}
                                                         <div style={{ overflow: "hidden", flexGrow: 1 }}>
                                                             <Text fw={700} c="white" size="sm" lineClamp={1}>
                                                                 {item.equipmentName || eqData?.name}
                                                             </Text>
                                                         </div>
                                                     </Group>

                                                     {/* ACTIONS */}
                                                     {/* Desktop Actions */}
                                                     <Group gap="xs" wrap="nowrap" visibleFrom="xs" style={{ flexShrink: 0, marginLeft: "auto" }}>
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

                                                     {/* Mobile 3-Dots Menu */}
                                                     <Box hiddenFrom="xs" style={{ flexShrink: 0, marginLeft: "auto" }}>
                                                         <Menu shadow="md" width={140} position="bottom-end" styles={{
                                                             dropdown: {
                                                                 backgroundColor: "#1c1917",
                                                                 border: "1px solid rgba(245, 158, 11, 0.2)",
                                                                 padding: "4px",
                                                                 borderRadius: "8px"
                                                             },
                                                             item: {
                                                                 backgroundColor: "transparent",
                                                                 "&[data-hovered]": {
                                                                     backgroundColor: "rgba(255, 255, 255, 0.05)"
                                                                 }
                                                             }
                                                         }}>
                                                             <Menu.Target>
                                                                 <ActionIcon size="md" variant="subtle" color="amber">
                                                                     <IconDotsVertical size={18} />
                                                                 </ActionIcon>
                                                             </Menu.Target>

                                                             <Menu.Dropdown>
                                                                 <Stack gap="xs" p={4}>
                                                                     <Menu.Item 
                                                                         leftSection={<IconSearch size={14} color="#f59e0b" />} 
                                                                         onClick={() => handleDetailsOpen(item.equipmentId!)}
                                                                         style={{ color: "white", fontWeight: 600, fontSize: "12px" }}
                                                                     >
                                                                         Inspect
                                                                     </Menu.Item>
                                                                     <Menu.Item 
                                                                         leftSection={<IconCoins size={14} color="#ea580c" />} 
                                                                         onClick={() => handleSellOpen(item.equipmentId!)}
                                                                         style={{ color: "#f97316", fontWeight: 700, fontSize: "12px" }}
                                                                     >
                                                                         Sell
                                                                     </Menu.Item>
                                                                 </Stack>
                                                             </Menu.Dropdown>
                                                         </Menu>
                                                     </Box>
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
                         {selectedEquipmentId && (() => {
                             const eq = equipments.find(e => e.id === selectedEquipmentId);
                             const maxQty = playerInventory?.items?.find(i => i.equipmentId === selectedEquipmentId)?.quantity ?? 1;
                             return (
                                 <>
                                     <Text fw={700} c="white" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                         {eq?.name}
                                     </Text>
                                     <Text size="sm" c="gray.4">
                                         The item will be removed from your bag and placed in escrow until the DM approves or rejects the sale.
                                     </Text>
                                     <Text size="xs" c="dimmed">
                                         Max available to sell: {maxQty}
                                     </Text>

                                     <Divider color="rgba(245, 158, 11, 0.15)" />

                                     <NumberInput 
                                         label="Quantity to Sell" 
                                         value={sellQuantity} 
                                         onChange={(v) => setSellQuantity(Number(v))} 
                                         min={1} 
                                         max={maxQty}
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
                                 </>
                             );
                         })()}
                     </Stack>
                </Modal>

                {/* STEAL MODAL */}
                <Modal
                    opened={stealModalOpen}
                    onClose={() => setStealModalOpen(false)}
                    title="Are you REALLY SURE?"
                    centered
                    styles={{
                        content: {
                            background: "rgba(24, 15, 15, 0.95)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
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
                            color: "#f87171"
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
                        {selectedEquipmentId && (() => {
                            const eq = equipments.find(e => e.id === selectedEquipmentId);
                            const maxQty = shopInventory?.items?.find(i => i.equipmentId === selectedEquipmentId)?.quantity ?? 1;
                            return (
                                <>
                                    <Text size="sm" c="gray.3">
                                        Are you REALLY SURE you want to attempt to steal 
                                    </Text>
                                    <Text fw={700} c="white" style={{ textTransform: "uppercase", letterSpacing: 1 }} >
                                        {eq?.name} ?
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        Max available to steal: {maxQty}
                                    </Text>
                                    <NumberInput
                                        label="Quantity to Steal"
                                        value={stealQuantity}
                                        onChange={(v) => setStealQuantity(Number(v))}
                                        min={1}
                                        max={maxQty}
                                        styles={{
                                            input: { backgroundColor: "rgba(0,0,0,0.25)", color: "white", border: "1px solid rgba(239, 68, 68, 0.1)" }
                                        }}
                                    />
                                    <Button 
                                        color="red" 
                                        onClick={executeSteal} 
                                        loading={actionLoading} 
                                        mt="sm" 
                                        styles={{ 
                                            root: { 
                                                backgroundColor: "#ef4444", 
                                                color: "white", 
                                                fontWeight: 700, 
                                                "&:hover": { backgroundColor: "#dc2626" } 
                                            } 
                                        }}
                                    >
                                        Attempt Steal
                                    </Button>
                                </>
                            );
                        })()}
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