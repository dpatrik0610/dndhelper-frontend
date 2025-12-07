import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import { BaseModal } from "@components/BaseModal";
import type { Session } from "@appTypes/Session";
import type { Campaign } from "@appTypes/Campaign";
import ReactMarkdown from "react-markdown";
import dayjs from "dayjs";
import { SessionNotesPanel } from "./SessionNotesPanel";

interface Props {
  opened: boolean;
  session: Session | null;
  campaigns: Campaign[];
  onClose: () => void;
}

export default function SessionViewModal({ opened, session, campaigns, onClose }: Props) {
  if (!session) return null;

  const campaignName = campaigns.find((c) => c.id === session.campaignId)?.name ?? "Unassigned";
  const formatDate = (value?: string | null) => (value ? dayjs(value).format("YYYY-MM-DD") : "Not set");

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Session Details"
      showSaveButton={false}
      showCancelButton={false}
      hideHeader
      withCloseButton
      size="lg"
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {session.name}
            </Text>
            <Text size="sm" c="dimmed">
              Campaign: {campaignName}
            </Text>
          </Stack>
          <Badge color={session.isLive ? "teal" : "gray"}>{session.isLive ? "Active" : "Inactive"}</Badge>
        </Group>

        <Card withBorder radius="md" p="md" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Text fw={600} size="sm" mb={4}>
            Description
          </Text>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Text size="sm" c="dimmed" style={{ margin: 0 }}>
                  {children}
                </Text>
              ),
            }}
          >
            {session.description || "No description"}
          </ReactMarkdown>
        </Card>

        <Group align="flex-start" gap="md">
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Scheduled For
            </Text>
            <Text fw={600}>{formatDate(session.scheduledFor)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Created At
            </Text>
            <Text fw={600}>{formatDate(session.createdAt)}</Text>
          </Stack>
        </Group>

        <SessionNotesPanel session={session} saving={false} onUpdateNoteIds={async () => {}} editable={false} />
      </Stack>
    </BaseModal>
  );
}
