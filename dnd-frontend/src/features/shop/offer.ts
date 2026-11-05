export type OfferSide = "give" | "want";

export interface OfferLine {
    side: OfferSide;
    equipmentId: string;
    name: string;
    quantity: number;
    max: number | null;
    sourceInventoryId?: string;
}

export const offerKey = (side: OfferSide, equipmentId: string, sourceInventoryId?: string | null) =>
    `${side}:${equipmentId}:${sourceInventoryId ?? ""}`;

export interface OfferPicker {
    picked: (side: OfferSide, equipmentId: string, sourceInventoryId?: string | null) => number;
    set: (line: OfferLine) => void;
}
