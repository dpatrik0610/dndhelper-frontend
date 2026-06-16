import { Card, Group, Title, Select, Box, Stack, Badge, Text, ActionIcon, Button, Menu } from "@mantine/core";
import { IconSearch, IconDotsVertical, IconCoins } from "@tabler/icons-react";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import { SectionColor } from "@appTypes/SectionColor";
import { CharacterCurrencyArea } from "@features/profile/components/CharacterCurrencyArea";

interface AdventureBagProps {
    activeCharacter: any;
    inventories: Inventory[];
    playerInventory: Inventory | null | undefined;
    selectedInventoryId: string | null;
    setSelectedInventoryId: (id: string | null) => void;
    equipments: any[];
    handleDetailsOpen: (id: string) => void;
    handleSellOpen: (id: string) => void;
}

export function AdventureBag({
    activeCharacter,
    inventories,
    playerInventory,
    selectedInventoryId,
    setSelectedInventoryId,
    equipments,
    handleDetailsOpen,
    handleSellOpen,
}: AdventureBagProps) {
    const items = playerInventory?.items || [];

    const selectData = (activeCharacter?.inventoryIds && activeCharacter.inventoryIds.length > 1)
        ? activeCharacter.inventoryIds
            .map((id: string) => {
                const inv = inventories.find(i => i.id === id);
                return inv ? { value: id, label: inv.name } : null;
            })
            .filter((opt: any): opt is { value: string; label: string } => opt !== null)
        : [];

    return (
        <Card p="xs" bg="rgba(15, 12, 10, 0.45)" style={{ border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}>
            <Group justify="space-between" mb="xs" wrap="nowrap" gap="xs">
                <Title order={3} c="amber.5" size="h5" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Your Adventure Bag</Title>
                {selectData.length > 1 && (
                    <Select
                        size="xs"
                        data={selectData}
                        value={selectedInventoryId}
                        onChange={setSelectedInventoryId}
                        styles={{
                            input: { backgroundColor: "rgba(0,0,0,0.35)", color: "white", border: "1px solid rgba(255,255,255,0.08)", fontSize: "11px", height: "24px" }
                        }}
                    />
                )}
            </Group>

            {/* ACTIVE CHARACTER CURRENCY */}
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

            {items.length === 0 ? (
                <Text c="dimmed" size="xs" py="md">Your satchel is empty.</Text>
            ) : (
                <Stack gap="xs">
                    {items.map((item: any) => {
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
    );
}
