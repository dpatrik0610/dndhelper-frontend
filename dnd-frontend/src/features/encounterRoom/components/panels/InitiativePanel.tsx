import { ActionIcon, Badge, Button, Group, NumberInput, Paper, Progress, Stack, Text } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay, IconPlayerTrackNext } from "@tabler/icons-react";
import type { EncounterRoom, SessionEntity } from "@appTypes/EncounterRoom";
import { useRoomPermissions } from "../../hooks/useRoomPermissions";

interface InitiativePanelProps {
  room: EncounterRoom;
  onSetInitiative: (entityId: string, initiative: number) => void;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onAdvanceTurn: () => void;
  onSelectEntity: (entityId: string) => void;
}

const numberAttribute = (entity: SessionEntity, key: string) => {
  const value = entity.attributes?.[key];
  return typeof value === "number" ? value : Number(value) || 0;
};

export function InitiativePanel({
  room,
  onSetInitiative,
  onStartCombat,
  onEndCombat,
  onAdvanceTurn,
  onSelectEntity,
}: InitiativePanelProps) {
  const permissions = useRoomPermissions(room);
  const sorted = [...room.entities].sort((a, b) => (b.initiative ?? -999) - (a.initiative ?? -999));

  return (
    <Paper withBorder p="sm" radius="sm" bg="rgba(15, 23, 42, 0.94)" h="100%">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={700}>Initiative</Text>
          <Badge variant="light">Round {room.turnState.round}</Badge>
        </Group>

        {permissions.isDM && (
          <Group gap="xs">
            <Button size="xs" leftSection={<IconPlayerPlay size={14} />} onClick={onStartCombat} disabled={room.turnState.isActive}>
              Start
            </Button>
            <ActionIcon variant="light" onClick={onAdvanceTurn} disabled={!room.turnState.isActive} aria-label="Next turn">
              <IconPlayerTrackNext size={16} />
            </ActionIcon>
            <ActionIcon color="red" variant="light" onClick={onEndCombat} disabled={!room.turnState.isActive} aria-label="End combat">
              <IconPlayerPause size={16} />
            </ActionIcon>
          </Group>
        )}

        <Stack gap="xs">
          {sorted.map((entity, index) => {
            const current = room.turnState.isActive && room.turnState.currentIndex === index;
            const maxHp = numberAttribute(entity, "MaxHp");
            const currentHp = numberAttribute(entity, "CurrentHp");
            const canEdit = permissions.canEditEntity(entity);

            return (
              <Paper
                key={entity.id}
                p="xs"
                radius="sm"
                withBorder
                bg={current ? "rgba(124, 58, 237, 0.28)" : "rgba(255,255,255,0.03)"}
                onClick={() => onSelectEntity(entity.id)}
                style={{ cursor: "pointer", borderColor: entity.color }}
              >
                <Group justify="space-between" align="flex-start" gap="xs">
                  <Stack gap={3} style={{ flex: 1 }}>
                    <Group gap="xs">
                      <Badge size="xs" style={{ background: entity.color }}>
                        {entity.isPlayer ? "PC" : "NPC"}
                      </Badge>
                      <Text size="sm" fw={700} lineClamp={1}>
                        {entity.name}
                      </Text>
                    </Group>
                    {maxHp > 0 && <Progress size="xs" color="red" value={(currentHp / maxHp) * 100} />}
                    <Text size="xs" c="dimmed">
                      AC {String(entity.attributes?.AC ?? "-")} {entity.attributes?.Condition ? `- ${String(entity.attributes.Condition)}` : ""}
                    </Text>
                  </Stack>
                  <NumberInput
                    size="xs"
                    w={74}
                    value={entity.initiative ?? ""}
                    disabled={!canEdit}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(value) => onSetInitiative(entity.id, Number(value) || 0)}
                  />
                </Group>
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
}
