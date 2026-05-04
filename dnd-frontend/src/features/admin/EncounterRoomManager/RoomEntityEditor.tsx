import { Button, Group, NumberInput, Paper, Stack, Table, Text, TextInput } from "@mantine/core";
import { useState } from "react";
import type { AddEntityRequest, EncounterRoom } from "@appTypes/EncounterRoom";

interface RoomEntityEditorProps {
  room: EncounterRoom | null;
  onAddEntity: (request: AddEntityRequest) => void;
  onUpdateEntity: (entityId: string, updates: Record<string, unknown>) => void;
  onRemoveEntity: (entityId: string) => void;
}

export function RoomEntityEditor({ room, onAddEntity, onUpdateEntity, onRemoveEntity }: RoomEntityEditorProps) {
  const [name, setName] = useState("");

  if (!room) return <Text c="dimmed">Select a room to edit entities.</Text>;

  return (
    <Stack>
      <Paper withBorder p="sm" radius="sm">
        <Group align="end">
          <TextInput label="Entity name" value={name} onChange={(event) => setName(event.currentTarget.value)} />
          <Button
            onClick={() => {
              if (!name.trim()) return;
              onAddEntity({ name: name.trim(), isPlayer: false, color: "#7c3aed", attributes: { MaxHp: 10, CurrentHp: 10, AC: 10 } });
              setName("");
            }}
          >
            Add Entity
          </Button>
        </Group>
      </Paper>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Initiative</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {room.entities.map((entity) => (
            <Table.Tr key={entity.id}>
              <Table.Td>{entity.name}</Table.Td>
              <Table.Td>
                <NumberInput
                  size="xs"
                  w={90}
                  value={entity.initiative ?? ""}
                  onChange={(value) => onUpdateEntity(entity.id, { Initiative: Number(value) || 0 })}
                />
              </Table.Td>
              <Table.Td>
                <Button size="xs" color="red" variant="subtle" onClick={() => onRemoveEntity(entity.id)}>
                  Remove
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
