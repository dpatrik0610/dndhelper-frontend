import type { Currency } from "../Currency";
import type { InventoryItem } from "./InventoryItem";

export interface Inventory {
  id?: string;
  name?: string;
  characterIds: string[];
  ownerIds: string[];
  items?: InventoryItem[];
  currencies: Currency[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
