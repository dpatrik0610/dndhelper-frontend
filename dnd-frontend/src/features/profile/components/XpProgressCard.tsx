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
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        borderRadius: 16,
        padding: "16px",
        backdropFilter: "blur(16px) saturate(130%)",
        WebkitBackdropFilter: "blur(16px) saturate(130%)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        ...containerStyle,
      }}
    >
      <Group wrap="nowrap" gap="md" align="center">
        <ThemeIcon
          size={64}
          radius="md"
          style={{
            background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
            boxShadow: "var(--theme-glow-shadow-primary)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            flexShrink: 0,
          }}
        >
          <Stack gap={0} align="center" justify="center" h="100%">
            <Text size="xs" fw={850} style={{ fontSize: "10px", opacity: 0.9, lineHeight: 1, marginTop: 4, color: "#fff" }}>
              LEVEL
            </Text>
            <Text fw={900} style={{ fontSize: "30px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.4)", color: "#fff" }}>
              {expProgress.current.level}
            </Text>
          </Stack>
        </ThemeIcon>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" mb={8} align="flex-end" wrap="wrap" gap="xs">
            <Stack gap={2} style={{ flex: "1 1 auto", minWidth: "40%" }}>
              <Text size="sm" fw={800} style={{ color: "var(--theme-color-accent-secondary, #10b981)", textTransform: "uppercase", letterSpacing: "1px" }} truncate>
                Experience
              </Text>
              <Text size="xs" style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))", fontWeight: 600 }} truncate>
                {experience.toLocaleString()} / {hasNext ? expProgress.next!.experience.toLocaleString() : "Max"} XP
              </Text>
            </Stack>

            <Stack gap={2} style={{ flex: "1 1 auto", minWidth: "40%", alignItems: "flex-end" }}>
              <Text size="sm" fw={700} style={{ color: "var(--theme-color-text-primary, #fff)" }} truncate>
                {xpToNextText}
              </Text>
            </Stack>
          </Group>

          <Progress
            value={expProgress.progressPercent}
            size="lg"
            radius="xl"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.5)",
              overflow: "hidden"
            }}
            styles={{
              section: {
                background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
                boxShadow: "var(--theme-glow-shadow-primary)",
                transition: "width 250ms ease"
              }
            }}
          />
        </Box>
      </Group>
    </Box>
  );
}
