import { Paper, Group, Text } from "@mantine/core";
import type { ReactNode, CSSProperties, MouseEventHandler } from "react";
import styles from "@features/profile/styles/StatBox.module.css";

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
  labelColor?: string;
  labelGradient?: { from: string; to: string; deg?: number };
  icon?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  background?: string;
  variant?: string;
  children?: ReactNode;
  style?: CSSProperties;
  hoverEffect?: boolean;
  fullWidth?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function StatBox({
  label,
  value,
  color,
  labelColor,
  labelGradient,
  icon,
  size = "md",
  children,
  style,
  hoverEffect = true,
  fullWidth = false,
  onClick,
}: StatBoxProps) {
  const sizeMap = {
    xs: { padding: "xs", labelSize: "xs", valueSize: "sm", gap: "xs" },
    sm: { padding: "sm", labelSize: "sm", valueSize: "md", gap: "xs" },
    md: { padding: "md", labelSize: "sm", valueSize: "xl", gap: "sm" },
    lg: { padding: "lg", labelSize: "md", valueSize: "2xl", gap: "md" },
    xl: { padding: "xl", labelSize: "lg", valueSize: "3xl", gap: "md" },
  } as const;

  const s = sizeMap[size];

  const resolvedValueColor = color && color !== "white" && color !== "blue" && color !== "gray" && color !== "teal" && color !== "orange" && color !== "green" && color !== "grape"
    ? color
    : "var(--theme-color-accent-primary, #f59e0b)";

  return (
    <Paper
      className={styles.statBox}
      onClick={onClick}
      w={fullWidth ? "100%" : undefined}
      maw={fullWidth ? "100%" : undefined}
      miw={fullWidth ? undefined : "100px"}
      mih="72px"
      p={s.padding}
      withBorder
      style={{
        textAlign: "center",
        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transformOrigin: "center",
        cursor: onClick || hoverEffect ? "pointer" : "default",
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!hoverEffect && !onClick) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)";
      }}
      onMouseLeave={(e) => {
        if (!hoverEffect && !onClick) return;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
      }}
    >
      <Group gap={s.gap} justify="center" mb="xs">
        {icon && <span style={{ color: "var(--theme-color-accent-secondary, rgba(255,255,255,0.7))", display: "flex", alignItems: "center" }}>{icon}</span>}
        <Text
          size={s.labelSize}
          fw={800}
          tt="uppercase"
          style={
            labelGradient
              ? {
                  background: `linear-gradient(${labelGradient.deg ?? 135}deg, ${labelGradient.from}, ${labelGradient.to})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "0.5px",
                }
              : {
                  letterSpacing: "0.5px",
                  color: labelColor ?? "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                }
          }
        >
          {label}
        </Text>
      </Group>

      <Text
        size={s.valueSize}
        fw={900}
        style={{
          color: resolvedValueColor,
          textShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {value}
      </Text>

      {children && <div style={{ marginTop: "0.5rem" }}>{children}</div>}
    </Paper>
  );
}
