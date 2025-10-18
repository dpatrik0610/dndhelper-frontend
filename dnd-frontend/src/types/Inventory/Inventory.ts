import type { Currency } from "../Currency";
import type { InventoryItem } from "./InventoryItem";

export interface Inventory {
  id?: string;
  characterId?: string;
  name?: string;
  items?: InventoryItem[];
  createdAt?: string; // ISO date string from API
  updatedAt?: string; // ISO date string from API
  isDeleted?: boolean;
  ownerIds: string[];
  currencies: Currency[];
}