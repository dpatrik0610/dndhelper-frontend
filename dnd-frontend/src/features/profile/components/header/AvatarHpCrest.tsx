import { Box, Avatar, ThemeIcon } from "@mantine/core";
import type { Character } from "@appTypes/Character/Character";
import { computeEffects } from "@utils/effects";
import { IconAward, IconDice5 } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useReduceMotion } from "@hooks/useReduceMotion";
import { showNotification } from "@components/Notification/Notification";
import styles from "./AvatarHpCrest.module.css";

const FLIP_MS = 1100;
const SHOW_ROLL_MS = 3500;
/** Three identical flips in a row earn a toast; nothing else is tracked. */
function streakMessage(last: number[]): { title: string; color: string } | null {
  if (last.length < 3 || last.some((r) => r !== last[0])) return null;
  if (last[0] === 20) return { title: "The dice favour you", color: "yellow" };
  if (last[0] === 1) return { title: "The dice have forsaken you", color: "red" };
  return { title: `Déjà vu… ${last[0]}, ${last[0]}, ${last[0]}`, color: "grape" };
}

/** Stacked discs between the faces give the coin a visible rim mid-spin. */
const EDGE_LAYERS = [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4];

/** Front view of a d20: [points, shade] per facet, lighter toward the upper right. */
const D20_FACETS: [string, number][] = [
  ["50,4 10.2,27 50,24", 0.1],
  ["50,4 89.8,27 50,24", 0.16],
  ["10.2,27 50,24 26,66", 0.07],
  ["89.8,27 50,24 74,66", 0.2],
  ["10.2,27 26,66 10.2,73", 0.04],
  ["89.8,27 74,66 89.8,73", 0.12],
  ["10.2,73 26,66 50,96", 0.05],
  ["89.8,73 74,66 50,96", 0.09],
  ["26,66 74,66 50,96", 0.13],
  ["50,24 74,66 26,66", 0.26],
];

function D20Face({ roll }: { roll: number }) {
  return (
    <svg viewBox="0 0 100 100" className={styles.d20} aria-hidden>
      {D20_FACETS.map(([points, shade]) => (
        <polygon key={points} points={points} fill="currentColor" fillOpacity={shade} />
      ))}
      <polygon
        points="50,4 89.8,27 89.8,73 50,96 10.2,73 10.2,27"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M50,24 L74,66 L26,66 Z M50,24 L10.2,27 M50,24 L50,4 M50,24 L89.8,27 M26,66 L10.2,27 M26,66 L10.2,73 M26,66 L50,96 M74,66 L89.8,27 M74,66 L89.8,73 M74,66 L50,96"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      {roll === 1 && (
        <path className={styles.crack} d="M44,30 L52,42 L46,50 L56,60 L50,70 L58,84" />
      )}
      <text x="50" y="53" className={styles.rollValue}>
        {roll}
      </text>
    </svg>
  );
}

interface AvatarHpCrestProps {
  character: Character | null;
  isMobile: boolean;
}

export function AvatarHpCrest({ character, isMobile }: AvatarHpCrestProps) {
  const size = isMobile ? 110 : 140;
  const strokeWidth = isMobile ? 5 : 7;
  const avatarSize = size - strokeWidth * 2 - (isMobile ? 6 : 8);

  // Flip token: a just-for-fun d20 on the back. Nothing is logged or saved.
  const flipperRef = useRef<HTMLDivElement>(null);
  const angle = useRef(0);
  const spinning = useRef(false);
  const returnTimer = useRef<number | undefined>(undefined);
  const recent = useRef<number[]>([]);
  const reduceMotion = useReduceMotion();
  const [roll, setRoll] = useState<number | null>(null);
  const showingBack = roll !== null;

  useEffect(() => () => window.clearTimeout(returnTimer.current), []);

  const spin = (onDone: () => void) => {
    const el = flipperRef.current;
    if (!el || spinning.current) return;
    spinning.current = true;
    const from = angle.current;
    // An odd number of half turns always lands on the other face.
    const to = from + 180 * (3 + 2 * Math.floor(Math.random() * 2));
    angle.current = to;
    el.animate(
      [
        { transform: `rotateY(${from}deg) scale(1)` },
        { transform: `rotateY(${from + (to - from) * 0.55}deg) scale(1.14)`, offset: 0.45 },
        { transform: `rotateY(${to}deg) scale(1)` },
      ],
      { duration: reduceMotion ? 1 : FLIP_MS, easing: "cubic-bezier(0.2, 0.7, 0.25, 1)", fill: "forwards" }
    ).onfinish = () => {
      spinning.current = false;
      onDone();
    };
  };

  const flipBack = () => {
    window.clearTimeout(returnTimer.current);
    spin(() => setRoll(null));
  };

  const flip = () => {
    if (spinning.current) return;
    if (showingBack) return flipBack();
    const next = 1 + Math.floor(Math.random() * 20);
    recent.current = [...recent.current, next].slice(-3);
    setRoll(next);
    spin(() => {
      const streak = streakMessage(recent.current);
      if (streak) {
        showNotification({ ...streak, message: "Three in a row.", icon: <IconDice5 size={18} /> });
        recent.current = [];
      }
      returnTimer.current = window.setTimeout(flipBack, SHOW_ROLL_MS);
    });
  };

  const current = character?.hitPoints ?? 0;
  const max = character ? computeEffects(character).stats.maxHp.value : 100;
  const temp = Math.max(0, character?.temporaryHitPoints ?? 0);
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
        margin: 0,
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
            className={hpPercent < 25 ? styles.heartbeat : undefined}
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

      {/* 2. Flippable avatar token in dead center of the ring */}
      <button
        type="button"
        className={`${styles.coin} ${showingBack ? "" : styles.idle}`}
        style={{ width: avatarSize, height: avatarSize }}
        onClick={flip}
        aria-label={showingBack ? `Rolled ${roll} on a d20. Flip back` : "Flip token for a d20 roll"}
      >
        <div ref={flipperRef} className={styles.flipper}>
          <div className={styles.face}>
            {character?.imageUrl ? (
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
          </div>
          <div
            className={`${styles.face} ${styles.back}`}
            data-crit={roll === 20 ? "high" : roll === 1 ? "low" : undefined}
            aria-live="polite"
          >
            {roll !== null && (
              <>
                <D20Face roll={roll} />
                <span className={styles.glint} />
              </>
            )}
          </div>
          {EDGE_LAYERS.map((z) => (
            <div key={z} className={styles.edge} style={{ transform: `translateZ(${z}px)` }} />
          ))}
        </div>
        {roll === 20 && <span className={styles.burst} />}
        {isDead && !showingBack && (
          <svg className={styles.flatline} viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden>
            <polyline className={styles.flatlineBase} points="0,10 42,10 46,4 50,17 54,10 100,10" />
            <polyline className={styles.flatlineBlip} points="0,10 42,10 46,4 50,17 54,10 100,10" />
          </svg>
        )}
      </button>
    </Box>
  );
}
