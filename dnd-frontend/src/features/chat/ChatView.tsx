import { Fragment, lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ActionIcon, Badge, Button, Center, Loader, Menu, Popover, Portal, ScrollArea, Stack, Text, Textarea, Tooltip } from "@mantine/core";
import { IconArrowBackUp, IconCheck, IconDots, IconEdit, IconMoodSmile, IconSend, IconSpy, IconTrash, IconUsersGroup, IconX } from "@tabler/icons-react";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useIsMobile } from "@hooks/useIsMobile";
import type { ChatMessage } from "@appTypes/Chat";
import {
  loadShortcodes,
  replaceClosedShortcode,
  replaceShortcodes,
  shortcodeQuery,
  suggestShortcodes,
  type Shortcode,
  type ShortcodeTable,
} from "./shortcodes";
import { ChatAvatar } from "./ChatAvatar";
import "./chat.css";

const MAX_LENGTH = 2000;
// The picker and its emoji data load on first open, not with the page.
const EmojiPickerPanel = lazy(() => import("./EmojiPickerPanel"));
/** Messages from the same speaker closer than this share one card. */
const GROUP_MS = 5 * 60_000;

/** Who a whisper goes to: a character (DM whispers), or null for the DMs (player whispers). */
export interface WhisperTarget {
  characterId: string | null;
  label: string;
  avatar?: string;
}

/** Themed menus (whisper picker, message actions); they're portaled, so the look comes from chat.css. */
const MENU_CLASSES = { dropdown: "chat-menu", item: "chat-menu-item", label: "chat-menu-label", divider: "chat-menu-divider" };

