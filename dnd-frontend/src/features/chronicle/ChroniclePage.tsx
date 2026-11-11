import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowBackUp,
  IconArrowRight,
  IconBraces,
  IconChevronLeft,
  IconFolderPlus,
  IconLayoutSidebar,
  IconLink,
  IconMoon,
  IconPlus,
  IconSun,
  IconX,
} from "@tabler/icons-react";
import { Link, useSearchParams } from "react-router";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";
import {
  CHRONICLE_CATEGORY_COLORS,
  type ChronicleEntry,
  type ChronicleEntryInput,
  type ChronicleFolder,
} from "@appTypes/Chronicle";
import { CampaignRoles, type CampaignMemberView } from "@appTypes/Campaign";
import { BaseModal } from "@components/BaseModal";
import { showNotification } from "@components/Notification/Notification";
import { getCampaignMembers } from "@services/campaignService";
import {
  useCurrentCampaign,
  useCurrentCampaignId,
  useIsDm,
} from "@store/campaign/campaignSelectors";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { getIsSuperAdmin } from "@store/auth/authUtils";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import {
  backlinks,
  decodeNewLink,
  INTERNAL_LINK,
  NEW_LINK,
  outgoing,
  parseOutline,
  plainText,
  titleIndex,
  toMarkdown,
  wordCount,
  type TitleIndex,
} from "@features/chronicle/chronicleLinks";
import {
  blankInput,
  isShared,
  toFolderInput,
  toInput,
} from "@features/chronicle/chronicleUtils";
import { folderPath } from "@features/chronicle/folderTree";
import { EntryTree } from "@features/chronicle/components/EntryTree";
import { EntryView } from "@features/chronicle/components/EntryView";
import { EntryEditor } from "@features/chronicle/components/EntryEditor";
import { DiscussionPanel } from "@features/chronicle/components/DiscussionPanel";
import { GraphView } from "@features/chronicle/components/GraphView";
import { ChronicleIndex } from "@features/chronicle/components/ChronicleIndex";
import { FolderModal } from "@features/chronicle/components/FolderModal";
import { Segmented } from "@features/chronicle/components/Segmented";
import {
  JsonDumpPanel,
  JsonEntryPanel,
} from "@features/chronicle/components/JsonPanel";
import classes from "@features/chronicle/Chronicle.module.css";

type EditorState = {
  key: number;
  entryId: string | null;
  initial: ChronicleEntryInput;
};
type FolderModalState = {
  key: number;
  folder: ChronicleFolder | null;
  parentId: string | null;
};

const MAX_TABS = 12;

const fail = (title: string) => (error: unknown) =>
  showNotification({
    title,
    message: error instanceof Error ? error.message : "Something went wrong.",
    color: "red",
  });

