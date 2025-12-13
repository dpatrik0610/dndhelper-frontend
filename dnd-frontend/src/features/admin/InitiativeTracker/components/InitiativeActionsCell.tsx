import { ActionIcon, Button, Group, Tooltip } from "@mantine/core";
import { IconPlus, IconCheck, IconTrash, IconX, IconPencil, IconHeartPlus, IconDroplet } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { AdjustHpModal } from "./AdjustHpModal";
import { Divider } from "@mantine/core";

interface InitiativeActionsCellProps {
  rowId: string;
  isEditing: boolean;
  isSaving: boolean;
  onAddCondition?: (id: string) => void;
  onAdjustHp?: (id: string, delta: number) => void;
  onToggleEdit?: (id: string, enable: boolean) => void;
  onApplyEdit?: (id: string) => void;
  onRemove: (id: string) => void;
}

export function InitiativeActionsCell({
  rowId,
  isEditing,
  isSaving,
  onAddCondition,
  onAdjustHp,
  onToggleEdit,
  onApplyEdit,
  onRemove,
}: InitiativeActionsCellProps) {
  const [healOpen, { open: openHeal, close: closeHeal }] = useDisclosure(false);
  const [damageOpen, { open: openDamage, close: closeDamage }] = useDisclosure(false);

  return (
    <>
      <Group gap="xs" justify="flex-end" wrap="nowrap" align="center">
        <Tooltip label="Heal">
          <ActionIcon
            size="md"
            variant="light"
            color="teal"
            onClick={openHeal}
          >
            <IconHeartPlus size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Damage">
          <ActionIcon
            size="md"
            variant="light"
            color="red"
            onClick={openDamage}
          >
            <IconDroplet size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Add condition">
          <ActionIcon
            size="md"
            variant="light"
            color="grape"
            onClick={() => onAddCondition?.(rowId)}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
        <Divider orientation="vertical" />

      {!isEditing ? (
        <Tooltip label="Enable editing">
          <ActionIcon
            size="md"
            variant="light"
            color="blue"
            onClick={() => onToggleEdit?.(rowId, true)}
          >
            <IconPencil size={16} />
          </ActionIcon>
        </Tooltip>
      ) : (
        <>
          <Tooltip label="Apply changes">
            <Button
              size="compact-sm"
              variant="filled"
              color="teal"
              loading={isSaving}
              leftSection={<IconCheck size={14} />}
              onClick={() => onApplyEdit?.(rowId)}
            >
              Apply
            </Button>
          </Tooltip>
          <Tooltip label="Cancel editing">
            <ActionIcon
              size="md"
              variant="subtle"
              color="gray"
              onClick={() => onToggleEdit?.(rowId, false)}
              disabled={isSaving}
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        </>
      )}

      <Tooltip label="Remove row">
        <ActionIcon size="md" color="red" variant="light" onClick={() => onRemove(rowId)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Tooltip>
      </Group>

      <AdjustHpModal
        opened={healOpen}
        mode="heal"
        onClose={closeHeal}
        onSubmit={(amount) => onAdjustHp?.(rowId, amount)}
      />
      <AdjustHpModal
        opened={damageOpen}
        mode="damage"
        onClose={closeDamage}
        onSubmit={(amount) => onAdjustHp?.(rowId, -amount)}
      />
    </>
  );
}
