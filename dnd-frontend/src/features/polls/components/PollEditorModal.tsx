import { useState, type CSSProperties } from "react";
import { NumberInput, SegmentedControl, Stack, Switch, Text } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconPlus, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Poll, PollInput, PollResultsVisibility } from "@appTypes/Poll";
import { BaseModal } from "@components/BaseModal";
import { GlassyTextInput } from "@components/common/GlassyTextInput";
import { GlassyTextarea } from "@components/common/GlassyTextarea";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { usePollStore } from "@store/poll/pollStore";
import { optionColor } from "@features/polls/pollUtils";
import classes from "@features/polls/Polls.module.css";

const MAX_OPTIONS = 20;
const ACCENT = "var(--theme-color-accent-primary)";

interface PollEditorModalProps {
  opened: boolean;
  onClose: () => void;
  campaignId: string;
  /** null creates a new poll. */
  poll: Poll | null;
}

type Draft = Omit<PollInput, "options" | "closesAt"> & {
  options: { id?: string; text: string; suggestedBy?: string | null }[];
  /** Mantine's local "YYYY-MM-DD HH:mm:ss" string. */
  closesAt: string | null;
};

const toDraft = (poll: Poll | null): Draft =>
  poll
    ? {
        title: poll.title,
        description: poll.description ?? "",
        options: poll.options.map((o) => ({ ...o })),
        allowMultiple: poll.allowMultiple,
        maxChoices: poll.maxChoices ?? null,
        anonymous: poll.anonymous,
        resultsVisibility: poll.resultsVisibility,
        allowVoteChange: poll.allowVoteChange,
        allowSuggestions: poll.allowSuggestions,
        announceOnClose: poll.announceOnClose,
        closesAt: poll.closesAt ? dayjs(poll.closesAt).format("YYYY-MM-DD HH:mm:ss") : null,
      }
    : {
        title: "",
        description: "",
        options: [{ text: "" }, { text: "" }],
        allowMultiple: false,
        maxChoices: null,
        anonymous: false,
        resultsVisibility: "Always",
        allowVoteChange: true,
        allowSuggestions: false,
        announceOnClose: true,
        closesAt: null,
      };

