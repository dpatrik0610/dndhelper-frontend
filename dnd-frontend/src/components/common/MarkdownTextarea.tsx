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
} from "@tabler/icons-react";
import {
  useRef,
  useState,
  useMemo,
  type SyntheticEvent,
} from "react";

interface MarkdownTextareaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minHeightRem?: number;
}

export function MarkdownTextarea({
  label = "Details",
  value,
  onChange,
  minHeightRem = 8,
}: MarkdownTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

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

    // Detect internal trimmed section
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
        // --- UNWRAP ---
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
        // --- WRAP ---
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
      // remove bullets
      transformed = linesInBlock
        .map((l) =>
          l.trim().match(/^[-*]\s+/)
            ? l.replace(/^(\s*)[-*]\s+/, "$1")
            : l
        )
        .join("\n");
    } else {
      // add bullets
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
      // remove numeric list formatting
      transformed = linesInBlock
        .map((l) =>
          l.trim().match(/^\d+\.\s+/)
            ? l.replace(/^(\s*)\d+\.\s+/, "$1")
            : l
        )
        .join("\n");
    } else {
      // add numeric list
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

  // active states for buttons
  const boldActive = useMemo(() => isWrapped("**"), [value, selection]);
  const italicActive = useMemo(() => isWrapped("_"), [value, selection]);

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
            variant={boldActive ? "filled" : "subtle"}
            color={boldActive ? "cyan" : undefined}
            onClick={applyBold}
          >
            <IconBold size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Italic" withArrow>
          <ActionIcon
            size="sm"
            variant={italicActive ? "filled" : "subtle"}
            color={italicActive ? "cyan" : undefined}
            onClick={applyItalic}
          >
            <IconItalic size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Bullet list" withArrow>
          <ActionIcon
            size="sm"
            variant={listActive ? "filled" : "subtle"}
            color={listActive ? "cyan" : undefined}
            onClick={applyBulletList}
          >
            <IconList size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Numbered list" withArrow>
          <ActionIcon
            size="sm"
            variant={numberedListActive ? "filled" : "subtle"}
            color={numberedListActive ? "cyan" : undefined}
            onClick={applyNumberedList}
          >
            <IconListNumbers size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Insert table" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={insertTableTemplate}
          >
            <IconTable size={14} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Horizontal rule (---)" withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={insertHorizontalRule}
          >
            <IconMinus size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Textarea
        classNames={{ input: "glassy-input", label: "glassy-label" }}
        label={label}
        autosize={false}
        value={value}
        onChange={(e) => {
          onChange(e.currentTarget.value);
          updateSelectionFromElement(e.currentTarget);
        }}
        onSelect={handleSelect}
        onKeyUp={handleSelect}
        onClick={handleSelect}
        ref={textareaRef}
        styles={{
          input: {
            minHeight: `${minHeightRem}rem`,
            resize: "vertical",
          },
        }}
      />
    </>
  );
}
