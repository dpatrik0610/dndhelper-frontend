import { useEffect, useState } from "react";
import { Tabs, Text } from "@mantine/core";
import { IconAlertCircle, IconChartBar, IconChartPie, IconHourglass, IconLock, IconPlus } from "@tabler/icons-react";
import { isPollOpen, type Poll } from "@appTypes/Poll";
import { useCurrentCampaignId, useIsDm } from "@store/campaign/campaignSelectors";
import { usePollStore } from "@store/poll/pollStore";
import { BaseModal } from "@components/BaseModal";
import { CardGridSkeleton } from "@components/common/Skeletons";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { PollCard } from "./components/PollCard";
import { PollEditorModal } from "./components/PollEditorModal";
import { PollResults } from "./components/PollResults";
import tabClasses from "@features/profile/styles/ProfileTabs.module.css";
import classes from "./Polls.module.css";

type PollTab = "active" | "closed" | "results";

export default function PollsPage() {
  const campaignId = useCurrentCampaignId();
  const isDm = useIsDm();
  const polls = usePollStore((s) => s.polls);
  const loading = usePollStore((s) => s.loading);

  const [tab, setTab] = useState<PollTab>("active");
  const [now, setNow] = useState(() => Date.now());
  // Bumping the key remounts the editor, so its draft starts from the poll being edited.
  const [editor, setEditor] = useState<{ key: number; poll: Poll | null } | null>(null);
  const [deleting, setDeleting] = useState<Poll | null>(null);

  useEffect(() => {
    if (campaignId) void usePollStore.getState().load(campaignId);
  }, [campaignId]);

  // Countdown ticks; a poll whose deadline just passed is refetched, which makes the server close (and announce) it.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      for (const poll of usePollStore.getState().polls)
        if (!poll.isClosed && !isPollOpen(poll, t)) void usePollStore.getState().refresh(poll.id);
    }, 15000);
    return () => window.clearInterval(timer);
  }, []);

  const active = polls.filter((p) => isPollOpen(p, now));
  const closed = polls.filter((p) => !isPollOpen(p, now));
  const awaitingMyVote = active.filter((p) => p.myOptionIds.length === 0).length;

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await usePollStore.getState().remove(deleting.id);
      showNotification({ title: "Poll deleted", message: deleting.title, color: SectionColor.Green });
      setDeleting(null);
    } catch (err) {
      showNotification({ message: err instanceof Error ? err.message : "Delete failed.", color: SectionColor.Red });
    }
  };

  const openEditor = (poll: Poll | null) => setEditor((e) => ({ key: (e?.key ?? 0) + 1, poll }));

  if (!campaignId) {
    return (
      <div className={classes.page}>
        <div className={`${classes.panel} ${classes.empty}`}>
          <IconAlertCircle size={40} className={classes.emptyIcon} />
          <Text fw={600}>No campaign selected.</Text>
          <Text size="xs" className={classes.muted}>
            Pick or join a campaign at the top of the sidebar to see its polls.
          </Text>
        </div>
      </div>
    );
  }

  const list = (items: Poll[], emptyText: string) =>
    loading && polls.length === 0 ? (
      <CardGridSkeleton count={2} cols={{ base: 1, md: 2 }} height={260} />
    ) : items.length === 0 ? (
      <div className={`${classes.panel} ${classes.empty}`}>
        <IconChartBar size={34} className={classes.emptyIcon} />
        <p className={classes.muted}>{emptyText}</p>
        {isDm && tab === "active" && (
          <button type="button" className={classes.primaryButton} onClick={() => openEditor(null)}>
            <IconPlus size={16} /> Start a poll
          </button>
        )}
      </div>
    ) : (
      <div className={classes.grid}>
        {items.map((poll) => (
          <PollCard key={poll.id} poll={poll} isDm={isDm} now={now} onEdit={openEditor} onDelete={setDeleting} />
        ))}
      </div>
    );

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <span className={classes.headerIcon}>
          <IconChartBar size={22} stroke={1.75} />
        </span>
        <div className={classes.headerText}>
          <h1 className={classes.title}>Polls</h1>
          <p className={`${classes.subtitle} ${classes.muted}`}>
            {active.length} open
            {awaitingMyVote > 0 && ` · ${awaitingMyVote} waiting for your vote`}
          </p>
        </div>
        {isDm && (
          <button type="button" className={classes.primaryButton} onClick={() => openEditor(null)}>
            <IconPlus size={16} /> New poll
          </button>
        )}
      </header>

      <Tabs
        value={tab}
        onChange={(v) => setTab((v as PollTab) ?? "active")}
        unstyled
        keepMounted={false}
        classNames={{ list: tabClasses.list, tab: tabClasses.tab, tabSection: tabClasses.icon, tabLabel: tabClasses.label }}
      >
        <Tabs.List aria-label="Poll sections">
          <Tabs.Tab value="active" leftSection={<IconHourglass size={16} stroke={1.75} />}>
            Active ({active.length})
          </Tabs.Tab>
          <Tabs.Tab value="closed" leftSection={<IconLock size={16} stroke={1.75} />}>
            Closed ({closed.length})
          </Tabs.Tab>
          <Tabs.Tab value="results" leftSection={<IconChartPie size={16} stroke={1.75} />}>
            Results
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="active">
          {list(active, isDm ? "No open polls. Ask the party something!" : "No open polls right now.")}
        </Tabs.Panel>
        <Tabs.Panel value="closed">{list(closed, "No closed polls yet.")}</Tabs.Panel>
        <Tabs.Panel value="results">
          <PollResults polls={polls} />
        </Tabs.Panel>
      </Tabs>

      {editor && (
        <PollEditorModal
          key={editor.key}
          opened
          onClose={() => setEditor(null)}
          campaignId={campaignId}
          poll={editor.poll}
        />
      )}

      <BaseModal
        opened={deleting != null}
        onClose={() => setDeleting(null)}
        title="Delete poll"
        size="sm"
        onSave={confirmDelete}
        saveLabel="Delete"
      >
        <Text size="sm">
          Delete <strong>{deleting?.title}</strong>? All of its votes are lost.
        </Text>
      </BaseModal>
    </div>
  );
}
