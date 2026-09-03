import { Group, Stack, Text, ActionIcon, Badge } from "@mantine/core";
import { IconEdit, IconTrash, IconMapPin } from "@tabler/icons-react";
import { QuestType, QuestStatus } from "@appTypes/Quest";

interface QuestCardHeaderProps {
  title: string;
  type: QuestType;
  status: QuestStatus;
  location?: string;
  isPersonal: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function QuestCardHeader({
  title,
  type,
  status,
  location,
  isPersonal,
  onEdit,
  onDelete,
}: QuestCardHeaderProps) {
  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case QuestStatus.Active:
        return "var(--theme-color-accent-primary, #f59e0b)";
      case QuestStatus.Completed:
        return "#10b981";
      case QuestStatus.Failed:
        return "#ef4444";
      case QuestStatus.Available:
        return "var(--theme-color-accent-secondary, #06b6d4)";
      default:
        return "gray";
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <Stack gap={6} mb="xs">
      <Group
        justify="space-between"
        align="center"
        wrap="nowrap"
        gap="sm"
      >
        {/* Title + badges */}
        <Group
          gap="sm"
          align="center"
          wrap="nowrap"
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Text
            size="lg"
            fw={700}
            truncate="end"
            className="narrative-title"
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            {title}
          </Text>

          <Group
            gap={6}
            wrap="nowrap"
            style={{
              flexShrink: 0,
            }}
          >
            <Badge
              size="sm"
              variant="light"
              style={{
                background:
                  "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
                border:
                  "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                color:
                  "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {type}
            </Badge>

            <Badge
              size="sm"
              variant="outline"
              style={{
                borderColor: statusColor,
                color: statusColor,
                background: "rgba(255, 255, 255, 0.01)",
                letterSpacing: "1px",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {status}
            </Badge>
          </Group>
        </Group>

        {/* Actions */}
        {isPersonal && (
          <Group gap={4} style={{ flexShrink: 0 }}>
            <ActionIcon
              variant="subtle"
              color="var(--theme-color-accent-primary, #f59e0b)"
              onClick={onEdit}
              aria-label="Edit quest"
            >
              <IconEdit size={16} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="red"
              onClick={onDelete}
              aria-label="Delete quest"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        )}
      </Group>

      {/* Location */}
      {location && (
        <Group
          gap={5}
          align="center"
          wrap="nowrap"
          c="var(--theme-color-text-secondary, rgba(255,255,255,0.7))"
        >
          <IconMapPin size={14} style={{ flexShrink: 0 }} />

          <Text size="xs" span truncate="end">
            {location}
          </Text>
        </Group>
      )}
    </Stack>
  );
}