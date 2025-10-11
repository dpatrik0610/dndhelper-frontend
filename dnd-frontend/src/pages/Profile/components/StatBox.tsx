import { Paper, Group, Text } from "@mantine/core";
import type { ReactNode, CSSProperties } from "react";

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  background?: "transparent" | "solid" | "gradient" | "dark";
  children?: ReactNode;
  style?: CSSProperties;
  hoverEffect?: boolean; // 👈 new prop
}

export function StatBox({
  label,
  value,
  color = "blue",
  icon,
  size = "md",
  background = "transparent",
  children,
  style,
  hoverEffect = true,
}: StatBoxProps) {
  const sizeMap = {
    xs: { padding: "xs", labelSize: "xs", valueSize: "sm", gap: "xs" },
    sm: { padding: "sm", labelSize: "sm", valueSize: "md", gap: "xs" },
    md: { padding: "md", labelSize: "sm", valueSize: "xl", gap: "sm" },
    lg: { padding: "lg", labelSize: "md", valueSize: "2xl", gap: "md" },
    xl: { padding: "xl", labelSize: "lg", valueSize: "3xl", gap: "md" },
  } as const;

  const s = sizeMap[size];

  const backgroundMap: Record<typeof background, React.CSSProperties> = {
    transparent: { backgroundColor: "rgba(0,0,0,0.02)" },
    solid: { backgroundColor: `var(--mantine-color-${color}-1)` },
    gradient: {
      background: `linear-gradient(135deg, var(--mantine-color-${color}-2), rgba(255,255,255,0.1))`,
    },
    dark: { backgroundColor: "rgba(0,0,0,0.2)" },
  };

  return (
    <Paper
      p={s.padding}
      withBorder
      style={{
        textAlign: "center",
        minWidth: "90px",
        transition: "all 0.2s ease",
        transformOrigin: "center",
        ...backgroundMap[background],
        ...(hoverEffect
          ? {
              cursor: "pointer",
            }
          : {}),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!hoverEffect) return;
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = `0 0 5px var(--mantine-color-${color}-5)`;
      }}
      onMouseLeave={(e) => {
        if (!hoverEffect) return;
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Group gap={s.gap} justify="center" mb="xs">
        {icon}
        <Text
          size={s.labelSize}
          c={background === "dark" ? "gray.1" : "dimmed"}
          fw={600}
          tt="uppercase"
        >
          {label}
        </Text>
      </Group>

      <Text size={s.valueSize} fw={700} c={color}>
        {value}
      </Text>

      {children && <div style={{ marginTop: "0.5rem" }}>{children}</div>}
    </Paper>
  );
}
