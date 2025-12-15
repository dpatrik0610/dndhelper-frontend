import { Box, Group, Progress, Text, Badge } from "@mantine/core";
import { getExperienceProgress } from "@utils/experienceTable";
import type { CSSProperties } from "react";

interface Props {
  experience: number;
  containerStyle?: CSSProperties;
}

export function XpProgressCard({ experience, containerStyle }: Props) {
  const expProgress = getExperienceProgress(experience);
  const xpToNextText = expProgress.next
    ? `${expProgress.remaining.toLocaleString()} XP to Level ${expProgress.next.level}`
    : "Max level reached";

  return (
    <Box
      style={{
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, rgba(255,180,80,0.2), rgba(255,120,80,0.25) 45%, rgba(60,20,80,0.4))",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 10,
        padding: "14px 14px 12px",
        boxShadow: "0 8px 18px rgba(0,0,0,0.35)",
        ...containerStyle,
      }}
    >
      <Group justify="space-between" gap="xs" align="center">
        <Text size="sm" fw={800} c="#ffe38f" tt="uppercase" lts={0.3}>
          XP Progress
        </Text>
        <Text size="xs" c="rgba(255,255,255,0.9)">
          {xpToNextText}
        </Text>

        <Group gap="xs" mt={8}>
          <Badge color="grape" variant="light" size="xs" radius="sm">
            Current: {experience.toLocaleString()} XP
          </Badge>
          <Badge color="orange" variant="filled" size="xs" radius="sm">
            Level {expProgress.current.level}
          </Badge>
        </Group>
      </Group>
      <Progress
        value={expProgress.progressPercent}
        color="orange"
        size="md"
        radius="sm"
        mt={10}
        styles={{ section: { transition: "width 160ms ease" } }}
      />
      <Group justify="space-between" mt={6}>
        <Text size="xs" c="rgba(255,255,255,0.85)" fw={600}>
          {expProgress.current.experience.toLocaleString()} XP
        </Text>
        <Text size="xs" c="rgba(255,255,255,0.85)" fw={600}>
          {expProgress.next ? `${expProgress.next.experience.toLocaleString()} XP` : "Level 20"}
        </Text>
      </Group>
    </Box>
  );
}
