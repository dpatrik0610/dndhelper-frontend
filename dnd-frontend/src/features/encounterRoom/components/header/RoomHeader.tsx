import { Badge, Button, CopyButton, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCopy, IconDoorExit, IconRefresh, IconSwords } from "@tabler/icons-react";
import type { EncounterRoom } from "@appTypes/EncounterRoom";
import { PlayerAvatarRow } from "./PlayerAvatarRow";

interface RoomHeaderProps {
  room: EncounterRoom;
  isConnected: boolean;
  isDM: boolean;
  onLeave: () => void;
  onEnd: () => void;
  onRegenerateCode: () => void;
}

export function RoomHeader({ room, isConnected, isDM, onLeave, onEnd, onRegenerateCode }: RoomHeaderProps) {
  return (
    <Paper withBorder p="sm" radius="sm" bg="rgba(15, 23, 42, 0.94)">
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Group gap="sm">
          <ThemeIcon color="violet" variant="light" size="lg">
            <IconSwords size={18} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700}>{room.name}</Text>
            <Group gap="xs">
              <Badge color={isConnected ? "green" : "red"} variant="dot">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Text size="xs" c="dimmed">
                rev {room.revision}
              </Text>
            </Group>
          </Stack>
        </Group>

        <Group gap="xs">
          <PlayerAvatarRow playerIds={room.playerIds} />
          {isDM && (
            <>
              <CopyButton value={room.joinCode}>
                {({ copied, copy }) => (
                  <Button size="xs" variant="light" color={copied ? "green" : "violet"} leftSection={<IconCopy size={14} />} onClick={copy}>
                    {room.joinCode}
                  </Button>
                )}
              </CopyButton>
              <Button size="xs" variant="subtle" leftSection={<IconRefresh size={14} />} onClick={onRegenerateCode}>
                Code
              </Button>
            </>
          )}
          <Button
            size="xs"
            color={isDM ? "red" : "gray"}
            variant={isDM ? "light" : "subtle"}
            leftSection={<IconDoorExit size={14} />}
            onClick={isDM ? onEnd : onLeave}
          >
            {isDM ? "End Room" : "Leave"}
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
