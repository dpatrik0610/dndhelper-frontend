export interface Campaign {
  id?: string;
  name: string;
  description?: string;
  dungeonMasterId: string;
  playerIds: string[];
  worldIds: string[];
  questIds: string[];
  noteIds: string[];

  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
  isActive: boolean;

  currentSessionId?: string;
  sessionIds: string[];
}
