import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActionIcon, Button, Loader, Menu, ScrollArea, TextInput, Tooltip } from "@mantine/core";
import {
  IconDots,
  IconPlayerPlay,
  IconPlayerSkipForward,
  IconPlayerStop,
  IconRotateClockwise,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Session, SessionDetails } from "@appTypes/Session";
import { useSessionStore } from "@store/session/sessionStore";
import { nextPlanned } from "@store/session/sessionSelectors";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import shared from "@styles/InventoryDashboard.module.css";
import classes from "@features/admin/SessionManager/SessionManager.module.css";
import { SessionLog } from "./SessionLog";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

type SaveState = "saved" | "pending" | "saving" | "error";
const SAVE_LABEL: Record<SaveState, string> = { saved: "All changes saved", pending: "Unsaved", saving: "Saving…", error: "Not saved" };

const detailsOf = (s: Session): SessionDetails => ({
  name: s.name,
  number: s.number,
  location: s.location,
  scheduledFor: s.scheduledFor,
  plan: s.plan,
  recap: s.recap,
});

function useAutosave(id: string, draft: SessionDetails) {
  const save = useSessionStore((s) => s.save);
  const json = JSON.stringify(draft);
  const savedRef = useRef(json);
  const draftRef = useRef(draft);
  const [state, setState] = useState<SaveState>("saved");

  useLayoutEffect(() => {
    draftRef.current = draft;
  });

  const flush = useCallback(async () => {
    const next = draftRef.current;
    const nextJson = JSON.stringify(next);
    if (nextJson === savedRef.current) return;
    const previous = savedRef.current;
    savedRef.current = nextJson;
    setState("saving");
    const ok = await save(id, next);
    if (!ok) savedRef.current = previous;
    setState(!ok ? "error" : JSON.stringify(draftRef.current) === savedRef.current ? "saved" : "pending");
  }, [id, save]);

  useEffect(() => {
    if (json === savedRef.current) return;
    setState("pending");
    const timer = setTimeout(() => void flush(), 800);
    return () => clearTimeout(timer);
  }, [json, flush]);

  useEffect(() => () => void flush(), [flush]);

  return state;
}

