import type { Currency } from "./Currency";

export enum QuestType {
  Main = "Main",
  Side = "Side",
  Faction = "Faction",
  Personal = "Personal",
  Undefined = "Undefined"
}

export enum QuestStatus {
  Available = "Available",
  Unavailable = "Unavailable",
  Active = "Active",
  Completed = "Completed",
  Failed = "Failed"
}

export interface QuestObjective {
  id: string;
  description?: string;
  isCompleted: boolean;
  currentProgress: number;
  completionThreshold: number; // Target numeric goal (defaults to 1)
}

export interface Quest {
  id?: string;
  campaignId: string;
  involvedCharacterIds?: string[];    // Linked Character ObjectIds (used for Personal Quests)
  title: string;
  description?: string;
  location?: string;
  objectives: QuestObjective[];
  status: QuestStatus;
  type: QuestType;
  rewardItemIds: string[];
  rewardCurrencies: Currency[];
  createdAt?: string;
  updatedAt?: string;
}
