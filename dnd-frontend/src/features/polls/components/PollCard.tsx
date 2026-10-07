import { useState, type CSSProperties } from "react";
import { Loader, Menu, RingProgress, Tooltip } from "@mantine/core";
import {
  IconCheck,
  IconCrown,
  IconDotsVertical,
  IconEyeOff,
  IconLock,
  IconLockOpen,
  IconPencil,
  IconPlus,
  IconSpeakerphone,
  IconTrash,
  IconUserQuestion,
} from "@tabler/icons-react";
import { isPollOpen, type Poll } from "@appTypes/Poll";
import { usePollStore } from "@store/poll/pollStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { GlassyTextInput } from "@components/common/GlassyTextInput";
import { timeAgo } from "@utils/timeAgo";
import { leaderIds, optionColor, percentFor, sameSelection, timeLeft, votesFor } from "@features/polls/pollUtils";
import classes from "@features/polls/Polls.module.css";

interface PollCardProps {
  poll: Poll;
  isDm: boolean;
  now: number;
  onEdit: (poll: Poll) => void;
  onDelete: (poll: Poll) => void;
}

const fail = (err: unknown) =>
  showNotification({
    title: "Poll",
    message: err instanceof Error ? err.message : "Something went wrong.",
    color: SectionColor.Red,
  });

