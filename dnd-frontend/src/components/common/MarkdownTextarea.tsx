import {
  Textarea,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconTable,
  IconMinus,
  IconPhoto,
} from "@tabler/icons-react";
import {
  useRef,
  useState,
  useMemo,
  type ClipboardEvent,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { showNotification } from "@components/Notification/Notification";

// Toolbar buttons follow the theme: muted at rest, accent while the selection already has that format.
const toolStyle = (active: boolean): CSSProperties =>
  active
    ? {
        color: "var(--theme-color-accent-primary, #f59e0b)",
        background: "color-mix(in srgb, var(--theme-color-accent-primary, #f59e0b) 18%, transparent)",
      }
    : { color: "color-mix(in srgb, var(--theme-color-text-primary, #fff) 65%, transparent)" };

interface MarkdownTextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minHeightRem?: number;
  /** Titles offered while typing a [[wiki link]]. */
  linkSuggestions?: string[];
  /** Enables the image button, paste and drop. Resolves to the uploaded image's URL; throw to reject the file. */
  onUploadImage?: (file: File) => Promise<string>;
}

const LINK_QUERY = /\[\[([^\]\n|]*)$/;
const MAX_SUGGESTIONS = 8;

export function MarkdownTextarea({
  label = "Details",
  value,
  onChange,
  minHeightRem = 8,
  linkSuggestions,
  onUploadImage,
}: MarkdownTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestionsClosed, setSuggestionsClosed] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const linkQuery =
    linkSuggestions && selection.start === selection.end ? LINK_QUERY.exec(value.slice(0, selection.start))?.[1] : undefined;
  const suggestions = useMemo(() => {
    if (linkQuery === undefined || !linkSuggestions) return [];
    const q = linkQuery.trim().toLowerCase();
    return linkSuggestions.filter((t) => t.toLowerCase().includes(q)).slice(0, MAX_SUGGESTIONS);
  }, [linkQuery, linkSuggestions]);
  const showSuggestions = suggestions.length > 0 && !suggestionsClosed;

  function moveCaret(pos: number) {
    const el = textareaRef.current;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(pos, pos);
      setSelection({ start: pos, end: pos });
    });
  }

  function insertLink(title: string) {
    if (linkQuery === undefined) return;
    const start = selection.start - linkQuery.length;
    const rest = value.slice(selection.start);
    const after = rest.startsWith("]]") ? rest.slice(2) : rest;
    onChange(`${value.slice(0, start)}${title}]]${after}`);
    moveCaret(start + title.length + 2);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActiveSuggestion((i) => (i + step + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertLink(suggestions[Math.min(activeSuggestion, suggestions.length - 1)]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setSuggestionsClosed(true);
    }
  }

  // A placeholder marks where each image lands, so typing during the upload doesn't lose its place.
  async function uploadImages(files: File[]) {
    if (!onUploadImage) return;
    for (const file of files.filter((f) => f.type.startsWith("image/"))) {
      const name = file.name.replace(/[[\]()]/g, "") || "image";
      const placeholder = `![Uploading ${name}...]()`;
      const pos = textareaRef.current?.selectionStart ?? valueRef.current.length;
      onChange(`${valueRef.current.slice(0, pos)}${placeholder}${valueRef.current.slice(pos)}`);
      try {
        const url = await onUploadImage(file);
        onChange(valueRef.current.replace(placeholder, `![${name}](${url})`));
      } catch (error) {
        onChange(valueRef.current.replace(placeholder, ""));
        showNotification({ title: "Image not added", message: (error as Error).message, color: "red" });
      }
    }
  }

  function imageFiles(list: FileList) {
    const files = [...list];
    return onUploadImage && files.some((f) => f.type.startsWith("image/")) ? files : null;
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const files = imageFiles(e.clipboardData.files);
    if (!files) return;
    e.preventDefault();
    void uploadImages(files);
  }

  function handleDrop(e: DragEvent<HTMLTextAreaElement>) {
    const files = imageFiles(e.dataTransfer.files);
    if (!files) return;
    e.preventDefault();
    void uploadImages(files);
  }

  function updateSelectionFromElement(el: HTMLTextAreaElement) {
    setSelection({
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    });
  }

  function handleSelect(e: SyntheticEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    updateSelectionFromElement(el);
  }

  function isWrapped(prefix: string, suffix: string = prefix) {
    const { start, end } = selection;
    if (start >= end) return false;
    if (start - prefix.length < 0) return false;
    if (end + suffix.length > value.length) return false;

    const before = value.slice(start - prefix.length, start);
    const after = value.slice(end, end + suffix.length);
    return before === prefix && after === suffix;
  }

    function wrapOrUnwrap(prefix: string, suffix: string = prefix) {
    const el = textareaRef.current;
    if (!el) return;

    const { start, end } = selection;
    if (start >= end) return;

    const selectedFull = value.slice(start, end);

    const leadingSpaces = selectedFull.match(/^\s*/)?.[0].length ?? 0;
    const trailingSpaces = selectedFull.match(/\s*$/)?.[0].length ?? 0;

    const innerStart = start + leadingSpaces;
    const innerEnd = end - trailingSpaces;
    const selected = value.slice(innerStart, innerEnd);

    const alreadyWrapped =
        innerStart >= prefix.length &&
        value.slice(innerStart - prefix.length, innerStart) === prefix &&
        value.slice(innerEnd, innerEnd + suffix.length) === suffix;

    if (alreadyWrapped) {
        const before = value.slice(0, innerStart - prefix.length);
        const after = value.slice(innerEnd + suffix.length);

        const newValue = before + selectedFull + after;
        onChange(newValue);

        const newStart = innerStart - prefix.length;
        const newEnd = newStart + selectedFull.length;

        requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(newStart, newEnd);
        setSelection({ start: newStart, end: newEnd });
        });
    } else {
        const wrapped = prefix + selected + suffix;

        const newValue =
        value.slice(0, start) +
        wrapped +
        value.slice(end);

        onChange(newValue);

        const newInnerStart = start + prefix.length;
        const newInnerEnd = newInnerStart + selected.length;

        requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(newInnerStart, newInnerEnd);
        setSelection({ start: newInnerStart, end: newInnerEnd });
        });
    }
    }

  function applyBold() {
    wrapOrUnwrap("**");
  }

  function applyItalic() {
    wrapOrUnwrap("_");
  }

  function applyBulletList() {
    const el = textareaRef.current;
    if (!el) return;

    const { start, end } = selection;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    const block = selected || "";
    const linesInBlock = block.split("\n");

    const nonEmpty = linesInBlock.filter((l) => l.trim().length > 0);
    const allBulleted =
      nonEmpty.length > 0 &&
      nonEmpty.every((l) => l.trim().match(/^[-*]\s+/));

    let transformed: string;

    if (allBulleted) {
      transformed = linesInBlock
        .map((l) =>
          l.trim().match(/^[-*]\s+/)
            ? l.replace(/^(\s*)[-*]\s+/, "$1")
            : l
        )
        .join("\n");
    } else {
      transformed = linesInBlock
        .map((l) =>
          l.trim().length ? `- ${l.replace(/^[-*]\s+/, "")}` : ""
        )
        .join("\n");
    }

    const next = before + transformed + after;
    onChange(next);

    const newStart = before.length;
    const newEnd = newStart + transformed.length;

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
      setSelection({ start: newStart, end: newEnd });
    });
  }

  function applyNumberedList() {
    const el = textareaRef.current;
    if (!el) return;

    const { start, end } = selection;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    const block = selected || "";
    const linesInBlock = block.split("\n");

    const nonEmpty = linesInBlock.filter((l) => l.trim().length > 0);
    const allNumbered =
      nonEmpty.length > 0 &&
      nonEmpty.every((l) => l.trim().match(/^\d+\.\s+/));

    let transformed: string;

    if (allNumbered) {
      transformed = linesInBlock
        .map((l) =>
          l.trim().match(/^\d+\.\s+/)
            ? l.replace(/^(\s*)\d+\.\s+/, "$1")
            : l
        )
        .join("\n");
    } else {
      let index = 1;
      transformed = linesInBlock
        .map((l) => {
          if (!l.trim().length) return "";
          const clean = l.replace(/^\d+\.\s+/, "").replace(/^[-*]\s+/, "");
          const line = `${index}. ${clean}`;
          index += 1;
          return line;
        })
        .join("\n");
    }

    const next = before + transformed + after;
    onChange(next);

    const newStart = before.length;
    const newEnd = newStart + transformed.length;

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newStart, newEnd);
      setSelection({ start: newStart, end: newEnd });
    });
  }

  function insertTableTemplate() {
    const el = textareaRef.current;
    if (!el) return;

    const { start, end } = selection;

    const before = value.slice(0, start);
    const after = value.slice(end);

    const table = `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |`;

    const needsBlankBefore =
      before.length > 0 && !before.endsWith("\n\n");
    const prefix = needsBlankBefore
      ? "\n\n"
      : before.endsWith("\n")
      ? "\n"
      : "\n\n";

    const needsBlankAfter =
      after.length > 0 && !after.startsWith("\n\n");
    const suffix = needsBlankAfter ? "\n\n" : "\n";

    const insert = prefix + table + suffix;
    const next = before + insert + after;
    onChange(next);

    const newPos = before.length + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
      setSelection({ start: newPos, end: newPos });
    });
  }

  function insertHorizontalRule() {
    const el = textareaRef.current;
    if (!el) return;

    const { start, end } = selection;

    const before = value.slice(0, start);
    const after = value.slice(end);

    const hr = "---";

    const needsBlankBefore =
      before.length > 0 && !before.endsWith("\n");
    const prefix = needsBlankBefore
      ? "\n"
      : before.endsWith("\n")
      ? ""
      : "\n";

    const needsBlankAfter =
      after.length > 0 && !after.startsWith("\n\n");
    const suffix = needsBlankAfter ? "\n" : "";

    const insert = prefix + hr + suffix;
    const next = before + insert + after;
    onChange(next);

    const newPos = before.length + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
      setSelection({ start: newPos, end: newPos });
    });
  }

  const boldActive = isWrapped("**");
  const italicActive = isWrapped("_");

  const listActive = useMemo(() => {
    const { start, end } = selection;
    if (start >= end) return false;

    const selected = value.slice(start, end);
    const linesInBlock = selected.split("\n");
    const nonEmpty = linesInBlock.filter((l) => l.trim().length > 0);

    return (
      nonEmpty.length > 0 &&
      nonEmpty.every((l) => l.trim().match(/^[-*]\s+/))
    );
  }, [value, selection]);

  const numberedListActive = useMemo(() => {
    const { start, end } = selection;
    if (start >= end) return false;

    const selected = value.slice(start, end);
    const linesInBlock = selected.split("\n");
    const nonEmpty = linesInBlock.filter((l) => l.trim().length > 0);

    return (
      nonEmpty.length > 0 &&
      nonEmpty.every((l) => l.trim().match(/^\d+\.\s+/))
    );
  }, [value, selection]);

  return (
    <>
      <Group gap="xs" mb={4}>
        <Tooltip label="Bold" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            style={toolStyle(boldActive)}
            onClick={applyBold}
          >
            <IconBold size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Italic" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            style={toolStyle(italicActive)}
            onClick={applyItalic}
          >
            <IconItalic size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Bullet list" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            style={toolStyle(listActive)}
            onClick={applyBulletList}
          >
            <IconList size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Numbered list" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            style={toolStyle(numberedListActive)}
            onClick={applyNumberedList}
          >
            <IconListNumbers size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Insert table" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            style={toolStyle(false)}
            onClick={insertTableTemplate}
          >
            <IconTable size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Horizontal rule (---)" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            style={toolStyle(false)}
            onClick={insertHorizontalRule}
          >
            <IconMinus size={14} />
          </ActionIcon>
        </Tooltip>

        {onUploadImage && (
          <Tooltip label="Add image (or paste / drop one)" withArrow>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              style={toolStyle(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconPhoto size={14} />
            </ActionIcon>
          </Tooltip>
        )}
        {onUploadImage && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const files = [...(e.currentTarget.files ?? [])];
              e.currentTarget.value = "";
              void uploadImages(files);
            }}
          />
        )}
      </Group>

      <Textarea
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        label={label}
        autosize={false}
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value);
          updateSelectionFromElement(e.currentTarget);
          setSuggestionsClosed(false);
          setActiveSuggestion(0);
        }}
        onSelect={handleSelect}
        onKeyUp={handleSelect}
        onKeyDown={handleKeyDown}
        onClick={handleSelect}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onBlur={() => setSuggestionsClosed(true)}
        onFocus={() => setSuggestionsClosed(false)}
        ref={textareaRef}
        styles={{
          input: {
            minHeight: `${minHeightRem}rem`,
            resize: "vertical",
          },
        }}
      />
      {showSuggestions && (
        <div role="listbox" aria-label="Link to entry" style={SUGGESTION_LIST_STYLE}>
          {suggestions.map((title, i) => (
            <div
              key={title}
              role="option"
              aria-selected={i === activeSuggestion}
              style={suggestionStyle(i === activeSuggestion)}
              onMouseDown={(e) => {
                e.preventDefault();
                insertLink(title);
              }}
            >
              {title}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const SUGGESTION_LIST_STYLE: CSSProperties = {
  marginTop: 4,
  padding: 4,
  borderRadius: 8,
  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
  background: "var(--theme-bg-panel-opaque, var(--theme-bg-panel, rgba(15, 15, 15, 0.95)))",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
};

const suggestionStyle = (active: boolean): CSSProperties => ({
  padding: "6px 10px",
  borderRadius: 6,
  fontSize: "var(--mantine-font-size-sm)",
  cursor: "pointer",
  color: active ? "var(--theme-color-accent-primary, #f59e0b)" : "var(--theme-color-text-primary, #fff)",
  background: active ? "color-mix(in srgb, var(--theme-color-accent-primary, #f59e0b) 14%, transparent)" : "transparent",
});
