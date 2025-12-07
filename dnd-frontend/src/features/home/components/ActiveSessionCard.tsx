import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import type { Session } from "@appTypes/Session";
import ReactMarkdown from "react-markdown";

interface Props {
  session: Session;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
}

export function ActiveSessionCard({ session, palette }: Props) {
  const formatDate = (value?: string | null) => (value ? dayjs(value).format("YYYY-MM-DD") : "—");

  return (
    <Card
      shadow="xl"
      radius="lg"
      withBorder
      p="lg"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        borderColor: palette.border,
        color: palette.textMain,
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={700} size="lg" c={palette.textMain} truncate="end">
              {session.name}
            </Text>
          </Stack>
          <Badge
            color={session.isLive ? "teal" : "gray"}
            variant="gradient"
            gradient={session.isLive ? { from: "teal", to: "lime" } : { from: "gray", to: "dark" }}
            size="lg"
          >
            {session.isLive ? "Active" : "Scheduled"}
          </Badge>
        </Group>

        <Card withBorder radius="md" p="md" style={{ background: "rgba(0,0,0,0.18)", borderColor: palette.border }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <Text size="sm" c={palette.textDim} style={{ margin: 0 }}>
                  {children}
                </Text>
              ),
              h1: ({ children }) => (
                <Text size="lg" fw={700} c={palette.textMain} style={{ marginBottom: 6 }}>
                  {children}
                </Text>
              ),
              h2: ({ children }) => (
                <Text size="md" fw={700} c={palette.textMain} style={{ marginBottom: 4 }}>
                  {children}
                </Text>
              ),
              h3: ({ children }) => (
                <Text size="sm" fw={700} c={palette.textMain} style={{ marginBottom: 2 }}>
                  {children}
                </Text>
              ),
            }}
          >
            {session.description || "No description"}
          </ReactMarkdown>
        </Card>

        <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
          <Stack gap={2}>
            <Text size="xs" c={palette.textDim}>
              Scheduled
            </Text>
            <Text fw={700}>{formatDate(session.scheduledFor)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text size="xs" c={palette.textDim}>
              Location
            </Text>
            <Text fw={700}>{session.location || "—"}</Text>
          </Stack>
        </Group>
      </Stack>
    </Card>
  );
}
