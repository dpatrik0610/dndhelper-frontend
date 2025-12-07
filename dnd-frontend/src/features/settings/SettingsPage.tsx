import { Paper, Stack, Text, Title, Button, Group } from "@mantine/core";
import { useUiStore } from "@store/useUiStore";

export default function SettingsPage() {
  const sidebarTheme = useUiStore((s) => s.sidebarTheme);
  const setSidebarTheme = useUiStore((s) => s.setSidebarTheme);

  return (
    <Stack p="md" gap="md">
      <Title order={2}>Settings</Title>
      <Paper p="md" withBorder radius="md">
        <Stack gap="sm">
          <Text fw={600}>Sidebar Theme</Text>
          <Group gap="xs">
            <Button size="xs" variant={sidebarTheme === "midnight" ? "filled" : "light"} onClick={() => setSidebarTheme("midnight")}>
              Midnight
            </Button>
            <Button size="xs" variant={sidebarTheme === "emerald" ? "filled" : "light"} onClick={() => setSidebarTheme("emerald")}>
              Emerald
            </Button>
            <Button size="xs" variant={sidebarTheme === "sunset" ? "filled" : "light"} onClick={() => setSidebarTheme("sunset")}>
              Sunset
            </Button>
          </Group>
          <Text c="dimmed" size="sm">Theme selection is shared and will persist locally.</Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
