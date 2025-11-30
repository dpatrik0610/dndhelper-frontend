export interface EntityChangeEvent {
  entityType: "Character" | "Inventory" | "Campaign";
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  action: "created" | "updated" | "deleted";
  changedBy: string;
  timestamp: string;
}

export interface EntityChangeBatch {
  correlationId: string;
  timestamp: string;
  changes: EntityChangeEvent[];
}
