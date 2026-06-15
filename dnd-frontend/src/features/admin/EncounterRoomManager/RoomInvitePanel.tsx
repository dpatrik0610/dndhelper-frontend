import { useToken } from "@store/auth/authSelectors";
import { Button, Group, MultiSelect, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { UserService } from "@services/Admin/userService";
import { encounterRoomService } from "@services/encounterRoomService";

import type { EncounterRoom } from "@appTypes/EncounterRoom";
import type { User } from "@appTypes/User";

interface RoomInvitePanelProps {
  room: EncounterRoom | null;
}

export function RoomInvitePanel({ room }: RoomInvitePanelProps) {
  const token = useToken();
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    void UserService.getAll().then(setUsers);
  }, [token]);

  if (!room) return null;

  return (
    <Paper withBorder p="sm" radius="sm">
      <Stack>
        <Text fw={700}>Invites</Text>
        <MultiSelect
          label="Players"
          data={users.map((user) => ({ value: user.id, label: user.username }))}
          value={selected}
          onChange={setSelected}
          searchable
        />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">Join code: {room.joinCode}</Text>
          <Button
            size="xs"
            disabled={!token || selected.length === 0}
            onClick={() => token && void encounterRoomService.invitePlayers(room.id, selected)}
          >
            Send Invites
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
