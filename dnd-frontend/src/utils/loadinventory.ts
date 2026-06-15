import { getInventoriesByCharacter, getInventory } from "@services/inventoryService";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { useCharacterStore } from "@store/character/characterStore";


export async function loadInventories() {

  const character = useCharacterStore.getState().character;
  if (!character?.id) {
    console.warn("⚠️ No character selected — skipping inventory load.");
    return [];
  }

  const {inventories, setInventories} = useInventoryStore.getState();

  try {
    const response = await getInventoriesByCharacter(character.id);
    setInventories(response);

    return inventories;
  } catch (error) {
    console.error("❌ Failed to load inventories:", error);
    useInventoryStore.getState().setInventories([]);
    return [];
  }
}

export async function loadInventoryById(inventoryId: string) {

  if (!inventoryId) {
    console.warn("⚠️ No inventoryId provided — skipping load.");
    return null;
  }

  try {
    const inventory = await getInventory(inventoryId);
    if (!inventory) return null;

    const store = useInventoryStore.getState();
    const existing = store.inventories.find((i) => i.id === inventoryId);

    if (existing) {
      store.updateInventory({ ...inventory, id: inventoryId });
      console.log(`🔄 Updated inventory: ${inventory.name ?? inventoryId}`);
    } else {
      store.addInventory(inventory);
      console.log(`Loaded single inventory: ${inventory.name ?? inventoryId}`);
    }

    return inventory;
  } catch (error) {
    console.error(`❌ Failed to load inventory ${inventoryId}:`, error);
    return null;
  }
}
