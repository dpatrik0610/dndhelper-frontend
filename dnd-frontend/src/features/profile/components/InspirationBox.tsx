import { Box, Group, Text } from "@mantine/core";
import type { CSSProperties } from "react";

interface Props {
  value: number;
  onClick?: () => void;
  containerStyle?: CSSProperties;
}

export function InspirationBox({ value, onClick, containerStyle }: Props) {
  const capped = Math.max(0, Math.min(3, value ?? 0));

  return (
    <Group
      gap="sm"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "rgba(0,0,0,0.2)",
        padding: "6px 12px",
        borderRadius: 20,
        ...containerStyle,
      }}
    >
      <Text size="xs" c="dimmed" fw={800} tt="uppercase" lts={1.5}>
        Inspiration
      </Text>
      <Group gap={6}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: "2px",
              transform: "rotate(45deg)",
              background: i < capped ? "#8fffe0" : "rgba(255,255,255,0.1)",
              boxShadow: i < capped ? "0 0 8px rgba(143,255,224,0.6)" : "none",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </Group>
    </Group>
  );
}