/** The conversation itself, store-free so another campaign screen can host it. */
export function ChatView({
  messages,
  hasMore,
  speaker,
  whisperTargets,
  canEdit,
  canDelete,
  onSend,
  onEdit,
  onDelete,
  onLoadMore,
  avatarOf,
}: {
  messages: ChatMessage[];
  hasMore: boolean;
  speaker: string;
  whisperTargets: WhisperTarget[];
  canEdit: (message: ChatMessage) => boolean;
  canDelete: (message: ChatMessage) => boolean;
  onSend: (text: string, whisperTo: WhisperTarget | null, replyToId: string | null) => Promise<boolean>;
  onEdit: (messageId: string, text: string) => Promise<boolean>;
  onDelete: (messageId: string) => void;
  onLoadMore: () => Promise<void>;
  /** Portrait for a message's speaker; without one the avatar shows their initial (the DM gets a star). */
  avatarOf?: (message: ChatMessage) => string | undefined;
}) {
  const me = useCurrentUserId();
  const viewport = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [whisperTo, setWhisperTo] = useState<WhisperTarget | null>(null);
  const [editingState, setEditing] = useState<ChatMessage | null>(null);
  // A message deleted elsewhere can't be edited any more.
  const editing = editingState && messages.some((m) => m.id === editingState.id) ? editingState : null;
  const [replyState, setReplyTo] = useState<ChatMessage | null>(null);
  // Same for replies; the quoted text follows edits to the original.
  const replyTo = replyState ? (messages.find((m) => m.id === replyState.id) ?? null) : null;
  const byId = new Map(messages.map((m) => [m.id, m]));
  /** Edit/Delete menu for one message, at a viewport point (right-click or the ⋯ button). */
  const [menu, setMenu] = useState<{
    message: ChatMessage;
    x: number;
    y: number;
  } | null>(null);
  // :shortcode: suggestions for the ":query" before the caret; the table loads on the first ":" typed.
  const [codes, setCodes] = useState<ShortcodeTable | null>(null);
  const [caret, setCaret] = useState(0);
  const [pick, setPick] = useState(0);
  /** Colon position of a query closed with Escape, so it stays closed until a new one starts. */
  const [dismissed, setDismissed] = useState<number | null>(null);
  const query = codes ? shortcodeQuery(draft.slice(0, caret)) : null;
  const suggestions = codes && query && query.start !== dismissed ? suggestShortcodes(codes, query.query) : [];
  const picked = suggestions.length ? Math.min(pick, suggestions.length - 1) : 0;

  // Distance from the bottom before older messages were put on top, to keep the view still.
  const fromBottom = useRef<number | null>(null);

  const firstId = messages[0]?.id;
  const content = useRef<HTMLDivElement>(null);
  /** Following the newest message; off while the reader is scrolled up in the history. */
  const following = useRef(true);

  // Stay at the bottom whenever the content grows while following: on open, for new messages, and when it
  // grows late (web fonts, portraits) after the first scroll. Jumps the first time, glides after that.
  useEffect(() => {
    const el = viewport.current;
    const box = content.current;
    if (!el || !box) return;
    let opened = false;
    let lastTop = el.scrollTop;
    // Only the reader turns following off (by scrolling up); our own scrolling only ever goes down.
    const onScroll = () => {
      if (el.scrollHeight - el.clientHeight - el.scrollTop < 48) following.current = true;
      else if (el.scrollTop < lastTop) following.current = false;
      lastTop = el.scrollTop;
    };
    const grew = new ResizeObserver(() => {
      if (following.current && fromBottom.current === null) scrollToBottom(el, opened);
      opened = true;
    });
    el.addEventListener("scroll", onScroll, { passive: true });
    grew.observe(box);
    return () => {
      el.removeEventListener("scroll", onScroll);
      grew.disconnect();
    };
  }, []);

  // Sending always brings you down to your message, even from up in the history.
  const last = messages.at(-1);
  const myLastId = last && last.userId === me ? last.id : undefined;
  useEffect(() => {
    const el = viewport.current;
    if (!el || !myLastId) return;
    following.current = true;
    scrollToBottom(el, true);
  }, [myLastId]);

  useLayoutEffect(() => {
    const el = viewport.current;
    if (el && fromBottom.current !== null) el.scrollTop = el.scrollHeight - fromBottom.current;
    fromBottom.current = null;
  }, [firstId]);

  const loadOlder = async () => {
    const el = viewport.current;
    if (el) fromBottom.current = el.scrollHeight - el.scrollTop;
    setLoadingOlder(true);
    await onLoadMore();
    setLoadingOlder(false);
  };

  const startEdit = (message: ChatMessage) => {
    setReplyTo(null);
    setEditing(message);
    setDraft(message.text);
    input.current?.focus();
  };

  /** Puts the emoji where the cursor is (or replaces the selection), then puts the cursor after it. */
  const insertEmoji = (emoji: string) => {
    const el = input.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    if (next.length > MAX_LENGTH) return;
    setDraft(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const placeCaret = (at: number) => {
    setCaret(at);
    requestAnimationFrame(() => input.current?.setSelectionRange(at, at));
  };

  /** Typing a closing colon on a known name swaps in the emoji right away. */
  const changeDraft = (value: string, caretAt: number) => {
    if (!codes && value.includes(":")) void loadShortcodes().then(setCodes);
    setPick(0);
    const typedForward = value.length > draft.length;
    const replaced = codes && typedForward ? replaceClosedShortcode(codes, value.slice(0, caretAt)) : null;
    if (replaced === null) {
      setDraft(value);
      setCaret(caretAt);
      return;
    }
    setDraft(replaced + value.slice(caretAt));
    placeCaret(replaced.length);
  };

  /** Replaces the ":query" with the emoji and a space. */
  const applySuggestion = (code: Shortcode) => {
    if (!query) return;
    const insert = code.emoji + " ";
    const next = draft.slice(0, query.start) + insert + draft.slice(caret);
    if (next.length > MAX_LENGTH) return;
    setDraft(next);
    placeCaret(query.start + insert.length);
    input.current?.focus();
  };

  const startReply = (message: ChatMessage) => {
    if (editing) cancelEdit();
    setReplyTo(message);
    input.current?.focus();
  };

  /** Brings a quoted message into view and flashes it. */
  const jumpTo = (id: string) => {
    const el = viewport.current?.querySelector<HTMLElement>(`[data-message-id="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });
    el.classList.remove("flash");
    void el.offsetWidth; // restart the animation
    el.classList.add("flash");
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft("");
  };

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    // Shortcodes pasted or typed without the suggestions still become emoji.
    const table = draft.includes(":") ? (codes ?? (await loadShortcodes())) : null;
    const text = (table ? replaceShortcodes(table, draft) : draft).trim();
    const ok = editing
      ? text === editing.text || (await onEdit(editing.id, text))
      : await onSend(text, whisperTo, replyTo?.id ?? null);
    if (ok) {
      setDraft("");
      setEditing(null);
      setReplyTo(null);
    }
    setSending(false);
  };

  const groups = groupMessages(messages);

  return (
    <div className="chat-view">
      <Scroller viewportRef={viewport}>
        <Stack ref={content} gap={8} p="sm">
          {hasMore && (
            <Button size="compact-xs" variant="subtle" color="gray" onClick={() => void loadOlder()} loading={loadingOlder}>
              Load older messages
            </Button>
          )}
          {messages.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="lg">
              Messages show up here for everyone in the campaign.
            </Text>
          )}
          {groups.map((group, i) => {
            const first = group[0];
            return (
              <Fragment key={first.id}>
                {(i === 0 || dayKey(groups[i - 1][0]) !== dayKey(first)) && <div className="chat-day">{dayLabel(first.createdAt)}</div>}
                <div className={`chat-card${first.userId === me ? " mine" : ""}${first.whisper ? " whisper" : ""}`}>
                  <div className="chat-head">
                    <ChatAvatar name={first.name} src={avatarOf?.(first)} dm={first.isDm} />
                    <Text size="sm" fw={700} truncate>
                      {first.name}
                    </Text>
                    {first.isDm && (
                      <Badge size="xs" variant="light" color="violet" className="chat-dm">
                        DM
                      </Badge>
                    )}
                    {first.whisper && (
                      <Text size="xs" className="chat-whisper" truncate>
                        <IconSpy size={12} /> to {first.toName ?? "the DM"}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed" ml="auto" title={fullDate(first.createdAt)}>
                      {time(first.createdAt)}
                    </Text>
                  </div>
                  {group.map((m) => (
                    <div
                      key={m.id}
                      data-message-id={m.id}
                      className={`chat-line${editing?.id === m.id || replyTo?.id === m.id || menu?.message.id === m.id ? " active" : ""}`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setMenu({ message: m, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <Text size="sm" className="chat-text" title={fullDate(m.createdAt)} component="div">
                        {m.replyToId && <Quote original={byId.get(m.replyToId)} onJump={() => jumpTo(m.replyToId!)} />}
                        {m.text}
                        {m.editedAt && (
                          <Text span size="xs" c="dimmed" title={`Edited ${fullDate(m.editedAt)}`}>
                            {" "}
                            (edited)
                          </Text>
                        )}
                      </Text>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        className="chat-actions"
                        aria-label="Reply"
                        title="Reply"
                        onClick={() => startReply(m)}
                      >
                        <IconArrowBackUp size={14} />
                      </ActionIcon>
                      {(canEdit(m) || canDelete(m)) && (
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="gray"
                          className="chat-actions"
                          aria-label="Message actions"
                          onClick={(e) => {
                            const r = e.currentTarget.getBoundingClientRect();
                            setMenu({ message: m, x: r.right, y: r.bottom });
                          }}
                        >
                          <IconDots size={14} />
                        </ActionIcon>
                      )}
                    </div>
                  ))}
                </div>
              </Fragment>
            );
          })}
        </Stack>
      </Scroller>

      {/* Portaled: the glass panel (backdrop-filter) would otherwise be the frame for the fixed anchor. */}
      {menu && (
        <Portal>
          <Menu opened onChange={(o) => !o && setMenu(null)} position="bottom-start" withinPortal={false} shadow="md" classNames={MENU_CLASSES}>
            <Menu.Target>
              {/* Zero-size anchor at the click point. */}
              <div
                style={{
                  position: "fixed",
                  left: menu.x,
                  top: menu.y,
                  width: 0,
                  height: 0,
                }}
              />
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconArrowBackUp size={14} />} onClick={() => startReply(menu.message)}>
                Reply
              </Menu.Item>
              {canEdit(menu.message) && (
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => startEdit(menu.message)}>
                  Edit
                </Menu.Item>
              )}
              {canDelete(menu.message) && (
                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => onDelete(menu.message.id)}>
                  Delete
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Portal>
      )}

      <div className="chat-compose">
        {suggestions.length > 0 && (
          <div className="chat-suggest" role="listbox" aria-label="Emoji suggestions">
            {suggestions.map((code, i) => (
              <div
                key={code.name}
                role="option"
                aria-selected={i === picked}
                className={`chat-suggest-item${i === picked ? " active" : ""}`}
                // Keep focus in the box.
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(code);
                }}
                onMouseEnter={() => setPick(i)}
              >
                <span className="chat-suggest-emoji">{code.emoji}</span>
                <span className="chat-suggest-name">:{code.name}:</span>
              </div>
            ))}
          </div>
        )}
        {replyTo && !editing && (
          <div className="chat-editing">
            <IconArrowBackUp size={12} />
            <span className="chat-replying-text">
              Replying to <b>{replyTo.name}</b>: {replyTo.text}
            </span>
            <ActionIcon size="xs" variant="subtle" color="gray" ml="auto" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <IconX size={12} />
            </ActionIcon>
          </div>
        )}
        {editing && (
          <div className="chat-editing">
            <IconEdit size={12} />
            <span>Editing message</span>
            <ActionIcon size="xs" variant="subtle" color="gray" ml="auto" onClick={cancelEdit} aria-label="Cancel editing">
              <IconX size={12} />
            </ActionIcon>
          </div>
        )}
        <div className="chat-input">
          {!editing && (
            <Menu position="top-start" withinPortal shadow="md" width={200} classNames={MENU_CLASSES}>
              <Menu.Target>
                <Tooltip label={whisperTo ? `Whispering to ${whisperTo.label}` : "Whisper"}>
                  <ActionIcon
                    variant="subtle"
                    className={`chat-whisper-btn${whisperTo ? " active" : ""}`}
                    aria-label={whisperTo ? `Whispering to ${whisperTo.label}` : "Whisper"}
                  >
                    <IconSpy size={17} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconUsersGroup size={15} />}
                  rightSection={!whisperTo && <IconCheck size={14} />}
                  className={whisperTo ? undefined : "selected"}
                  onClick={() => setWhisperTo(null)}
                >
                  Everyone
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>
                  <IconSpy size={12} /> Whisper
                </Menu.Label>
                {whisperTargets.length === 0 && <Menu.Item disabled>No one to whisper to</Menu.Item>}
                {whisperTargets.map((t) => {
                  const chosen = whisperTo?.characterId === t.characterId;
                  return (
                    <Menu.Item
                      key={t.characterId ?? "dm"}
                      leftSection={<ChatAvatar name={t.label} src={t.avatar} dm={t.characterId === null} />}
                      rightSection={chosen && <IconCheck size={14} />}
                      className={chosen ? "selected" : undefined}
                      onClick={() => setWhisperTo(t)}
                    >
                      {t.label}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          )}
          <Textarea
            ref={input}
            size="xs"
            autosize
            minRows={1}
            maxRows={4}
            maxLength={MAX_LENGTH}
            placeholder={whisperTo && !editing ? `Whisper to ${whisperTo.label}` : `Message as ${speaker}`}
            aria-label="Chat message"
            value={draft}
            onChange={(e) => changeDraft(e.currentTarget.value, e.currentTarget.selectionStart)}
            onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
            onKeyDown={(e) => {
              // With suggestions open: arrows move, Enter/Tab pick, Escape closes them.
              if (suggestions.length && !e.nativeEvent.isComposing) {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const step = e.key === "ArrowDown" ? 1 : -1;
                  setPick((picked + step + suggestions.length) % suggestions.length);
                  return;
                }
                if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
                  e.preventDefault();
                  applySuggestion(suggestions[picked]);
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setDismissed(query!.start);
                  return;
                }
              }
              // Enter sends, Shift+Enter breaks the line; leave IME composition alone.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              } else if (e.key === "Escape" && editing) {
                cancelEdit();
              } else if (e.key === "Escape" && replyTo) {
                setReplyTo(null);
              } else if (e.key === "ArrowUp" && !draft) {
                // Up in an empty box edits your last message.
                const last = [...messages].reverse().find(canEdit);
                if (last) {
                  e.preventDefault();
                  startEdit(last);
                }
              }
            }}
            style={{ flex: 1 }}
            rightSection={<EmojiPicker onPick={insertEmoji} />}
          />
          <ActionIcon
            variant="light"
            className="chat-send-btn"
            onClick={() => void send()}
            loading={sending}
            disabled={!draft.trim()}
            aria-label={editing ? "Save" : "Send"}
          >
            <IconSend size={16} />
          </ActionIcon>
        </div>
        {/* The box stops at the cap; say so before it does. */}
        {draft.length > MAX_LENGTH * 0.8 && (
          <div className={`chat-count${draft.length >= MAX_LENGTH ? " full" : ""}`}>
            {draft.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

/** The answered message above a reply; click to jump to it. It may be older than what's loaded, deleted, or a whisper you can't see. */
function Quote({ original, onJump }: { original?: ChatMessage; onJump: () => void }) {
  if (!original)
    return (
      <span className="chat-quote missing">
        <IconArrowBackUp size={12} /> Reply to an earlier message
      </span>
    );
  return (
    <button type="button" className="chat-quote" onClick={onJump} title="Show the original">
      <IconArrowBackUp size={12} />
      <b>{original.name}</b>
      <span>{original.text}</span>
    </button>
  );
}

/** The site's "Reduce motion" setting or the system's. */
const scrollToBottom = (el: HTMLElement, smooth: boolean) =>
  el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reducedMotion() ? "smooth" : "auto" });

const reducedMotion = () =>
  document.documentElement.hasAttribute("data-reduce-motion") || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Phones scroll natively (momentum, the system indicator); elsewhere the thin Mantine scrollbar. */
function Scroller({ viewportRef, children }: { viewportRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <div ref={viewportRef} className="chat-scroll native">
      {children}
    </div>
  ) : (
    <ScrollArea viewportRef={viewportRef} className="chat-scroll" type="auto">
      {children}
    </ScrollArea>
  );
}

const dayKey = (m: ChatMessage) => new Date(m.createdAt).toDateString();

/** Runs of messages from the same speaker, same day, same audience, a few minutes apart. */
function groupMessages(messages: ChatMessage[]) {
  const groups: ChatMessage[][] = [];
  for (const m of messages) {
    const last = groups.at(-1)?.at(-1);
    const joins =
      last &&
      last.userId === m.userId &&
      last.name === m.name &&
      last.whisper === m.whisper &&
      last.toCharacterId === m.toCharacterId &&
      dayKey(last) === dayKey(m) &&
      Date.parse(m.createdAt) - Date.parse(last.createdAt) < GROUP_MS;
    if (joins) groups.at(-1)!.push(m);
    else groups.push([m]);
  }
  return groups;
}

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fullDate = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

/** The picker button shows one of these, a new one on each hover. */
const HOVER_FACES = ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😛", "😜", "🤪", "😎", "🤓", "🥳", "🤩", "😏", "🤔", "🤗", "🤭", "😮", "😲", "😳", "🥺", "😬", "🙃", "😺", "👻", "🐉"];

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [opened, setOpened] = useState(false);
  const [face, setFace] = useState<string | null>(null);
  const shuffle = () =>
    setFace((prev) => {
      const others = HOVER_FACES.filter((f) => f !== prev);
      return others[Math.floor(Math.random() * others.length)];
    });
  return (
    <Popover opened={opened} onChange={setOpened} position="top-end" withinPortal shadow="lg" radius="md">
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          color="gray"
          onClick={() => setOpened((o) => !o)}
          onMouseEnter={shuffle}
          onMouseLeave={() => setFace(null)}
          aria-label="Emoji"
        >
          {face ? <span className="chat-emoji-face">{face}</span> : <IconMoodSmile size={16} />}
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={0} className="chat-emoji-pop">
        <Suspense
          fallback={
            <Center w={296} h={320}>
              <Loader size="sm" color="violet" />
            </Center>
          }
        >
          <EmojiPickerPanel
            onPick={(emoji) => {
              onPick(emoji);
              setOpened(false);
            }}
          />
        </Suspense>
      </Popover.Dropdown>
    </Popover>
  );
}
