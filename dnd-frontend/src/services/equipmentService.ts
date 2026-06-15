import { apiClient } from "@api/apiClient";
import type { Equipment, EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import type { PagedResult } from "@appTypes/PagedResult";

const baseUrl = "/Equipment";

/**
 * Fetch all equipment items.
 */
export async function getAllEquipment(): Promise<Equipment[]> {
  return apiClient(baseUrl, { method: "GET" });
}

export async function getAllPaginatedEquipment(
    page: number, 
    pageSize: number, 
    tag: string, 
    tier: string, 
    damageType: string, 
    name: string
): Promise<PagedResult<Equipment>> {
    const query = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        tag,
        tier,
        damageType,
        name
    }).toString();
    return apiClient(`${baseUrl}/paginated?${query}`, { method: "GET" });
}

/**
 * Fetch a single equipment item by its database ID.
 */
export async function getEquipmentById(id: string): Promise<Equipment> {
  return apiClient(`${baseUrl}/${id}`, { method: "GET" });
}

/**
 * Fetch a single equipment item by its index (if different from ID).
 */
export async function getEquipmentByIndex(index: string): Promise<Equipment> {
  return apiClient(`${baseUrl}/index/${index}`, { method: "GET" });
}

/**
 * Search equipment items by name.
 */
export async function searchEquipmentByName(name: string): Promise<Equipment[]> {
  return apiClient(`${baseUrl}/search?name=${encodeURIComponent(name)}`, { method: "GET" });
}

/**
 * Create a new equipment item.
 */
export async function createEquipment(equipment: Equipment): Promise<Equipment> {
  return apiClient(baseUrl, {
    method: "POST",

    body: equipment,
  });
}

/**
 * Create many equipment items at once.
 */
export async function createManyEquipment(equipments: Equipment[]): Promise<Equipment[]> {
  return apiClient(`${baseUrl}/many`, {
    method: "POST",

    body: equipments,
  });
}

/**
 * Update an equipment item by ID.
 */
export async function updateEquipmentById(id: string, equipment: Equipment): Promise<Equipment> {
  console.log(equipment);
  return apiClient(`${baseUrl}/${id}`, {
    method: "PUT",

    body: equipment,
  });
}

/**
 * Update an equipment item by index.
 */
export async function updateEquipmentByIndex(index: string, equipment: Equipment): Promise<Equipment> {
  return apiClient(`${baseUrl}/index/${index}`, {
    method: "PUT",

    body: equipment,
  });
}

/**
 * Delete an equipment item by ID.
 */
export async function deleteEquipment(id: string): Promise<void> {
  return apiClient(`${baseUrl}/${id}`, { method: "DELETE" });
}

export async function getEquipmentByIds(ids: string[]): Promise<Equipment[]> {
  return apiClient(`${baseUrl}/by-ids`, {
    method: 'POST',
    body: ids,

  });
}

export async function getEquipmentByIdsForUser(ids: string[]): Promise<EquipmentUserResponse[]> {
  return apiClient(`${baseUrl}/userview`, {
    method: 'POST',
    body: ids,

  });
}
