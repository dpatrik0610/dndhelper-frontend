import { Badge, Button, Group, MultiSelect, Stack, Title } from "@mantine/core";
import { IconFileImport, IconPlus, IconRefresh, IconWand } from "@tabler/icons-react";
import { magicGlowTheme } from "@styles/magic/glowTheme";

interface NotesHeaderProps {
  loading: boolean;
  onReload: () => void;
  onAdd: () => void;
  onImport: () => void;
  isMobile: boolean;
  summary: {
    total: number;
    favorites: number;
    tags: number;
  };
}

export function NotesHeader({
  loading,
  onReload,
  onAdd,
  onImport,
  isMobile,
  summary,
}: NotesHeaderProps) {
  const buttonSize = isMobile ? "xs" : "sm";

  return (
    <Stack gap="xs">
      <Group justify="space-between" align={isMobile ? "flex-start" : "center"} gap="sm" wrap="wrap">
        <Stack gap={4}>
          <Group gap="xs">
            <IconWand size={18} color={magicGlowTheme.palette.primary} />
            <Title order={3}>Notes</Title>
          </Group>
          <Group gap={6} wrap="wrap">
            <Badge color="violet" variant="light">
              Total: {summary.total}
            </Badge>
            <Badge color="yellow" variant="light">
              Favorites: {summary.favorites}
            </Badge>
            <Badge color="cyan" variant="light">
              Tags: {summary.tags}
            </Badge>
          </Group>
        </Stack>

        <Stack gap={isMobile ? 8 : "xs"} w={isMobile ? "100%" : "auto"}>
          <Group gap="xs" justify={isMobile ? "flex-start" : "flex-end"} w={isMobile ? "100%" : "auto"}>
            <Button
              size={buttonSize}
              radius="md"
              variant="gradient"
              gradient={{ from: "#c084fc", to: "#60a5fa" }}
              leftSection={<IconPlus size={16} />}
              fullWidth={isMobile}
              onClick={onAdd}
            >
              Add note
            </Button>
            <Button
              size={buttonSize}
              radius="md"
              variant="light"
              color="grape"
              leftSection={<IconFileImport size={16} />}
              fullWidth={isMobile}
              onClick={onImport}
            >
              Import
            </Button>
            <Button
              size={buttonSize}
              radius="md"
              variant="light"
              color="blue"
              leftSection={<IconRefresh size={16} />}
              fullWidth={isMobile}
              loading={loading}
              onClick={onReload}
            >
              Refresh
            </Button>
          </Group>
        </Stack>
      </Group>
    </Stack>
  );
}

interface MultiTagSelectProps {
  tags: string[];
  value: string[];
  onChange: (value: string[]) => void;
  hidden?: boolean;
}

export function MultiTagSelect({ tags, value, onChange, hidden = false }: MultiTagSelectProps) {
  if (hidden) return null;

  return (
    <MultiSelect
      size="sm"
      placeholder={tags.length ? "Filter tags" : "No tags yet"}
      data={tags}
      value={value}
      onChange={onChange}
      searchable
      clearable
      maxDropdownHeight={200}
      styles={{
        input: {
          background: "rgba(30, 26, 60, 0.78)",
          boxShadow: magicGlowTheme.card.boxShadow,
          backdropFilter: magicGlowTheme.card.backdropFilter,
          borderRadius: 10,
          color: magicGlowTheme.text.color,
          borderColor: magicGlowTheme.palette.border,
          borderWidth: 1,
          borderStyle: "solid",
        },
        dropdown: { background: "rgba(18,16,32,0.96)", borderColor: magicGlowTheme.palette.border },
        option: { color: "#f3f0ff" },
      }}
    />
  );
}
