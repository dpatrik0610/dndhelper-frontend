import { Group, Paper, Stack, Text, ThemeIcon, Badge } from "@mantine/core";
import { IconMapPin, IconClock } from "@tabler/icons-react";

interface Props {
  scheduled: string;
  location?: string | null;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
  panelBg: string;
}

export function SessionFooter({ scheduled, location, palette, panelBg }: Props) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{ background: panelBg, borderColor: palette.border }}
    >
      <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
        <Group gap="sm" align="center">
          <ThemeIcon variant="light" color="cyan" radius="md">
            <IconClock size={14} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="xs" c={palette.textDim} tt="uppercase" fw={700}>
              Scheduled
            </Text>
            <Text fw={700} c={palette.textMain}>
              {scheduled}
            </Text>
          </Stack>
        </Group>
        <Group gap="sm" align="center">
          <ThemeIcon variant="light" color="violet" radius="md">
            <IconMapPin size={14} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text size="xs" c={palette.textDim} tt="uppercase" fw={700}>
              Location
            </Text>
            <Text fw={700} c={palette.textMain}>
              {location || "Not set"}
            </Text>
          </Stack>
        </Group>
        <Badge variant="dot" color="indigo" size="sm">
          Session overview
        </Badge>
      </Group>
    </Paper>
  );
}
