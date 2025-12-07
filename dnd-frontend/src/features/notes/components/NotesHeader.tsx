import {
  ActionIcon,
  Group,
  MultiSelect,
  Text,
  Tooltip,
  Transition,
  Box,
} from "@mantine/core";
import {
  IconFilter,
  IconFileImport,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";

interface NotesHeaderProps {
  loading: boolean;
  onReload: () => void;
  onAdd: () => void;
  onImport: () => void;
  tags: string[];
  tagValue: string[];
  onTagsChange: (tags: string[]) => void;
  showTagFilter: boolean;
  toggleTagFilter: () => void;
}

export function NotesHeader({
  loading,
  onReload,
  onAdd,
  onImport,
  tags,
  tagValue,
  onTagsChange,
  showTagFilter,
  toggleTagFilter,
}: NotesHeaderProps) {
  return (
    <Group justify="space-between" mb={6} align="flex-start" gap="xs">
      <Box>
        <Text size="lg" fw={600} c="red.3" style={{ lineHeight: 1.1 }}>
          Personal Notes{" "}
          {loading && (
            <Text span c="dimmed" size="sm" style={{ lineHeight: 1.1 }}>
              (loading...)
            </Text>
          )}
        </Text>
      </Box>

      <Group gap="xs" align="flex-start" wrap="nowrap" style={{ position: "relative" }}>
        <Transition mounted={showTagFilter} transition="slide-left" duration={160} timingFunction="ease">
          {(styles) => (
            <Box
              style={{
                ...styles,
                position: "absolute",
                right: "100%",
                top: -6,
                marginRight: 10,
                minWidth: 180,
              }}
            >
              <MultiSelect
                size="xs"
                label="Tags"
                placeholder={tags.length ? "Filter tags" : "No tags"}
                data={tags}
                value={tagValue}
                onChange={onTagsChange}
                searchable
                clearable
                maxDropdownHeight={160}
                classNames={{ input: "glassy-input", label: "glassy-label" }}
              />
            </Box>
          )}
        </Transition>

        <Tooltip label="Toggle tag filter">
          <ActionIcon
            size="md"
            radius="xl"
            variant="light"
            onClick={toggleTagFilter}
            style={{
              background: showTagFilter ? "rgba(255,0,0,0.45)" : "rgba(255,0,0,0.2)",
              border: "1px solid rgba(255,100,100,0.5)",
              backdropFilter: "blur(6px)",
              color: "white",
              transition: "0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.45)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = showTagFilter
                ? "rgba(255,0,0,0.45)"
                : "rgba(255,0,0,0.2)";
              e.currentTarget.style.color = "white";
            }}
          >
            <IconFilter size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Import markdown">
          <ActionIcon
            size="md"
            radius="xl"
            variant="light"
            onClick={onImport}
            style={{
              background: "rgba(255,0,0,0.2)",
              border: "1px solid rgba(255,100,100,0.5)",
              backdropFilter: "blur(6px)",
              color: "rgba(255,200,200,0.9)",
              transition: "0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.4)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.2)";
              e.currentTarget.style.color = "rgba(255,200,200,0.9)";
            }}
          >
            <IconFileImport size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Refresh">
          <ActionIcon
            size="md"
            radius="xl"
            variant="light"
            onClick={onReload}
            style={{
              background: "rgba(255,0,0,0.25)",
              border: "1px solid rgba(255,100,100,0.5)",
              backdropFilter: "blur(6px)",
              color: "rgba(255,200,200,0.9)",
              transition: "0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.45)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.25)";
              e.currentTarget.style.color = "rgba(255,200,200,0.9)";
            }}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Add note">
          <ActionIcon
            size="md"
            radius="xl"
            variant="light"
            onClick={onAdd}
            style={{
              background: "rgba(255,0,0,0.35)",
              border: "1px solid rgba(255,100,100,0.6)",
              backdropFilter: "blur(6px)",
              color: "white",
              boxShadow: "0 0 6px rgba(255,60,60,0.6)",
              transition: "0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.55)";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(255,80,80,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.35)";
              e.currentTarget.style.boxShadow = "0 0 6px rgba(255,60,60,0.6)";
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
