export const CHRONICLE_CATEGORIES = [
  "Location",
  "Npc",
  "Faction",
  "Item",
  "Lore",
  "Quest",
  "Session",
  "Other",
] as const;
export type ChronicleCategory = (typeof CHRONICLE_CATEGORIES)[number];

export const CHRONICLE_FLAGS = [
  "None",
  "Important",
  "Todo",
  "Idea",
  "Done",
] as const;
export type ChronicleFlag = (typeof CHRONICLE_FLAGS)[number];

export type ChronicleVisibility = "Private" | "All" | "Selected";

/** Players get a stripped copy: no %%secrets%%, flag "None", pinned false, sharedWith empty. */
export interface ChronicleEntry {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  folderId: string | null;
  category: ChronicleCategory;
  tags: string[];
  pinned: boolean;
  flag: ChronicleFlag;
  visibility: ChronicleVisibility;
  sharedWith: string[];
  createdBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ChronicleEntryInput {
  campaignId?: string;
  title: string;
  content: string;
  folderId: string | null;
  category: ChronicleCategory;
  tags: string[];
  pinned: boolean;
  flag: ChronicleFlag;
  visibility: ChronicleVisibility;
  sharedWith: string[];
}

/** Sharing a folder shares everything under it. Players get visibility "All" on folders they can read and no sharedWith. */
export interface ChronicleFolder {
  id: string;
  campaignId: string;
  name: string;
  parentId: string | null;
  visibility: ChronicleVisibility;
  sharedWith: string[];
}

export interface ChronicleFolderInput {
  campaignId?: string;
  name: string;
  parentId: string | null;
  visibility: ChronicleVisibility;
  sharedWith: string[];
}

export interface ChronicleComment {
  id: string;
  entryId: string;
  userId: string;
  username: string;
  isDm: boolean;
  text: string;
  createdAt: string | null;
}

export const CHRONICLE_CATEGORY_LABELS: Record<ChronicleCategory, string> = {
  Location: "Location",
  Npc: "NPC",
  Faction: "Faction",
  Item: "Item",
  Lore: "Lore",
  Quest: "Quest",
  Session: "Session",
  Other: "Other",
};

export const CHRONICLE_CATEGORY_COLORS: Record<ChronicleCategory, string> = {
  Location: "#4ade80",
  Npc: "#f59e0b",
  Faction: "#f87171",
  Item: "#60a5fa",
  Lore: "#c084fc",
  Quest: "#facc15",
  Session: "#2dd4bf",
  Other: "#94a3b8",
};

export const CHRONICLE_FLAG_COLORS: Record<
  Exclude<ChronicleFlag, "None">,
  string
> = {
  Important: "#ef4444",
  Todo: "#f59e0b",
  Idea: "#a78bfa",
  Done: "#22c55e",
};

export const CHRONICLE_IMAGE_MAX_BYTES = 3 * 1024 * 1024;
