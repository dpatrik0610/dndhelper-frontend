import type { ReactNode } from "react";
import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { pixels } from "@utils/pixelArt";
import { SCROLL } from "./backdrops/librarySprites";
import s from "./ThemeCritter.module.css";

/**
 * The theme critters (ThemeCritter.tsx shows them, the hidden /scoreboard lists them). Their names are
 * also the backend's allowlist in UserService.Critters: keep the two in step.
 */

export type Motion = "fly" | "sink" | "rise" | "roll" | "lurk";

export interface Critter {
  name: string;
  motion: Motion;
  /** Art faces right; mirror it when travelling left. */
  facing?: boolean;
  art: ReactNode;
}

/** Path plus its mirror across the vertical centre line, for symmetric wings. */
const pair = (d: string, fill: string, opacity?: number) => (
  <>
    <path d={d} fill={fill} fillOpacity={opacity} />
    <path d={d} fill={fill} fillOpacity={opacity} transform="matrix(-1 0 0 1 32 0)" />
  </>
);

/** Pixel art from utils/pixelArt rows, one SVG unit per pixel (scale it with a transform). */
const pixelArt = (rows: string[], palette: Record<string, string>) => (
  <g shapeRendering="crispEdges">
    {pixels(rows, palette).map((p, i) => (
      <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.color} />
    ))}
  </g>
);

const ACCENT = "currentColor";
const SECOND = "var(--theme-color-accent-secondary, #06b6d4)";

