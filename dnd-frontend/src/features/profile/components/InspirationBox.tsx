import { Box, Group, Text } from "@mantine/core";
import type { CSSProperties } from "react";

interface Props {
  value: number;
  onClick?: () => void;
  containerStyle?: CSSProperties;
}

export function InspirationBox({ value, onClick, containerStyle }: Props) {
  const capped = Math.max(0, Math.min(3, value ?? 0));
  const hasInspiration = capped > 0;

  return (
    <Group
      gap="md"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
        border: hasInspiration
          ? "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.25))"
          : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        padding: "8px 16px",
        borderRadius: "24px",
        boxShadow: hasInspiration
          ? "0 4px 20px rgba(0, 0, 0, 0.15), var(--theme-glow-shadow-primary)"
          : "0 4px 20px rgba(0, 0, 0, 0.15)",
        transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        userSelect: "none",
        ...containerStyle,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.25))";
          e.currentTarget.style.boxShadow = hasInspiration
            ? "0 6px 24px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)"
            : "0 6px 24px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = hasInspiration
            ? "var(--theme-border-glow, rgba(245, 158, 11, 0.25))"
            : "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
          e.currentTarget.style.boxShadow = hasInspiration
            ? "0 4px 20px rgba(0, 0, 0, 0.15), var(--theme-glow-shadow-primary)"
            : "0 4px 20px rgba(0, 0, 0, 0.15)";
        }
      }}
    >
      <Text
        size="xs"
        style={{
          color: hasInspiration
            ? "var(--theme-color-accent-primary, #f59e0b)"
            : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          fontSize: "11px",
          transition: "color 0.25s ease",
          textShadow: hasInspiration
            ? "0 0 8px rgba(245, 158, 11, 0.3)"
            : "none",
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
                transform: isActive ? "scale(1.15)" : "scale(1)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={18}
                height={18}
                style={{
                  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                  filter: isActive
                    ? "drop-shadow(0 0 3px var(--theme-color-accent-primary, #f59e0b)) drop-shadow(0 0 8px var(--theme-color-accent-primary, rgba(245, 158, 11, 0.5)))"
                    : "none",
                }}
              >
                <path
                  d="M12 2L2 12l10 10 10-10L12 2z"
                  fill={isActive ? "var(--theme-color-accent-primary, #f59e0b)" : "rgba(0, 0, 0, 0.25)"}
                  stroke={isActive ? "var(--theme-color-accent-primary, #f59e0b)" : "rgba(255, 255, 255, 0.25)"}
                  strokeWidth={2.5}
                  style={{
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
