import { getInventoriesByCharacter, getInventory } from "../services/inventoryService";
import { useInventoryStore } from "../store/useInventorystore";
import { useCharacterStore } from "../store/useCharacterStore";

export async function loadInventories(token: string) {
  const character = useCharacterStore.getState().character;

  if (!character?.id) {
    console.warn("⚠️ No character selected — skipping inventory load.");
    return [];
  }

  try {
    const inventories = await getInventoriesByCharacter(character.id, token);
    useInventoryStore.getState().setInventories(inventories);
    console.log(`✅ Loaded ${inventories.length} inventories.`);
    return inventories;
  } catch (error) {
    console.error("❌ Failed to load inventories:", error);
    useInventoryStore.getState().setInventories([]);
    return [];
  }
}

export async function loadInventoryById(inventoryId: string, token: string) {
  if (!inventoryId) {
    console.warn("⚠️ No inventoryId provided — skipping load.");
    return null;
  }

  try {
    const inventory = await getInventory(inventoryId, token);
    const store = useInventoryStore.getState();
    const existing = store.inventories.find((i) => i.id === inventoryId);

    if (existing) {
      store.updateInventory({ id: inventoryId, ...inventory });
      console.log(`🔄 Updated inventory: ${inventory.name ?? inventoryId}`);
    } else {
      store.addInventory(inventory);
      console.log(`🆕 Loaded single inventory: ${inventory.name ?? inventoryId}`);
    }

    return inventory;
  } catch (error) {
    console.error(`❌ Failed to load inventory ${inventoryId}:`, error);
    return null;
  }
}