export const ENCOUNTER_STATUSES = [
  "Planned",
  "Active",
  "Completed",
  "Cancelled",
] as const;

export type EncounterStatus = (typeof ENCOUNTER_STATUSES)[number];

export const ENCOUNTER_ENTITY_TYPES = [
  "PlayerCharacter",
  "Enemy",
  "Npc",
  "Ally",
  "Other",
] as const;

export type EncounterEntityType = (typeof ENCOUNTER_ENTITY_TYPES)[number];

export const ENCOUNTER_ENTITY_STATUSES = [
  "Alive",
  "Dead",
  "Unconscious",
  "Fled",
  "Removed",
  "Other",
] as const;

export type EncounterEntityStatus = (typeof ENCOUNTER_ENTITY_STATUSES)[number];

export interface EncounterEntity {
  type: EncounterEntityType;
  referenceId: string | null;
  name: string;
  initiative: number | null;
  quantity: number;
  note: string | null;
  status: EncounterEntityStatus;
}

export interface EncounterLootItem {
  equipmentId: string | null;
  name: string;
  quantity: number;
  note: string | null;
  isClaimed: boolean;
}

export interface Encounter {
  id: string;
  campaignId: string;
  sessionId: string | null;
  ownerIds: string[];
  name: string;
  description: string | null;
  mapUrl: string | null;
  imageUrls: string[];
  dmNote: string | null;
  location: string | null;
  entities: EncounterEntity[];
  loot: EncounterLootItem[];
  status: EncounterStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isDeleted: boolean;
}

export const encounterEntityTemplate: EncounterEntity = {
  type: "Enemy",
  referenceId: null,
  name: "",
  initiative: null,
  quantity: 1,
  note: null,
  status: "Alive",
};

export const encounterLootItemTemplate: EncounterLootItem = {
  equipmentId: null,
  name: "",
  quantity: 1,
  note: null,
  isClaimed: false,
};

export const createEncounterTemplate = (campaignId = "", ownerIds: string[] = []): Encounter => ({
  id: "",
  campaignId,
  sessionId: null,
  ownerIds,
  name: "",
  description: null,
  mapUrl: null,
  imageUrls: [],
  dmNote: null,
  location: null,
  entities: [],
  loot: [],
  status: "Planned",
  startedAt: null,
  endedAt: null,
  createdAt: null,
  updatedAt: null,
  isDeleted: false,
});
