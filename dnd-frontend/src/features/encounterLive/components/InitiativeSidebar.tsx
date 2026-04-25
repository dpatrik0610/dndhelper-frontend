import { Badge, Button, Group, NumberInput, Paper, ScrollArea, Select, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPlayerTrackNext, IconRefresh } from "@tabler/icons-react";
import type { EncounterEntity } from "@appTypes/Encounter";
import { ENCOUNTER_ENTITY_STATUSES } from "@appTypes/Encounter";
import { buildEntityKey, getEntityStatusColor } from "../initiativeUtils";

type InitiativeSidebarProps = {
  entities: EncounterEntity[];
  isAdmin: boolean;
  cycleCount: number;
  activeEntityKey: string | null;
  saving: boolean;
  onCycleChange: (value: number) => void;
  onNextTurn: () => void;
  onResetTurn: () => void;
  onUpdateEntity: (index: number, update: Partial<EncounterEntity>) => void;
  scrollClassName?: string;
};

export function InitiativeSidebar({
  entities,
  isAdmin,
  cycleCount,
  activeEntityKey,
  saving,
  onCycleChange,
  onNextTurn,
  onResetTurn,
  onUpdateEntity,
  scrollClassName,
}: InitiativeSidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        background: "linear-gradient(165deg, rgba(20, 14, 38, 0.9), rgba(12, 10, 24, 0.86))",
        borderColor: "rgba(177, 151, 252, 0.28)",
      }}
    >
      <Stack gap="sm" h="100%">
        <Group justify="space-between" align="center">
          <Text fw={700} c="grape.0">
            Initiative
          </Text>
          <Badge variant="light" color="grape">
            {entities.length}
          </Badge>
        </Group>

        {isAdmin ? (
          <Group justify="space-between" align="center" wrap={isMobile ? "wrap" : "nowrap"}>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Cycle
              </Text>
              <NumberInput
                size="xs"
                value={cycleCount}
                min={1}
                allowDecimal={false}
                onChange={(value) => onCycleChange(Math.max(1, Number(value || 1)))}
                w={86}
              />
            </Group>
            <Group gap="xs" grow={isMobile}>
              <Button size={isMobile ? "sm" : "compact-sm"} variant="light" leftSection={<IconPlayerTrackNext size={14} />} onClick={onNextTurn}>
                Next
              </Button>
              <Button size={isMobile ? "sm" : "compact-sm"} variant="subtle" color="gray" leftSection={<IconRefresh size={14} />} onClick={onResetTurn}>
                Reset
              </Button>
            </Group>
          </Group>
        ) : null}

        <ScrollArea className={scrollClassName}>
          <Stack gap="xs" pr="xs">
            {entities.map((entity, index) => {
              /** Builds a stable key and active-state marker for each initiative row. */
              const entityKey = buildEntityKey(entity, index);
              const isActive = activeEntityKey === entityKey;

              return (
                <Paper
                  key={entityKey}
                  withBorder
                  p="xs"
                  radius="md"
                  bg={isActive ? "rgba(157, 78, 221, 0.16)" : "rgba(255, 255, 255, 0.02)"}
                  style={{
                    borderColor: isActive ? "rgba(177, 151, 252, 0.6)" : "rgba(177, 151, 252, 0.2)",
                    transition: "border-color 120ms ease, transform 120ms ease",
                  }}
                >
                  <Stack gap={6}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text fw={600} truncate>
                        {entity.name}
                      </Text>
                      <Badge variant={isActive ? "filled" : "light"} color={isActive ? "violet" : getEntityStatusColor(entity.status)}>
                        {entity.initiative ?? "-"}
                      </Badge>
                    </Group>

                    <Group gap="xs">
                      <Badge variant="dot" color="gray">
                        {entity.type}
                      </Badge>
                      {entity.quantity > 1 ? <Badge variant="light">x{entity.quantity}</Badge> : null}
                      <Badge color={getEntityStatusColor(entity.status)}>{entity.status}</Badge>
                    </Group>

                    {isAdmin ? (
                      <Group grow wrap={isMobile ? "wrap" : "nowrap"}>
                        <NumberInput
                          size="xs"
                          label="Init"
                          value={entity.initiative ?? undefined}
                          allowDecimal={false}
                          onChange={(value) =>
                            onUpdateEntity(index, {
                              initiative: typeof value === "number" ? value : null,
                            })
                          }
                        />
                        <Select
                          size="xs"
                          label="Status"
                          data={ENCOUNTER_ENTITY_STATUSES.map((status) => ({
                            value: status,
                            label: status,
                          }))}
                          value={entity.status}
                          allowDeselect={false}
                          onChange={(value) =>
                            onUpdateEntity(index, {
                              status: (value as EncounterEntity["status"]) ?? entity.status,
                            })
                          }
                        />
                      </Group>
                    ) : null}
                  </Stack>
                </Paper>
              );
            })}

            {entities.length === 0 ? (
              <Text size="sm" c="dimmed">
                No entities.
              </Text>
            ) : null}
          </Stack>
        </ScrollArea>

        {saving && isAdmin ? (
          <Text size="xs" c="dimmed">
            Saving changes...
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
