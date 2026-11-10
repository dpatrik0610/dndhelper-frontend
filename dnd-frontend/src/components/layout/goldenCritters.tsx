import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { pair, type Critter } from "./critters";
import s from "./ThemeCritter.module.css";

const G1 = "#ffe58a";
const G2 = "#f5c542";
const G3 = "#c8901a";
const G4 = "#7a5208";
const LIGHT = "#fff8dc";
const DARK = "#2a1a02";

const starPath = (cx: number, cy: number, outer: number, inner: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 ? inner : outer;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join("L")}Z`;
};

export const GOLDEN_CRITTERS: Record<SidebarThemeVariant, Critter> = {
  midnight: {
    name: "Golden Owl",
    motion: "swoop",
    trail: "sparkle",
    art: (
      <>
        <g className={s.flapSlow}>
          {pair("M13.500 14C9 8.500 4 8 1 10Q.5 13 2 15.500Q3 17.500 4.500 16.200Q5.500 18.800 7.200 17.200Q8.300 19.800 10 18Q11.200 20 13.500 18.500Z", G3)}
          {pair("M13.500 14C10 10.500 6 9.800 3.200 10.800Q4.500 13.800 7 14.500Q10 15.500 13.500 16.800Z", G2)}
          {pair("M13.500 14C11 12 8.500 11.300 6 11.600Q8 13.300 13.500 15.200Z", G1)}
          <path d="M4.500 16.200l.3-2.200M7.200 17.200l.3-2.400M10 18l.2-2.200M27.500 16.200l-.3-2.200M24.800 17.200l-.3-2.400M22 18l-.2-2.200" stroke={G4} strokeWidth="0.4" strokeLinecap="round" />
        </g>
        <ellipse cx="16" cy="18" rx="5" ry="6.5" fill={G2} />
        <ellipse cx="16" cy="20" rx="3" ry="4" fill={G1} />
        <path d="M14.600 18.600l.7.7.7-.7M16 20.400l.7.7.7-.7M14.400 21.800l.7.7.7-.7" stroke={G3} strokeWidth="0.4" fill="none" strokeLinecap="round" />
        <path d="M14 24.5v1.6M18 24.5v1.6" stroke={G4} strokeWidth="1.1" strokeLinecap="round" />
        {pair("M12 8.5l-1.5-4 4 2.5Z", G3)}
        <circle cx="16" cy="11.5" r="5" fill={G2} />
        {pair("M13.8 9.5a2 2 0 1 0 .1 0Z", LIGHT)}
        {pair("M13.9 10.6a.9.9 0 1 0 .1 0Z", DARK)}
        <path d="M16 12.6l-1 2h2Z" fill={G4} />
      </>
    ),
  },
  sunset: {
    name: "Golden Lantern",
    motion: "bob",
    trail: "sparkle",
    art: (
      <>
        <circle className={s.pulse} cx="16" cy="16" r="10" fill={G2} fillOpacity={0.22} />
        <path d="M12 8Q16 2 20 8" stroke={G3} strokeWidth="1.2" fill="none" />
        <rect x="11" y="8" width="10" height="2.5" rx="1" fill={G3} />
        <rect x="12" y="10.5" width="8" height="11" rx="2" fill={G1} fillOpacity={0.5} />
        <path className={s.flicker} d="M16 12.6q2.6 3.2 0 6.6q-2.6-3.4 0-6.6Z" fill={LIGHT} />
        <path d="M12 10.5v11M20 10.5v11" stroke={G3} strokeWidth="0.9" />
        <rect x="11" y="21.5" width="10" height="2.5" rx="1" fill={G3} />
      </>
    ),
  },
  "crimson-vampire": {
    name: "Golden Chalice",
    motion: "rise",
    trail: "drip",
    art: (
      <g className={s.tilt}>
        <path d="M10 26q6-4 12 0Z" fill={G3} />
        <rect x="15" y="16.5" width="2" height="7" fill={G3} />
        <circle cx="16" cy="19.6" r="1.6" fill={G1} />
        <path d="M9 7h14q0 9-7 10q-7-1-7-10Z" fill={G2} />
        <ellipse cx="16" cy="7" rx="7" ry="1.7" fill={G1} />
        <ellipse cx="16" cy="7.2" rx="5.6" ry="1" fill="#9f1239" />
        <circle cx="16" cy="12" r="1.5" fill="#e11d48" />
        <path d="M11 9q.4 4 2.6 6" stroke={LIGHT} strokeOpacity={0.6} strokeWidth="0.8" fill="none" />
      </g>
    ),
  },
  "frost-glacier": {
    name: "Golden Snow Fox",
    motion: "hop",
    facing: true,
    trail: "snow",
    art: (() => {
      const fur = (
        <>
          <path className={s.wag} d="M9 19Q1 15 2 8Q7 11 10 16Z" fill="#fff" />
          <ellipse cx="14" cy="19" rx="7" ry="4" fill="#fff" />
          <path d="M19.5 12.5l.5-4.6 3 3.1ZM23 11.6l2.6-3.6.9 4.6Z" fill="#fff" />
          <circle cx="22" cy="15" r="4" fill="#fff" />
          <path d="M24.5 15l5 1.8-4.5 1.6Z" fill="#fff" />
        </>
      );
      return (
        <>
          <path d="M10 22v5M13.5 22.5v4.5M17 22.5v4.5M19.5 22v5" stroke={G2} strokeWidth="1.6" strokeLinecap="round" />
          <g stroke={G2} strokeWidth="1.8" strokeLinejoin="round">
            {fur}
          </g>
          {fur}
          <path className={s.wag} d="M2 8q.4 3.2 2.6 5.4L5.6 10.6Z" fill={G1} />
          <path d="M20.3 11.3l.2-2 1.3 1.4ZM24 11l1.2-1.6.4 2Z" fill={G1} />
          <circle cx="29.2" cy="16.8" r="0.7" fill={DARK} />
          <circle cx="23.3" cy="14.4" r="0.7" fill={DARK} />
        </>
      );
    })(),
  },
  feywild: {
    name: "Golden Pixie",
    motion: "dart",
    trail: "sparkle",
    art: (
      <>
        <g className={s.flap}>
          {pair("M16 14C12 5 5 5 6 11c1 3 6 4 10 4Z", G1, 0.55)}
          {pair("M16 15c-4 1-8 6-6 8 3 1 5-4 6-7Z", G1, 0.4)}
        </g>
        <path d="M15 21v3.5M17 21v3.5" stroke={G3} strokeWidth="1" strokeLinecap="round" />
        <path d="M16 13l-3.2 8h6.4Z" fill={G3} />
        <circle cx="16" cy="11" r="2.6" fill={G2} />
        <path d="M13.4 10.6q2.6-4.2 5.2 0q-2.6-1.6-5.2 0Z" fill={G4} />
        <path d="M18.6 15.4l5-4" stroke={G4} strokeWidth="0.8" strokeLinecap="round" />
        <circle className={s.led} cx="24.2" cy="10.8" r="1.4" fill={LIGHT} />
      </>
    ),
  },
  toxic: {
    name: "Golden Toad",
    motion: "hop",
    trail: "dust",
    art: (
      <g className={s.breathe}>
        <path d="M6 25.5h5M21 25.5h5" stroke={G3} strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="16" cy="20" rx="9" ry="6" fill={G2} />
        <ellipse cx="16" cy="22.6" rx="6" ry="3.2" fill={G1} />
        <circle cx="11.5" cy="14" r="3" fill={G2} />
        <circle cx="20.5" cy="14" r="3" fill={G2} />
        <circle cx="11.5" cy="13.6" r="1.6" fill={LIGHT} />
        <circle cx="20.5" cy="13.6" r="1.6" fill={LIGHT} />
        <ellipse cx="11.5" cy="13.6" rx="1.3" ry="0.5" fill={DARK} />
        <ellipse cx="20.5" cy="13.6" rx="1.3" ry="0.5" fill={DARK} />
        <path d="M9.5 19.6q6.5 3.4 13 0" stroke={G4} strokeWidth="0.8" strokeLinecap="round" fill="none" />
        <circle cx="12.5" cy="18" r="0.8" fill={G3} />
        <circle cx="20" cy="17.6" r="0.9" fill={G3} />
        <circle cx="16" cy="16.6" r="0.7" fill={G3} />
      </g>
    ),
  },
  void: {
    name: "Golden Star",
    motion: "shoot",
    facing: true,
    trail: "sparkle",
    art: (
      <>
        <path d="M15 13L-22 0L13 19Z" fill={G2} fillOpacity={0.4} />
        <path d="M15 15L-8 6.5L14 18Z" fill={LIGHT} fillOpacity={0.6} />
        <g className={s.twinkle}>
          <path d={starPath(19, 17, 9, 3.8)} fill={G2} stroke={G1} strokeWidth="0.8" strokeLinejoin="round" />
          <circle cx="19" cy="17" r="2.4" fill={LIGHT} />
        </g>
      </>
    ),
  },
  steampunk: {
    name: "Golden Wind-up Beetle",
    motion: "strut",
    facing: true,
    trail: "dust",
    art: (
      <>
        <g className={s.scuttle} stroke={G4} strokeWidth="1.1" strokeLinecap="round">
          <path d="M11 22l-2 4M15 23v4M19 23l1.5 4M22.5 21.5l3 3.5" />
        </g>
        <path d="M13 11.5V7.5" stroke={G4} strokeWidth="1.2" />
        <path className={s.key} d="M13 7a2.2 2.2 0 1 0-4.4 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0" stroke={G1} strokeWidth="1.1" fill="none" />
        <circle cx="26.5" cy="19" r="2.6" fill={G3} />
        <path d="M28 17.4q2-3 3.5-2.4" stroke={G4} strokeWidth="0.7" fill="none" />
        <path d="M6 21.5Q8 11 17 11Q25 11 26 21.5Z" fill={G2} />
        <path d="M16.5 11.2V21.5" stroke={G4} strokeOpacity={0.5} strokeWidth="0.6" />
        <circle cx="11" cy="17" r="1" fill={G1} />
        <circle cx="21.5" cy="16.5" r="1" fill={G1} />
        <circle cx="27.6" cy="18.6" r="0.6" fill={LIGHT} />
      </>
    ),
  },
  "deep-ocean": {
    name: "Golden Seahorse",
    motion: "bob",
    facing: true,
    trail: "bubble",
    art: (
      <>
        <path className={s.rotor} d="M12.4 14.2l-3.6 1.6 3.4 2.2Z" fill={G1} />
        <path d="M16 11.5Q11.5 16 16 20Q19 23 16 25.5Q13.5 27.5 12.5 25" stroke={G2} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M16.6 12.6Q13.4 16 16.6 19.6" stroke={G1} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M14.4 6.2l.9-3.2 1.3 2.5 1.6-2.7.7 3.2Z" fill={G1} />
        <circle cx="17" cy="8.5" r="3.6" fill={G2} />
        <path d="M19.6 7.6l5.6 1.4-5.4 1.8Z" fill={G2} />
        <circle cx="17.9" cy="8" r="0.8" fill={DARK} />
      </>
    ),
  },
  darkvision: {
    name: "Golden Mimic",
    motion: "lurk",
    art: (
      <>
        <rect x="6" y="17" width="20" height="10" rx="1.5" fill={G3} />
        <rect x="7" y="15.4" width="18" height="2.6" fill={DARK} />
        <path d="M15 17.6q1 5 4 5.6q1.6 0 1-1.6q-2-.4-2.6-4Z" fill="#e11d48" />
        <path d="M8 17.8l1.5-2.4 1.5 2.4ZM12 17.8l1.5-2.4 1.5 2.4ZM20 17.8l1.5-2.4 1.5 2.4Z" fill={LIGHT} />
        <g className={s.chomp}>
          <path d="M6 15.6Q6 7 16 7Q26 7 26 15.6Z" fill={G2} />
          <path d="M11 7.9v7.7M21 7.9v7.7" stroke={G4} strokeWidth="1" />
          <path d="M9 15.6l1.5 2.2 1.5-2.2ZM13 15.6l1.5 2.2 1.5-2.2ZM17 15.6l1.5 2.2 1.5-2.2ZM21 15.6l1.5 2.2 1.5-2.2Z" fill={LIGHT} />
          <g className={s.wink}>
            <circle cx="16" cy="11.4" r="2.3" fill={LIGHT} />
            <ellipse cx="16" cy="11.4" rx="0.7" ry="1.7" fill={DARK} />
          </g>
        </g>
      </>
    ),
  },
  cyberpunk: {
    name: "Golden Rogue AI",
    motion: "glitch",
    trail: "pixel",
    art: (
      <g className={s.glitch}>
        <g className={s.mane}>
          <path d="M11.500 10L5 2.500l5.500 2L10 -1l3.500 3.500L16 -2.500l2 5L22.500 -.5l-.5 5 5.500-1.500-4.500 5 4 1.500-6.500 1.500Z" fill="#ff2bd6" transform="translate(0.800 0.800)" />
          <path d="M11.500 10L5 2.500l5.500 2L10 -1l3.500 3.500L16 -2.500l2 5L22.500 -.5l-.5 5 5.500-1.500-4.500 5 4 1.500-6.500 1.500Z" fill={G2} />
          <path d="M16 -2.500l2 5L22.500 -.5l-.5 5 5.500-1.500-4.500 5L16 6Z" fill={G1} />
        </g>
        <path className={s.led} d="M10.500 28.500l1.800 1.200-2 1ZM20 29l2 .4-1.400 1.400ZM15 31.500h2v2h-2ZM7.500 26l1.200.800-1.400.6ZM23.500 26.500l1.400-.4-.4 1.400Z" fill="#00f0ff" />
        <path d="M13 26.500h6l-1.200 2.600-1.800-.8-1.800 2.200Z" fill={G4} stroke={G1} strokeWidth="0.4" strokeLinejoin="round" />
        <path d="M8.500 15.500l-2.500 6 3 3.500 1.500-2-1.500-2 1.500-4Z" fill={G4} stroke={G1} strokeWidth="0.4" strokeLinejoin="round" />
        <path d="M23.500 15.500l3.500-3.500-.8-4.500 2.800 5-4 6Z" fill={G4} stroke={G1} strokeWidth="0.4" strokeLinejoin="round" />
        <path d="M8 14.500l8 1.500 8-1.500-3 6-1.500 6.500h-7L11 20.500Z" fill={DARK} stroke={G1} strokeWidth="0.5" strokeLinejoin="round" />
        <path d="M8 14.500l8 1.500v11h-3.500L11 20.500Z" fill={G4} opacity="0.7" />
        <path d="M12.500 19l3.500 2 3.500-2-.4 1.600-3.100 1.800-3.100-1.800Z" fill="#ff2bd6" />
        <path d="M16 23.200l1.200 1.300-1.200 1.300-1.200-1.300Z" fill="#00f0ff" />
        <path d="M8 14.500l-3.500-3 6.500 1.500ZM24 14.500l3.500-3-6.500 1.500Z" fill={G2} stroke={G4} strokeWidth="0.3" strokeLinejoin="round" />
        <path d="M11.500 15.300l1.700-3 2.800 3.700ZM20.500 15.300l-1.700-3-2.800 3.700Z" fill={G2} />
        <path d="M12.300 6.500L16 4l3.700 2.500.5 4.500-2.200 3.500h-4L11.800 11Z" fill={DARK} stroke={G4} strokeWidth="0.3" />
        <g className={s.wink}>
          <path d="M12.800 8.200l2.700 1.200-2.300.9ZM19.200 8.200l-2.700 1.200 2.300.9Z" fill="#00f0ff" />
        </g>
        <path d="M13.600 11.700l4.800-.5-1.100 2.200-1.300-1-1.300 1.200Z" fill="#fff" />
        <path className={s.spinBox} d="M27.500 1.500l2.200 2.500-2.200 2.500-2.200-2.500Z" fill="#00f0ff" stroke="#fff" strokeWidth="0.3" />
      </g>
    ),
  },
  "art-deco": {
    name: "Golden Peacock",
    motion: "strut",
    facing: true,
    trail: "sparkle",
    art: (
      <>
        <g className={s.fan}>
          {[-72, -47, -22, 3, 28].map((a) => (
            <g key={a} transform={`rotate(${a} 13 22)`}>
              <path d="M13 22V6" stroke={G3} strokeWidth="1" />
              <ellipse cx="13" cy="6" rx="2.3" ry="2.9" fill={G1} />
              <circle cx="13" cy="6.2" r="1.1" fill="#0e7490" />
            </g>
          ))}
        </g>
        <path d="M14 25v3M16.5 25v3" stroke={G4} strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="15" cy="22" rx="4.5" ry="3.4" fill={G2} />
        <path d="M17.5 21Q20.4 16 19 12" stroke={G2} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d="M19 9.2l-.9-2.6M19.3 9V6.2M19.7 9.2l.9-2.6" stroke={G1} strokeWidth="0.6" strokeLinecap="round" />
        <circle cx="19" cy="11" r="2" fill={G2} />
        <path d="M20.8 10.5l2.7.9-2.7.7Z" fill={G4} />
        <circle cx="19.5" cy="10.7" r="0.5" fill={DARK} />
      </>
    ),
  },
  "scorching-desert": {
    name: "Golden Scarab",
    motion: "roll",
    facing: true,
    trail: "dust",
    art: (
      <>
        <g className={s.scuttle} stroke={G4} strokeWidth="1" strokeLinecap="round">
          <path d="M8 25l-2 3M12 26v2.5M16 25.5l1.5 2.5M17.5 20.5l2.5-2" />
        </g>
        <g className={s.spinBox}>
          <circle cx="25" cy="21" r="5.4" fill={G1} />
          <path d="M22 21a3 3 0 0 1 3-3" stroke={LIGHT} strokeWidth="1" fill="none" />
          <circle cx="26.6" cy="23" r="0.9" fill={G3} />
        </g>
        <circle cx="18" cy="22.5" r="2" fill={G3} />
        <ellipse cx="12" cy="22" rx="6" ry="4" fill={G2} />
        <path d="M12 18.2v7.6" stroke={G4} strokeOpacity={0.6} strokeWidth="0.6" />
        <circle cx="9.5" cy="21" r="0.8" fill={G1} />
        <circle cx="14.5" cy="21" r="0.8" fill={G1} />
      </>
    ),
  },
  "wizards-library": {
    name: "Golden Quill",
    motion: "loop",
    facing: true,
    trail: "ink",
    art: (
      <g className={s.flutter}>
        <path d="M27 4Q14 6 8 18L10.5 20.5Q22 15 27 4Z" fill={G2} />
        <path d="M27 4Q19 8 13 15" stroke={G1} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <path d="M20 8.5l-2 4M23 9l-5.5 6.5M15.5 12l-1.5 4" stroke={G3} strokeWidth="0.6" />
        <path d="M26 5L7 23" stroke={G4} strokeWidth="0.8" />
        <path d="M9.2 19.2L5 26l6.8-4.2Z" fill={G4} />
        <circle className={s.led} cx="4.6" cy="27" r="1" fill="#312e81" />
      </g>
    ),
  },
  "nine-hells": {
    name: "Golden Soul Coin",
    motion: "toss",
    trail: "sparkle",
    art: (
      <g className={s.coin}>
        <circle cx="16" cy="16" r="10.600" fill={G4} />
        <circle cx="16" cy="16" r="10" fill={G2} stroke={G3} strokeWidth="1.200" />
        <circle cx="16" cy="16" r="8.600" fill="none" stroke={G1} strokeWidth="0.7" strokeDasharray="0.5 1.300" strokeLinecap="round" />
        <g transform="translate(16 16.400) scale(0.900) translate(-16 -16)">
          <g transform="translate(0.500 0.600)" opacity="0.9">
            {pair("M12.200 12.600C9.200 11.600 8 8.800 9.600 6.200C10 8.800 11.600 10 14 10.600Z", G3)}
            <path d="M16 9.800C13 9.800 11 11.800 11 14.500C11 17 12.200 18.500 13 20L16 24.500L19 20C19.800 18.500 21 17 21 14.500C21 11.800 19 9.800 16 9.800Z" fill={G3} />
          </g>
          {pair("M12.200 12.600C9.200 11.600 8 8.800 9.600 6.200C10 8.800 11.600 10 14 10.600Z", LIGHT)}
          {pair("M12.200 12.600C10.600 11.800 9.800 10.400 9.800 8.800", "none")}
          {pair("M11.200 13.600l-3-1.600 2.800 4Z", G1)}
          <path d="M16 9.800C13 9.800 11 11.800 11 14.500C11 17 12.200 18.500 13 20L16 24.500L19 20C19.800 18.500 21 17 21 14.500C21 11.800 19 9.800 16 9.800Z" fill={G1} stroke={G4} strokeWidth="0.4" strokeLinejoin="round" />
          <path d="M16 9.800C13 9.800 11 11.800 11 14.500C11 17 12.200 18.500 13 20L16 24.500Z" fill={G2} opacity="0.55" />
          <path d="M10.600 8.600l1.200.6M10.200 10l1.400.5M21.400 8.600l-1.200.6M21.800 10l-1.400.5" stroke={G3} strokeWidth="0.4" strokeLinecap="round" />
          <path d="M16 10.800l.9 1.100-.9 1.100-.9-1.100Z" fill={G4} />
          <path d="M11.600 13.400l3.600 1.500M20.400 13.400l-3.600 1.500" stroke={G4} strokeWidth="0.9" strokeLinecap="round" />
          <g className={s.led}>{pair("M12.300 14.700l2.900 1.100-2.300.800Z", "#d4121f")}</g>
          <path d="M16 15.800l-.8 2.300h1.600Z" fill={G3} />
          <path d="M13.200 19q2.800 1.800 5.600 0l-1.200 2h-3.200Z" fill={G4} />
          <path d="M13.900 19.500l.6 1.500.6-1.100ZM18.100 19.500l-.6 1.500-.6-1.100Z" fill="#fff" />
          <path d="M15.200 22l.8 2.500.8-2.500" stroke={G4} strokeWidth="0.4" fill="none" strokeLinejoin="round" />
        </g>
        <path d="M7.800 12.800a8.800 8.800 0 0 1 5.400-5.200" stroke={LIGHT} strokeOpacity={0.7} strokeWidth="0.9" strokeLinecap="round" fill="none" />
      </g>
    ),
  },
  celestia: {
    name: "Golden Dove",
    motion: "swoop",
    facing: true,
    trail: "feather",
    art: (() => {
      const body = (
        <>
          <path d="M10 17Q4 15 1.5 13.5Q2.5 17 1.5 20.5Q5 19.8 10 20Z" />
          <path d="M8 18.5Q12 14 19 14.5Q22.5 15 23.5 13.5Q26.5 16 23.5 19.5Q19 23 12 21.5Q9 20.8 8 18.5Z" />
          <circle cx="24" cy="12" r="3.2" />
        </>
      );
      const wing = <path d="M12.5 17Q8 8 11 2Q15 5 19 9Q21.5 12.5 20 16Z" />;
      return (
        <>
          <g className={s.flapSlowY}>
            <path d="M15 16Q13 7 18 2Q20 8 21.5 15Z" fill="#dfe8f5" stroke={G2} strokeWidth="1" />
          </g>
          <g stroke={G2} strokeWidth="1.8" strokeLinejoin="round">
            {body}
          </g>
          <g fill="#fff">{body}</g>
          <path d="M26.8 11.2l3.2 1-3.2.9Z" fill={G3} />
          <circle cx="25" cy="11.3" r="0.65" fill={DARK} />
          <ellipse className={s.pulse} cx="24" cy="6.8" rx="3.4" ry="1.1" fill="none" stroke={G1} strokeWidth="0.9" />
          <path d="M28.6 13Q30.6 15.6 29 19" stroke={G3} strokeWidth="0.6" fill="none" />
          <ellipse cx="30.1" cy="15" rx="1.2" ry="0.55" transform="rotate(50 30.1 15)" fill={G1} />
          <ellipse cx="29.2" cy="17.2" rx="1.2" ry="0.55" transform="rotate(-30 29.2 17.2)" fill={G2} />
          <g className={s.flapSlowY}>
            <g stroke={G2} strokeWidth="1.6" strokeLinejoin="round">
              {wing}
            </g>
            <g fill="#fff">{wing}</g>
            <path d="M12.6 6.5l3 4M11.8 10.2l3.4 3.2M14.8 4.8l2.8 4.2" stroke={G2} strokeWidth="0.6" strokeLinecap="round" />
          </g>
        </>
      );
    })(),
  },
};

export const ALL_GOLDEN: { theme: SidebarThemeVariant; name: string }[] = Object.entries(GOLDEN_CRITTERS).map(([theme, c]) => ({
  theme: theme as SidebarThemeVariant,
  name: c.name,
}));
