import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { InventoryItem } from "@appTypes/Inventory/InventoryItem";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { apiClient } from "@api/apiClient";


// Base URL for all requests
const baseUrl = "/inventory";

// ------------------------
// Inventory CRUD
// ------------------------

export async function getInventoriesByCharacter(characterId: string, token: string): Promise<Inventory[]> {
  return apiClient(`${baseUrl}/character/${characterId}`, { method: "GET", token });
}

export async function getAllInventories(token: string): Promise<Inventory[]> {
  return apiClient(`${baseUrl}/all`, { method: "GET", token });
}

export async function getInventory(id: string, token: string): Promise<Inventory> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET", token });
}

export async function createInventory(inventory: Inventory, token: string): Promise<Inventory> {
  return apiClient(baseUrl, { method: "POST", body: inventory, token });
}

export async function updateInventory(id: string, inventory: Inventory, token: string): Promise<Inventory> {
  return apiClient(`${baseUrl}/${id}`, { method: "PUT", body: inventory, token });
}

export async function deleteInventory(id: string, token: string): Promise<void> {
  await apiClient(`${baseUrl}/${id}`, { method: "DELETE", token });
}

export async function assignInventoryToCharacter(inventoryId: string, characterId: string, token: string ): Promise<Inventory[]> {
  return apiClient(`${baseUrl}/${inventoryId}/assign-to/${characterId}`, { method: "PATCH", token });
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

export async function getItems(inventoryId: string, token: string): Promise<InventoryItem[]> {
  return apiClient(`${baseUrl}/${inventoryId}/items`, { method: "GET", token });
}

export async function getItem(inventoryId: string, equipmentIndex: string, token: string): Promise<InventoryItem> {
  return apiClient(`${baseUrl}/${inventoryId}/items/${equipmentIndex}`, { method: "GET", token });
}

export async function addOrIncrementExisting(inventoryId: string, request: ModifyEquipmentAmount, token: string): Promise<InventoryItem> {
  return apiClient(`${baseUrl}/${inventoryId}/additem`, { method: "POST", body: request, token });
}

export async function addNewItem(inventoryId: string, equipment: Equipment, token: string): Promise<InventoryItem> {
  return apiClient(`${baseUrl}/${inventoryId}/additem/new`, { method: "POST", body: equipment, token });
}

export async function updateItem(inventoryId: string, equipmentId: string, item: InventoryItem, token: string): Promise<void> {
  await apiClient(`${baseUrl}/${inventoryId}/items/${equipmentId}`, { method: "PUT", body: item, token });
}

export async function deleteItem(inventoryId: string, equipmentId: string, token?: string) {
  await apiClient(`${baseUrl}/${inventoryId}/items/${equipmentId}`, {method: "DELETE", token});
}

export async function decrementItemQuantity(inventoryId: string, request: ModifyEquipmentAmount, token: string): Promise<void> {
  await apiClient(`${baseUrl}/${inventoryId}/items/`, { method: "PATCH", body : request, token });
}

export async function moveItem(sourceInventoryId: string, equipmentId: string, request: MoveItemRequest, token: string): Promise<void> {
  await apiClient(`${baseUrl}/${sourceInventoryId}/items/${equipmentId}/move`, {method: "POST", body: request, token})
}

export async function moveItemToCharacter(
  sourceInventoryId: string,
  equipmentId: string,
  characterId: string,
  request: MoveItemToCharacterRequest,
  token: string
): Promise<void> {
  await apiClient(
    `${baseUrl}/${sourceInventoryId}/items/${equipmentId}/move-to-character/${characterId}`,
    { method: "POST", body: request, token }
  );
}
