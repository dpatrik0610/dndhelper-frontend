import { ActionIcon, Badge, Divider, Group, Modal, Paper, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useSubtleRollStore } from "@store/ui/subtleRollStore";
import { formatRollExpression, formatRollsList } from "@utils/rollFormat";

export function SubtleRollDetailsModal() {
  const { activeRoll, opened, close } = useSubtleRollStore();

  if (!activeRoll) return null;

  const timestamp = new Date(activeRoll.timestampUtc);
  const expression = formatRollExpression(activeRoll);

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      centered
      styles={{
        header: { display: "none" },
        content: {
          background: "rgba(20,0,0,0.45)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,100,100,0.2)",
          boxShadow: "0 0 12px rgba(255,60,60,0.25)",
        },
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            Subtle Roll
          </Text>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={close}
            aria-label="Close subtle roll details"
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <Paper
          p="sm"
          radius="md"
          withBorder
          style={{
            background: "rgba(0,0,0,0.22)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text fw={600}>{activeRoll.characterName}</Text>
              <Badge color="violet" variant="light">
                {timestamp.toLocaleString()}
              </Badge>
            </Group>
            {activeRoll.note && (
              <Text size="sm" c="dimmed">
                Note: {activeRoll.note}
              </Text>
            )}
          </Stack>
        </Paper>

        <Divider my="xs" />

        <Paper
          p="sm"
          radius="md"
          withBorder
          style={{
            background: "rgba(0,0,0,0.25)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text fw={600}>Result</Text>
              <Badge color="violet" variant="light" size="lg">
                Total {activeRoll.total}
              </Badge>
            </Group>
            <Text size="sm">Expression: {expression}</Text>
            <Text size="sm">Rolls: {formatRollsList(activeRoll)}</Text>
            <Group gap="xs" wrap="wrap">
              {typeof activeRoll.min === "number" && (
                <Badge color="gray" variant="light">
                  Min {activeRoll.min}
                </Badge>
              )}
              {typeof activeRoll.max === "number" && (
                <Badge color="gray" variant="light">
                  Max {activeRoll.max}
                </Badge>
              )}
              {typeof activeRoll.average === "number" && (
                <Badge color="gray" variant="light">
                  Avg {activeRoll.average.toFixed(2)}
                </Badge>
              )}
            </Group>
          </Stack>
        </Paper>

        {(activeRoll.rolledByUsername || activeRoll.rolledByUserId) && (
          <Text size="xs" c="dimmed">
            Rolled by {activeRoll.rolledByUsername ?? activeRoll.rolledByUserId}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
