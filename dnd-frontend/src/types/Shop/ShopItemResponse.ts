export interface ShopItemResponse {
    equipmentId: string;
    equipmentName: string;
    quantity: number;
    note?: string;
    finalCostSp: number;
    displayCost: string;
    description?: string[];
    damage?: { damageDice: string; damageType: { name: string } };
    range?: { normal: number; long: number };
    weight?: number;
    tags?: string[];
    tier?: string;
}