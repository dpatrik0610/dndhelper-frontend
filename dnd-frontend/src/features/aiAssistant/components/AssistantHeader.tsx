import { Box, Button, Group, Select, Title } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconRefresh } from "@tabler/icons-react";

export function AssistantHeader({ controller }: any) {
  const {
    config,
    resolvedModelId,
    setActiveModelId,
    isMobile,
    clear,
    settingsOpen,
    setSettingsOpen,
    activeTopic,
  } = controller;

  return (
    <Group justify="space-between">
      <Box>
        <Title order={2}>AI Assistant</Title>
      </Box>

      <Group>
        <Button
          variant="light"
          onClick={() => setSettingsOpen((c: boolean) => !c)}
          rightSection={settingsOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        >
          Assistant Settings
        </Button>

        <Select
          data={config.models.map((m: any) => ({ value: m.id, label: m.label }))}
          value={resolvedModelId}
          onChange={(v) => v && setActiveModelId(v)}
          w={isMobile ? 180 : 240}
          size="sm"
        />

        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={clear}
          disabled={!activeTopic}
        >
          Clear
        </Button>
      </Group>
    </Group>
  );
}