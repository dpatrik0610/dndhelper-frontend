import {
  Badge,
  Box,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowUpRight,
  IconCircle,
  IconCircleCheck,
  IconTarget,
} from "@tabler/icons-react";

import type { Quest } from "@appTypes/Quest";
import { QuestCardHeader } from "./QuestCardHeader";
import { MarkdownRenderer } from "@components/MarkdownRender";

interface QuestCardProps {
  quest: Quest;
  isPersonal: boolean;
  onEditQuest?: (q: Quest) => void;
  onDeleteQuest?: (id: string, title: string) => void;
  onOpenDetails: (q: Quest) => void;
}

export function QuestCard({
  quest: quest,
  isPersonal,
  onEditQuest,
  onDeleteQuest,
  onOpenDetails,
}: QuestCardProps) {
  const objectives = quest.objectives ?? [];
  const completedObjectives = objectives.filter(
    (objective) => objective.isCompleted,
  ).length;

  const totalObjectives = objectives.length;
  const progress =
    totalObjectives > 0
      ? Math.round((completedObjectives / totalObjectives) * 100)
      : 0;

  const displayedObjectives = objectives.slice(0, 3);
  const remainingCount = Math.max(totalObjectives - 3, 0);
  const isCompleted = quest.status?.toLowerCase() === "completed";

  return (
    <Paper
      component="article"
      withBorder
      radius="md"
      p={0}
      className="quest-card"
      style={{
        height: "100%",
        minHeight: 300,
        overflow: "hidden",
        background:
          "var(--theme-bg-card, rgba(255, 255, 255, 0.02))",
        borderColor:
          "var(--theme-border-subtle, rgba(255, 255, 255, 0.07))",
        transition:
          "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
    >
      <Box
        p="md"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack gap="md" style={{ flex: 1 }}>
          {/* Title */}
          <Text 
          size="md" 
          fw={800} 
          c="var(--theme-color-text-primary)" 
          lineClamp={1} 
          className="narrative-title" 
          style={{ textTransform: "capitalize" }}>
            {quest.title}
          </Text>

          <QuestCardHeader
            type={quest.type}
            status={quest.status}
            location={quest.location}
            isPersonal={isPersonal}
            onEdit={() => onEditQuest?.(quest)}
            onDelete={() => onDeleteQuest?.(quest.id || "", quest.title)} title={""}
            />

          {/* Description (Markdown) */}
          

          {quest.description && (
            <MarkdownRenderer content={quest.description || ""} style={{ lineHeight: 1.5, color: "var(--theme-color-text-secondary)", lineClamp: 3 }} />
          )}

          {/* Progress */}
          {totalObjectives > 0 && (
            <Box
              p="sm"
              style={{
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.025)",
                border:
                  "1px solid var(--theme-border-subtle, rgba(255,255,255,0.05))",
              }}
            >
              <Group justify="space-between" mb={7}>
                <Group gap={6}>
                  <IconTarget
                    size={14}
                    style={{
                      color: "var(--theme-color-primary)",
                    }}
                  />

                  <Text
                    size="xs"
                    fw={600}
                    c="var(--theme-color-text-primary)"
                  >
                    Objectives
                  </Text>
                </Group>

                <Text
                  size="xs"
                  fw={600}
                  c={
                    progress === 100
                      ? "var(--mantine-color-green-5)"
                      : "var(--theme-color-text-secondary)"
                  }
                >
                  {completedObjectives}/{totalObjectives}
                </Text>
              </Group>

              <Progress
                value={progress}
                size={5}
                radius="xl"
                color={progress === 100 ? "green" : "blue"}
              />

              <Text
                mt={6}
                size="10px"
                c="var(--theme-color-text-secondary)"
              >
                {progress === 100
                  ? "All objectives completed"
                  : `${progress}% complete`}
              </Text>
            </Box>
          )}

          {/* Objective preview */}
          {displayedObjectives.length > 0 && (
            <Stack
              gap={6}
              style={{
                paddingTop: 2,
              }}
            >
              {displayedObjectives.map((objective) => (
                <Group
                  key={objective.id}
                  gap={8}
                  wrap="nowrap"
                  align="flex-start"
                >
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingTop: 1,
                      flexShrink: 0,
                      color: objective.isCompleted
                        ? "var(--mantine-color-green-5)"
                        : "var(--theme-color-text-secondary)",
                    }}
                  >
                    {objective.isCompleted ? (
                      <IconCircleCheck size={15} stroke={2} />
                    ) : (
                      <IconCircle size={15} stroke={1.5} />
                    )}
                  </Box>

                  <Text
                    size="xs"
                    lineClamp={1}
                    c={
                      objective.isCompleted
                        ? "var(--theme-color-text-secondary)"
                        : "var(--theme-color-text-primary)"
                    }
                    style={{
                      flex: 1,
                      textDecoration: objective.isCompleted
                        ? "line-through"
                        : "none",
                      opacity: objective.isCompleted ? 0.55 : 1,
                    }}
                  >
                    {objective.description}
                  </Text>
                </Group>
              ))}

              {remainingCount > 0 && (
                <Text
                  size="10px"
                  c="var(--theme-color-text-secondary)"
                  ml={23}
                >
                  +{remainingCount} more objective
                  {remainingCount === 1 ? "" : "s"}
                </Text>
              )}
            </Stack>
          )}
        </Stack>

        {/* Footer */}
        <Group
          mt="lg"
          justify="space-between"
          align="center"
          gap="sm"
        >
          <Group gap={7}>
            {isCompleted && (
              <Badge
                size="sm"
                variant="light"
                color="green"
                radius="sm"
              >
                Complete
              </Badge>
            )}

            {totalObjectives === 0 && (
              <Text
                size="xs"
                c="var(--theme-color-text-secondary)"
              >
                No objectives
              </Text>
            )}
          </Group>

          <UnstyledButton
            onClick={() => onOpenDetails(quest)}
            className="quest-card-details"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 8px",
              borderRadius: 6,
              color: "var(--theme-color-text-secondary)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              transition:
                "background 150ms ease, color 150ms ease",
            }}
          >
            View quest
            <IconArrowUpRight size={14} />
          </UnstyledButton>
        </Group>
      </Box>

      <style>
        {`
          .quest-card:hover {
            transform: translateY(-2px);
            border-color: var(--theme-border-glow, rgba(255,255,255,0.15));
            box-shadow: var(--theme-glow-shadow-primary);
          }

          .quest-card-details:hover {
            background: rgba(255,255,255,0.06);
            color: var(--theme-color-text-primary);
          }
        `}
      </style>
    </Paper>
  );
}

