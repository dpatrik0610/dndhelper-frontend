import { useEffect } from "react";
import { Text, Group, Button, Stack, Switch, NumberInput, Loader, Card, Badge, Grid, Paper, Avatar, ThemeIcon, Center, Box } from "@mantine/core";
import { IconBuildingStore, IconCheck, IconX, IconPackage } from "@tabler/icons-react";
import { useAdminShopStore } from "@store/admin/adminShopStore";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { getInventory } from "@services/inventoryService";
import { MetaPanel } from "../../InventoryDashboard/components/MetaPanel";
import { ItemsPanel } from "../../InventoryDashboard/components/ItemsPanel";
import { formatCostToDisplay, formatSilverToDisplay } from "@utils/currencyConverter";
import styles from "@styles/InventoryDashboard.module.css";

export function ShopWorkspace() {
  const { selectedShopId, shops, updateShop, toggleShopOpen, sellRequests, loadSellRequests, approveSellRequest, rejectSellRequest } = useAdminShopStore();
  const { selectedId: activeCampaignId } = useAdminCampaignStore();
  const { equipments, loadAll: loadEquipments } = useAdminEquipmentStore();
  const { selected: selectedInventory, setSelected: setSelectedInventory } = useAdminInventoryStore();
  const { loadInventoryById } = useAdminCurrencyStore();
  const { characters, loadAll: loadCharacters } = useAdminCharacterStore();
  
  const shop = shops.find(s => s.id === selectedShopId);

  useEffect(() => {
    if (activeCampaignId) {
      loadSellRequests(activeCampaignId);
      loadCharacters(activeCampaignId);
    }
  }, [activeCampaignId, loadSellRequests, loadCharacters]);

  useEffect(() => {
    if (equipments.length === 0) {
      loadEquipments();
    }
  }, [equipments.length, loadEquipments]);

  useEffect(() => {
    if (shop?.inventoryId) {
      getInventory(shop.inventoryId).then(data => {
        setSelectedInventory(data);
        void loadInventoryById(shop.inventoryId!);
      }).catch(err => {
        console.error("Failed to fetch shop inventory", err);
        setSelectedInventory(null);
      });
    } else {
      setSelectedInventory(null);
    }
  }, [shop?.inventoryId, loadInventoryById, setSelectedInventory]);

  if (!shop) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateInner}>
          <IconBuildingStore size={36} color="#818cf8" stroke={1.3} />
          <Text size="sm" c="dimmed" maw={280}>
            Select a shop from the sidebar to manage its settings and stock.
          </Text>
        </div>
      </div>
    );
  }

  const shopSellRequests = sellRequests.filter(r => r.shopId === shop.id && (r.status === "Pending" || r.status === 0));

  return (
    <div className={styles.workspacePanel} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minHeight: "100%" }}>
        {/* TOP CONTROL BAR: Compact & Modern */}
        <Paper p="md" radius="md" style={{ backgroundColor: "rgba(30, 27, 24, 0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <div>
                    <Group gap="xs" align="center">
                        <IconBuildingStore size={24} color="#fbbf24" />
                        <Text size="xl" fw={800} c="white" style={{ letterSpacing: 0.5 }}>
                            {shop.name}
                        </Text>
                        <Badge color={shop.isOpened ? "green" : "red"} variant="light">
                            {shop.isOpened ? "Open to Players" : "Closed"}
                        </Badge>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2}>
                        Inventory ID: <code style={{ color: "#a5b4fc", backgroundColor: "rgba(0,0,0,0.2)", padding: "2px 4px", borderRadius: 4 }}>{shop.inventoryId}</code>
                    </Text>
                </div>

                <Group gap="lg" align="center">
                    {/* Compact controls */}
                    <Switch
                        label="Open to Players"
                        checked={shop.isOpened}
                        onChange={(event) => toggleShopOpen(shop.id!, event.currentTarget.checked)}
                        size="sm"
                        styles={{ label: { color: "white", fontWeight: 600 } }}
                    />
                    
                    <Group gap="xs" align="center">
                        <Text size="sm" fw={600} c="gray.3">Price Multiplier:</Text>
                        <NumberInput
                            value={shop.priceMultiplier}
                            onChange={(val) => updateShop(shop.id!, { ...shop, priceMultiplier: Number(val) })}
                            min={0.1}
                            step={0.1}
                            max={5.0}
                            decimalScale={2}
                            size="xs"
                            styles={{
                                input: {
                                    backgroundColor: "rgba(0,0,0,0.3)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    color: "white",
                                    fontWeight: 700,
                                    width: "80px",
                                    textAlign: "center"
                                }
                            }}
                        />
                    </Group>
                </Group>
            </Group>
        </Paper>

        {/* MAIN split content area */}
        <Grid gutter="md">
            {/* LEFT COLUMN: Pending Requests */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
                <Paper 
                    p="md" 
                    radius="md" 
                    style={{ 
                        backgroundColor: "rgba(20, 17, 15, 0.4)", 
                        border: "1px solid rgba(255,255,255,0.04)", 
                        height: "650px",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <Group justify="space-between" mb="md" align="center" style={{ flexShrink: 0 }}>
                        <Text size="lg" fw={700} c="white" style={{ letterSpacing: 0.5 }}>
                            Pending Player Requests
                        </Text>
                        {shopSellRequests.length > 0 && (
                            <Badge color="red" variant="filled" size="xs">
                                {shopSellRequests.length} Active
                            </Badge>
                        )}
                    </Group>

                    {/* Scrollable container for Requests */}
                    <Box style={{ flexGrow: 1, overflowY: "auto", paddingRight: "4px" }}>
                        {shopSellRequests.length === 0 ? (
                            <Center style={{ height: "100%" }}>
                                <Stack align="center" gap="xs">
                                    <IconPackage size={32} color="rgba(255,255,255,0.15)" />
                                    <Text size="sm" c="dimmed">No pending requests for this shop.</Text>
                                </Stack>
                            </Center>
                        ) : (
                            <Stack gap="sm">
                                {shopSellRequests.map(req => {
                                    const eq = equipments.find(e => e.id === req.equipmentId);
                                    const itemName = eq?.name || `Item ID: ${req.equipmentId.substring(0, 8)}...`;
                                    const originalPrice = formatCostToDisplay(eq?.cost);
                                    const askingPrice = formatSilverToDisplay(req.offeredPriceGp * 100);
                                    
                                    const char = characters.find(c => c.id === req.characterId);
                                    const charName = char?.name || "Unknown Seller";
                                    
                                    const chaScore = char?.abilityScores?.cha ?? 10;
                                    const chaMod = Math.floor((chaScore - 10) / 2);
                                    const chaDisplay = `${chaScore} (${chaMod >= 0 ? '+' : ''}${chaMod})`;

                                    const isSteal = !!req.isSteal;

                                    return (
                                         <Card 
                                            key={req.id} 
                                            p="md" 
                                            bg={isSteal ? "rgba(139, 0, 0, 0.12)" : "rgba(30, 27, 24, 0.4)"} 
                                            style={{ 
                                                borderRadius: 8, 
                                                border: isSteal ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255,255,255,0.06)',
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                            }}
                                         >
                                            <Stack gap="sm">
                                                {/* Header row inside card */}
                                                <Group justify="space-between" align="center">
                                                    <Group gap="xs">
                                                        <ThemeIcon size="md" radius="md" color={isSteal ? "red" : "amber"} variant="light">
                                                            <IconPackage size={18} />
                                                        </ThemeIcon>
                                                        <div>
                                                            <Text size="md" fw={700} c="white">
                                                                {isSteal ? "Stealing: " : ""}{itemName}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                Qty: <b style={{ color: "white" }}>{req.quantity}</b> | Original: {originalPrice}
                                                            </Text>
                                                        </div>
                                                    </Group>

                                                    <Stack gap={4} align="flex-end">
                                                        {isSteal ? (
                                                            <Badge color="red" size="sm" variant="filled" style={{ letterSpacing: 0.5 }}>
                                                                STEAL ATTEMPT
                                                        </Badge>
                                                        ) : (
                                                            <Badge color="amber" size="sm" variant="filled" style={{ letterSpacing: 0.5 }}>
                                                                SELL OFFER
                                                            </Badge>
                                                        )}
                                                        <Text size="xs" c="dimmed">
                                                            {new Date(req.createdAt || "").toLocaleDateString()}
                                                        </Text>
                                                    </Stack>
                                                </Group>

                                                {/* Details Section */}
                                                <Paper p="xs" radius="sm" bg="rgba(0,0,0,0.2)" style={{ border: "1px solid rgba(255,255,255,0.03)" }}>
                                                    <Group justify="space-between" align="center" wrap="nowrap">
                                                        <Group gap="xs">
                                                            <Avatar color="indigo" radius="xl" size="sm">
                                                                {charName.substring(0, 2).toUpperCase()}
                                                            </Avatar>
                                                            <div>
                                                                <Text size="xs" fw={700} c="indigo.3">{charName}</Text>
                                                                <Text size="xxs" c="dimmed" title="Charisma score and modifier">
                                                                    CHA Score: <b style={{ color: "#2dd4bf" }}>{chaDisplay}</b>
                                                                </Text>
                                                            </div>
                                                        </Group>

                                                        <div style={{ textAlign: "right" }}>
                                                            <Text size="xxs" c="dimmed" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                                                                {isSteal ? "Offer Price" : "Asking Price"}
                                                            </Text>
                                                            <Text size="md" fw={800} c={isSteal ? "red.4" : "yellow.4"}>
                                                                {isSteal ? "Free" : askingPrice}
                                                            </Text>
                                                        </div>
                                                    </Group>
                                                </Paper>

                                                {/* Action buttons inside Card */}
                                                <Group gap="xs" grow>
                                                    <Button 
                                                        size="xs" 
                                                        color="red" 
                                                        variant="light" 
                                                        leftSection={<IconX size={14}/>} 
                                                        onClick={() => rejectSellRequest(req.id!)}
                                                        styles={{ root: { fontWeight: 700 } }}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button 
                                                        size="xs" 
                                                        color="green" 
                                                        variant="filled" 
                                                        leftSection={<IconCheck size={14}/>} 
                                                        onClick={() => approveSellRequest(req.id!)}
                                                        styles={{ root: { backgroundColor: "#10b981", color: "white", fontWeight: 700, "&:hover": { backgroundColor: "#059669" } } }}
                                                    >
                                                        Approve
                                                    </Button>
                                                </Group>
                                            </Stack>
                                         </Card>
                                    );
                                })}
                            </Stack>
                        )}
                    </Box>
                </Paper>
            </Grid.Col>

            {/* RIGHT COLUMN: Shop Register & Stock */}
            <Grid.Col span={{ base: 12, lg: 6 }}>
                <Paper 
                    p="md" 
                    radius="md" 
                    style={{ 
                        backgroundColor: "rgba(20, 17, 15, 0.4)", 
                        border: "1px solid rgba(255,255,255,0.04)",
                        height: "650px",
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <Text size="lg" fw={700} c="white" mb="md" style={{ letterSpacing: 0.5, flexShrink: 0 }}>
                        Register & Stock
                    </Text>

                    {/* Scrollable container for Stock */}
                    <Box style={{ flexGrow: 1, overflowY: "auto", paddingRight: "4px" }}>
                        {shop.inventoryId && selectedInventory?.id === shop.inventoryId ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <MetaPanel />
                                <ItemsPanel />
                            </div>
                        ) : (
                            <Center style={{ height: "100%" }}>
                                <Loader color="indigo" size="sm" />
                            </Center>
                        )}
                    </Box>
                </Paper>
            </Grid.Col>
        </Grid>
    </div>
  );
}