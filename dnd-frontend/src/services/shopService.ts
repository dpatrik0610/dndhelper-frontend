import { apiClient } from "@api/apiClient";
import type { Shop, BuyRequest, SellRequest } from "@appTypes/Shop/Shop";
import type { ShopItemResponse } from "@appTypes/Shop/ShopItemResponse";

const baseUrl = "/shop";

export async function getShopById(id: string): Promise<Shop> {
    return apiClient(`${baseUrl}/${id}`, { method: "GET" });
}

export async function getShopItems(id: string): Promise<ShopItemResponse[]> {
    return apiClient(`${baseUrl}/${id}/items`, { method: "GET" });
}

export async function getShopsForCampaign(campaignId: string): Promise<Shop[]> {
    return apiClient(`${baseUrl}/campaign/${campaignId}`, { method: "GET" });
}

export async function createShop(shop: Shop): Promise<Shop> {
    return apiClient(baseUrl, { method: "POST", body: shop });
}

export async function buyItem(shopId: string, request: BuyRequest): Promise<{ success: boolean; message: string }> {
    return apiClient(`${baseUrl}/${shopId}/buy`, { method: "POST", body: request });
}

export async function submitSellRequest(request: SellRequest): Promise<SellRequest> {
    return apiClient(`${baseUrl}/sell-requests`, { method: "POST", body: request });
}

export async function getCampaignSellRequests(campaignId: string): Promise<SellRequest[]> {
    return apiClient(`${baseUrl}/campaign/${campaignId}/sell-requests`, { method: "GET" });
}

export async function approveSellRequest(id: string): Promise<SellRequest> {
    return apiClient(`${baseUrl}/sell-requests/${id}/approve`, { method: "PATCH" });
}

export async function rejectSellRequest(id: string): Promise<SellRequest> {
    return apiClient(`${baseUrl}/sell-requests/${id}/reject`, { method: "PATCH" });
}

export async function updateShop(id: string, shop: Shop): Promise<Shop> {
    return apiClient(`${baseUrl}/${id}`, { method: "PUT", body: shop });
}

export async function toggleShopOpen(id: string, isOpen: boolean): Promise<Shop> {
    return apiClient(`${baseUrl}/${id}/toggle-open?isOpen=${isOpen}`, { method: "PATCH" });
}

export async function deleteShop(id: string): Promise<void> {
    await apiClient(`${baseUrl}/${id}`, { method: "DELETE" });
}
