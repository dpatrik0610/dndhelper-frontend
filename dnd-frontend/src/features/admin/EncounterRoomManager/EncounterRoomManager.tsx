import { Button, Group, Paper, SimpleGrid, Stack, Tabs, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEncounterRoomHub } from "@features/encounterRoom/hooks/useEncounterRoomHub";
import { useRoomActions } from "@features/encounterRoom/hooks/useRoomActions";
import { useEncounterRoomStore } from "@store/useEncounterRoomStore";
import type { EncounterRoom } from "@appTypes/EncounterRoom";
import { RoomEntityEditor } from "./RoomEntityEditor";
import { RoomInvitePanel } from "./RoomInvitePanel";
import { RoomMapConfig } from "./RoomMapConfig";

export function EncounterRoomManager() {
  const navigate = useNavigate();
  const rooms = useEncounterRoomStore((state) => state.myRooms);
  const room = useEncounterRoomStore((state) => state.room);
  const loadMyRooms = useEncounterRoomStore((state) => state.loadMyRooms);
  const loadRoom = useEncounterRoomStore((state) => state.loadRoom);
  const createRoom = useEncounterRoomStore((state) => state.createRoom);
  const deleteRoom = useEncounterRoomStore((state) => state.deleteRoom);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { invoke } = useEncounterRoomHub(selectedId);
  const actions = useRoomActions(invoke);

  useEffect(() => {
    void loadMyRooms();
  }, [loadMyRooms]);

  const selectRoom = async (selectedRoom: EncounterRoom) => {
    setSelectedId(selectedRoom.id);
    await loadRoom(selectedRoom.id);
  };

  return (
    <Stack>
      <Group justify="space-between">
        <Text fw={800} size="xl">Encounter Rooms</Text>
        <Button onClick={() => void createRoom({ name: "New Encounter Room" }).then((created) => created && selectRoom(created))}>
          Create Room
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Stack>
          {rooms.map((item) => (
            <Paper
              key={item.id}
              withBorder
              p="sm"
              radius="sm"
              onClick={() => void selectRoom(item)}
              style={{ cursor: "pointer", borderColor: item.id === room?.id ? "var(--mantine-color-violet-5)" : undefined }}
            >
              <Group justify="space-between">
                <Text fw={700}>{item.name}</Text>
                <Text size="xs" c="dimmed">{item.playerIds.length} players</Text>
              </Group>
            </Paper>
          ))}
        </Stack>

        <Paper withBorder p="sm" radius="sm" style={{ gridColumn: "span 2" }}>
          {!room ? (
            <Text c="dimmed">Select or create a room.</Text>
          ) : (
            <Tabs defaultValue="entities">
              <Tabs.List>
                <Tabs.Tab value="entities">Entities</Tabs.Tab>
                <Tabs.Tab value="map">Map</Tabs.Tab>
                <Tabs.Tab value="invites">Invites</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="entities" pt="sm">
                <RoomEntityEditor
                  room={room}
                  onAddEntity={(request) => void actions.addEntity(request)}
                  onUpdateEntity={(entityId, updates) => void actions.updateEntity({ entityId, updates })}
                  onRemoveEntity={(entityId) => void actions.removeEntity({ entityId })}
                />
              </Tabs.Panel>
              <Tabs.Panel value="map" pt="sm">
                <RoomMapConfig settings={room.mapSettings} onSave={(request) => void actions.updateMapSettings(request)} />
              </Tabs.Panel>
              <Tabs.Panel value="invites" pt="sm">
                <RoomInvitePanel room={room} />
              </Tabs.Panel>
              <Group mt="md">
                <Button size="xs" onClick={() => navigate(`/encounter-room/${room.id}`)}>Open Room</Button>
                <Button size="xs" color="red" variant="light" onClick={() => void deleteRoom(room.id)}>Delete Room</Button>
              </Group>
            </Tabs>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
