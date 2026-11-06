export interface EntityChangeEvent {
  entityType: "Character" | "Inventory" | "Campaign" | "Encounter" | "Session" | "Shop" | "SellRequest" | "Quest" | "Poll" | "Chronicle" | "CoreContent";
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  // assigned / unassigned: a DM gave a character to you / took it from you. announced: a poll result was sent out. commented / uncommented / shared: Chronicle discussion changes and entries newly shared with you.
  action: "created" | "updated" | "deleted" | "activeEncounterChanged" | "assigned" | "unassigned" | "announced" | "longrested" | "commented" | "uncommented" | "shared";
  changedBy: string;
  timestamp: string;
}

export interface EntityChangeBatch {
  correlationId: string;
  timestamp: string;
  changes: EntityChangeEvent[];
}
