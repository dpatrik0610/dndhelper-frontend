import { useEffect, type AnimationEvent } from "react";
import { createPortal } from "react-dom";
import { IconMoonStars, IconSun, IconSunrise, IconSunset } from "@tabler/icons-react";
import { useRestClockStore } from "@store/ui/restClockStore";
import { useReduceMotion } from "@hooks/useReduceMotion";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import "./restClock.css";

const STARS = Array.from({ length: 70 }, () => {
  const a = Math.random() * Math.PI * 2;
  const d = Math.sqrt(Math.random()) * 116;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d, r: 0.4 + Math.random() * 1.1, delay: Math.random() * 2 };
});

const TICKS = Array.from({ length: 24 }, (_, i) => i * 15).filter((deg) => deg % 90 !== 0);

const MARKERS = [
  { deg: 0, fill: "full" },
  { deg: 90, fill: "half" },
  { deg: 180, fill: "empty" },
  { deg: 270, fill: "half" },
] as const;

const NODES = [
  { key: "noon", icon: IconSun, cls: "rc-node--top" },
  { key: "dusk", icon: IconSunset, cls: "rc-node--right" },
  { key: "night", icon: IconMoonStars, cls: "rc-node--bottom" },
  { key: "dawn", icon: IconSunrise, cls: "rc-node--left" },
];

function Gear({ r, teeth, x, y, cls }: { r: number; teeth: number; x: number; y: number; cls: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`rc-gear ${cls}`}>
        <circle r={r} className="rc-gear__teeth" pathLength={teeth * 2} />
        <circle r={r - 7} className="rc-gear__rim" />
        <circle r={r * 0.55} className="rc-gear__rim" />
        <circle r={r * 0.18} className="rc-gear__hub" />
      </g>
    </g>
  );
}

export function RestClock() {
  const { playId, message, clear } = useRestClockStore();
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (!message || !reduceMotion) return;
    showNotification({ title: "Long rest", message, color: SectionColor.Green });
    clear();
  }, [message, reduceMotion, clear]);

  useEffect(() => {
    if (!message) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && clear();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message, clear]);

  if (!message || reduceMotion) return null;

  const onEnd = (e: AnimationEvent) => {
    if (e.target === e.currentTarget && e.animationName === "rc-overlay") clear();
  };

  return createPortal(
    <div key={playId} className="rc-overlay" onClick={clear} onAnimationEnd={onEnd} role="status" aria-live="polite">
      <div className="rc-dawn-flash" />
      <div className="rc-dial">
        <svg viewBox="-200 -200 400 400" className="rc-svg" aria-hidden>
          <defs>
            <clipPath id="rc-disc">
              <circle r="118" />
            </clipPath>
            <radialGradient id="rc-vignette">
              <stop offset="55%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.65" />
            </radialGradient>
          </defs>

          <g className="rc-orbit">
            <circle r="188" className="rc-line" />
            <circle r="172" className="rc-line rc-line--dashed" />
            <circle r="150" className="rc-line" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} y1="-150" y2="-196" className="rc-line" transform={`rotate(${i * 30 + 15})`} />
            ))}
            <path d="M0 -150 L106 -106 L150 0 L106 106 L0 150 L-106 106 L-150 0 L-106 -106 Z" className="rc-line" />
          </g>

          <g clipPath="url(#rc-disc)">
            <circle r="118" className="rc-sky" />
            <g className="rc-stars">
              {STARS.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} style={{ animationDelay: `${s.delay}s` }} />
              ))}
            </g>
            <Gear r={78} teeth={36} x={-34} y={-22} cls="rc-gear--a" />
            <Gear r={46} teeth={22} x={74} y={58} cls="rc-gear--b" />
            <Gear r={30} teeth={14} x={-60} y={82} cls="rc-gear--c" />
            <circle r="118" fill="url(#rc-vignette)" />
          </g>

          <circle r="130" className="rc-track" />
          <circle r="130" className="rc-progress" pathLength={360} />
          <circle r="140" className="rc-rim" />
          <circle r="119" className="rc-rim" />

          {TICKS.map((deg) => (
            <rect key={deg} x="-2.4" y="-132.4" width="4.8" height="4.8" className="rc-tick" transform={`rotate(${deg}) rotate(45 0 -130)`} />
          ))}

          {MARKERS.map((m) => (
            <g key={m.deg} transform={`rotate(${m.deg}) translate(0 -130) rotate(${-m.deg})`}>
              <circle r="11" className="rc-marker" />
              {m.fill === "full" && <circle r="8" className="rc-marker__fill" />}
              {m.fill === "half" && <path d="M-8 0 A8 8 0 0 0 8 0 Z" className="rc-marker__fill" />}
            </g>
          ))}

          <g className="rc-hand">
            <path d="M0 22 L5 30 L0 40 L-5 30 Z" className="rc-hand__metal" />
            <path d="M0 -20 L9 -44 L3 -88 L0 -96 L-3 -88 L-9 -44 Z" className="rc-hand__metal" />
            <path d="M0 -40 L4 -50 L0 -74 L-4 -50 Z" className="rc-hand__cut" />
            <path d="M0 -114 L12 -90 L0 -97 L-12 -90 Z" className="rc-hand__metal" />
            <circle r="17" className="rc-hand__ring" />
            <circle r="6" className="rc-hand__metal" />
          </g>
        </svg>

        {NODES.map(({ key, icon: Icon, cls }) => (
          <span key={key} className={`rc-node ${cls}`}>
            <Icon size="58%" stroke={1.6} />
          </span>
        ))}
      </div>

      <div className="rc-caption">
        <span className="rc-caption__title">Long Rest</span>
        <span className="rc-caption__line rc-caption__line--night">The night passes…</span>
        <span className="rc-caption__line rc-caption__line--dawn">{message}</span>
      </div>
    </div>,
    document.body,
  );
}
