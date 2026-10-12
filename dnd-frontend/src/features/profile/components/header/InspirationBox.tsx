import { Box, Group, Text } from "@mantine/core";
import { useRef, type CSSProperties, type MouseEvent } from "react";
import { useReduceMotion } from "@hooks/useReduceMotion";
import fun from "./HeaderFun.module.css";

/** Burns while inspiration is held. Clicking it makes it flare; it never spends the inspiration. */
function InspirationFlame() {
  const ref = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReduceMotion();

  const flare = (e: MouseEvent) => {
    e.stopPropagation();
    if (reduceMotion) return;
    ref.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.7) translateY(-3px)", offset: 0.25 },
        { transform: "scale(0.9)", offset: 0.7 },
        { transform: "scale(1)" },
      ],
      { duration: 700, easing: "ease-out" }
    );
  };

  return (
    <button ref={ref} type="button" className={fun.flame} onClick={flare} aria-label="Stoke the flame">
      <svg viewBox="0 0 20 26" width={16} height={22} aria-hidden>
        <path
          d="M10 1C11 6 17 9 17 16a7 7 0 0 1-14 0c0-4 2-6 3-8 .5 2.5 1.5 3.5 2.5 4C8 9 8 5 10 1Z"
          fill="currentColor"
        />
        <path
          className={fun.flameCore}
          d="M10 12c.6 2.4 3.5 3.4 3.5 6.5a3.5 3.5 0 0 1-7 0c0-2 1.5-3 2-4.5.6 1 1 1.4 1.5 1.6C10 14.5 9.6 13.4 10 12Z"
          fill="#fff7d6"
          fillOpacity={0.9}
        />
      </svg>
    </button>
  );
}

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
      className={fun.inspiration}
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
        border: hasInspiration
          ? "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.25))"
          : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        padding: "8px 16px",
        borderRadius: "12px",
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
      {hasInspiration && <InspirationFlame />}
      <Text
        size="xs"
        style={{
          color: hasInspiration
            ? "var(--theme-color-accent-primary, #f59e0b)"
            : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          fontSize: "14px",
          transition: "color 0.25s ease",
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
