import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import type { Session } from "../../../types/Session";
import ReactMarkdown from "react-markdown";

interface Props {
  session: Session;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
}

export function ActiveSessionCard({ session, palette }: Props) {
  const formatDate = (value?: string | null) => (value ? dayjs(value).format("YYYY-MM-DD") : "—");

  return (
    <Card shadow="lg" radius="md" withBorder p="lg" style={{ background: palette.cardBg, borderColor: palette.border, color: palette.textMain }}>
      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg" c={palette.textMain}>
            Active Session: {session.name}
          </Text>
          <Badge color={session.isLive ? "teal" : "gray"} variant="light">
            {session.isLive ? "Live" : "Scheduled"}
          </Badge>
        </Group>

        <div style={{ maxHeight: 100, overflow: "hidden" }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Text size="sm" c={palette.textDim} style={{ margin: 0 }}>
                  {children}
                </Text>
              ),
            }}
          >
            {session.description || "No description"}
          </ReactMarkdown>
        </div>

        <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Scheduled
            </Text>
            <Text fw={600}>{formatDate(session.scheduledFor)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Started
            </Text>
            <Text fw={600}>{formatDate(session.startedAt)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Ended
            </Text>
            <Text fw={600}>{formatDate(session.endedAt)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c="dimmed">
              Location
            </Text>
            <Text fw={600}>{session.location || "—"}</Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
}
