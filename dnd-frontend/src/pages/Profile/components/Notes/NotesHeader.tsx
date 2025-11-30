import { ActionIcon, Group, Text } from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";

interface NotesHeaderProps {
  loading: boolean;
  onReload: () => void;
  onAdd: () => void;
}

export function NotesHeader({ loading, onReload, onAdd }: NotesHeaderProps) {
  return (
    <Group justify="space-between" mb="sm">
      <Text size="lg" fw={600} c="red.3">
        Personal Notes {loading && <Text span c="dimmed" size="sm"> (loading…)</Text>}
      </Text>

      <Group gap="xs">
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
      </Group>
    </Group>
  )
}