import { handleCharacterChange } from "./handlers/characterChangeHandler";
import { handleInventoryChange } from "./handlers/inventoryChangeHandler";
import { handleCampaignChange } from "./handlers/campaignChangeHandler";
import type { EntityChangeBatch, EntityChangeEvent } from "./handlers/entitySyncTypes";

export class EntitySyncManager {
  static handleEntityChange(event: EntityChangeEvent) {
    console.log(
      `🔄 Entity sync: ${event.entityType} ${event.action} by ${event.changedBy}`
    );

    switch (event.entityType) {
      case "Character":
        handleCharacterChange(event);
        break;

      case "Inventory":
        handleInventoryChange(event);
        break;

      case "Campaign":
        handleCampaignChange(event);
        break;

      default:
        console.warn(`Unknown entity type: ${event.entityType}`, event);
    }
  }

  static handleBatch(batch: EntityChangeBatch) {
    batch.changes.forEach((evt) => this.handleEntityChange(evt));
  }
}