export default function ChroniclePage() {
  const campaignId = useCurrentCampaignId();
  const campaign = useCurrentCampaign();
  const narrow = useMediaQuery("(max-width: 1280px)") ?? false;
  const [treeOpen, setTreeOpen] = useState(false);
  const isDm = useIsDm();
  const entries = useChronicleStore((s) => s.entries);
  const folders = useChronicleStore((s) => s.folders);
  const loading = useChronicleStore((s) => s.loading);
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("entry");

  const [view, setView] = useState<"notes" | "graph">("notes");
  const [players, setPlayers] = useState<CampaignMemberView[]>([]);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [folderModal, setFolderModal] = useState<FolderModalState | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<ChronicleEntry | null>(
    null,
  );
  const [deletingFolder, setDeletingFolder] = useState<ChronicleFolder | null>(
    null,
  );
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [searchTick, setSearchTick] = useState(0);
  const [mode, setMode] = useLocalStorage<"light" | "dark">({
    key: "chronicle-mode",
    defaultValue: "light",
  });
  const [devMode, setDevMode] = useLocalStorage({
    key: "chronicle-dev",
    defaultValue: false,
  });
  const dirtyRef = useRef(false);
  const keyRef = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const { isConnected: live } = useSignalRConnection();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      setTreeOpen(true);
      setSearchTick((n) => n + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!searchTick) return;
    searchRef.current?.focus();
    searchRef.current?.select();
  }, [searchTick]);

  useEffect(() => {
    if (selectedId)
      setOpenIds((ids) =>
        ids.includes(selectedId) ? ids : [...ids, selectedId].slice(-MAX_TABS),
      );
  }, [selectedId]);

  useEffect(() => {
    if (campaignId)
      void useChronicleStore
        .getState()
        .load(campaignId)
        .catch(fail("Could not load the Chronicle"));
  }, [campaignId]);

  useEffect(() => {
    if (!campaignId || !isDm) return;
    let stale = false;
    getCampaignMembers(campaignId)
      .then(
        (members) =>
          !stale &&
          setPlayers(
            members.filter((m) => !m.roles.includes(CampaignRoles.Dm)),
          ),
      )
      .catch(() => !stale && setPlayers([]));
    return () => {
      stale = true;
    };
  }, [campaignId, isDm]);

  const index = useMemo(() => titleIndex(entries), [entries]);
  const devAllowed = isDm && (import.meta.env.DEV || getIsSuperAdmin());
  const dev = devAllowed && devMode;
  const selected = entries.find((e) => e.id === selectedId) ?? null;
  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  // Leaving an editor with unsaved text asks first.
  const guard = (action: () => void) => {
    if (editor && dirtyRef.current) setPending(() => action);
    else action();
  };

  const select = (id: string | null) =>
    guard(() => {
      setEditor(null);
      setTreeOpen(false);
      setView("notes");
      setParams(id ? { entry: id } : {});
    });

  const newEntry = (folderId: string | null, title = "") =>
    campaignId &&
    guard(() => {
      setView("notes");
      setEditor({
        key: ++keyRef.current,
        entryId: null,
        initial: blankInput(campaignId, title, folderId),
      });
    });

  const closeTab = (id: string) => {
    const at = openIds.indexOf(id);
    const rest = openIds.filter((x) => x !== id);
    if (id !== selectedId) {
      setOpenIds(rest);
      return;
    }
    guard(() => {
      setOpenIds(rest);
      setEditor(null);
      const next = rest[Math.min(at, rest.length - 1)];
      setParams(next ? { entry: next } : {});
    });
  };

  const editEntry = (entry: ChronicleEntry) =>
    setEditor({
      key: ++keyRef.current,
      entryId: entry.id,
      initial: toInput(entry),
    });

  const onLink = (href: string) => {
    if (href.startsWith(INTERNAL_LINK))
      select(href.slice(INTERNAL_LINK.length));
    else if (href.startsWith(NEW_LINK) && isDm)
      newEntry(selected?.folderId ?? null, decodeNewLink(href));
  };

  const moveEntry = (entry: ChronicleEntry, folderId: string | null) =>
    void useChronicleStore
      .getState()
      .update(entry.id, { ...toInput(entry), folderId })
      .catch(fail("Could not move the entry"));

  const moveFolder = (folder: ChronicleFolder, parentId: string | null) =>
    void useChronicleStore
      .getState()
      .updateFolder(folder.id, { ...toFolderInput(folder), parentId })
      .catch(fail("Could not move the folder"));

  const setVisibility = (
    entry: ChronicleEntry,
    visibility: "All" | "Private",
  ) =>
    void useChronicleStore
      .getState()
      .update(entry.id, { ...toInput(entry), visibility, sharedWith: [] })
      .then(() =>
        showNotification({
          message:
            visibility === "All"
              ? `${entry.title} is now readable by all players.`
              : `${entry.title} is hidden from players again.`,
          color: "green",
        }),
      )
      .catch(fail("Could not change who can read it"));

  const confirmDeleteEntry = async () => {
    if (!deletingEntry) return;
    try {
      await useChronicleStore.getState().remove(deletingEntry.id);
      if (selectedId === deletingEntry.id) setParams({});
      setDeletingEntry(null);
    } catch (error) {
      fail("Could not delete the entry")(error);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!deletingFolder) return;
    try {
      await useChronicleStore.getState().removeFolder(deletingFolder.id);
      setDeletingFolder(null);
    } catch (error) {
      fail("Could not delete the folder")(error);
    }
  };

  const back = (
    <Link to="/" className={classes.back} title="Back to Home">
      <IconChevronLeft size={18} /> Home
    </Link>
  );

  if (!campaignId)
    return (
      <div className={classes.workspace} data-mode={mode}>
        <aside className={classes.leather}>
          <div className={classes.leatherHead}>{back}</div>
        </aside>
        <div className={classes.paper}>
          <div className={classes.centered}>
            <IconAlertCircle size={40} className={classes.centeredIcon} />
            <Text fw={600}>No campaign selected</Text>
            <Text size="sm" className={classes.muted}>
              Go back Home and pick or join a campaign to open its Chronicle.
            </Text>
          </div>
        </div>
      </div>
    );

  const tabs = openIds
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is ChronicleEntry => !!e);
  const words = selected
    ? wordCount(toMarkdown(selected.content, index, isDm))
    : 0;
  const rail = selected && !editor && (
    <ContextRail
      entry={selected}
      entries={entries}
      index={index}
      isDm={isDm}
      onOpen={(id) => select(id)}
    />
  );

  let main;
  if (editor)
    main = (
      <EntryEditor
        key={editor.key}
        entryId={editor.entryId}
        initial={editor.initial}
        campaignId={campaignId}
        folders={folders}
        players={players}
        index={index}
        onDirtyChange={setDirty}
        onCancel={() => guard(() => setEditor(null))}
        onSaved={(entry) => {
          setEditor(null);
          setParams({ entry: entry.id });
        }}
      />
    );
  else if (dev && selected)
    main = <JsonEntryPanel key={selected.id} entry={selected} />;
  else if (selected)
    main = (
      <EntryView
        key={selected.id}
        entry={selected}
        index={index}
        folders={folders}
        players={players}
        isDm={isDm}
        onLink={onLink}
        onEdit={() => editEntry(selected)}
        onSetVisibility={(v) => setVisibility(selected, v)}
        onDelete={() => setDeletingEntry(selected)}
      />
    );
  else if (dev) main = <JsonDumpPanel entries={entries} folders={folders} />;
  else
    main = (
      <ChronicleIndex
        entries={entries}
        index={index}
        campaignName={campaign?.name ?? null}
        isDm={isDm}
        onOpen={(id) => select(id)}
        onCreate={(title) => newEntry(null, title)}
        onNewEntry={() => newEntry(null)}
        onNewFolder={() =>
          setFolderModal({
            key: ++keyRef.current,
            folder: null,
            parentId: null,
          })
        }
      />
    );

  const stats =
    loading && entries.length === 0
      ? "Loading..."
      : (campaign?.name ?? "Campaign journal");
  const openNewFolder = (parentId: string | null) =>
    setFolderModal({ key: ++keyRef.current, folder: null, parentId });

  return (
    <div
      className={classes.workspace}
      data-mode={mode}
      data-tree-open={treeOpen || undefined}
    >
      <aside className={classes.leather} aria-label="Chronicle entries">
        <div className={classes.leatherHead}>
          {back}
          <div className={classes.brandRow}>
            <button
              type="button"
              className={classes.brand}
              onClick={() => select(null)}
              title="Open the Chronicle index"
            >
              <span className={classes.brandName}>Chronicle</span>
              <span className={classes.brandStats}>{stats}</span>
            </button>
            <button
              type="button"
              className={`${classes.iconButton} ${classes.treeToggle}`}
              onClick={() => setTreeOpen((v) => !v)}
              aria-label={treeOpen ? "Hide entries" : "Show entries"}
              aria-expanded={treeOpen}
            >
              <IconLayoutSidebar size={18} />
            </button>
          </div>
        </div>

        <EntryTree
          entries={entries}
          folders={folders}
          isDm={isDm}
          selectedId={editor ? editor.entryId : selectedId}
          searchRef={searchRef}
          onSelect={(id) => select(id)}
          onNewEntry={(folderId) => newEntry(folderId)}
          onNewFolder={openNewFolder}
          onEditFolder={(folder) =>
            setFolderModal({
              key: ++keyRef.current,
              folder,
              parentId: folder.parentId,
            })
          }
          onDeleteFolder={setDeletingFolder}
          onMoveEntry={moveEntry}
          onMoveFolder={moveFolder}
        />

        {isDm && (
          <div className={classes.leatherFoot}>
            <button
              type="button"
              className={`glass-btn-primary ${classes.button} ${classes.bigButton}`}
              onClick={() => newEntry(null)}
            >
              <IconPlus size={16} /> New entry
            </button>
            <button
              type="button"
              className={`${classes.iconButton} ${classes.squareButton}`}
              onClick={() => openNewFolder(null)}
              aria-label="New folder"
              title="New folder"
            >
              <IconFolderPlus size={18} />
            </button>
          </div>
        )}
      </aside>

      <div className={classes.paper}>
        <header className={classes.paperBar}>
          <div
            className={classes.entryTabs}
            role="tablist"
            aria-label="Open entries"
          >
            {tabs.length === 0 && !editor && (
              <span className={classes.tabsEmpty}>
                Entries you open stay here as tabs.
              </span>
            )}
            {tabs.map((e) => (
              <div
                key={e.id}
                role="tab"
                tabIndex={0}
                aria-selected={e.id === selectedId}
                className={classes.entryTab}
                data-active={
                  (e.id === selectedId && !(editor && !editor.entryId)) ||
                  undefined
                }
                onClick={() => select(e.id)}
                onAuxClick={(ev) => {
                  if (ev.button === 1) closeTab(e.id);
                }}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    select(e.id);
                  }
                }}
                title={e.title}
              >
                <span
                  className={classes.dot}
                  style={{ background: CHRONICLE_CATEGORY_COLORS[e.category] }}
                />
                <span className={classes.rowLabel}>{e.title}</span>
                <button
                  type="button"
                  className={classes.tabClose}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    closeTab(e.id);
                  }}
                  aria-label={`Close ${e.title}`}
                >
                  <IconX size={12} />
                </button>
              </div>
            ))}
            {editor && !editor.entryId && (
              <div
                role="tab"
                aria-selected
                className={classes.entryTab}
                data-active
              >
                <span className={classes.rowLabel}>
                  {editor.initial.title || "New entry"}
                </span>
              </div>
            )}
          </div>
          <Segmented<"notes" | "graph">
            label="View"
            value={view}
            onChange={(v) =>
              guard(() => {
                setEditor(null);
                setView(v);
              })
            }
            data={[
              { value: "notes", label: "Journal" },
              { value: "graph", label: "Graph" },
            ]}
          />
          {devAllowed && (
            <button
              type="button"
              className={`${classes.iconButton} ${classes.modeToggle}`}
              onClick={() =>
                guard(() => {
                  setEditor(null);
                  setView("notes");
                  setDevMode(!devMode);
                })
              }
              aria-pressed={devMode}
              aria-label="Dev mode: view and edit entries as JSON"
              title={devMode ? "Leave dev mode" : "Dev mode (JSON)"}
            >
              <IconBraces size={18} />
            </button>
          )}
          <button
            type="button"
            className={`${classes.iconButton} ${classes.modeToggle}`}
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            aria-label={
              mode === "dark" ? "Switch to light pages" : "Switch to dark pages"
            }
            title={mode === "dark" ? "Light pages" : "Dark pages"}
          >
            {mode === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </button>
        </header>

        {view === "graph" ? (
          <GraphView
            entries={entries}
            index={index}
            selectedId={selectedId}
            onOpen={(id) => select(id)}
          />
        ) : (
          <div className={classes.panes} data-norail={!rail || undefined}>
            <main className={`${classes.pane} ${classes.folio}`}>
              {main}
              {narrow && rail && (
                <div className={classes.railInline}>{rail}</div>
              )}
            </main>
            {!narrow && rail && (
              <aside
                className={`${classes.pane} ${classes.rail}`}
                aria-label="About this entry"
              >
                {rail}
              </aside>
            )}
          </div>
        )}

        <footer className={classes.statusBar}>
          <span className={classes.statusItem}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
          <span className={classes.statusItem}>
            {folders.length} {folders.length === 1 ? "folder" : "folders"}
          </span>
          {isDm && (
            <span className={classes.statusItem}>
              {entries.filter((e) => isShared(e, folders)).length} shared with
              players
            </span>
          )}
          <span className={classes.toolbarSpacer} />
          {selected && !editor && (
            <>
              <span className={classes.statusItem}>{words} words</span>
              <span className={classes.statusItem}>
                {Math.max(1, Math.ceil(words / 200))} min read
              </span>
            </>
          )}
          {editor && (
            <span className={classes.statusItem}>Editing, Ctrl+S to save</span>
          )}
          <span
            className={classes.statusItem}
            title={
              live
                ? "Changes from others appear instantly"
                : "Reconnecting to live updates"
            }
          >
            <span className={classes.liveDot} data-live={live || undefined} />{" "}
            {live ? "Live" : "Offline"}
          </span>
        </footer>
      </div>

      {folderModal && (
        <FolderModal
          key={folderModal.key}
          campaignId={campaignId}
          folders={folders}
          players={players}
          folder={folderModal.folder}
          parentId={folderModal.parentId}
          onClose={() => setFolderModal(null)}
        />
      )}

      <BaseModal
        opened={deletingEntry != null}
        onClose={() => setDeletingEntry(null)}
        title="Delete entry"
        size="sm"
        onSave={() => void confirmDeleteEntry()}
        saveLabel="Delete"
      >
        <Text size="sm">
          Delete <strong>{deletingEntry?.title}</strong> and its discussion?
          Links to it will show as missing.
        </Text>
      </BaseModal>

      <BaseModal
        opened={deletingFolder != null}
        onClose={() => setDeletingFolder(null)}
        title="Delete folder"
        size="sm"
        onSave={() => void confirmDeleteFolder()}
        saveLabel="Delete"
      >
        <Text size="sm">
          Delete <strong>{deletingFolder?.name}</strong>? Nothing inside is
          lost: its entries and subfolders move to{" "}
          {deletingFolder?.parentId ? (
            <strong>{folderPath(deletingFolder.parentId, folders)}</strong>
          ) : (
            "the top level"
          )}
          .
        </Text>
      </BaseModal>

      <BaseModal
        opened={pending != null}
        onClose={() => setPending(null)}
        title="Discard changes?"
        size="sm"
        onSave={() => {
          const action = pending;
          setPending(null);
          dirtyRef.current = false;
          action?.();
        }}
        saveLabel="Discard"
      >
        <Text size="sm">
          This entry has unsaved changes. Leave without saving?
        </Text>
      </BaseModal>
    </div>
  );
}

