import { Button, Group, NumberInput, Stack, Text, Tooltip } from "@mantine/core";
import { IconPlayerTrackNext, IconRefresh, IconPlus, IconMinus } from "@tabler/icons-react";

interface InitiativeControlsProps {
  cycleCount: number;
  onSetCycle: (value: number) => void;
  onNext: () => void;
  onReset: () => void;
}

export function InitiativeControls({ cycleCount, onSetCycle, onNext, onReset }: InitiativeControlsProps) {
  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="sm" fw={600}>
            Cycles
          </Text>
          <NumberInput
            size="xs"
            value={cycleCount}
            min={0}
            onChange={(val) => onSetCycle(Number(val ?? 0))}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            styles={{ input: { width: 80 } }}
          />
          <Tooltip label="Decrease cycle">
            <Button
              size="compact-xs"
              variant="light"
              leftSection={<IconMinus size={14} />}
              onClick={() => onSetCycle(Math.max(0, cycleCount - 1))}
            >
              Dec
            </Button>
          </Tooltip>
          <Tooltip label="Increase cycle">
            <Button
              size="compact-xs"
              variant="light"
              leftSection={<IconPlus size={14} />}
              onClick={() => onSetCycle(cycleCount + 1)}
            >
              Inc
            </Button>
          </Tooltip>
        </Group>

        <Group gap="xs">
          <Button
            size="xs"
            variant="gradient"
            gradient={{ from: "grape", to: "cyan" }}
            leftSection={<IconPlayerTrackNext size={14} />}
            onClick={onNext}
          >
            Next turn
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            leftSection={<IconRefresh size={14} />}
            onClick={onReset}
          >
            Reset
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
