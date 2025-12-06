import { Badge, Card, Group, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import type { Session } from "../../../types/Session";

interface Props {
  session: Session;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
}

export function ActiveSessionCard({ session, palette }: Props) {
  return (
    <Card shadow="lg" radius="md" withBorder p="lg" style={{ background: palette.cardBg, borderColor: palette.border, color: palette.textMain }}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text fw={700} size="lg" c={palette.textMain}>
            Active Session: {session.name}
          </Text>
          <Text size="sm" c={palette.textDim} lineClamp={3}>
            {session.description || "No description"}
          </Text>
        </div>
        <Stack gap={4} align="flex-end">
          <Badge color={session.isLive ? "teal" : "gray"} variant="light">
            {session.isLive ? "Live" : "Scheduled"}
          </Badge>
          <Text size="sm" c={palette.textMain}>
            {session.scheduledFor ? dayjs(session.scheduledFor).format("YYYY-MM-DD") : "No date set"}
          </Text>
        </Stack>
      </Group>
    </Card>
  );
}
