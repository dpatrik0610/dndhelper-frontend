import { apiClient } from "../api/apiClient";
import type { Equipment } from "../types/Equipment/Equipment";

const baseUrl = "/Equipment";

/**
 * Fetch all equipment items.
 */
export async function getAllEquipment(token: string): Promise<Equipment[]> {
  return apiClient(baseUrl, { method: "GET", token });
}

/**
 * Fetch a single equipment item by its database ID.
 */
export async function getEquipmentById(id: string, token: string): Promise<Equipment> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET", token });
}

/**
 * Fetch a single equipment item by its index (if different from ID).
 */
export async function getEquipmentByIndex(index: string, token: string): Promise<Equipment> {
  return apiClient(`${baseUrl}/index/${index}`, { method: "GET", token });
}

/**
 * Search equipment items by name.
 */
export async function searchEquipmentByName(name: string, token: string): Promise<Equipment[]> {
  return apiClient(`${baseUrl}/search?name=${encodeURIComponent(name)}`, { method: "GET", token });
}

/**
 * Create a new equipment item.
 */
export async function createEquipment(equipment: Equipment, token: string): Promise<Equipment> {
  return apiClient(baseUrl, {
    method: "POST",
    token,
    body: equipment,
  });
}

/**
 * Create many equipment items at once.
 */
export async function createManyEquipment(equipments: Equipment[], token: string): Promise<Equipment[]> {
  return apiClient(`${baseUrl}/many`, {
    method: "POST",
    token,
    body: equipments,
  });
}

/**
 * Update an equipment item by ID.
 */
export async function updateEquipmentById(id: string, equipment: Equipment, token: string): Promise<Equipment> {
  console.log(equipment);
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",
    token,
    body: equipment,
  });
}

/**
 * Update an equipment item by index.
 */
export async function updateEquipmentByIndex(index: string, equipment: Equipment, token: string): Promise<Equipment> {
  return apiClient(`${baseUrl}/index/${index}`, {
    method: "PUT",
    token,
    body: equipment,
  });
}

/**
 * Delete an equipment item by ID.
 */
export async function deleteEquipment(id: string, token: string): Promise<void> {
  return apiClient(`${baseUrl}/${id}`, { method: "DELETE", token });
}
