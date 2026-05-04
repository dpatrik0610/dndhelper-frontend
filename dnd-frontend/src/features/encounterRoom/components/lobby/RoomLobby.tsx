import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconDoorEnter, IconPlus } from "@tabler/icons-react";
import type { CreateRoomRequest, EncounterRoom } from "@appTypes/EncounterRoom";
import { CreateRoomModal } from "../modals/CreateRoomModal";
import { JoinRoomModal } from "../modals/JoinRoomModal";

interface RoomLobbyProps {
  rooms: EncounterRoom[];
  loading: boolean;
  error: string | null;
  onCreateRoom: (request: CreateRoomRequest) => Promise<void>;
  onJoinRoom: (joinCode: string) => Promise<void>;
  onOpenRoom: (roomId: string) => void;
}

export function RoomLobby({ rooms, loading, error, onCreateRoom, onJoinRoom, onOpenRoom }: RoomLobbyProps) {
  const [createOpened, createHandlers] = useDisclosure(false);
  const [joinOpened, joinHandlers] = useDisclosure(false);

  return (
    <Stack p="md" gap="md">
      <Paper withBorder p="lg" radius="sm" bg="rgba(15, 23, 42, 0.92)">
        <Group justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Text fw={800} size="xl">Encounter Rooms</Text>
            <Text size="sm" c="dimmed">Create or join a live tactical room.</Text>
          </Stack>
          <Group>
            <Button leftSection={<IconDoorEnter size={16} />} variant="light" onClick={joinHandlers.open}>
              Join Room
            </Button>
            <Button leftSection={<IconPlus size={16} />} onClick={createHandlers.open}>
              Create Room
            </Button>
          </Group>
        </Group>
      </Paper>

      {error && <Badge color="red">{error}</Badge>}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {rooms.map((room) => (
          <Paper
            key={room.id}
            withBorder
            p="md"
            radius="sm"
            bg="rgba(15, 23, 42, 0.9)"
            onClick={() => onOpenRoom(room.id)}
            style={{ cursor: "pointer" }}
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={700}>{room.name}</Text>
                <Badge variant="light">{room.playerIds.length} players</Badge>
              </Group>
              <Text size="xs" c="dimmed">
                Created {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : "recently"}
              </Text>
              <Text size="xs" c="dimmed">
                {room.mapSettings.gridType} {room.mapSettings.gridWidth}x{room.mapSettings.gridHeight}
              </Text>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>

      {!loading && rooms.length === 0 && (
        <Paper withBorder p="lg" radius="sm" bg="rgba(15, 23, 42, 0.82)">
          <Text c="dimmed">No active encounter rooms yet.</Text>
        </Paper>
      )}

      <CreateRoomModal opened={createOpened} onClose={createHandlers.close} onSubmit={onCreateRoom} />
      <JoinRoomModal opened={joinOpened} onClose={joinHandlers.close} onSubmit={onJoinRoom} />
    </Stack>
  );
}
