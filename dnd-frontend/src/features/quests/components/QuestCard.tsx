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
import { useMemo } from "react";

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

  // Dynamic Type-based Color Coding Theme Spec using Campaign CSS Variables (Adapts automatically to Feywild, Steampunk, Toxic, Glacier, etc.)
  const typeTheme = useMemo(() => {
    switch (quest.type?.toLowerCase()) {
      case "main":
        return {
          color: "var(--theme-color-accent-primary, rgba(168, 85, 247, 0.8))",
          bg: "var(--theme-gradient-primary-glass, rgba(168, 85, 247, 0.015))",
          border: "var(--theme-border-glow, rgba(168, 85, 247, 0.12))",
          shadow: "var(--theme-glow-shadow-primary, rgba(168, 85, 247, 0.05))",
        };
      case "side":
        return {
          color: "var(--theme-color-accent-secondary, rgba(59, 130, 246, 0.8))",
          bg: "rgba(59, 130, 246, 0.015)",
          border: "rgba(59, 130, 246, 0.12)",
          shadow: "rgba(59, 130, 246, 0.05)",
        };
      case "faction":
        return {
          color: "var(--theme-color-text-secondary, rgba(13, 148, 136, 0.8))",
          bg: "rgba(13, 148, 136, 0.015)",
          border: "rgba(13, 148, 136, 0.12)",
          shadow: "rgba(13, 148, 136, 0.05)",
        };
      case "personal":
        return {
          color: "var(--theme-color-text-glow, rgba(245, 158, 11, 0.8))",
          bg: "rgba(245, 158, 11, 0.055)",
          border: "rgba(245, 158, 11, 0.12)",
          shadow: "rgba(245, 158, 11, 0.05)",
        };
      default:
        return {
          color: "var(--theme-border-subtle, rgba(255, 255, 255, 0.25))",
          bg: "rgba(255, 255, 255, 0.5)",
          border: "var(--theme-border-subtle, rgba(255, 255, 255, 0.07))",
          shadow: "rgba(0, 0, 0, 0.1)",
        };
    }
  }, [quest.type]);

  return (
    <Paper
      component="article"
      withBorder
      radius="md"
      className="quest-card"
      style={{
        height: "100%",
        minHeight: 300,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${typeTheme.bg} 0%, rgba(255, 255, 255, 0.01) 100%)`,
        borderLeft: `4px solid ${typeTheme.color}`,
        borderTop: `1.5px solid ${typeTheme.border}`,
        borderRight: `0.5px solid ${typeTheme.border}`,
        borderBottom: `0.5px solid ${typeTheme.border}`,
        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.22), 0 0 15px ${typeTheme.shadow}, inset 0 1px 1px rgba(255, 255, 255, 0.03)`,
        transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
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
          size="lg" 
          fw={900} 
          c="var(--theme-color-text-primary)" 
          lineClamp={1} 
          className="narrative-title" 
          style={{ textTransform: "capitalize", letterSpacing: "0.2px" }}>
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
            <Box
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <MarkdownRenderer content={quest.description || ""} style={{ lineHeight: 1.5, color: "var(--theme-color-text-secondary)"}} />
            </Box>
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
          .quest-card {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.03);
            transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
          }

          .quest-card:hover {
            transform: translateY(-6px);
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

