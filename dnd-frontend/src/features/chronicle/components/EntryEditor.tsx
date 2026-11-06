import { useEffect, useMemo, useState } from "react";
import { MultiSelect, Switch, TagsInput, Text } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import {
  CHRONICLE_CATEGORIES,
  CHRONICLE_CATEGORY_LABELS,
  CHRONICLE_FLAGS,
  CHRONICLE_IMAGE_MAX_BYTES,
  type ChronicleCategory,
  type ChronicleEntry,
  type ChronicleEntryInput,
  type ChronicleFlag,
  type ChronicleFolder,
  type ChronicleVisibility,
} from "@appTypes/Chronicle";
import type { CampaignMemberView } from "@appTypes/Campaign";
import { GlassyTextInput } from "@components/common/GlassyTextInput";
import { CustomSelect } from "@components/common/CustomSelect";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { showNotification } from "@components/Notification/Notification";
import { uploadChronicleImage } from "@services/chronicleService";
import { useChronicleStore } from "@store/chronicle/chronicleStore";
import { useIsMobile } from "@hooks/useIsMobile";
import {
  toMarkdown,
  type TitleIndex,
} from "@features/chronicle/chronicleLinks";
import { folderPath } from "@features/chronicle/folderTree";
import { Segmented } from "@features/chronicle/components/Segmented";
import classes from "@features/chronicle/Chronicle.module.css";

const ROOT = "__root";
const ACCENT = "var(--theme-color-accent-primary)";
const glassy = { input: "glassy-input", label: "glassy-label" };
const switchClasses = {
  root: "sq-switch",
  track: "sq-switch-track",
  thumb: "sq-switch-thumb",
};

