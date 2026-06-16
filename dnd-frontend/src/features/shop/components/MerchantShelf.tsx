import { Box, Card, Title, Text, Stack, Group, Badge, ActionIcon, Button, Menu } from "@mantine/core";
import { IconSearch, IconDotsVertical, IconPackage, IconBuildingStore } from "@tabler/icons-react";
import type { Shop } from "@appTypes/Shop/Shop";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import { SectionColor } from "@appTypes/SectionColor";
import { formatCostToDisplay } from "@utils/currencyConverter";
import classes from "../styles/ShopkeeperPage.module.css";

interface MerchantShelfProps {
    shopInventory: Inventory | null | undefined;
    equipments: any[];
    activeShop: Shop;
    handleDetailsOpen: (id: string) => void;
    handleStealOpen: (id: string) => void;
    handleBuyOpen: (id: string) => void;
}

export function MerchantShelf({
    shopInventory,
    equipments,
    activeShop,
    handleDetailsOpen,
    handleStealOpen,
    handleBuyOpen,
}: MerchantShelfProps) {
    const items = shopInventory?.items || [];

    return (
        <Card p="xs" bg="rgba(15, 12, 10, 0.45)" style={{ border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}>
            <Title order={3} c="amber.5" mb="xs" size="h5" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Merchant Shelves</Title>
            {items.length === 0 ? (
                <Text c="dimmed" size="xs" py="md">The merchant's shelves are currently bare.</Text>
            ) : (
                <Stack gap="xs">
                    {items.map((item: any) => {
                        const eqData = equipments.find((e: any) => e.id === item.equipmentId);
                        if (!eqData) return null;

                        const displayCost = formatCostToDisplay(eqData.cost, activeShop.priceMultiplier);

                        return (
                            <Card key={item.equipmentId} bg="rgba(0,0,0,0.3)" p="xs" style={{ border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6 }}>
                                <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                                    <Group gap="sm" style={{ flex: "1 1 200px", overflow: "hidden" }} wrap="nowrap" align="center">
                                        {/* [PRICE] Placard */}
                                        <Box className={classes.pricePlacard}>
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
                        );
                    })}
                </Stack>
            )}
        </Card>
    );
}
