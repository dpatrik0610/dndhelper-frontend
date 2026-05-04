import { Button, Group, NumberInput, Paper, Stack, Text, TextInput } from "@mantine/core";
import type { EncounterRoom } from "@appTypes/EncounterRoom";
import { useRoomPermissions } from "../../hooks/useRoomPermissions";

interface EntityPanelProps {
  room: EncounterRoom;
  selectedEntityId: string | null;
  onUpdateEntity: (entityId: string, updates: Record<string, unknown>) => void;
  onAddToken: (entityId: string) => void;
}

export function EntityPanel({ room, selectedEntityId, onUpdateEntity, onAddToken }: EntityPanelProps) {
  const entity = room.entities.find((item) => item.id === selectedEntityId) ?? null;
  const permissions = useRoomPermissions(room);

  if (!entity) {
    return (
      <Paper withBorder p="sm" radius="sm" bg="rgba(15, 23, 42, 0.94)">
        <Text size="sm" c="dimmed">Select a token or initiative entry.</Text>
      </Paper>
    );
  }

  const canEdit = permissions.canEditEntity(entity);
  const attributeEntries = Object.entries(entity.attributes ?? {});

  return (
    <Paper withBorder p="sm" radius="sm" bg="rgba(15, 23, 42, 0.94)">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700}>{entity.name}</Text>
          {permissions.isDM && (
            <Button size="xs" variant="light" onClick={() => onAddToken(entity.id)}>
              Add Token
            </Button>
          )}
        </Group>

        <TextInput
          label="Name"
          value={entity.name}
          disabled={!canEdit}
          onChange={(event) => onUpdateEntity(entity.id, { Name: event.currentTarget.value })}
        />

        <Stack gap="xs">
          {attributeEntries.map(([key, value]) => {
            const numeric = typeof value === "number" || !Number.isNaN(Number(value));
            return numeric ? (
              <NumberInput
                key={key}
                size="xs"
                label={key}
                value={Number(value)}
                disabled={!canEdit}
                onChange={(nextValue) => onUpdateEntity(entity.id, { [key]: Number(nextValue) || 0 })}
              />
            ) : (
              <TextInput
                key={key}
                size="xs"
                label={key}
                value={String(value ?? "")}
                disabled={!canEdit}
                onChange={(event) => onUpdateEntity(entity.id, { [key]: event.currentTarget.value })}
              />
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
