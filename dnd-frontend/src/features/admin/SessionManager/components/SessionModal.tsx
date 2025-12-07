import { Button, Group, Stack, TextInput, Textarea, Switch } from "@mantine/core";
import { BaseModal } from "@components/BaseModal";
import { CustomDateInput } from "@components/common/CustomDateInput";
import { IconLock, IconPlus } from "@tabler/icons-react";
import type { Session } from "@appTypes/Session";
import type { Campaign } from "@appTypes/Campaign";
import { useSessionStore } from "@store/session/useSessionStore";
import { SessionNotesPanel } from "./SessionNotesPanel";
import { SectionColor } from "@appTypes/SectionColor";

interface Props {
  opened: boolean;
  mode: "create" | "edit" | null;
  draft: Session;
  campaigns: Campaign[];
  saving: boolean;
  onClose: () => void;
  onChangeDraft: (draft: Session) => void;
  onSave: () => void;
}

export default function SessionModal({
  opened,
  mode,
  draft,
  campaigns,
  saving,
  onClose,
  onChangeDraft,
  onSave,
}: Props) {
  const { update } = useSessionStore();
  const editable = mode === "create" || mode === "edit";

  const handleUpdateNoteIds = async (ids: string[]) => {
    await update({ ...draft, noteIds: ids });
    onChangeDraft({ ...draft, noteIds: ids });
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={mode === "edit" ? "Edit Session" : "Create Session"}
      showSaveButton={false}
      showCancelButton={false}
      hideHeader
      withCloseButton
      size="lg"
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          value={draft.name}
          onChange={(e) => onChangeDraft({ ...draft, name: e.currentTarget.value })}
          disabled={!editable}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
        <TextInput
          label="Campaign"
          value={campaigns.find((c) => c.id === draft.campaignId)?.name ?? "Unassigned"}
          readOnly
          rightSection={<IconLock size={14} />}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
        <Textarea
          label="Description (Markdown)"
          value={draft.description ?? ""}
          autosize
          minRows={5}
          onChange={(e) => onChangeDraft({ ...draft, description: e.currentTarget.value })}
          disabled={!editable}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />
        <TextInput
          label="Location"
          value={draft.location ?? ""}
          onChange={(e) => onChangeDraft({ ...draft, location: e.currentTarget.value })}
          disabled={!editable}
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        <Group justify="space-between" gap="md">
          <CustomDateInput
            label="Scheduled For"
            value={draft.scheduledFor}
            onChange={(value) => onChangeDraft({ ...draft, scheduledFor: value })}
            disabled={!editable}
          />
          <Switch
            label="Is Live"
            checked={draft.isLive}
            onChange={(e) => onChangeDraft({ ...draft, isLive: e.currentTarget.checked })}
            disabled={!editable}
          />
        </Group>


        {mode === "edit" && draft.id && (
          <SessionNotesPanel session={draft} saving={saving} onUpdateNoteIds={handleUpdateNoteIds} editable />
        )}

        <Group justify="flex-end" align="right">
          {editable && (
            <Button leftSection={<IconPlus size={14} />} loading={saving} onClick={onSave} bg={SectionColor.Grape}>
              {draft.id ? "Save" : "Create"}
            </Button>
          )}
        </Group>
      </Stack>
    </BaseModal>
  );
}
