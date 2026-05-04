import { Paper, Text } from "@mantine/core";

export function ChatPanel() {
  return (
    <Paper withBorder p="sm" radius="sm" bg="rgba(15, 23, 42, 0.94)">
      <Text size="sm" c="dimmed">Room chat is reserved for a later pass.</Text>
    </Paper>
  );
}
