import { useEffect } from "react";
import { Text, Group, Button, Stack, Switch, NumberInput, Divider, Loader, Card, Badge } from "@mantine/core";
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
    <div className={styles.workspacePanel}>
        <div className={styles.metaPanel}>
            <Group justify="space-between" align="flex-start" mb="md">
                <div>
                <Text size="lg" fw={700} c="white">
                    {shop.name} Settings
                </Text>
                <Text size="xs" c="dimmed">
                    Inventory ID: {shop.inventoryId}
                </Text>
                </div>
            </Group>
            
            <Stack gap="sm">
                <Switch
                    label="Shop is Open to Players"
                    checked={shop.isOpened}
                    onChange={(event) => toggleShopOpen(shop.id!, event.currentTarget.checked)}
                />
                
                <NumberInput
                    label="Price Multiplier"
                    description="1.0 is standard price. 1.2 is a 20% markup."
                    value={shop.priceMultiplier}
                    onChange={(val) => updateShop(shop.id!, { ...shop, priceMultiplier: Number(val) })}
                    min={0.1}
                    step={0.1}
                    max={5.0}
                    decimalScale={2}
                    styles={{
                        input: {
                            backgroundColor: "rgba(0,0,0,0.25)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "white"
                        }
                    }}
                />
            </Stack>

            <Divider my="lg" color="dark.4" />

            <Text size="lg" fw={700} c="white" mb="md">
                Pending Player Sell Requests
            </Text>
            
            {shopSellRequests.length === 0 ? (
                 <Text size="sm" c="dimmed">No pending requests for this shop.</Text>
            ) : (
                <Stack gap="xs">
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

                        return (
                             <Card key={req.id} p="sm" bg="rgba(0,0,0,0.18)" style={{ borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Stack gap="xs">
                                    <Group justify="space-between" align="center">
                                        <Group gap="xs">
                                            <IconPackage size={18} color="#a5b4fc" />
                                            <Text size="sm" fw={600} c="white">{itemName}</Text>
                                        </Group>
                                        <Group gap="xs">
                                            <Badge color="indigo" size="xs" variant="filled">
                                                {charName}
                                            </Badge>
                                            <Badge color="teal" size="xs" variant="filled" title="Charisma score and modifier">
                                                CHA: {chaDisplay}
                                            </Badge>
                                        </Group>
                                    </Group>

                                    <Group justify="space-between" align="center">
                                        <div>
                                            <Text size="xs" c="dimmed">
                                                Quantity: <b>{req.quantity}</b> | Asking: <b style={{ color: "#fbbf24" }}>{askingPrice}</b>
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                Original Cost: {originalPrice}
                                            </Text>
                                        </div>
                                        <Group gap="xs">
                                            <Button size="compact-xs" color="green" variant="light" leftSection={<IconCheck size={12}/>} onClick={() => approveSellRequest(req.id!)}>Approve</Button>
                                            <Button size="compact-xs" color="red" variant="light" leftSection={<IconX size={12}/>} onClick={() => rejectSellRequest(req.id!)}>Reject</Button>
                                        </Group>
                                    </Group>
                                </Stack>
                             </Card>
                        );
                    })}
                </Stack>
            )}

            <Divider my="lg" color="dark.4" />
            <Text size="lg" fw={700} c="white" mb="md">
                Shop Register & Stock
            </Text>
            {shop.inventoryId && selectedInventory?.id === shop.inventoryId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <MetaPanel />
                    <ItemsPanel />
                </div>
            ) : (
                <Loader color="indigo" size="sm" />
            )}

        </div>
    </div>
  );
}