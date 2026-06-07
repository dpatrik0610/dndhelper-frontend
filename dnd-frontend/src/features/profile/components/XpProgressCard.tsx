import { Box, Group, Progress, Text, ThemeIcon, Stack } from "@mantine/core";
import { getExperienceProgress } from "@utils/experienceTable";
import type { CSSProperties } from "react";

interface Props {
  experience: number;
  containerStyle?: CSSProperties;
}

export function XpProgressCard({ experience, containerStyle }: Props) {
  const expProgress = getExperienceProgress(experience);
  const hasNext = !!expProgress.next;

  const xpToNextText = hasNext
    ? `${expProgress.remaining.toLocaleString()} XP to Level ${expProgress.next!.level}`
    : "Maximum Level Reached";

  return (
    <Box
      style={{
        width: "100%",
        background: "linear-gradient(135deg, rgba(30,20,40,0.6), rgba(20,10,30,0.8))",
        border: "1px solid rgba(255, 180, 80, 0.2)",
        borderRadius: 12,
        padding: "16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        ...containerStyle,
      }}
    >
      <Group wrap="nowrap" gap="md" align="center">
        {/* Prominent Level Indicator */}
        <ThemeIcon
          size={64}
          radius="md"
          variant="gradient"
          gradient={{ from: "orange", to: "red", deg: 135 }}
          style={{
            boxShadow: "0 0 15px rgba(255, 100, 50, 0.4)",
            border: "2px solid rgba(255,255,255,0.2)",
            flexShrink: 0,
          }}
        >
          <Stack gap={0} align="center" justify="center" h="100%">
            <Text size="xs" fw={800} style={{ fontSize: "10px", opacity: 0.9, lineHeight: 1, marginTop: 4 }}>
              LEVEL
            </Text>
            <Text fw={900} style={{ fontSize: "32px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              {expProgress.current.level}
            </Text>
          </Stack>
        </ThemeIcon>

        {/* Progress and Details */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" mb={8} align="flex-end" wrap="wrap" gap="xs">
            {/* Left side texts */}
            <Stack gap={2} style={{ flex: "1 1 auto", minWidth: "40%" }}>
              <Text size="sm" fw={800} c="#ffe38f" tt="uppercase" lts={1} truncate>
                Experience
              </Text>
              <Text size="xs" c="dimmed" fw={600} truncate>
                {experience.toLocaleString()} / {hasNext ? expProgress.next!.experience.toLocaleString() : "Max"} XP
              </Text>
            </Stack>

            {/* Right side texts */}
            <Stack gap={2} style={{ flex: "1 1 auto", minWidth: "40%", alignItems: "flex-end" }}>
              <Text size="sm" fw={700} c="white" truncate style={{ maxWidth: "100%" }}>
                {xpToNextText}
              </Text>
            </Stack>
          </Group>

          <Progress
            value={expProgress.progressPercent}
            color="orange"
            size="lg"
            radius="xl"
            striped
            animated
            style={{
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5), 0 0 8px rgba(255,165,0,0.3)",
              backgroundColor: "rgba(0,0,0,0.4)"
            }}
            styles={{ section: { transition: "width 250ms ease" } }}
          />
        </Box>
      </Group>
    </Box>
  );
}
