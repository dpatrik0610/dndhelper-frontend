export interface EntityChangeEvent {
  entityType: "Character" | "Inventory" | "Campaign" | "Encounter" | "Shop" | "SellRequest" | "Quest" | "Poll" | "CoreContent";
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // assigned / unassigned: a DM gave a character to you / took it from you. announced: a poll result was sent out.
  action: "created" | "updated" | "deleted" | "activeEncounterChanged" | "assigned" | "unassigned" | "announced";
  changedBy: string;
  timestamp: string;
}

export interface EntityChangeBatch {
  correlationId: string;
  timestamp: string;
  changes: EntityChangeEvent[];
}
