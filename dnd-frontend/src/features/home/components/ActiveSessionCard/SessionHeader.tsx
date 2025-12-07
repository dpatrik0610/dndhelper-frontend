import { Badge, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarEvent, IconBolt, IconAlignLeft } from "@tabler/icons-react";
import type { Session } from "@appTypes/Session";
import ReactMarkdown from "react-markdown";

interface Props {
  session: Session;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
  formattedDate: string;
  description?: string | null;
  panelBg: string;
  themeAccent?: { gradientFrom: string; gradientTo: string };
}

export function SessionHeader({ session, palette, formattedDate, description, panelBg, themeAccent }: Props) {
  const accent = themeAccent ?? { gradientFrom: "violet", gradientTo: "grape" };
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        borderColor: palette.border,
        background: panelBg,
      }}
    >
      <Stack gap="xs" style={{ width: "100%" }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs" align="center">
            <ThemeIcon variant="gradient" gradient={{ from: accent.gradientFrom, to: accent.gradientTo }} radius="xl" size="lg">
              <IconBolt size={16} />
            </ThemeIcon>
            <Text size="xs" c={palette.textDim} tt="uppercase" fw={700} lts={0.5}>
              Current Session
            </Text>
          </Group>
          <Badge
            size="lg"
            radius="sm"
            variant="gradient"
            gradient={session.isLive ? { from: "teal", to: "lime" } : { from: "gray", to: "dark" }}
          >
            {session.isLive ? "Active" : "Scheduled"}
          </Badge>
        </Group>

        <Text fw={800} size="xl" c={palette.textMain} style={{ lineHeight: 1.1 }} truncate="end">
          {session.name}
        </Text>

        {description && (
          <Group gap={6} align="flex-start" wrap="nowrap">
            <ThemeIcon size={20} radius="xl" variant="light" color="cyan">
              <IconAlignLeft size={14} />
            </ThemeIcon>
            <div style={{ width: "100%" }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <Text size="xs" c={palette.textDim} style={{ margin: 0, lineHeight: 1.4 }}>
                      {children}
                    </Text>
                  ),
                  h1: ({ children }) => (
                    <Text size="sm" fw={700} c={palette.textDim} style={{ margin: 0 }}>
                      {children}
                    </Text>
                  ),
                  h2: ({ children }) => (
                    <Text size="xs" fw={700} c={palette.textDim} style={{ margin: 0 }}>
                      {children}
                    </Text>
                  ),
                  h3: ({ children }) => (
                    <Text size="xs" fw={600} c={palette.textDim} style={{ margin: 0 }}>
                      {children}
                    </Text>
                  ),
                  li: ({ children }) => (
                    <Text size="xs" c={palette.textDim} style={{ margin: 0, lineHeight: 1.3 }}>
                      • {children}
                    </Text>
                  ),
                }}
              >
                {description}
              </ReactMarkdown>
            </div>
          </Group>
        )}

        <Group gap={6} align="center">
          <ThemeIcon size={20} radius="xl" variant="light" color="cyan">
            <IconCalendarEvent size={14} />
          </ThemeIcon>
          <Text size="sm" c={palette.textDim}>
            {formattedDate}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
