import { Button, Grid, Group, Select, Stack, Text, TextInput, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { BaseModal } from "@components/BaseModal";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import type { Encounter } from "@appTypes/Encounter";
import { ENCOUNTER_STATUSES } from "@appTypes/Encounter";
import type { Session } from "@appTypes/Session";
import { toNullableString } from "../encounterUtils";

type CreateEncounterModalProps = {
  opened: boolean;
  draft: Encounter | null;
  sessions: Session[];
  saving: boolean;
  onClose: () => void;
  onChange: (next: Encounter) => void;
  onCreate: () => void;
};

export function CreateEncounterModal({
  opened,
  draft,
  sessions,
  saving,
  onClose,
  onChange,
  onCreate,
}: CreateEncounterModalProps) {
  if (!draft) {
    return null;
  }

  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: session.name,
  }));

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Create Encounter"
      showSaveButton={false}
      showCancelButton={false}
      hideHeader
      withCloseButton
      size="lg"
    >
      <Stack gap="md">
        <Title order={3} c="grape.0">
          New Encounter
        </Title>
        <Text size="sm" c="dimmed">
          Prefilled from the selected campaign and current session where available.
        </Text>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Encounter name"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.currentTarget.value })}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Status"
              data={ENCOUNTER_STATUSES.map((status) => ({ value: status, label: status }))}
              value={draft.status}
              onChange={(value) => onChange({ ...draft, status: (value as Encounter["status"]) ?? draft.status })}
              allowDeselect={false}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Session"
              placeholder="Optional"
              data={sessionOptions}
              value={draft.sessionId}
              onChange={(value) => onChange({ ...draft, sessionId: value || null })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Location"
              value={draft.location ?? ""}
              onChange={(event) => onChange({ ...draft, location: toNullableString(event.currentTarget.value) })}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Map URL"
              placeholder="https://..."
              value={draft.mapUrl ?? ""}
              onChange={(event) => onChange({ ...draft, mapUrl: toNullableString(event.currentTarget.value) })}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <MarkdownTextarea
              label="Description"
              value={draft.description ?? ""}
              onChange={(value) => onChange({ ...draft, description: toNullableString(value) })}
              minHeightRem={8}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <MarkdownTextarea
              label="DM notes"
              value={draft.dmNote ?? ""}
              onChange={(value) => onChange({ ...draft, dmNote: toNullableString(value) })}
              minHeightRem={6}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate} loading={saving} disabled={!draft.name.trim()}>
            Create Encounter
          </Button>
        </Group>
      </Stack>
    </BaseModal>
  );
}
