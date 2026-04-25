import { ActionIcon, Group, ScrollArea, Stack, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowsMove,
  IconBook2,
  IconLayersIntersect,
  IconPhoto,
  IconRulerMeasure,
  IconTargetArrow,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";

const tools = [
  { label: "Pan", icon: IconArrowsMove },
  { label: "Zoom in", icon: IconZoomIn },
  { label: "Zoom out", icon: IconZoomOut },
  { label: "Focus", icon: IconTargetArrow },
  { label: "Measure", icon: IconRulerMeasure },
  { label: "Layers", icon: IconLayersIntersect },
  { label: "Media", icon: IconPhoto },
  { label: "Notes", icon: IconBook2 },
] as const;

export function MapToolbar() {
  const isMobile = useMediaQuery("(max-width: 992px)");

  if (isMobile) {
    return (
      <ScrollArea type="never" w="100%">
        <Group gap="xs" wrap="nowrap" py={2}>
          {tools.map((tool) => (
            <ActionIcon
              key={tool.label}
              variant="light"
              size={44}
              radius="md"
              color="grape"
              aria-label={tool.label}
              style={{
                backdropFilter: "blur(8px)",
                background: "linear-gradient(145deg, rgba(143, 92, 255, 0.3), rgba(104, 63, 190, 0.2))",
                border: "1px solid rgba(177, 151, 252, 0.35)",
              }}
            >
              <tool.icon size={18} />
            </ActionIcon>
          ))}
        </Group>
      </ScrollArea>
    );
  }

  return (
    <Stack gap="xs" align="center">
      {tools.map((tool) => (
        <Tooltip key={tool.label} label={tool.label} withArrow position="right">
          <ActionIcon
            variant="light"
            size={40}
            radius="md"
            color="grape"
            aria-label={tool.label}
            style={{
              backdropFilter: "blur(8px)",
              background: "linear-gradient(145deg, rgba(143, 92, 255, 0.3), rgba(104, 63, 190, 0.2))",
              border: "1px solid rgba(177, 151, 252, 0.35)",
            }}
          >
            <tool.icon size={18} />
          </ActionIcon>
        </Tooltip>
      ))}
    </Stack>
  );
}
