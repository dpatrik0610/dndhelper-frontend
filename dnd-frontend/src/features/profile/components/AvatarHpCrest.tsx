import { Box, Avatar, ThemeIcon } from "@mantine/core";
import { IconAward } from "@tabler/icons-react";
import { useIsMobile } from "@hooks/useIsMobile";

interface AvatarHpCrestProps {
  character: any;
  isMobile: boolean;
}

export function AvatarHpCrest({ character, isMobile }: AvatarHpCrestProps) {
  const size = isMobile ? 110 : 140;
  const strokeWidth = isMobile ? 5 : 7;
  const avatarSize = size - strokeWidth * 2 - (isMobile ? 6 : 8);

  const current = character.hitPoints ?? 0;
  const max = character.maxHitPoints ?? 100;
  const temp = Math.max(0, character.temporaryHitPoints ?? 0);
  const maxHp = Math.max(1, max);

  const hpPercent = Math.min(100, Math.max(0, (current / maxHp) * 100));
  const tempPercent = Math.min(100, Math.max(0, (temp / maxHp) * 100));

  const isDead = current <= 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const hpOffset = circumference - (hpPercent / 100) * circumference;
  const tempOffset = circumference - (tempPercent / 100) * circumference;

  // Add margin for shadow glow (12px on all sides) to prevent clipping
  const glowMargin = 12;
  const canvasSize = size + glowMargin * 2;
  const centerCoord = canvasSize / 2;

  // Dynamic color stops and drop-shadows based on health thresholds (80%, 50%, 25%, 0%)
  let stop0 = "#dc2626";
  let stop50 = "#ef4444";
  let stop100 = "#f87171";
  let glowColor = "rgba(239, 68, 68, 0.65)";

  if (isDead) {
    stop0 = "#374151";
    stop50 = "#4b5563";
    stop100 = "#6b7280";
    glowColor = "none";
  } else if (hpPercent >= 80) {
    // Healthy/Emerald Green
    stop0 = "#047857";
    stop50 = "#10b981";
    stop100 = "#34d399";
    glowColor = "rgba(16, 185, 129, 0.65)";
  } else if (hpPercent >= 50) {
    // Caution/Gold Amber
    stop0 = "#d97706";
    stop50 = "#f59e0b";
    stop100 = "#fbbf24";
    glowColor = "rgba(245, 158, 11, 0.65)";
  } else if (hpPercent >= 25) {
    // Danger/Orange
    stop0 = "#ea580c";
    stop50 = "#f97316";
    stop100 = "#fdba74";
    glowColor = "rgba(249, 115, 22, 0.65)";
  } else {
    // Critical Danger/Crimson Red (<25%)
    stop0 = "#b91c1c";
    stop50 = "#dc2626";
    stop100 = "#f87171";
    glowColor = "rgba(239, 68, 68, 0.75)";
  }

  return (
    <Box
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        margin: isMobile ? "0 auto" : 0,
      }}
    >
      {/* 1. Concentric SVG HP Rings (Enlarged canvas to accommodate drop-shadow blur without clipping) */}
      <svg
        width={canvasSize}
        height={canvasSize}
        style={{
          position: "absolute",
          transform: "rotate(-90deg)", // Flows clockwise from top center
          top: -glowMargin,
          left: -glowMargin,
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Dynamic health threshold gradient */}
          <linearGradient id="hpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={stop0} />
            <stop offset="50%" stopColor={stop50} />
            <stop offset="100%" stopColor={stop100} />
          </linearGradient>
          {/* Temporary HP Golden gradient */}
          <linearGradient id="tempGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* Empty backing track (frosted glass feel) */}
        <circle
          cx={centerCoord}
          cy={centerCoord}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.45)"
          strokeWidth={strokeWidth}
        />

        {/* Standard HP Fill (Dynamic color threshold) */}
        {!isDead && (
          <circle
            cx={centerCoord}
            cy={centerCoord}
            r={radius}
            fill="none"
            stroke="url(#hpGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={hpOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              filter: glowColor !== "none" ? `drop-shadow(0 0 6px ${glowColor})` : "none",
            }}
          />
        )}

        {/* Temporary HP Fill (Gold) */}
        {temp > 0 && (
          <circle
            cx={centerCoord}
            cy={centerCoord}
            r={radius}
            fill="none"
            stroke="url(#tempGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={tempOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              filter: "drop-shadow(0 0 6px rgba(245, 158, 11, 0.65))",
            }}
          />
        )}
      </svg>

      {/* 2. Nesting Avatar in dead center of the ring */}
      <Box
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0,0,0,0.35)",
          background: "var(--theme-bg-card, rgba(255, 255, 255, 0.02))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {character.imageUrl ? (
          <Avatar
            src={character.imageUrl}
            size={avatarSize}
            radius="100%"
            style={{
              border: "none",
              boxShadow: "none",
              background: "transparent",
            }}
          />
        ) : (
          <ThemeIcon
            size={avatarSize}
            radius="100%"
            style={{
              background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
              border: "none",
              boxShadow: "none",
              color: "#121214",
            }}
          >
            <IconAward size={isMobile ? 32 : 44} />
          </ThemeIcon>
        )}
      </Box>
    </Box>
  );
}
