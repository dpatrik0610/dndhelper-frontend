import type {
  ChronicleEntry,
  ChronicleEntryInput,
  ChronicleFolder,
  ChronicleFolderInput,
} from "@appTypes/Chronicle";
import { sharingFolder } from "@features/chronicle/folderTree";

export const toInput = (entry: ChronicleEntry): ChronicleEntryInput => ({
  campaignId: entry.campaignId,
  title: entry.title,
  content: entry.content,
  folderId: entry.folderId,
  category: entry.category,
  tags: entry.tags,
  pinned: entry.pinned,
  flag: entry.flag,
  visibility: entry.visibility,
  sharedWith: entry.sharedWith,
});

export const toFolderInput = (
  folder: ChronicleFolder,
): ChronicleFolderInput => ({
  campaignId: folder.campaignId,
  name: folder.name,
  parentId: folder.parentId,
  visibility: folder.visibility,
  sharedWith: folder.sharedWith,
});

/** Shared with at least one player, directly or through a folder above it. */
export const isShared = (entry: ChronicleEntry, folders: ChronicleFolder[]) =>
  entry.visibility !== "Private" ||
  sharingFolder(entry.folderId, folders) != null;

export const blankInput = (
  campaignId: string,
  title = "",
  folderId: string | null = null,
): ChronicleEntryInput => ({
  campaignId,
  title,
  content: "",
  folderId,
  category: "Other",
  tags: [],
  pinned: false,
  flag: "None",
  visibility: "Private",
  sharedWith: [],
});

export function entryMatches(entry: ChronicleEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    entry.title.toLowerCase().includes(q) ||
    entry.content.toLowerCase().includes(q) ||
    entry.tags.some((t) => t.toLowerCase().includes(q))
  );
}