export function PollCard({ poll, isDm, now, onEdit, onDelete }: PollCardProps) {
  // null = no unsaved picks: show the vote the server has.
  const [draft, setDraft] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  const open = isPollOpen(poll, now);
  const selected = draft ?? poll.myOptionIds;
  const hasVoted = poll.myOptionIds.length > 0;
  const canVote = open && (!hasVoted || poll.allowVoteChange);
  // Single choice that can be changed later: a click is the vote, no confirm step.
  const instant = !poll.allowMultiple && poll.allowVoteChange;
  const maxPicks = poll.allowMultiple ? poll.maxChoices ?? poll.options.length : 1;
  const showResults = !poll.resultsHidden && poll.tally != null;
  const leaders = open ? [] : leaderIds(poll);
  const turnout = poll.memberCount ? Math.round((poll.voterCount * 100) / poll.memberCount) : 0;
  const dirty = draft != null && !sameSelection(draft, poll.myOptionIds);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const submitVote = (optionIds: string[]) =>
    run(async () => {
      await usePollStore.getState().vote(poll.id, optionIds);
      setDraft(null);
    });

  const toggle = (optionId: string) => {
    if (!canVote || busy) return;
    if (!poll.allowMultiple) {
      if (instant) {
        if (!poll.myOptionIds.includes(optionId)) void submitVote([optionId]);
      } else setDraft([optionId]);
      return;
    }
    if (selected.includes(optionId)) setDraft(selected.filter((id) => id !== optionId));
    else if (selected.length < maxPicks) setDraft([...selected, optionId]);
  };

  const submitSuggestion = () => {
    const text = suggestion.trim();
    if (!text) return;
    void run(async () => {
      await usePollStore.getState().suggest(poll.id, text);
      setSuggestion("");
    });
  };

  const dmAction = (action: () => Promise<void>, message: string) =>
    run(async () => {
      await action();
      showNotification({ title: poll.title, message, color: SectionColor.Green });
    });

  return (
    <article className={classes.card} data-closed={!open || undefined} aria-busy={busy}>
      <header className={classes.cardHeader}>
        <div className={classes.cardHeading}>
          <h3 className={classes.cardTitle}>{poll.title}</h3>
          <div className={classes.chips}>
            <span className={`${classes.chip} ${classes.status}`} data-closed={!open || undefined}>
              {open ? <span className={classes.pulse} /> : <IconLock size={11} />}
              {open ? (poll.closesAt ? timeLeft(poll.closesAt, now) : "Open") : "Closed"}
            </span>
            {poll.allowMultiple && (
              <span className={classes.chip}>{poll.maxChoices ? `Pick up to ${poll.maxChoices}` : "Multiple choice"}</span>
            )}
            {poll.anonymous && (
              <span className={classes.chip}>
                <IconUserQuestion size={11} /> Anonymous
              </span>
            )}
            {poll.resultsVisibility !== "Always" && (
              <span className={classes.chip}>
                <IconEyeOff size={11} /> {poll.resultsVisibility === "AfterVote" ? "Results after voting" : "Results after closing"}
              </span>
            )}
            {!poll.allowVoteChange && <span className={classes.chip}>Final votes</span>}
          </div>
        </div>

        {busy && <Loader size="xs" color="var(--theme-color-accent-primary)" />}

        {isDm && (
          <Menu position="bottom-end" withinPortal classNames={{ dropdown: "glassy-dropdown" }}>
            <Menu.Target>
              <button type="button" className={classes.iconButton} aria-label={`Manage ${poll.title}`}>
                <IconDotsVertical size={16} />
              </button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(poll)}>
                Edit
              </Menu.Item>
              {open ? (
                <Menu.Item
                  leftSection={<IconLock size={14} />}
                  onClick={() =>
                    dmAction(
                      () => usePollStore.getState().close(poll.id),
                      poll.announceOnClose ? "Closed and announced to the party." : "Poll closed."
                    )
                  }
                >
                  Close poll
                </Menu.Item>
              ) : (
                <>
                  <Menu.Item
                    leftSection={<IconSpeakerphone size={14} />}
                    onClick={() => dmAction(() => usePollStore.getState().announce(poll.id), "Result sent to the party.")}
                  >
                    Announce result
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconLockOpen size={14} />}
                    onClick={() => dmAction(() => usePollStore.getState().reopen(poll.id), "Poll reopened.")}
                  >
                    Reopen
                  </Menu.Item>
                </>
              )}
              <Menu.Divider />
              <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete(poll)}>
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </header>

      {poll.description && <p className={classes.description}>{poll.description}</p>}

      <div className={classes.options} role={poll.allowMultiple ? "group" : "radiogroup"} aria-label={poll.title}>
        {poll.options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const percent = percentFor(poll, option.id);
          const votes = votesFor(poll, option.id);
          return (
            <button
              key={option.id}
              type="button"
              role={poll.allowMultiple ? "checkbox" : "radio"}
              aria-checked={isSelected}
              className={classes.option}
              data-selected={isSelected || undefined}
              data-leader={leaders.includes(option.id) || undefined}
              disabled={!canVote || busy}
              onClick={() => toggle(option.id)}
              style={
                {
                  "--fill": showResults ? `${percent}%` : "0%",
                  "--option-color": optionColor(index, poll.options.length),
                } as CSSProperties
              }
            >
              {showResults && <span className={classes.fill} />}
              <span className={classes.marker} data-multi={poll.allowMultiple || undefined}>
                {isSelected && <IconCheck size={12} stroke={3} />}
              </span>
              <span className={classes.optionText}>
                {option.text}
                {option.suggestedBy && <span className={classes.suggested}>suggested by {option.suggestedBy}</span>}
              </span>
              {leaders.includes(option.id) && (
                <Tooltip label="Winner" withArrow>
                  <IconCrown size={16} className={classes.crown} />
                </Tooltip>
              )}
              {showResults && (
                <span className={classes.count}>
                  {percent}% <span className={classes.countVotes}>· {votes}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {poll.resultsHidden && (
        <div className={classes.notice}>
          <IconLock size={14} />
          {poll.resultsVisibility === "AfterVote"
            ? "Cast your vote to reveal the standings."
            : "The standings stay sealed until the poll closes."}
        </div>
      )}

      {open && poll.allowSuggestions && (
        <div className={classes.suggestRow}>
          <GlassyTextInput
            size="xs"
            style={{ flex: 1 }}
            placeholder="Suggest another option…"
            maxLength={120}
            value={suggestion}
            onChange={(e) => setSuggestion(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSuggestion()}
            disabled={busy}
          />
          <button
            type="button"
            className={classes.secondaryButton}
            onClick={submitSuggestion}
            disabled={busy || !suggestion.trim()}
            aria-label="Add suggestion"
          >
            <IconPlus size={14} />
          </button>
        </div>
      )}

      <footer className={classes.cardFooter}>
        <div className={classes.turnout}>
          <RingProgress
            size={36}
            thickness={4}
            roundCaps
            sections={[{ value: turnout, color: "var(--theme-color-accent-secondary)" }]}
            rootColor="color-mix(in srgb, var(--theme-color-text-primary) 10%, transparent)"
          />
          <span>
            <strong>{poll.voterCount}</strong>
            <span className={classes.muted}> of {poll.memberCount} voted</span>
            <br />
            <span className={classes.muted}>
              {poll.createdBy ? `by ${poll.createdBy}` : ""}
              {poll.createdAt ? ` · ${timeAgo(poll.createdAt)}` : ""}
            </span>
          </span>
        </div>

        <div className={classes.footerActions}>
          {open && hasVoted && poll.allowVoteChange && !dirty && (
            <button
              type="button"
              className={classes.ghostButton}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await usePollStore.getState().retract(poll.id);
                  setDraft(null);
                })
              }
            >
              Retract vote
            </button>
          )}
          {dirty && (
            <button type="button" className={classes.ghostButton} disabled={busy} onClick={() => setDraft(null)}>
              Cancel
            </button>
          )}
          {canVote && !instant && (!hasVoted || dirty) && (
            <button
              type="button"
              className={classes.primaryButton}
              disabled={busy || !dirty || selected.length === 0}
              onClick={() => submitVote(selected)}
            >
              {hasVoted ? "Update vote" : poll.allowVoteChange ? "Cast vote" : "Cast final vote"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
