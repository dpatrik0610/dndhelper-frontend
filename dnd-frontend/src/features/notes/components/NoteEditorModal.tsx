import { Suspense, lazy, useEffect, useState } from "react";
import { Loader, Menu, Modal, Stack, TextInput } from "@mantine/core";
import { IconDeviceFloppy, IconEye, IconPencil, IconTemplate } from "@tabler/icons-react";
import type { Note } from "@appTypes/Note";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { useNoteActions } from "@store/note/noteSelectors";
import { showNotification } from "@components/Notification/Notification";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { useIsMobile } from "@hooks/useIsMobile";
import { noteBody } from "@features/notes/noteUtils";
import { timeAgo } from "@utils/timeAgo";
import classes from "@features/notes/Notes.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

const TEMPLATES = [
  { label: "Session recap", content: "## Session recap\n- Key events:\n- NPCs met:\n- Hooks for next time:\n" },
  { label: "NPC / faction", content: "### NPC / Faction\n- Name:\n- Where we met:\n- Motive:\n- Favor owed?:\n" },
  { label: "Clue / puzzle", content: "### Clue\n- Found at:\n- Why it matters:\n- Next guess:\n" },
];

interface NoteEditorModalProps {
  opened: boolean;
  /** The note to edit; null writes a new one. */
  note: Note | null;
  onClose: () => void;
}

export function NoteEditorModal({ opened, note, onClose }: NoteEditorModalProps) {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const { create, update } = useNoteActions();
  const isMobile = useIsMobile();

  const initialTitle = note?.title ?? "";
  const initialBody = note ? noteBody(note) : "";
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [saving, setSaving] = useState(false);

  // Each open starts from the note as saved (or blank for a new one).
  useEffect(() => {
    if (!opened) return;
    setTitle(initialTitle);
    setBody(initialBody);
    setMode("write");
  }, [opened, initialTitle, initialBody]);

  const dirty = title !== initialTitle || body !== initialBody;
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  const insertTemplate = (content: string) => {
    setBody((prev) => (prev.trim() ? `${prev.replace(/\n*$/, "")}\n\n${content}` : content));
    setMode("write");
  };

  async function handleSave() {
    if (!title.trim() && !body.trim()) {
      showNotification({ title: "Nothing to save", message: "Give the note a title or some text first.", color: "yellow" });
      return;
    }

    setSaving(true);
    try {
      const lines = body.split("\n");
      if (note?.id) {
        await update(note.id, { title: title.trim() || "Untitled note", lines });
      } else if (character) {
        const created = await create({ title: title.trim() || "Untitled note", lines });
        updateCharacter({ noteIds: [...(character.noteIds ?? []), created.id!] });
      }
      onClose();
    } catch (error) {
      showNotification({ title: "Could not save the note", message: (error as Error).message, color: "red" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={() => !saving && onClose()}
      title={<span className={classes.dialogTitle}>{note ? "Edit note" : "New note"}</span>}
      size="lg"
      fullScreen={isMobile}
      centered
      // Typed text isn't thrown away by a stray click beside the dialog.
      closeOnClickOutside={!dirty && !saving}
      closeOnEscape={!saving}
      classNames={{ content: classes.dialog }}
    >
      <Stack gap="md">
        <TextInput
          aria-label="Title"
          placeholder="Title"
          size="md"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          data-autofocus={!note || undefined}
        />

        <div className={classes.editorBar}>
          <div className={classes.modeSwitch} role="group" aria-label="Editor mode">
            <button type="button" className={classes.modeButton} aria-pressed={mode === "write"} onClick={() => setMode("write")}>
              <IconPencil size={14} /> Write
            </button>
            <button type="button" className={classes.modeButton} aria-pressed={mode === "preview"} onClick={() => setMode("preview")}>
              <IconEye size={14} /> Preview
            </button>
          </div>

          <Menu position="bottom-end" withinPortal classNames={{ dropdown: "glassy-dropdown" }}>
            <Menu.Target>
              <button type="button" className={classes.modeButton}>
                <IconTemplate size={14} /> Insert template
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              {TEMPLATES.map((template) => (
                <Menu.Item key={template.label} onClick={() => insertTemplate(template.content)}>
                  {template.label}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        </div>

        {mode === "write" ? (
          <MarkdownTextarea label="Content" value={body} onChange={setBody} minHeightRem={isMobile ? 18 : 16} />
        ) : (
          <div className={classes.preview}>
            {body.trim() ? (
              <Suspense fallback={<Loader size="sm" />}>
                <MarkdownRenderer content={body} textColor="var(--theme-color-text-primary, #fff)" />
              </Suspense>
            ) : (
              <span className={classes.muted}>Nothing to preview yet.</span>
            )}
          </div>
        )}

        <div className={classes.dialogFooter}>
          <span className={classes.muted} style={{ fontSize: "var(--mantine-font-size-xs)" }}>
            {words} word{words === 1 ? "" : "s"} · Markdown and #tags supported
            {note?.updatedAt && ` · Last edited ${timeAgo(note.updatedAt)}`}
          </span>
          <div className={classes.dialogFooterButtons}>
            <button type="button" className={classes.secondaryButton} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="button" className={classes.primaryButton} onClick={() => void handleSave()} disabled={saving}>
              {saving ? <Loader size={14} color="currentColor" /> : <IconDeviceFloppy size={16} />}
              {note ? "Save" : "Create note"}
            </button>
          </div>
        </div>
      </Stack>
    </Modal>
  );
}
