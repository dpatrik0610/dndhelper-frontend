import { ScrollArea, Stack, Paper, Group, Text, Loader } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import type { Event } from "../../../types/Event";

interface RecentEventsSectionProps {
  events: Event[];
  loading: boolean;
}

export function RecentEventsSection({ events, loading }: RecentEventsSectionProps) {
  // 🎨 Local color palette
  const palette = {
    accent: "#b197fc",
    border: "rgba(140, 120, 255, 0.3)",
    bg: "rgba(30, 30, 60, 0.4)",
    hoverBg: "rgba(180, 150, 255, 0.08)",
    itemBg: "rgba(255, 255, 255, 0.03)",
    textMain: "#f0f0ff",
    textDim: "rgba(220, 220, 255, 0.65)",
  };

  // 🧩 Shared style helpers
  const sectionStyle = {
    backdropFilter: "blur(6px)",
    backgroundColor: palette.bg,
    borderColor: palette.border,
  };

  const eventItemStyle = {
    backgroundColor: palette.itemBg,
    borderColor: palette.border,
    color: palette.textMain,
    transition: "transform 0.15s ease, background-color 0.15s ease",
    cursor: "pointer",
  } as const;

  const renderEventItem = (e: Event, idx: number) => (
    <Paper
      key={e.id || idx}
      radius="md"
      p="sm"
      withBorder
      style={eventItemStyle}
      onMouseEnter={(ev) =>
        (ev.currentTarget.style.backgroundColor = palette.hoverBg)
      }
      onMouseLeave={(ev) =>
        (ev.currentTarget.style.backgroundColor = palette.itemBg)
      }
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="xs">
          <IconStar size={14} color={palette.accent} />
            <Text fw={500} c={palette.textMain}>
              {e.type}
            </Text>
            <Text size="sm" c={palette.textDim} lineClamp={2}>
              {e.message}
            </Text>
        </Group>

        <Text size="xs" c={palette.textDim} style={{ whiteSpace: "nowrap" }}>
          {new Date(e.createdAt).toLocaleString()}
        </Text>
      </Group>
    </Paper>
  );

  return (
    <ExpandableSection
      title="Recent Events"
      color={SectionColor.Violet}
      icon={<IconStar size={18} color={palette.accent} />}
      defaultOpen
      transparent
      style={sectionStyle}
    >
      {loading ? (
        <Loader mt="sm" />
      ) : events.length > 0 ? (
        <ScrollArea h={250}>
          <Stack mt="sm" gap="xs">
            {events.slice(0, 8).map(renderEventItem)}
          </Stack>
        </ScrollArea>
      ) : (
        <Text mt="sm" c={palette.textDim}>
          No recent activity found.
        </Text>
      )}
    </ExpandableSection>
  );
}
