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
      gap="md"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        padding: "8px 16px",
        borderRadius: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        userSelect: "none",
        ...containerStyle,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
        }
      }}
    >
      <Text
        size="xs"
        style={{
          color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          fontSize: "11px",
        }}
      >
        Inspiration
      </Text>
      <Group gap={10}>
        {[0, 1, 2].map((i) => {
          const isActive = i < capped;
          return (
            <Box
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                transform: isActive ? "scale(1.1) rotate(0deg)" : "scale(1) rotate(0deg)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={18}
                height={18}
                style={{
                  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
              >
                <path
                  d="M12 2L2 12l10 10 10-10L12 2z"
                  fill={isActive ? "var(--theme-color-accent-primary, #f59e0b)" : "rgba(0, 0, 0, 0.25)"}
                  stroke={isActive ? "var(--theme-color-accent-primary, #f59e0b)" : "rgba(255, 255, 255, 0.2)"}
                  strokeWidth={2.2}
                  style={{
                    filter: isActive ? "drop-shadow(0 0 5px var(--theme-color-accent-primary))" : "none",
                    transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  }}
                />
              </svg>
            </Box>
          );
        })}
      </Group>
    </Group>
  );
}
