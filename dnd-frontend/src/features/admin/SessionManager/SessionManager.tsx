import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Button, Group, Loader, ScrollArea, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { IconCalendarPlus, IconCalendarTime, IconInbox, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Session } from "@appTypes/Session";
import { useSessionStore } from "@store/session/sessionStore";
import { groupSessions } from "@store/session/sessionSelectors";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { BaseModal } from "@components/BaseModal";
import styles from "@styles/InventoryDashboard.module.css";
import classes from "./SessionManager.module.css";
import { SessionWorkspace } from "./components/SessionWorkspace";

function SessionListItem({ session, selected, onSelect }: { session: Session; selected: boolean; onSelect: () => void }) {
  const live = session.status === "Live";
  const when = session.status === "Completed" ? session.startedAt ?? session.scheduledFor : session.scheduledFor;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-current={selected || undefined}
      className={`${styles.listItem} ${selected ? styles.listItemSelected : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
    >
      <div className={`${styles.listItemAvatar} ${classes.number}`}>{session.number}</div>
      <div className={styles.listItemInfo}>
        <span className={styles.listItemName}>{session.name}</span>
        <span className={styles.listItemMeta}>
          {live && <span className={classes.liveDot} />}
          <span>{live ? "Live now" : when ? dayjs(when).format("ddd, MMM D") : "No date"}</span>
          {session.notes.length > 0 && <span>· {session.notes.length} notes</span>}
        </span>
      </div>
    </div>
  );
}

export function SessionManager() {
  const campaignId = useCampaignStore((s) => s.selectedId);
  const { sessions, loading, load, create, remove } = useSessionStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Session | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (campaignId) void load(campaignId);
  }, [campaignId, load]);

  const groups = useMemo(() => groupSessions(sessions), [sessions]);
  const selected =
    sessions.find((s) => s.id === selectedId) ?? groups.live[0] ?? groups.upcoming[0] ?? groups.played[0] ?? null;

  const planNext = async () => {
    setBusy(true);
    const created = await create();
    if (created) setSelectedId(created.id);
    setBusy(false);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    if (await remove(toDelete.id)) setToDelete(null);
    setBusy(false);
  };

  const sections = [
    { key: "live", label: "Live", items: groups.live },
    { key: "upcoming", label: "Upcoming", items: groups.upcoming },
    { key: "played", label: "Played", items: groups.played },
  ].filter((g) => g.items.length > 0);

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.splitLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Group gap="xs" mb="sm">
              <ThemeIcon variant="light" color="neon" size="md" radius="sm">
                <IconCalendarTime size={16} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" c="white">Sessions</Text>
                <Text size="xs" c="dimmed">
                  {groups.played.length} played · {groups.upcoming.length} planned
                </Text>
              </div>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <Button
                style={{ flex: 1 }}
                className="glass-btn-primary"
                leftSection={<IconCalendarPlus size={14} />}
                onClick={() => void planNext()}
                loading={busy && !toDelete}
                size="xs"
                disabled={!campaignId}
              >
                Plan next session
              </Button>
              <Tooltip label="Refresh" withArrow>
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={() => campaignId && void load(campaignId)}
                  loading={loading}
                  size="md"
                  disabled={!campaignId}
                  aria-label="Refresh"
                >
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
            {loading && sessions.length === 0 ? (
              <Group justify="center" py="xl">
                <Loader color="neon" size="sm" />
              </Group>
            ) : sessions.length === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <IconInbox size={22} color="gray" />
                <Text c="dimmed" size="xs">No sessions yet.</Text>
              </Stack>
            ) : (
              sections.map((group) => (
                <div key={group.key}>
                  <div className={styles.listGroupHeader}>
                    <span>{group.label}</span>
                    <span className={styles.listGroupCount}>{group.items.length}</span>
                  </div>
                  {group.items.map((s) => (
                    <SessionListItem key={s.id} session={s} selected={selected?.id === s.id} onSelect={() => setSelectedId(s.id)} />
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        <div className={styles.workspaceArea}>
          {selected ? (
            <SessionWorkspace
              key={selected.id}
              session={selected}
              sessions={sessions}
              onSelect={setSelectedId}
              onDelete={() => setToDelete(selected)}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateInner}>
                <IconCalendarTime size={28} />
                <span>{campaignId ? "Plan your first session" : "Select a campaign first"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <BaseModal
        opened={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Delete Session"
        size="sm"
        loading={busy}
        onSave={() => void confirmDelete()}
        saveLabel="Delete"
      >
        <Text size="sm">
          Delete <b>#{toDelete?.number} {toDelete?.name}</b> with its plan, recap and {toDelete?.notes.length ?? 0} log entries? This can't be undone.
        </Text>
      </BaseModal>
    </div>
  );
}
