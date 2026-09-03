import React from "react";
import { Box, Group, Text, Progress, ActionIcon } from "@mantine/core";
import {
  IconCircle,
  IconCircleCheck,
  IconMinus,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import type { QuestObjective } from "@appTypes/Quest";

interface QuestObjectiveItemProps {
  obj: QuestObjective;
  questId: string;
  isPersonal: boolean;
  onToggle?: (questId: string, obj: QuestObjective) => void;
  onAdjustProgress?: (questId: string, obj: QuestObjective, amount: number) => void;
  onEdit?: (questId: string, obj: QuestObjective) => void;
  onDelete?: (questId: string, objId: string) => void;
}

export function QuestObjectiveItem({
  obj,
  questId,
  isPersonal,
  onToggle,
  onAdjustProgress,
  onEdit,
  onDelete,
}: QuestObjectiveItemProps) {
  const isComplex = obj.completionThreshold > 1;
  const progressPct = Math.min(
    100,
    Math.round((obj.currentProgress / obj.completionThreshold) * 100)
  );

  return (
    <Box
      p="xs"
      style={{
        background: "rgba(255, 255, 255, 0.01)",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        borderRadius: "6px",
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Group gap="xs" align="center" style={{ flex: 1, minWidth: 0 }}>
          {/* Checkbox rendering */}
          {!isComplex ? (
            isPersonal ? (
              <ActionIcon
                variant="subtle"
                color={obj.isCompleted ? "#10b981" : "rgba(255, 255, 255, 0.4)"}
                onClick={() => onToggle?.(questId, obj)}
                style={{ cursor: "pointer" }}
              >
                {obj.isCompleted ? <IconCircleCheck size={18} /> : <IconCircle size={18} />}
              </ActionIcon>
            ) : (
              <Box style={{ color: obj.isCompleted ? "#10b981" : "rgba(255, 255, 255, 0.3)", display: "flex", alignItems: "center" }}>
                {obj.isCompleted ? <IconCircleCheck size={18} /> : <IconCircle size={18} />}
              </Box>
            )
          ) : null}

          <Text
            size="sm"
            truncate="end"
            style={{
              textDecoration: obj.isCompleted ? "line-through" : "none",
              color: obj.isCompleted
                ? "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.4))"
                : "var(--theme-color-text-primary, #fff)",
              flex: 1,
            }}
          >
            {obj.description}
          </Text>
        </Group>

        {/* Progress Display & Adjustments */}
        <Group gap="xs" align="center">
          {isComplex && (
            <Text size="xs" fw={500} c="var(--theme-color-text-secondary)">
              {obj.currentProgress} / {obj.completionThreshold}
            </Text>
          )}

          {isPersonal && (
            <Group gap={4}>
              {isComplex && (
                <>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    disabled={obj.currentProgress === 0}
                    onClick={() => onAdjustProgress?.(questId, obj, -1)}
                    styles={{ root: { color: "var(--theme-color-text-secondary)" } }}
                  >
                    <IconMinus size={12} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    disabled={obj.isCompleted}
                    onClick={() => onAdjustProgress?.(questId, obj, 1)}
                    styles={{ root: { color: "var(--theme-color-accent-primary)" } }}
                  >
                    <IconPlus size={12} />
                  </ActionIcon>
                </>
              )}
              <ActionIcon
                size="sm"
                variant="subtle"
                color="var(--theme-color-accent-primary, #f59e0b)"
                onClick={() => onEdit?.(questId, obj)}
              >
                <IconEdit size={12} />
              </ActionIcon>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => onDelete?.(questId, obj.id)}
              >
                <IconTrash size={12} />
              </ActionIcon>
            </Group>
          )}
        </Group>
      </Group>

      {/* Progress Bar for complex objectives */}
      {isComplex && (
        <Box mt="xs" px="sm">
          <Progress
            value={progressPct}
            size="xs"
            radius="xl"
            color={obj.isCompleted ? "#10b981" : "var(--theme-color-accent-primary, #f59e0b)"}
            styles={{
              root: {
                background: "rgba(255, 255, 255, 0.05)",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
