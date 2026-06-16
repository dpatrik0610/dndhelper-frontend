import { Box, Card, Group, ThemeIcon, Title, Text, Menu, UnstyledButton, Stack, ActionIcon } from "@mantine/core";
import { IconBuildingStore, IconChevronDown, IconRefresh } from "@tabler/icons-react";
import type { Shop } from "@appTypes/Shop/Shop";
import classes from "../styles/ShopkeeperPage.module.css";

interface ShopkeeperHeaderProps {
    visibleShops: Shop[];
    activeShop: Shop | null;
    selectedShopId: string | null;
    setSelectedShopId: (id: string | null) => void;
    handleRefresh: () => Promise<void>;
    refreshing: boolean;
}

export function ShopkeeperHeader({
    visibleShops,
    activeShop,
    selectedShopId,
    setSelectedShopId,
    handleRefresh,
    refreshing,
}: ShopkeeperHeaderProps) {
    return (
        <Card p="xs" mb="xs" className={classes.headerCard}>
            <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                {/* BRAND PLACARD */}
                <Group gap="xs">
                    <ThemeIcon size="lg" variant="light" color="yellow" radius="md">
                        <IconBuildingStore size={22} />
                    </ThemeIcon>
                    <div>
                        <Title order={2} c="white" size="h3" className={classes.headerTitle}>The Shopkeeper</Title>
                        <Text size="xs" c="amber.5">A quiet marketplace to trade your gear</Text>
                    </div>
                </Group>

                {/* CONTROLS */}
                <Group gap="xs" style={{ marginLeft: "auto" }}>
                    {/* RELOAD ICON */}
                    <ActionIcon 
                        variant="light" 
                        color="yellow" 
                        size="lg" 
                        onClick={handleRefresh} 
                        loading={refreshing} 
                        title="Refresh shops and inventories"
                        className={classes.reloadIcon}
                    >
                        <IconRefresh size={18} />
                    </ActionIcon>

                    {/* SHOP SELECTOR DROPDOWN */}
                    {visibleShops.length > 1 && (
                        <ShopSelectorDropdown
                            visibleShops={visibleShops}
                            activeShop={activeShop}
                            selectedShopId={selectedShopId}
                            setSelectedShopId={setSelectedShopId}
                        />
                    )}

                    {/* SINGLE SHOP PLACARD */}
                    {visibleShops.length === 1 && activeShop && (
                        <Box className={classes.singlePlacard}>
                            <div style={{ textAlign: "left", lineHeight: 1.1 }}>
                                <Text fw={800} c="amber.5" style={{ letterSpacing: 0.8, fontSize: "9px", textTransform: "uppercase" }}>VISITING</Text>
                                <Text fw={700} size="xs" c="white">{activeShop.name}</Text>
                            </div>
                        </Box>
                    )}
                </Group>
            </Group>
        </Card>
    );
}

interface ShopSelectorDropdownProps {
    visibleShops: Shop[];
    activeShop: Shop | null;
    selectedShopId: string | null;
    setSelectedShopId: (id: string | null) => void;
}

function ShopSelectorDropdown({
    visibleShops,
    activeShop,
    selectedShopId,
    setSelectedShopId,
}: ShopSelectorDropdownProps) {
    return (
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
                    <UnstyledButton className={classes.unbutton}>
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
                                        className={`${classes.dropdownCard} ${isSelected ? classes.dropdownCardSelected : ""}`}
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
    );
}
