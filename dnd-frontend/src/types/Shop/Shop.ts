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

export type SellRequestStatus = "Pending" | "Approved" | "Rejected" | "Countered" | 0 | 1 | 2 | 3;

export interface TradeItem {
    equipmentId: string;
    equipmentName?: string | null;
    quantity: number;
    sourceInventoryId?: string | null;
}

export const describeTradeItems = (items: TradeItem[] = []) =>
    items.map(i => `${i.quantity}× ${i.equipmentName ?? "item"}`).join(", ");

export const isCountered =(r: { status?: SellRequestStatus }) => r.status === "Countered" || r.status === 3;

export const isOpenRequest = (r: { status?: SellRequestStatus }) => r.status === "Pending" || r.status === 0 || isCountered(r);

export interface SellRequest {
    id?: string;
    campaignId: string;
    shopId: string;
    characterId: string;
    equipmentId?: string | null;
    sourceInventoryId?: string;
    quantity: number;
    offeredPriceGp: number;
    isSteal?: boolean;
    isHaggle?: boolean;
    counterPriceGp?: number | null;
    isTrade?: boolean;
    giveItems?: TradeItem[];
    wantItems?: TradeItem[];
    status?: SellRequestStatus;
    ownerIds?: string[];
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}