/** Links and discussion for the open entry, as tabs. The discussion stays mounted so its tab can show a count. */
function ContextRail({
  entry,
  entries,
  index,
  isDm,
  onOpen,
}: {
  entry: ChronicleEntry;
  entries: ChronicleEntry[];
  index: TitleIndex<ChronicleEntry>;
  isDm: boolean;
  onOpen: (id: string) => void;
}) {
  const [tab, setTab] = useState<"links" | "outline" | "discussion">("links");
  const [count, setCount] = useState(0);
  const out = useMemo(() => outgoing(entry, index), [entry, index]);
  const back = useMemo(
    () => backlinks(entry, entries, index),
    [entry, entries, index],
  );
  const outline = useMemo(
    () => parseOutline(toMarkdown(entry.content, index, isDm)),
    [entry.content, index, isDm],
  );

  const jumpTo = (i: number) => {
    const text = outline[i].text;
    const nth = outline.slice(0, i).filter((o) => o.text === text).length;
    const match = [
      ...document.querySelectorAll<HTMLElement>(
        "[data-chronicle-content] :is(h1, h2, h3)",
      ),
    ].filter((h) => plainText(h.textContent ?? "") === text)[nth];
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    match?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "start",
    });
  };

  const list = (items: ChronicleEntry[], empty: string) =>
    items.length ? (
      <div className={classes.linkList}>
        {items.map((e) => (
          <button
            key={e.id}
            type="button"
            className={classes.linkButton}
            onClick={() => onOpen(e.id)}
          >
            <span
              className={classes.dot}
              style={{ background: CHRONICLE_CATEGORY_COLORS[e.category] }}
            />
            <span className={classes.rowLabel}>{e.title}</span>
          </button>
        ))}
      </div>
    ) : (
      <p className={classes.railNote}>{empty}</p>
    );

  return (
    <>
      <div
        className={classes.tabs}
        role="tablist"
        aria-label="About this entry"
      >
        <button
          type="button"
          role="tab"
          className={classes.tab}
          aria-selected={tab === "links"}
          onClick={() => setTab("links")}
        >
          Links{" "}
          {out.length + back.length > 0 && (
            <span className={classes.faint}>{out.length + back.length}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          className={classes.tab}
          aria-selected={tab === "outline"}
          onClick={() => setTab("outline")}
        >
          Outline{" "}
          {outline.length > 0 && (
            <span className={classes.faint}>{outline.length}</span>
          )}
        </button>
        <button
          type="button"
          role="tab"
          className={classes.tab}
          aria-selected={tab === "discussion"}
          onClick={() => setTab("discussion")}
        >
          Discussion{" "}
          {count > 0 && <span className={classes.faint}>{count}</span>}
        </button>
      </div>
      <div
        className={classes.railBody}
        role="tabpanel"
        hidden={tab !== "links"}
      >
        <h3 className={classes.railHeading}>
          <IconArrowRight size={13} /> Links to
        </h3>
        {list(out, "This entry doesn't link to any other entry.")}
        <h3 className={classes.railHeading}>
          <IconArrowBackUp size={13} /> Linked from
        </h3>
        {list(back, "No other entry links here yet.")}
        <p
          className={classes.railNote}
          style={{ display: "flex", gap: 6, alignItems: "flex-start" }}
        >
          <IconLink size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Write [[{entry.title}]] in another entry to link to this one.
          </span>
        </p>
      </div>
      <div
        className={classes.railBody}
        role="tabpanel"
        hidden={tab !== "outline"}
      >
        {outline.length ? (
          outline.map((o, i) => (
            <button
              key={`${o.text}-${i}`}
              type="button"
              className={classes.outlineItem}
              style={{
                paddingLeft: 8 + (o.level - 1) * 14,
                fontWeight: o.level === 1 ? 600 : 400,
              }}
              onClick={() => jumpTo(i)}
            >
              {o.text}
            </button>
          ))
        ) : (
          <p className={classes.railNote}>
            No headings yet. Start a line with # or ## to give this entry
            sections.
          </p>
        )}
      </div>
      <div
        className={classes.railBody}
        role="tabpanel"
        hidden={tab !== "discussion"}
      >
        <DiscussionPanel
          key={entry.id}
          entry={entry}
          isDm={isDm}
          onCount={setCount}
        />
      </div>
    </>
  );
}
