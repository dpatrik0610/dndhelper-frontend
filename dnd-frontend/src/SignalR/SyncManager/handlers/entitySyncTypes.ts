export interface EntityChangeEvent {
  entityType: "Character" | "Inventory" | "Campaign" | "Encounter" | "Shop" | "SellRequest";
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  action: "created" | "updated" | "deleted" | "activeEncounterChanged";
  changedBy: string;
  timestamp: string;
}

export interface EntityChangeBatch {
  correlationId: string;
  timestamp: string;
  changes: EntityChangeEvent[];
}
