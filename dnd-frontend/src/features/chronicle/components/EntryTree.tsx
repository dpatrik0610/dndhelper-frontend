import { useMemo, useState, type ReactNode, type Ref } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  IconChevronDown,
  IconChevronRight,
  IconFlag,
  IconFolder,
  IconFolderOpen,
  IconFolderPlus,
  IconLock,
  IconPencil,
  IconPin,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import {
  CHRONICLE_CATEGORIES,
  CHRONICLE_CATEGORY_COLORS,
  CHRONICLE_CATEGORY_LABELS,
  CHRONICLE_FLAG_COLORS,
  type ChronicleCategory,
  type ChronicleEntry,
  type ChronicleFolder,
} from "@appTypes/Chronicle";
import { GlassyTextInput } from "@components/common/GlassyTextInput";
import {
  buildTree,
  isDescendant,
  type FolderNode,
} from "@features/chronicle/folderTree";
import { entryMatches, isShared } from "@features/chronicle/chronicleUtils";
import { Segmented } from "@features/chronicle/components/Segmented";
import classes from "@features/chronicle/Chronicle.module.css";

type Node = FolderNode<ChronicleFolder, ChronicleEntry>;
type DragItem =
  | { type: "entry"; entry: ChronicleEntry }
  | { type: "folder"; folder: ChronicleFolder };
const ROOT = "root";

interface EntryTreeProps {
  entries: ChronicleEntry[];
  folders: ChronicleFolder[];
  isDm: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewEntry: (folderId: string | null) => void;
  onNewFolder: (parentId: string | null) => void;
  onEditFolder: (folder: ChronicleFolder) => void;
  onDeleteFolder: (folder: ChronicleFolder) => void;
  onMoveEntry: (entry: ChronicleEntry, folderId: string | null) => void;
  onMoveFolder: (folder: ChronicleFolder, parentId: string | null) => void;
  searchRef?: Ref<HTMLInputElement>;
}

const TAG_LIMIT = 8;