interface EntryEditorProps {
  entryId: string | null;
  initial: ChronicleEntryInput;
  campaignId: string;
  folders: ChronicleFolder[];
  players: CampaignMemberView[];
  index: TitleIndex<ChronicleEntry>;
  onSaved: (entry: ChronicleEntry) => void;
  onCancel: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function EntryEditor({
  entryId,
  initial,
  campaignId,
  folders,
  players,
  index,
  onSaved,
  onCancel,
  onDirtyChange,
}: EntryEditorProps) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState(initial);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);
  const patch = (p: Partial<ChronicleEntryInput>) =>
    setDraft((d) => ({ ...d, ...p }));

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const titles = useMemo(
    () =>
      [...index.values()].map((e) => e.title).filter((t) => t !== draft.title),
    [index, draft.title],
  );
  const folderOptions = useMemo(
    () => [
      { value: ROOT, label: "(top level)" },
      ...folders
        .map((f) => ({ value: f.id, label: folderPath(f.id, folders) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ],
    [folders],
  );

  const save = async () => {
    if (!draft.title.trim()) {
      showNotification({ message: "Give the entry a title.", color: "red" });
      return;
    }
    setSaving(true);
    try {
      const store = useChronicleStore.getState();
      const saved = entryId
        ? await store.update(entryId, draft)
        : await store.create({ ...draft, campaignId });
      onDirtyChange(false);
      onSaved(saved);
    } catch (error) {
      showNotification({
        title: "Could not save",
        message: (error as Error).message,
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const uploadImage = async (file: File) => {
    if (file.size > CHRONICLE_IMAGE_MAX_BYTES)
      throw new Error(`${file.name} is over 3 MB.`);
    return uploadChronicleImage(campaignId, file);
  };

  return (
    <section
      className={`${classes.sheet} ${classes.editor}`}
      aria-label={entryId ? "Edit entry" : "New entry"}
    >
      <GlassyTextInput
        label="Title"
        placeholder="Waterdeep, Volo, The Black Network..."
        value={draft.title}
        onChange={(e) => patch({ title: e.currentTarget.value })}
        maxLength={200}
        data-autofocus
        autoFocus={!entryId}
      />

      <div className={classes.editorGrid}>
        <CustomSelect
          label="Folder"
          data={folderOptions}
          value={draft.folderId ?? ROOT}
          onChange={(v) => patch({ folderId: !v || v === ROOT ? null : v })}
          searchable
          classNames={{ label: "glassy-label" }}
        />
        <CustomSelect
          label="Category"
          data={CHRONICLE_CATEGORIES.map((c) => ({
            value: c,
            label: CHRONICLE_CATEGORY_LABELS[c],
          }))}
          value={draft.category}
          onChange={(v) => v && patch({ category: v as ChronicleCategory })}
          classNames={{ label: "glassy-label" }}
        />
        <CustomSelect
          label="Flag (DM only)"
          data={CHRONICLE_FLAGS.map((f) => ({
            value: f,
            label: f === "None" ? "No flag" : f,
          }))}
          value={draft.flag}
          onChange={(v) => v && patch({ flag: v as ChronicleFlag })}
          classNames={{ label: "glassy-label" }}
        />
      </div>

      <TagsInput
        label="Tags"
        placeholder="Type and press Enter"
        value={draft.tags}
        onChange={(tags) =>
          patch({
            tags: tags.map((t) => t.replace(/^#+/, "").trim()).filter(Boolean),
          })
        }
        maxTags={30}
        clearable
        classNames={glassy}
      />

      <div className={classes.editorGrid} style={{ alignItems: "end" }}>
        <div>
          <Text size="sm" className="glassy-label" mb={4}>
            Who can read it
          </Text>
          <Segmented<ChronicleVisibility>
            fullWidth
            label="Who can read it"
            value={draft.visibility}
            onChange={(visibility) => patch({ visibility })}
            data={[
              { value: "Private", label: "Only DMs" },
              { value: "All", label: "All players" },
              { value: "Selected", label: "Some players" },
            ]}
          />
        </div>
        <Switch
          classNames={switchClasses}
          color={ACCENT}
          label="Pin to the top"
          checked={draft.pinned}
          onChange={(e) => patch({ pinned: e.currentTarget.checked })}
        />
      </div>

      {draft.visibility === "Selected" && (
        <MultiSelect
          label="Players"
          placeholder={
            players.length ? "Pick players" : "No players in this campaign yet"
          }
          data={players.map((p) => ({ value: p.userId, label: p.username }))}
          value={draft.sharedWith}
          onChange={(sharedWith) => patch({ sharedWith })}
          searchable
          classNames={glassy}
        />
      )}

      <div>
        <Segmented<"write" | "preview">
          label="Editor mode"
          value={mode}
          onChange={setMode}
          data={[
            { value: "write", label: "Write" },
            { value: "preview", label: "Preview" },
          ]}
        />
      </div>

      {mode === "write" ? (
        <MarkdownTextarea
          label="Content"
          value={draft.content}
          onChange={(content) => patch({ content })}
          minHeightRem={isMobile ? 16 : 24}
          linkSuggestions={titles}
          onUploadImage={uploadImage}
        />
      ) : draft.content.trim() ? (
        <div className={classes.page}>
          <MarkdownRenderer
            className={classes.content}
            textColor="inherit"
            content={toMarkdown(draft.content, index, true)}
          />
        </div>
      ) : (
        <p className={classes.emptyText}>Nothing to preview yet.</p>
      )}

      <div className={classes.editorBar}>
        <span className={classes.hint}>
          <code>[[Title]]</code> links another entry. <code>%%text%%</code>{" "}
          stays hidden from players, even in a shared entry. Paste or drop
          images up to 3 MB. Ctrl+S saves.
        </span>
        <button
          type="button"
          className={`glass-btn-secondary ${classes.button}`}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`glass-btn-primary ${classes.button}`}
          onClick={() => void save()}
          disabled={saving}
        >
          <IconDeviceFloppy size={15} />{" "}
          {saving ? "Saving..." : entryId ? "Save changes" : "Create entry"}
        </button>
      </div>
    </section>
  );
}
