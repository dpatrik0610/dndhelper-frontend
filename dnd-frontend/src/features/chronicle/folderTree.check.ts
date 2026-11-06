// Self-check for folderTree. Run: see .claude/skills/verify/run.sh (esbuild bundle | node)
import assert from "node:assert/strict";
import {
  buildTree,
  folderPath,
  isDescendant,
  sharingFolder,
} from "./folderTree.ts";

const f = (id: string, name: string, parentId: string | null = null) => ({
  id,
  name,
  parentId,
});
const e = (
  id: string,
  title: string,
  folderId: string | null,
  pinned = false,
) => ({ id, title, folderId, pinned });

const folders = [
  f("w", "World"),
  f("c", "Coast", "w"),
  f("a", "Aardvark", "w"),
  f("x", "Orphan", "missing"),
];
const entries = [
  e("1", "Zed", "c"),
  e("2", "Alpha", "c"),
  e("3", "Pinned", "c", true),
  e("4", "Root", null),
  e("5", "Lost", "gone"),
];

const { roots, rootEntries } = buildTree(folders, entries);
assert.deepEqual(
  roots.map((n) => n.folder.id),
  ["x", "w"],
  "orphan folder at root, sorted by name",
);
assert.deepEqual(
  roots[1].children.map((n) => n.folder.id),
  ["a", "c"],
);
assert.deepEqual(
  roots[1].children[1].entries.map((x) => x.id),
  ["3", "2", "1"],
  "pinned first, then by title",
);
assert.deepEqual(
  rootEntries.map((x) => x.id),
  ["5", "4"],
  "missing folder -> root",
);

assert.equal(isDescendant("c", "w", folders), true);
assert.equal(isDescendant("w", "w", folders), true);
assert.equal(isDescendant("w", "c", folders), false);

const loop = [f("p", "P", "q"), f("q", "Q", "p")];
assert.equal(isDescendant("p", "zzz", loop), false, "terminates on a cycle");
assert.equal(
  buildTree(loop, []).roots.length,
  2,
  "looping folders still show up",
);

assert.equal(folderPath("c", folders), "World / Coast");
assert.equal(folderPath("nope", folders), "");

const s = (id: string, parentId: string | null, visibility = "Private") => ({
  id,
  name: id,
  parentId,
  visibility,
});
const shared = [
  s("top", null, "All"),
  s("mid", "top"),
  s("leaf", "mid"),
  s("own", null),
  s("sel", "own", "Selected"),
];
assert.equal(
  sharingFolder("leaf", shared)?.id,
  "top",
  "inherits from a shared ancestor",
);
assert.equal(
  sharingFolder("sel", shared)?.id,
  "sel",
  "nearest shared folder wins",
);
assert.equal(sharingFolder("own", shared), null, "private all the way up");
assert.equal(sharingFolder(null, shared), null, "root entries have no folder");
assert.equal(
  sharingFolder("p", [s("p", "q"), s("q", "p")]),
  null,
  "terminates on a cycle",
);

console.log("folderTree ok");
