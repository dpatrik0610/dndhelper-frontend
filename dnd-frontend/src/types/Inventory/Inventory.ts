import type { Currency } from "@appTypes/Currency";
import type { InventoryItem } from "./InventoryItem";

export interface Inventory {
  id?: string | null;
  name?: string;
  characterIds: string[];
  ownerIds: string[];
  campaignId?: string | null;
  items?: InventoryItem[];
  currencies: Currency[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
