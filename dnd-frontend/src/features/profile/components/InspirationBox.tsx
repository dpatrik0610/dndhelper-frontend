import { Box, Group, Text } from "@mantine/core";
import type { CSSProperties } from "react";

interface Props {
  value: number;
  onClick?: () => void;
  containerStyle?: CSSProperties;
}

export function InspirationBox({ value, onClick, containerStyle }: Props) {
  const capped = Math.max(0, Math.min(3, value ?? 0));
  const barColor = (idx: number) => (idx < capped ? "#8fffe0" : "rgba(255,255,255,0.15)");

  return (
    <Box
      onClick={onClick}
      style={{
        height: "100%",
        padding: "8px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 120ms ease, box-shadow 120ms ease",
        ...containerStyle,
        textAlign: "center",
      }}
    >
      <Text size="xs" c="#8fffe0" fw={700} tt="uppercase" lts={1} mb={4}>
        Inspirations
      </Text>
      <Group gap={6} justify="space-between">
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            style={{
              flex: 1,
              height: 12,
              borderRadius: 5,
              background: barColor(i),
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: i < capped ? "0 0 10px rgba(143,255,224,0.6)" : "none",
            }}
          />
        ))}
      </Group>
    </Box>
  );
}