function useElapsed(since: string | null, active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [active]);
  if (!since) return null;
  const minutes = Math.max(0, Math.floor((now - dayjs(since).valueOf()) / 60_000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

const toLocalInput = (iso: string | null) => (iso ? dayjs(iso).format("YYYY-MM-DDTHH:mm") : "");

interface Props {
  session: Session;
  sessions: Session[];
  onSelect: (id: string) => void;
  onDelete: () => void;
}

export function SessionWorkspace({ session, sessions, onSelect, onDelete }: Props) {
  const { start, end, create } = useSessionStore();
  const [draft, setDraft] = useState<SessionDetails>(() => detailsOf(session));
  const [tab, setTab] = useState<"plan" | "recap">(session.status === "Completed" ? "recap" : "plan");
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const saveState = useAutosave(session.id, draft);
  const isLive = session.status === "Live";
  const elapsed = useElapsed(session.startedAt, isLive);

  const otherLive = sessions.find((s) => s.status === "Live" && s.id !== session.id);
  const next = nextPlanned(sessions, session);

  const patch = (changes: Partial<SessionDetails>) => setDraft((d) => ({ ...d, ...changes }));

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    await action();
    setBusy(false);
  };

  const startNext = () =>
    run(async () => {
      const target = next ?? (await create());
      const started = target && (await start(target.id));
      if (started) onSelect(started.id);
    });

  const field = tab === "plan" ? "plan" : "recap";
  const body = draft[field] ?? "";

  return (
    <div className={shared.workspacePanel}>
      <div className={shared.metaBar}>
        <span className={`${shared.metaBarTitle} ${classes.number}`}>#{session.number}</span>
        <TextInput
          className={classes.nameInput}
          aria-label="Session name"
          value={draft.name}
          onChange={(e) => patch({ name: e.currentTarget.value })}
          placeholder={`Session ${session.number}`}
        />
        <span className={classes.status} data-status={session.status}>
          {isLive && <span className={classes.liveDot} />}
          {isLive ? `Live · ${elapsed}` : session.status === "Planned" ? "Planned" : "Played"}
        </span>

        <div className={classes.actions}>
          <span className={classes.saveState} data-state={saveState}>
            {SAVE_LABEL[saveState]}
          </span>

          {session.status === "Planned" && (
            <Tooltip label={otherLive ? `Ends #${otherLive.number} ${otherLive.name}` : "Mark this session as being played now"} withArrow>
              <Button size="xs" className="glass-btn-primary" leftSection={<IconPlayerPlay size={14} />} loading={busy} onClick={() => void run(() => start(session.id))}>
                Start session
              </Button>
            </Tooltip>
          )}

          {isLive && (
            <>
              <Button size="xs" className="glass-btn-secondary" leftSection={<IconPlayerStop size={14} />} disabled={busy} onClick={() => void run(() => end(session.id))}>
                End
              </Button>
              <Tooltip label={next ? `Ends this one and starts #${next.number} ${next.name}` : "Ends this one and starts a new session"} withArrow>
                <Button size="xs" className="glass-btn-primary" leftSection={<IconPlayerSkipForward size={14} />} loading={busy} onClick={() => void startNext()}>
                  Start next
                </Button>
              </Tooltip>
            </>
          )}

          {session.status === "Completed" && (
            <Tooltip label={otherLive ? `Ends #${otherLive.number} and makes this live again` : "Make this session live again"} withArrow>
              <Button size="xs" className="glass-btn-secondary" leftSection={<IconRotateClockwise size={14} />} loading={busy} onClick={() => void run(() => start(session.id))}>
                Resume
              </Button>
            </Tooltip>
          )}

          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="More actions">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
                Delete session
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>

      <div className={classes.detailsBar}>
        <label className={classes.field}>
          <span className={classes.fieldLabel}>When</span>
          <TextInput
            type="datetime-local"
            size="xs"
            value={toLocalInput(draft.scheduledFor)}
            onChange={(e) => patch({ scheduledFor: e.currentTarget.value ? dayjs(e.currentTarget.value).toISOString() : null })}
          />
        </label>
        <label className={classes.field}>
          <span className={classes.fieldLabel}>Where</span>
          <TextInput
            size="xs"
            placeholder="Online, Alex's place…"
            value={draft.location ?? ""}
            onChange={(e) => patch({ location: e.currentTarget.value || null })}
          />
        </label>
        {session.startedAt && (
          <span className={classes.timeline}>
            Played {dayjs(session.startedAt).format("MMM D, HH:mm")}
            {session.endedAt && ` – ${dayjs(session.endedAt).format(dayjs(session.endedAt).isSame(session.startedAt, "day") ? "HH:mm" : "MMM D, HH:mm")}`}
          </span>
        )}
      </div>

      <div className={classes.columns}>
        <section className={classes.pane}>
          <div className={shared.itemsPanelHeader}>
            <div className={classes.tabs} role="group" aria-label="Write-up">
              <button type="button" className={classes.tab} aria-pressed={tab === "plan"} onClick={() => setTab("plan")}>
                Plan
              </button>
              <button type="button" className={classes.tab} aria-pressed={tab === "recap"} onClick={() => setTab("recap")}>
                Recap
              </button>
            </div>
            <div className={classes.tabs} role="group" aria-label="Editor mode">
              <button type="button" className={classes.tab} aria-pressed={!preview} onClick={() => setPreview(false)}>
                Write
              </button>
              <button type="button" className={classes.tab} aria-pressed={preview} onClick={() => setPreview(true)}>
                Preview
              </button>
            </div>
          </div>
          <ScrollArea className={shared.itemsPanelBody} offsetScrollbars>
            <p className={classes.hint}>
              {tab === "plan"
                ? "Your prep: hooks, encounters, NPCs, secrets. Only DMs see this."
                : "What happened, in your words. Players see this on their home page."}
            </p>
            {preview ? (
              <div className={classes.preview}>
                {body.trim() ? (
                  <Suspense fallback={<Loader size="sm" />}>
                    <MarkdownRenderer content={body} textColor="var(--cyber-fg)" />
                  </Suspense>
                ) : (
                  <span className={classes.empty}>Nothing written yet.</span>
                )}
              </div>
            ) : (
              <MarkdownTextarea
                key={field}
                label=""
                value={body}
                onChange={(value) => patch({ [field]: value })}
                minHeightRem={22}
              />
            )}
          </ScrollArea>
        </section>

        <section className={classes.pane}>
          <SessionLog session={session} />
        </section>
      </div>
    </div>
  );
}
