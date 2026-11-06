export interface FolderLike {
  id: string;
  name: string;
  parentId: string | null;
}

export interface EntryLike {
  id: string;
  title: string;
  folderId: string | null;
  pinned: boolean;
}

export interface FolderNode<F extends FolderLike, E extends EntryLike> {
  folder: F;
  children: FolderNode<F, E>[];
  entries: E[];
}

const byEntry = (x: EntryLike, y: EntryLike) =>
  Number(y.pinned) - Number(x.pinned) || x.title.localeCompare(y.title);

/** Nested folders with their entries; anything whose folder (or parent) is missing lands at the root. */
export function buildTree<F extends FolderLike, E extends EntryLike>(
  folders: F[],
  entries: E[],
) {
  const nodes = new Map(
    folders.map((f) => [
      f.id,
      { folder: f, children: [], entries: [] } as FolderNode<F, E>,
    ]),
  );
  const roots: FolderNode<F, E>[] = [];
  const rootEntries: E[] = [];

  for (const node of nodes.values()) {
    const parentId = node.folder.parentId;
    const parent = parentId ? nodes.get(parentId) : undefined;
    if (parent && parentId && !isDescendant(parentId, node.folder.id, folders))
      parent.children.push(node);
    else roots.push(node);
  }
  for (const entry of entries) {
    const node = entry.folderId ? nodes.get(entry.folderId) : undefined;
    (node ? node.entries : rootEntries).push(entry);
  }

  const sort = (list: FolderNode<F, E>[]) => {
    list.sort((x, y) => x.folder.name.localeCompare(y.folder.name));
    for (const n of list) {
      n.entries.sort(byEntry);
      sort(n.children);
    }
  };
  sort(roots);
  rootEntries.sort(byEntry);
  return { roots, rootEntries };
}

/** True when `folderId` is `ancestorId` or sits somewhere under it. Stops on broken (looping) data. */
export function isDescendant(
  folderId: string,
  ancestorId: string,
  folders: FolderLike[],
): boolean {
  const parents = new Map(folders.map((f) => [f.id, f.parentId]));
  const seen = new Set<string>();
  for (
    let id: string | null | undefined = folderId;
    id && !seen.has(id);
    id = parents.get(id)
  ) {
    if (id === ancestorId) return true;
    seen.add(id);
  }
  return false;
}

/** The nearest folder at or above `folderId` that is shared with players, or null. Sharing a folder shares everything under it. */
export function sharingFolder<F extends FolderLike & { visibility: string }>(
  folderId: string | null,
  folders: F[],
): F | null {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const seen = new Set<string>();
  for (
    let f = folderId ? byId.get(folderId) : undefined;
    f && !seen.has(f.id);
    f = f.parentId ? byId.get(f.parentId) : undefined
  ) {
    if (f.visibility !== "Private") return f;
    seen.add(f.id);
  }
  return null;
}

/** "Sword Coast / Waterdeep", for pickers. */
export function folderPath(folderId: string, folders: FolderLike[]): string {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const names: string[] = [];
  const seen = new Set<string>();
  for (
    let f = byId.get(folderId);
    f && !seen.has(f.id);
    f = f.parentId ? byId.get(f.parentId) : undefined
  ) {
    seen.add(f.id);
    names.unshift(f.name);
  }
  return names.join(" / ");
}