const gearPath = (() => {
  const teeth = 9;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const r = i % 4 < 2 ? 14 : 10.5;
    pts.push(`${(16 + r * Math.cos(a)).toFixed(2)},${(16 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

export const CRITTERS: Partial<Record<SidebarThemeVariant, Critter>> = {
  midnight: {
    name: "Moth",
    motion: "fly",
    art: (
      <>
        <g className={s.flap}>
          {pair("M16 14C10 4 2 6 3 12c1 4 7 4 13 4Z", ACCENT, 0.85)}
          {pair("M16 16c-5 2-10 8-7 10 3 1 6-5 7-9Z", SECOND, 0.7)}
        </g>
        <ellipse cx="16" cy="17" rx="1.6" ry="6" fill="#e9d5ff" />
        <path d="M15.4 11Q13 6 11 5M16.6 11Q19 6 21 5" stroke="#e9d5ff" strokeWidth="0.8" fill="none" />
      </>
    ),
  },
  sunset: {
    name: "Wisp",
    motion: "fly",
    art: (
      <g className={s.pulse}>
        <circle cx="16" cy="16" r="8" fill={ACCENT} fillOpacity={0.25} />
        <circle cx="16" cy="16" r="4.5" fill={ACCENT} />
        <circle cx="16" cy="16" r="2" fill="#fff" />
        <circle cx="7" cy="19" r="1.4" fill={SECOND} fillOpacity={0.7} />
        <circle cx="3" cy="21" r="0.9" fill={SECOND} fillOpacity={0.4} />
      </g>
    ),
  },
  "crimson-vampire": {
    name: "Bat",
    motion: "fly",
    art: (
      <>
        <g className={s.flapY}>
          {pair("M16 15c-3-4-8-5-14-3 3 1 4 3 3 5 2-1 4 0 4 2 2-2 4-2 7-1Z", ACCENT)}
        </g>
        <ellipse cx="16" cy="16" rx="2.6" ry="4" fill="#3f0d0d" />
        <path d="M14 12.5l.6-2.5 1.2 2M18 12.5l-.6-2.5-1.2 2" fill="#3f0d0d" />
        <circle cx="15.1" cy="14.5" r="0.6" fill="#fca5a5" />
        <circle cx="16.9" cy="14.5" r="0.6" fill="#fca5a5" />
      </>
    ),
  },
  "frost-glacier": {
    name: "Snowflake",
    motion: "sink",
    art: (
      <g className={s.spin} stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" fill="none">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} transform={`rotate(${a} 16 16)`} d="M16 16V3M16 7l-3-3M16 7l3-3M16 11.5l-2.5-2.5M16 11.5l2.5-2.5" />
        ))}
        <circle cx="16" cy="16" r="1.6" fill="#fff" stroke="none" />
      </g>
    ),
  },
  feywild: {
    name: "Butterfly",
    motion: "fly",
    art: (
      <>
        <g className={s.flapSlow}>
          {pair("M16 15C12 2 1 3 4 12c1 4 7 4 12 4Z", ACCENT, 0.9)}
          {pair("M16 16c-6 1-12 9-7 11 4 1 6-5 7-10Z", SECOND, 0.85)}
          {pair("M9 9a1.6 1.6 0 1 0 .1 0Z", "#fff", 0.7)}
        </g>
        <ellipse cx="16" cy="17" rx="1.3" ry="6" fill="#3b0a2a" />
        <path d="M15.4 11Q14 7 12 6M16.6 11Q18 7 20 6" stroke="#3b0a2a" strokeWidth="0.8" fill="none" />
      </>
    ),
  },
  toxic: {
    name: "Spore",
    motion: "rise",
    art: (
      <g className={s.pulse}>
        <circle cx="16" cy="16" r="7" fill={ACCENT} fillOpacity={0.35} stroke={ACCENT} strokeWidth="1" />
        <circle cx="13.5" cy="14" r="1.6" fill={SECOND} />
        <circle cx="18" cy="17.5" r="1.2" fill={SECOND} />
        <circle cx="15.5" cy="19" r="0.8" fill={SECOND} />
        <circle cx="25" cy="10" r="1.6" fill={ACCENT} fillOpacity={0.5} />
        <circle cx="7" cy="24" r="1.1" fill={ACCENT} fillOpacity={0.4} />
      </g>
    ),
  },
  void: {
    name: "Watcher",
    motion: "lurk",
    art: (
      <g className={s.blink}>
        <path d="M2 16Q16 3 30 16Q16 29 2 16Z" fill="#0b0712" stroke={ACCENT} strokeWidth="1.2" />
        <circle cx="16" cy="16" r="5.5" fill={ACCENT} />
        <ellipse cx="16" cy="16" rx="1.4" ry="4.2" fill="#0b0712" />
        <circle cx="17.8" cy="13.6" r="1" fill="#fff" fillOpacity={0.8} />
      </g>
    ),
  },
  steampunk: {
    name: "Cog",
    motion: "roll",
    art: (
      <g className={s.spinFast}>
        <path d={gearPath} fill={ACCENT} stroke="#1c1006" strokeWidth="0.6" />
        <circle cx="16" cy="16" r="6.5" fill="none" stroke="#1c1006" strokeWidth="1" strokeOpacity={0.5} />
        <circle cx="16" cy="16" r="3.2" fill="#1c1006" />
      </g>
    ),
  },
  "deep-ocean": {
    name: "Fish",
    motion: "fly",
    facing: true,
    art: (
      <>
        <path className={s.tail} d="M22 16l8-6-1.5 6 1.5 6Z" fill={SECOND} />
        <path d="M3 16Q12 6 24 16Q12 26 3 16Z" fill={ACCENT} />
        <path d="M11 11q2 5 0 10" stroke="#fff" strokeOpacity={0.25} strokeWidth="1" fill="none" />
        <circle cx="7.5" cy="15" r="1.3" fill="#04131f" />
      </>
    ),
  },
  darkvision: {
    name: "Lurker",
    motion: "lurk",
    art: (
      <g className={s.blink}>
        <ellipse cx="10" cy="16" rx="4" ry="2.4" fill={ACCENT} />
        <ellipse cx="22" cy="16" rx="4" ry="2.4" fill={ACCENT} />
        <ellipse cx="10.6" cy="16" rx="0.9" ry="2" fill="#050507" />
        <ellipse cx="22.6" cy="16" rx="0.9" ry="2" fill="#050507" />
      </g>
    ),
  },
  cyberpunk: {
    name: "Drone",
    motion: "fly",
    facing: true,
    art: (
      <>
        <path d="M5 12h22" stroke={ACCENT} strokeWidth="1.4" />
        <ellipse className={s.rotor} cx="6" cy="10.5" rx="5" ry="1" fill={ACCENT} fillOpacity={0.6} />
        <ellipse className={s.rotor} cx="26" cy="10.5" rx="5" ry="1" fill={ACCENT} fillOpacity={0.6} />
        <rect x="10" y="12" width="12" height="6" rx="2" fill="#0d1117" stroke={ACCENT} strokeWidth="1.2" />
        <rect x="18" y="13.6" width="3" height="2" rx="0.6" fill={SECOND} />
        <circle className={s.led} cx="16" cy="20.5" r="1.1" fill="#ff2a6d" />
      </>
    ),
  },
  "wizards-library": {
    name: "Scroll",
    motion: "fly",
    facing: true,
    art: (
      <g className={s.flutter}>
        <g transform="translate(0 4) scale(2)">
          {pixelArt(SCROLL.frames[0], SCROLL.palette)}
        </g>
      </g>
    ),
  },
  "art-deco": {
    name: "Plume",
    motion: "sink",
    art: (
      <g className={s.sway}>
        <path d="M25 4Q29 11 21 17Q16 22 8 27Q12 20 15 15Q19 8 25 4Z" fill={ACCENT} fillOpacity={0.9} />
        <path d="M16 13.5l-3-1M19 10.5l-3-1.5M14 17l-3.5-.5M21.5 13l1.5 3M18.5 16.5l1.5 3" stroke="#14110a" strokeOpacity={0.35} strokeWidth="0.6" />
        <path d="M6 30Q13 18 25 4" stroke={SECOND} strokeWidth="0.9" fill="none" />
      </g>
    ),
  },
  "scorching-desert": {
    name: "Scorpion",
    motion: "roll",
    facing: true,
    art: (
      <>
        <g className={s.scuttle} stroke={ACCENT} strokeWidth="1" strokeLinecap="round">
          <path d="M12 23l-2.5 4M14.5 23.5l-1 4M17 23.5l.5 4M19 23l2 3.5" />
        </g>
        <g className={s.sting}>
          <path d="M10 20Q4 17 5 12Q6 7.5 11 8" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M11 6.6q3.4.3 3.4 3.6l-1.9-1.6Z" fill={SECOND} />
        </g>
        <ellipse cx="15" cy="21" rx="6" ry="3.2" fill={ACCENT} />
        <ellipse cx="21.5" cy="21" rx="2.8" ry="2.5" fill={ACCENT} />
        <path d="M23 20Q26 18 27 18" stroke={ACCENT} strokeWidth="1.4" fill="none" />
        <path d="M26.5 16.5q3.5-1.5 4.5 1q-2.2-.6-3.2.7q2.4 0 2.8 1.6q-2.6-.4-4.1-.9Z" fill={ACCENT} />
        <circle cx="22.6" cy="20.2" r="0.6" fill="#1c0d04" />
      </>
    ),
  },
};

/** Every critter in display order, for the scoreboard. */
export const ALL_CRITTERS: { theme: SidebarThemeVariant; name: string }[] = Object.entries(CRITTERS).map(([theme, c]) => ({
  theme: theme as SidebarThemeVariant,
  name: c!.name,
}));