/** Remount (via key) for each open so the draft starts from the poll being edited. */
export function PollEditorModal({ opened, onClose, campaignId, poll }: PollEditorModalProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(poll));
  const [saving, setSaving] = useState(false);
  const patch = (changes: Partial<Draft>) => setDraft((d) => ({ ...d, ...changes }));
  const setOption = (index: number, text: string) =>
    setDraft((d) => ({ ...d, options: d.options.map((o, i) => (i === index ? { ...o, text } : o)) }));

  const filledOptions = draft.options.filter((o) => o.text.trim());
  const votesAtRisk = poll && poll.voterCount > 0;

  const save = async () => {
    if (!draft.title.trim()) return showNotification({ message: "Give the poll a question.", color: SectionColor.Red });
    if (filledOptions.length < 2) return showNotification({ message: "Add at least two options.", color: SectionColor.Red });

    const input: PollInput = {
      ...draft,
      campaignId,
      title: draft.title.trim(),
      options: filledOptions.map(({ id, text }) => ({ id, text })),
      maxChoices: draft.allowMultiple ? draft.maxChoices || null : null,
      closesAt: draft.closesAt ? dayjs(draft.closesAt).toISOString() : null,
    };

    setSaving(true);
    try {
      if (poll) await usePollStore.getState().update(poll.id, input);
      else await usePollStore.getState().create(input);
      showNotification({
        title: poll ? "Poll updated" : "Poll created",
        message: poll ? input.title : `${input.title} is open for votes.`,
        color: SectionColor.Green,
      });
      onClose();
    } catch (err) {
      showNotification({
        title: "Couldn't save the poll",
        message: err instanceof Error ? err.message : "Unexpected error.",
        color: SectionColor.Red,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={poll ? "Edit poll" : "New poll"}
      size="xl"
      onSave={save}
      loading={saving}
      saveLabel={poll ? "Save changes" : "Open poll"}
    >
      <Stack gap="md">
        <GlassyTextInput
          label="Question"
          placeholder="e.g. Where does the party head next?"
          required
          maxLength={120}
          value={draft.title}
          onChange={(e) => patch({ title: e.currentTarget.value })}
        />
        <GlassyTextarea
          label="Details"
          placeholder="Optional context, stakes, or lore for the vote…"
          autosize
          minRows={2}
          maxRows={6}
          maxLength={2000}
          value={draft.description ?? ""}
          onChange={(e) => patch({ description: e.currentTarget.value })}
        />

        <Stack gap={8}>
          <Text className="glassy-label">Options</Text>
          {draft.options.map((option, index) => (
            <div
              key={option.id ?? `new-${index}`}
              className={classes.optionRow}
              style={{ "--option-color": optionColor(index, draft.options.length) } as CSSProperties}
            >
              <span className={classes.optionIndex}>{index + 1}</span>
              <GlassyTextInput
                style={{ flex: 1 }}
                placeholder={`Option ${index + 1}`}
                maxLength={120}
                value={option.text}
                onChange={(e) => setOption(index, e.currentTarget.value)}
                description={option.suggestedBy ? `Suggested by ${option.suggestedBy}` : undefined}
              />
              <button
                type="button"
                className={classes.iconButton}
                aria-label={`Remove option ${index + 1}`}
                disabled={draft.options.length <= 2}
                onClick={() => setDraft((d) => ({ ...d, options: d.options.filter((_, i) => i !== index) }))}
              >
                <IconX size={15} />
              </button>
            </div>
          ))}
          {draft.options.length < MAX_OPTIONS && (
            <button
              type="button"
              className={classes.ghostButton}
              style={{ alignSelf: "flex-start" }}
              onClick={() => setDraft((d) => ({ ...d, options: [...d.options, { text: "" }] }))}
            >
              <IconPlus size={14} /> Add option
            </button>
          )}
          {votesAtRisk && (
            <Text size="xs" className={classes.muted}>
              Removing an option also removes the votes cast for it.
            </Text>
          )}
        </Stack>

        <div className={classes.settings}>
          <Stack gap="sm">
            <Switch
              color={ACCENT}
              label="Multiple choice"
              description="Voters may pick more than one option"
              checked={draft.allowMultiple}
              onChange={(e) => patch({ allowMultiple: e.currentTarget.checked })}
            />
            {draft.allowMultiple && (
              <NumberInput
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                label="Max picks"
                placeholder="No limit"
                min={1}
                max={Math.max(1, filledOptions.length)}
                allowDecimal={false}
                value={draft.maxChoices ?? ""}
                onChange={(v) => patch({ maxChoices: typeof v === "number" ? v : null })}
              />
            )}
            <Switch
              color={ACCENT}
              label="Anonymous"
              description="Nobody sees who voted for what, not even you"
              checked={draft.anonymous}
              onChange={(e) => patch({ anonymous: e.currentTarget.checked })}
            />
            <Switch
              color={ACCENT}
              label="Votes can change"
              description="Players may switch or retract their vote"
              checked={draft.allowVoteChange}
              onChange={(e) => patch({ allowVoteChange: e.currentTarget.checked })}
            />
          </Stack>
          <Stack gap="sm">
            <Switch
              color={ACCENT}
              label="Player suggestions"
              description="Players can add their own options"
              checked={draft.allowSuggestions}
              onChange={(e) => patch({ allowSuggestions: e.currentTarget.checked })}
            />
            <Switch
              color={ACCENT}
              label="Announce result"
              description="Notify everyone when the poll closes"
              checked={draft.announceOnClose}
              onChange={(e) => patch({ announceOnClose: e.currentTarget.checked })}
            />
            <Stack gap={4}>
              <Text className="glassy-label">Results visible</Text>
              <SegmentedControl
                fullWidth
                size="xs"
                color={ACCENT}
                value={draft.resultsVisibility}
                onChange={(v) => patch({ resultsVisibility: v as PollResultsVisibility })}
                data={[
                  { value: "Always", label: "Always" },
                  { value: "AfterVote", label: "After voting" },
                  { value: "AfterClose", label: "After close" },
                ]}
                styles={{ root: { background: "rgba(0, 0, 0, 0.25)" } }}
              />
            </Stack>
            <DateTimePicker
              classNames={{ input: "glassy-input", label: "glassy-label" }}
              label="Deadline"
              placeholder="Open until you close it"
              clearable
              minDate={new Date()}
              valueFormat="YYYY-MM-DD HH:mm"
              value={draft.closesAt}
              onChange={(v) => patch({ closesAt: v })}
            />
          </Stack>
        </div>
      </Stack>
    </BaseModal>
  );
}
