import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ActionIcon, Badge, Button, Group, Loader, Text, TextInput, Tooltip } from "@mantine/core";
import { IconArchive, IconFlag, IconPlayerPlay, IconPlus, IconSwords, IconTrash, IconUpload } from "@tabler/icons-react";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableEncounterSummary } from "@appTypes/Tabletop";
import { tabletop } from "./useTabletopHub";

const STATUS_COLOR: Record<TableEncounterSummary["status"], string> = {
  Active: "yellow",
  Completed: "teal",
  Planned: "blue",
  Cancelled: "gray",
};

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const minutesSince = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

/** Inline "are you sure" for actions that clear or replace the board. */
function Confirm({ text, label, color, busy, onConfirm, onCancel }: {
  text: ReactNode;
  label: string;
  color: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="tt-confirm">
      <Text size="xs" c="dimmed">
        {text}
      </Text>
      <Group gap="xs" justify="flex-end">
        <Button size="xs" variant="subtle" color="gray" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button size="xs" color={color} onClick={onConfirm} loading={busy}>
          {label}
        </Button>
      </Group>
    </div>
  );
}

/**
 * Encounters in the Session tab. Each one is a campaign Encounter with the whole board stored on it:
 * start a new one (blank board), end the current one (board saved), or load a stored one back.
 */
export function EncounterSection() {
  const encounter = useTabletopStore((s) => s.snapshot?.encounter ?? null);
  const round = useTabletopStore((s) => (s.snapshot?.turn.active ? s.snapshot.turn.round : 0));
  const [name, setName] = useState("");
  // "start" / "end", or `load:<id>` / `delete:<id>` for a stored encounter.
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<TableEncounterSummary[] | null>(null);

  const refresh = useCallback(async () => setHistory((await tabletop.listEncounters()) ?? []), []);

  // Reload the list whenever the running encounter changes (started, ended or loaded, here or by another DM).
  useEffect(() => {
    void refresh();
  }, [encounter?.id, refresh]);

  const run = async (action: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await action();
    setBusy(false);
    if (ok) {
      setConfirm(null);
      setName("");
      void refresh();
    }
  };

  const stored = (history ?? []).filter((e) => !e.active);

  return (
    <>
      <section className={`tt-set-card tt-encounter-card${encounter ? " live" : ""}`}>
        <div className="tt-set-card-head">
          <span className="tt-set-card-icon">
            <IconSwords size={17} />
          </span>
          <div className="tt-set-card-heading">
            <h3>Encounter</h3>
            <p>{encounter ? "Everything on the board is saved to it when it ends." : "No encounter running: the board isn't being recorded."}</p>
          </div>
          {encounter && <span className="tt-live">Live</span>}
        </div>

        <div className="tt-set-card-body">
          {encounter && (
            <div className="tt-encounter-now">
              <strong>{encounter.name}</strong>
              <span>
                Started {when(encounter.startedAt)} · {minutesSince(encounter.startedAt)} min
                {round > 0 && ` · Round ${round}`}
              </span>
              {confirm === "end" ? (
                <Confirm
                  text="Save the board (map, tokens, fog, templates, drawings) to this encounter and end it? The board stays as it is."
                  label="End & save"
                  color="red"
                  busy={busy}
                  onConfirm={() => void run(tabletop.endEncounter)}
                  onCancel={() => setConfirm(null)}
                />
              ) : (
                <Button variant="light" color="red" leftSection={<IconFlag size={15} />} onClick={() => setConfirm("end")}>
                  End encounter
                </Button>
              )}
            </div>
          )}

          <div className="tt-encounter-new">
            <Text size="sm" fw={600}>
              Start a new encounter
            </Text>
            <Group gap="xs" wrap="nowrap">
              <TextInput
                size="sm"
                radius="xl"
                placeholder="Goblin ambush"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && setConfirm("start")}
                style={{ flex: 1 }}
                aria-label="New encounter name"
              />
              <Button radius="xl" className="tt-cta" leftSection={<IconPlus size={15} />} onClick={() => setConfirm("start")} disabled={confirm === "start"}>
                Start
              </Button>
            </Group>
            {confirm === "start" && (
              <Confirm
                text={
                  <>
                    The board will be cleared: map, tokens, fog, templates, drawings and the roll log. Grid settings stay.
                    {encounter && <> <b>{encounter.name}</b> is saved and ended first.</>}
                  </>
                }
                label="Clear & start"
                color="violet"
                busy={busy}
                onConfirm={() => void run(() => tabletop.startEncounter(name.trim()))}
                onCancel={() => setConfirm(null)}
              />
            )}
          </div>
        </div>
      </section>

      <section className="tt-set-card">
        <div className="tt-set-card-head">
          <span className="tt-set-card-icon">
            <IconArchive size={17} />
          </span>
          <div className="tt-set-card-heading">
            <h3>Stored encounters</h3>
            <p>Load one to put its board back on the table and continue it.</p>
          </div>
        </div>
        <div className="tt-set-card-body">
          {history === null ? (
            <Group justify="center" py="sm">
              <Loader size="sm" color="violet" />
            </Group>
          ) : stored.length === 0 ? (
            <Text size="sm" c="dimmed">
              Nothing stored yet. End an encounter to keep its board.
            </Text>
          ) : (
            <div className="tt-encounter-list">
              {stored.map((e) => (
                <div key={e.id} className={`tt-encounter-row${confirm?.endsWith(`:${e.id}`) ? " confirming" : ""}`}>
                  <div className="tt-encounter-row-main">
                    <div className="tt-encounter-row-text">
                      <strong>{e.name || "Untitled encounter"}</strong>
                      <span>
                        {when(e.endedAt ?? e.startedAt)} · {e.tokenCount} token{e.tokenCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <Badge size="xs" variant="light" color={STATUS_COLOR[e.status]}>
                      {e.status}
                    </Badge>
                    <Button
                      size="compact-sm"
                      radius="xl"
                      variant="light"
                      color="violet"
                      leftSection={e.hasBoard ? <IconUpload size={13} /> : <IconPlayerPlay size={13} />}
                      onClick={() => setConfirm(`load:${e.id}`)}
                      disabled={confirm === `load:${e.id}`}
                    >
                      {e.hasBoard ? "Load" : "Run"}
                    </Button>
                    <Tooltip label="Delete encounter">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        radius="xl"
                        onClick={() => setConfirm(`delete:${e.id}`)}
                        disabled={confirm === `delete:${e.id}`}
                        aria-label={`Delete ${e.name || "encounter"}`}
                      >
                        <IconTrash size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                  {confirm === `delete:${e.id}` && (
                    <Confirm
                      text={
                        <>
                          Delete <b>{e.name || "this encounter"}</b> and its saved board? It disappears from the table and the dashboard.
                        </>
                      }
                      label="Delete"
                      color="red"
                      busy={busy}
                      onConfirm={() => void run(() => tabletop.deleteEncounter(e.id))}
                      onCancel={() => setConfirm(null)}
                    />
                  )}
                  {confirm === `load:${e.id}` && (
                    <Confirm
                      text={
                        <>
                          {e.hasBoard ? "Replace the board with this encounter's saved board?" : "This encounter has no saved board yet; it starts on a blank board."}
                          {encounter && <> <b>{encounter.name}</b> is saved and ended first.</>}
                        </>
                      }
                      label={e.hasBoard ? "Load" : "Run"}
                      color="violet"
                      busy={busy}
                      onConfirm={() => void run(() => tabletop.loadEncounter(e.id))}
                      onCancel={() => setConfirm(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
