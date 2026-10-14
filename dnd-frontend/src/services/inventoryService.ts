import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { apiClient } from "@api/apiClient";


// Base URL for all requests
const baseUrl = "/inventory";

// ------------------------
// Inventory CRUD
// ------------------------

export async function getInventoriesByCharacter(characterId: string): Promise<Inventory[]> {
  return apiClient(`${baseUrl}/character/${characterId}`, { method: "GET" });
}

export async function getAllInventories(): Promise<Inventory[]> {
  return apiClient(`${baseUrl}/all`, { method: "GET" });
}

export async function getInventory(id: string): Promise<Inventory> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET" });
}

export async function createInventory(inventory: Inventory): Promise<Inventory> {
  return apiClient(baseUrl, { method: "POST", body: inventory });
}

export async function updateInventory(id: string, inventory: Inventory): Promise<Inventory> {
  return apiClient(`${baseUrl}/${id}`, { method: "PUT", body: inventory });
}

export async function deleteInventory(id: string): Promise<void> {
  await apiClient(`${baseUrl}/${id}`, { method: "DELETE" });
}

/** Random mode rolls `count` items (tier first, at fixed rates); a non-empty `tierCounts` picks exact counts per tier instead. */
export interface LootRequest {
  name: string;
  campaignId?: string | null;
  characterIds: string[];
  count: number;
  tierCounts?: Record<string, number>;
  tags: string[];
}

/** Rolls loot server-side into a new inventory with the given name. */
export async function generateLoot(request: LootRequest): Promise<Inventory> {
  return apiClient(`${baseUrl}/loot`, { method: "POST", body: request });
}

/** Sets the inventory's characters; the server keeps each character's inventoryIds in step. */
export async function setInventoryCharacters(inventoryId: string, characterIds: string[]): Promise<Inventory> {
  return apiClient(`${baseUrl}/${inventoryId}/characters`, { method: "PUT", body: characterIds });
}
// ------------------------
// Inventory Item Operations
// ------------------------

export interface ModifyEquipmentAmount{
  equipmentId: string;
  amount: number;
}

export interface MoveItemRequest {
  targetInventoryId: string;
  amount: number;
}

export interface MoveItemToCharacterRequest {
  amount: number;
}

export async function getItems(inventoryId: string): Promise<InventoryItem[]> {
  return apiClient(`${baseUrl}/${inventoryId}/items`, { method: "GET" });
}

export async function getItem(inventoryId: string, equipmentIndex: string): Promise<InventoryItem> {
  return apiClient(`${baseUrl}/${inventoryId}/items/${equipmentIndex}`, { method: "GET" });
}

export async function addOrIncrementExisting(inventoryId: string, request: ModifyEquipmentAmount): Promise<InventoryItem> {
  return apiClient(`${baseUrl}/${inventoryId}/additem`, { method: "POST", body: request });
}

export async function addNewItem(inventoryId: string, equipment: Equipment): Promise<InventoryItem> {
  return apiClient(`${baseUrl}/${inventoryId}/additem/new`, { method: "POST", body: equipment });
}

export async function updateItem(inventoryId: string, equipmentId: string, item: InventoryItem): Promise<void> {
  await apiClient(`${baseUrl}/${inventoryId}/items/${equipmentId}`, { method: "PUT", body: item });
}

export async function deleteItem(inventoryId: string, equipmentId: string) {
  await apiClient(`${baseUrl}/${inventoryId}/items/${equipmentId}`, {method: "DELETE" });
}

export async function decrementItemQuantity(inventoryId: string, request: ModifyEquipmentAmount): Promise<void> {
  await apiClient(`${baseUrl}/${inventoryId}/items/`, { method: "PATCH", body : request });
}

export async function moveItem(sourceInventoryId: string, equipmentId: string, request: MoveItemRequest): Promise<void> {
  await apiClient(`${baseUrl}/${sourceInventoryId}/items/${equipmentId}/move`, {method: "POST", body: request })
}

export async function moveItemToCharacter(
  sourceInventoryId: string,
  equipmentId: string,
  characterId: string,
  request: MoveItemToCharacterRequest
): Promise<void> {
  await apiClient(
    `${baseUrl}/${sourceInventoryId}/items/${equipmentId}/move-to-character/${characterId}`,
    { method: "POST", body: request }
  );
}
