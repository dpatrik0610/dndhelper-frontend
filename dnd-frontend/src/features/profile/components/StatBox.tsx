import { Paper, Group, Text } from "@mantine/core";
import type { ReactNode, CSSProperties, MouseEventHandler } from "react";
import styles from "@features/profile/styles/StatBox.module.css";
type BackgroundType = "transparent" | "solid" | "gradient" | "dark";
type VariantType = "default" | "glass" | "glow" | "bordered" | "elevated" | "arcane" | "holographic" | "infernal" | "neon" | "sunset" | "electric" | "frost" | "velvet" | "prism" | "galaxy" | "monolith";

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
  labelColor?: string;
  labelGradient?: { from: string; to: string; deg?: number };
  icon?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  background?: BackgroundType;
  variant?: VariantType;
  children?: ReactNode;
  style?: CSSProperties;
  hoverEffect?: boolean;
  fullWidth?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function StatBox({
  label,
  value,
  color = "blue",
  labelColor,
  labelGradient,
  icon,
  size = "md",
  background = "transparent",
  variant = "default",
  children,
  style,
  hoverEffect = true,
  fullWidth = false,
  onClick,
}: StatBoxProps) {
  // Sizes
  const sizeMap = {
    xs: { padding: "xs", labelSize: "xs", valueSize: "sm", gap: "xs" },
    sm: { padding: "sm", labelSize: "sm", valueSize: "md", gap: "xs" },
    md: { padding: "md", labelSize: "sm", valueSize: "xl", gap: "sm" },
    lg: { padding: "lg", labelSize: "md", valueSize: "2xl", gap: "md" },
    xl: { padding: "xl", labelSize: "lg", valueSize: "3xl", gap: "md" },
  } as const;

  const s = sizeMap[size];

  // Base backgrounds
  const backgroundMap: Record<BackgroundType, React.CSSProperties> = {
    transparent: { backgroundColor: "rgba(255,255,255,0.02)" },
    solid: { backgroundColor: `var(--mantine-color-${color}-1)` },
    gradient: {
      background: `linear-gradient(135deg, var(--mantine-color-${color}-3), rgba(255,255,255,0.1))`,
    },
    dark: { backgroundColor: "rgba(0,0,0,0.25)" },
  };

  // Visual variants ✨
  const variantMap: Record<VariantType, React.CSSProperties> = {
    // 🧱 Minimal
    default: {
      border: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(255,255,255,0.02)",
    },

    // ❄️ Frosted glass look
    glass: {
      backdropFilter: "blur(8px) saturate(140%)",
      WebkitBackdropFilter: "blur(8px) saturate(140%)",
      border: "1px solid rgba(255,255,255,0.15)",
      background: "rgba(255,255,255,0.05)",
      boxShadow: "inset 0 0 8px rgba(255,255,255,0.06)",
    },

    // 💫 Magical glow aura
    glow: {
      border: `1px solid var(--mantine-color-${color}-5)`,
      boxShadow: `
        0 0 12px var(--mantine-color-${color}-4),
        0 0 24px rgba(255,255,255,0.05) inset`,
      background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), rgba(0,0,0,0.1))`,
    },

    // 🧿 Arcane, glowing outline, fits spells and magic UI
    arcane: {
      border: `1px solid var(--mantine-color-${color}-4)`,
      background: `linear-gradient(145deg, rgba(40,0,60,0.5), rgba(10,0,30,0.7))`,
      boxShadow: `
        0 0 6px var(--mantine-color-${color}-5),
        inset 0 0 12px rgba(255,255,255,0.08)`,
      textShadow: "0 0 6px rgba(255,255,255,0.2)",
    },

    // 🧰 Bordered metallic style
    bordered: {
      border: `2px solid var(--mantine-color-${color}-5)`,
      boxShadow: "inset 0 0 6px rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.03)",
    },

    // ⚔️ Elevated, card-like with shadow
    elevated: {
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
      background: "rgba(255,255,255,0.03)",
    },

    // 🔮 Holographic gradient shimmer
    holographic: {
      border: "1px solid rgba(255,255,255,0.25)",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(200,200,255,0.05))",
      boxShadow:
        "0 0 8px rgba(255,255,255,0.1), inset 0 0 8px rgba(255,255,255,0.08)",
      backdropFilter: "blur(6px)",
      animation: "pulseGlow 6s ease-in-out infinite alternate",
    },

    // 🩸 Infernal (dark red fiery energy, for enemies or curses)
    infernal: {
      border: `1px solid var(--mantine-color-${color}-6)`,
      background: `linear-gradient(160deg, rgba(70,0,0,0.6), rgba(20,0,0,0.8))`,
      boxShadow: `
        0 0 6px var(--mantine-color-${color}-6),
        inset 0 0 12px rgba(255,0,0,0.15)`,
    },
      // 🌈 Neon cyberpunk glow (dynamic edge light)
    neon: {
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(20, 10, 30, 0.65)",
      boxShadow: `
        0 0 6px rgba(0,255,255,0.4),
        inset 0 0 8px rgba(255,0,255,0.25)`,
      animation: "neonPulse 3s ease-in-out infinite alternate",
    },

    // 🌅 Sunset gradient fade (warm and soft)
    sunset: {
      background:
        "linear-gradient(135deg, rgba(255, 167, 81, 0.25), rgba(255, 80, 120, 0.25))",
      border: "1px solid rgba(255, 180, 130, 0.4)",
      boxShadow: "0 0 12px rgba(255, 180, 130, 0.2)",
    },

    // ⚡ Electric pulse (pulsating energy field)
    electric: {
      background: "radial-gradient(circle at 50% 50%, #1a1a1a 20%, #0d0d0d 100%)",
      border: "1px solid rgba(0,255,255,0.3)",
      boxShadow: "0 0 6px rgba(0,255,255,0.4)",
      animation: "electricPulse 2s ease-in-out infinite",
    },

    // 🧊 Crystal frost (icy cold sheen)
    frost: {
      border: "1px solid rgba(180,220,255,0.4)",
      background:
        "linear-gradient(145deg, rgba(180,220,255,0.12), rgba(100,150,255,0.08))",
      boxShadow:
        "0 0 8px rgba(200,220,255,0.3), inset 0 0 8px rgba(255,255,255,0.05)",
      backdropFilter: "blur(8px)",
    },

    // 💜 Velvet (deep rich feel with glowing edges)
    velvet: {
      background: "linear-gradient(135deg, #200020, #300030)",
      border: "1px solid rgba(255, 140, 255, 0.4)",
      boxShadow:
        "inset 0 0 10px rgba(255, 200, 255, 0.08), 0 0 12px rgba(100, 0, 100, 0.4)",
    },

    // 🔷 Prism glass (rotating shimmer)
    prism: {
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.15))",
      border: "1px solid rgba(255,255,255,0.15)",
      backdropFilter: "blur(6px) saturate(150%)",
      boxShadow: "0 0 10px rgba(255,255,255,0.1)",
      animation: "prismShift 5s linear infinite",
    },

    // 🌠 Galaxy (deep space gradient with stars)
    galaxy: {
      background:
        "radial-gradient(circle at 20% 30%, rgba(80,0,130,0.5), transparent 60%), radial-gradient(circle at 80% 70%, rgba(0,60,130,0.4), transparent 60%)",
      border: "1px solid rgba(200,150,255,0.4)",
      boxShadow:
        "0 0 8px rgba(150,100,255,0.3), inset 0 0 6px rgba(255,255,255,0.1)",
    },

    // 💀 Monolith (ultra-dark with pulsing inner core)
    monolith: {
      background: "radial-gradient(circle, #000, #060606)",
      border: "1px solid rgba(255,255,255,0.05)",
      boxShadow: "inset 0 0 8px rgba(255,255,255,0.05)",
      animation: "monolithPulse 4s ease-in-out infinite",
    },
  };


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
        transition: "all 0.25s ease",
        transformOrigin: "center",
        ...(hoverEffect ? { cursor: "pointer" } : {}),
        ...backgroundMap[background],
        ...variantMap[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!hoverEffect) return;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 0 8px var(--mantine-color-${color}-5)`;
      }}
      onMouseLeave={(e) => {
        if (!hoverEffect) return;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          variant === "glow"
            ? `0 0 12px var(--mantine-color-${color}-4)`
            : variantMap[variant].boxShadow || "none";
      }}
    >
      <Group gap={s.gap} justify="center" mb="xs">
        {icon}
        <Text
          size={s.labelSize}
          fw={600}
          tt="uppercase"
          style={
            labelGradient
              ? {
                  background: `linear-gradient(${labelGradient.deg ?? 135}deg, ${labelGradient.from}, ${labelGradient.to})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }
              : {}
          }
          c={
            !labelGradient
              ? labelColor ?? (background === "dark" ? "gray.1" : "dimmed")
              : undefined
          }
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

