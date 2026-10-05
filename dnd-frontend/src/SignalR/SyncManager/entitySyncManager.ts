import { handleCampaignChange } from "./handlers/campaignChangeHandler";
import { handleCharacterChange } from "./handlers/characterChangeHandler";
import type { EntityChangeBatch, EntityChangeEvent } from "./handlers/entitySyncTypes";
import { handleInventoryChange } from "./handlers/inventoryChangeHandler";
import { handleShopChange } from "./handlers/shopChangeHandler";
import { handleSellRequestChange } from "./handlers/sellRequestChangeHandler";
import { handleQuestChange } from "./handlers/questChangeHandler";
import { loadSpells } from "@utils/loadSpells";

export class EntitySyncManager {
  static handleEntityChange(event: EntityChangeEvent) {
    switch (event.entityType) {
      case "Quest":
        handleQuestChange(event);
        break;
      case "Character":
        handleCharacterChange(event);
        break;

      case "Inventory":
        handleInventoryChange(event);
        break;

      case "Campaign":
        handleCampaignChange(event);
        break;

      case "Shop":
        handleShopChange(event);
        break;

      case "SellRequest":
        handleSellRequestChange(event);
        break;

      case "Encounter":
        break;

      // The superadmin promoted (or moved) core content: refresh the cached spell list. The server decides
      // whether the current campaign imports core spells, so a plain reload is enough.
      case "CoreContent":
        if (event.data?.type === "Spells") void loadSpells();
        break;

      default:
        console.warn(`Unknown entity type: ${event.entityType}`, event);
    }
  }

  static handleBatch(batch: EntityChangeBatch) {
    batch.changes.forEach((event) => this.handleEntityChange(event));
  }
}
