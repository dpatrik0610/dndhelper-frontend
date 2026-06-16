export interface Shop {
    id?: string;
    campaignId: string;
    inventoryId?: string;
    ownerIds: string[];
    name: string;
    description?: string;
    isOpened: boolean;
    priceMultiplier: number;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}

export interface BuyRequest {
    buyerCharacterId: string;
    equipmentId: string;
    quantity: number;
}

export type SellRequestStatus = "Pending" | "Approved" | "Rejected" | 0 | 1 | 2;

export interface SellRequest {
    id?: string;
    campaignId: string;
    shopId: string;
    characterId: string;
    equipmentId: string;
    sourceInventoryId?: string;
    quantity: number;
    offeredPriceGp: number;
    isSteal?: boolean;
    status?: SellRequestStatus;
    ownerIds?: string[];
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}