export function EntryTree(props: EntryTreeProps) {
  const { entries, folders, isDm, onMoveEntry, onMoveFolder, searchRef } =
    props;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ChronicleCategory | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [allTags, setAllTags] = useState(false);
  const [groupBy, setGroupBy] = useState<"folders" | "categories">("folders");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const tags = useMemo(() => {
    const count = new Map<string, number>();
    for (const t of entries.flatMap((e) => e.tags))
      count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.keys()].sort(
      (a, b) => count.get(b)! - count.get(a)! || a.localeCompare(b),
    );
  }, [entries]);
  const topTags = tags.slice(0, TAG_LIMIT);
  const shownTags = allTags
    ? tags
    : tag && !topTags.includes(tag)
      ? [...topTags, tag]
      : topTags;
  const filtering = !!search.trim() || !!category || !!tag || flaggedOnly;
  const visible = useMemo(
    () =>
      entries
        .filter(
          (e) =>
            entryMatches(e, search) &&
            (!category || e.category === category) &&
            (!tag || e.tags.includes(tag)) &&
            (!flaggedOnly || e.flag !== "None" || e.pinned),
        )
        .sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) ||
            a.title.localeCompare(b.title),
        ),
    [entries, search, category, tag, flaggedOnly],
  );
  const tree = useMemo(() => buildTree(folders, entries), [folders, entries]);

  const toggle = (id: string) =>
    setCollapsed((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const item = active.data.current as DragItem | undefined;
    if (!item || !over) return;
    const target = over.id === ROOT ? null : String(over.id);
    if (item.type === "entry" && item.entry.folderId !== target)
      onMoveEntry(item.entry, target);
    if (
      item.type === "folder" &&
      item.folder.parentId !== target &&
      (target === null || !isDescendant(target, item.folder.id, folders))
    )
      onMoveFolder(item.folder, target);
  };

  const renderFolder = (node: Node): ReactNode => {
    const open = !collapsed.has(node.folder.id);
    return (
      <div key={node.folder.id}>
        <FolderRow
          folder={node.folder}
          open={open}
          count={countEntries(node)}
          isDm={isDm}
          onToggle={() => toggle(node.folder.id)}
          onNewEntry={() => props.onNewEntry(node.folder.id)}
          onNewFolder={() => props.onNewFolder(node.folder.id)}
          onEdit={() => props.onEditFolder(node.folder)}
          onDelete={() => props.onDeleteFolder(node.folder)}
        />
        {open && (node.children.length > 0 || node.entries.length > 0) && (
          <div className={classes.children}>
            {node.children.map(renderFolder)}
            {node.entries.map((e) => (
              <EntryRow
                key={e.id}
                entry={e}
                isDm={isDm}
                shared={isShared(e, folders)}
                selected={e.id === props.selectedId}
                onSelect={props.onSelect}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const flat = (list: ChronicleEntry[]) =>
    list.map((e) => (
      <EntryRow
        key={e.id}
        entry={e}
        isDm={isDm}
        shared={isShared(e, folders)}
        selected={e.id === props.selectedId}
        onSelect={props.onSelect}
      />
    ));

  let body: ReactNode;
  if (entries.length === 0 && folders.length === 0) {
    body = (
      <p className={classes.emptyNote}>
        {isDm
          ? "No entries yet. Start with a place, a person or a plot thread."
          : "Nothing has been shared with you yet."}
      </p>
    );
  } else if (filtering) {
    body = visible.length ? (
      flat(visible)
    ) : (
      <p className={classes.emptyNote}>No entries match these filters.</p>
    );
  } else if (groupBy === "categories") {
    body = CHRONICLE_CATEGORIES.map((c) => {
      const list = visible.filter((e) => e.category === c);
      if (!list.length) return null;
      return (
        <div key={c}>
          <h3 className={classes.groupTitle}>
            <span
              className={classes.dot}
              style={{ background: CHRONICLE_CATEGORY_COLORS[c] }}
            />
            {CHRONICLE_CATEGORY_LABELS[c]}
            <span className={classes.chipCount}>{list.length}</span>
          </h3>
          {flat(list)}
        </div>
      );
    });
  } else {
    body = (
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {tree.roots.map(renderFolder)}
        {tree.rootEntries.map((e) => (
          <EntryRow
            key={e.id}
            entry={e}
            isDm={isDm}
            shared={isShared(e, folders)}
            selected={e.id === props.selectedId}
            onSelect={props.onSelect}
          />
        ))}
        {isDm && <RootDrop />}
      </DndContext>
    );
  }

  return (
    <div className={`${classes.pane} ${classes.tree}`}>
      <GlassyTextInput
        ref={searchRef}
        aria-label="Search the Chronicle"
        placeholder="Search the journal"
        leftSection={<IconSearch size={15} />}
        rightSection={<kbd className={classes.kbd}>Ctrl K</kbd>}
        rightSectionWidth={64}
        rightSectionPointerEvents="none"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && filtering && visible[0])
            props.onSelect(visible[0].id);
          if (e.key === "Escape") setSearch("");
        }}
        size="sm"
      />

      <div className={classes.filters}>
        {CHRONICLE_CATEGORIES.filter((c) =>
          entries.some((e) => e.category === c),
        ).map((c) => (
          <button
            key={c}
            type="button"
            className={classes.chip}
            data-active={category === c || undefined}
            onClick={() => setCategory(category === c ? null : c)}
          >
            <span
              className={classes.dot}
              style={{ background: CHRONICLE_CATEGORY_COLORS[c] }}
            />
            {CHRONICLE_CATEGORY_LABELS[c]}
            <span className={classes.chipCount}>
              {entries.filter((e) => e.category === c).length}
            </span>
          </button>
        ))}
        {isDm && (
          <button
            type="button"
            className={classes.chip}
            data-active={flaggedOnly || undefined}
            onClick={() => setFlaggedOnly((v) => !v)}
          >
            <IconFlag size={11} /> Flagged
          </button>
        )}
      </div>

      {tags.length > 0 && (
        <div className={classes.filters}>
          {shownTags.map((t) => (
            <button
              key={t}
              type="button"
              className={classes.chip}
              data-active={tag === t || undefined}
              onClick={() => setTag(tag === t ? null : t)}
            >
              #{t}
            </button>
          ))}
          {tags.length > TAG_LIMIT && (
            <button
              type="button"
              className={`${classes.chip} ${classes.moreChip}`}
              onClick={() => setAllTags((v) => !v)}
              aria-expanded={allTags}
            >
              {allTags ? "Fewer tags" : `+${tags.length - TAG_LIMIT} more`}
            </button>
          )}
        </div>
      )}

      {!filtering && (
        <Segmented<"folders" | "categories">
          fullWidth
          label="Group entries by"
          value={groupBy}
          onChange={setGroupBy}
          data={[
            { value: "folders", label: "Folders" },
            { value: "categories", label: "Categories" },
          ]}
        />
      )}

      <div className={classes.treeBody} role="tree">
        {body}
      </div>
    </div>
  );
}

const countEntries = (node: Node): number =>
  node.entries.length + node.children.reduce((n, c) => n + countEntries(c), 0);

function EntryRow({
  entry,
  isDm,
  shared,
  selected,
  onSelect,
}: {
  entry: ChronicleEntry;
  isDm: boolean;
  shared: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `entry:${entry.id}`,
    data: { type: "entry", entry } satisfies DragItem,
    disabled: !isDm,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={classes.row}
      data-selected={selected || undefined}
      data-dragging={isDragging || undefined}
      onClick={() => onSelect(entry.id)}
      {...attributes}
      {...listeners}
      role="treeitem"
      aria-selected={selected}
    >
      <span
        className={classes.dot}
        style={{ background: CHRONICLE_CATEGORY_COLORS[entry.category] }}
      />
      <span className={classes.rowLabel}>{entry.title}</span>
      {entry.pinned && <IconPin size={12} aria-label="Pinned" />}
      {entry.flag !== "None" && (
        <IconFlag
          size={12}
          color={CHRONICLE_FLAG_COLORS[entry.flag]}
          aria-label={entry.flag}
        />
      )}
      {isDm && !shared && (
        <IconLock size={12} className={classes.faint} aria-label="Only DMs" />
      )}
    </button>
  );
}

function FolderRow({
  folder,
  open,
  count,
  isDm,
  onToggle,
  onNewEntry,
  onNewFolder,
  onEdit,
  onDelete,
}: {
  folder: ChronicleFolder;
  open: boolean;
  count: number;
  isDm: boolean;
  onToggle: () => void;
  onNewEntry: () => void;
  onNewFolder: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const drag = useDraggable({
    id: `folder:${folder.id}`,
    data: { type: "folder", folder } satisfies DragItem,
    disabled: !isDm,
  });
  const drop = useDroppable({ id: folder.id, disabled: !isDm });
  const setRef = (el: HTMLElement | null) => {
    drag.setNodeRef(el);
    drop.setNodeRef(el);
  };

  return (
    <div
      ref={setRef}
      className={`${classes.row} ${classes.folderRow}`}
      data-drop-target={(drop.isOver && !drag.isDragging) || undefined}
      data-dragging={drag.isDragging || undefined}
      {...drag.attributes}
      {...drag.listeners}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      role="treeitem"
      aria-expanded={open}
    >
      {open ? <IconChevronDown size={13} /> : <IconChevronRight size={13} />}
      {open ? <IconFolderOpen size={15} /> : <IconFolder size={15} />}
      <span className={classes.rowLabel}>{folder.name}</span>
      {isDm && folder.visibility !== "Private" && (
        <IconUsers
          size={13}
          className={classes.sharedMark}
          aria-label={
            folder.visibility === "All"
              ? "Shared with all players"
              : "Shared with some players"
          }
        />
      )}
      <span className={classes.rowCount}>{count}</span>
      {isDm && (
        <span
          className={classes.rowActions}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className={classes.iconButton}
            onClick={onNewEntry}
            aria-label={`New entry in ${folder.name}`}
            title="New entry here"
          >
            <IconPlus size={13} />
          </button>
          <button
            type="button"
            className={classes.iconButton}
            onClick={onNewFolder}
            aria-label={`New folder in ${folder.name}`}
            title="New subfolder"
          >
            <IconFolderPlus size={13} />
          </button>
          <button
            type="button"
            className={classes.iconButton}
            onClick={onEdit}
            aria-label={`Rename ${folder.name}`}
            title="Rename / move"
          >
            <IconPencil size={13} />
          </button>
          <button
            type="button"
            className={classes.iconButton}
            onClick={onDelete}
            aria-label={`Delete ${folder.name}`}
            title="Delete folder"
          >
            <IconTrash size={13} />
          </button>
        </span>
      )}
    </div>
  );
}

function RootDrop() {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT });
  return (
    <div
      ref={setNodeRef}
      className={classes.rootDrop}
      data-drop-target={isOver || undefined}
    >
      Drop here to move to the top level
    </div>
  );
}
