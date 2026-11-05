import { Badge, Group, Stack, Text } from "@mantine/core";
import { IconEyeOff } from "@tabler/icons-react";
import { BaseModal } from "@components/BaseModal";
import { useSubtleRollStore } from "@store/ui/subtleRollStore";
import type { RollResult } from "@appTypes/Roll";
import { DiceResult } from "./Dice";

export interface RollDetails {
  id: string;
  who: string;
  by?: string | null;
  at?: string | null;
  note?: string | null;
  subtle: boolean;
  result: RollResult;
}

export function RollDetailsModal({ details, onClose }: { details: RollDetails | null; onClose: () => void }) {
  return (
    <BaseModal
      opened={details != null}
      onClose={onClose}
      title={details?.subtle ? "Subtle Roll" : "Roll"}
      size="md"
      showSaveButton={false}
      showCancelButton={false}
    >
      {details && (
        <Stack gap="sm">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            <Stack gap={0} miw={0}>
              <Text fw={600} truncate>
                {details.who}
              </Text>
              <Text size="xs" c="dimmed">
                {[details.by && details.by !== details.who && `rolled by ${details.by}`, details.at && new Date(details.at).toLocaleString()]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </Stack>
            {details.subtle && (
              <Badge variant="light" leftSection={<IconEyeOff size={12} />}>
                Subtle
              </Badge>
            )}
          </Group>

          {details.note && (
            <Text size="sm" fs="italic" c="var(--theme-color-text-secondary)">
              “{details.note}”
            </Text>
          )}

          <DiceResult key={details.id} result={details.result} sides={details.result.sides} count={details.result.numberOfDice} />
        </Stack>
      )}
    </BaseModal>
  );
}

/** Opened from the "subtle roll" notification the DM gets. */
export function SubtleRollDetailsModal() {
  const { activeRoll, opened, close } = useSubtleRollStore();
  const details =
    opened && activeRoll
      ? {
          id: activeRoll.rollId,
          who: activeRoll.characterName,
          by: activeRoll.rolledByUsername,
          at: activeRoll.timestampUtc,
          note: activeRoll.note,
          subtle: true,
          result: activeRoll,
        }
      : null;
  return <RollDetailsModal details={details} onClose={close} />;
}
