import type { CSSProperties } from "react";

const PATHS = {
  play: <path d="M8 5.2v13.6L19 12z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  stop: <rect x="5.5" y="5.5" width="13" height="13" rx="2" fill="currentColor" stroke="none" />,
  prev: <path d="M6.5 5.5v13M18.5 6 9.5 12l9 6z" />,
  next: <path d="M17.5 5.5v13M5.5 6l9 6-9 6z" />,
  shuffle: <path d="M3 7h3c2.2 0 3.3 1.1 4.8 3.6l2.4 3.8C14.7 16.9 15.8 18 18 18h3M3 17h3c1.3 0 2.2-.4 3-1.3M14.9 8.3c.8-.9 1.7-1.3 3.1-1.3h3M18 4l3 3-3 3M18 15l3 3-3 3" />,
  repeat: <path d="M4 11.5V9.5A3.5 3.5 0 0 1 7.5 6H19M16 3l3 3-3 3M20 12.5v2a3.5 3.5 0 0 1-3.5 3.5H5M8 21l-3-3 3-3" />,
  queue: <path d="M4 6h13M4 11h13M4 16h7M15 14v6.5l5-3.25z" />,
  volume: <path d="M4 9.5h3.2L12 5.8v12.4l-4.8-3.7H4zM15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" />,
  muted: <path d="M4 9.5h3.2L12 5.8v12.4l-4.8-3.7H4zM16 9.5l5 5M21 9.5l-5 5" />,
  down: <path d="m6 9.5 6 6 6-6" />,
  up: <path d="m6 14.5 6-6 6 6" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  remove: <path d="M7 12h10" />,
  waves: <path d="M3 9c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 4.3-2 5 0M3 15c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 4.3-2 5 0" />,
  power: <path d="M12 3.5v8M7.2 6.6a7 7 0 1 0 9.6 0" />,
  note: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  fetch: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  upload: <path d="M12 15V3M7 8l5-5 5 5M5 21h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 18l5-5 4 4 3-3 4 4" />
    </>
  ),
  move: <path d="M7 4 3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  inbox: <path d="M4 13h4l1.5 3h5L16 13h4M4 13l2.5-7h11L20 13v6H4z" />,
  road: <path d="M4 20 10 4M20 20 14 4M12 6v2M12 11v2M12 16v2" />,
  swords: <path d="M5 19 19 5M15 5h4v4M5 5l14 14M9 19H5v-4" />,
  tankard: (
    <>
      <path d="M6 7h9v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
      <path d="M15 10h2.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H15" />
      <path d="M6 7c0-2 2-3 4-2 1-1.5 4-1.5 5 0" />
    </>
  ),
  anchor: <path d="M12 3v15M8 7h8M5 13a7 7 0 0 0 14 0M3 13h4M17 13h4" />,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  tree: <path d="M12 3 6 11h3l-4 6h14l-4-6h3zM12 17v4" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}

const SIGILS: [RegExp, IconName][] = [
  [/road|travel|journey|ride|wander|march/i, "road"],
  [/battle|fight|combat|boss|war|duel|ambush/i, "swords"],
  [/tavern|inn|feast|pub|bar|hall|festival/i, "tankard"],
  [/harbou?r|sea|ship|port|ocean|coast|sail/i, "anchor"],
  [/night|dream|sleep|camp|rest/i, "moon"],
  [/forest|wood|wild|grove/i, "tree"],
];

export function Sigil({ name, size = 18 }: { name: string; size?: number }) {
  return <Icon name={SIGILS.find(([re]) => re.test(name))?.[1] ?? "sparkle"} size={size} />;
}

export function Bars({ playing }: { playing: boolean }) {
  return (
    <span className={`sb-bars ${playing ? "is-playing" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function Disc({ size, spinning, cover }: { size: number; spinning: boolean; cover?: string | null }) {
  return (
    <span className="sb-disc" style={{ "--d": `${size}px` } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 248 248" className={`sb-disc-ring ${spinning ? "is-spinning" : ""}`}>
        <circle cx="124" cy="124" r="120" fill="none" stroke="var(--sb-line-2)" strokeWidth="2" />
        <circle cx="124" cy="124" r="110" fill="none" stroke="var(--sb-gold)" strokeOpacity="0.55" strokeWidth="6" strokeDasharray="1 9" />
        <circle cx="124" cy="124" r="98" fill="var(--sb-deep)" stroke="var(--sb-line)" strokeWidth="2" />
        <circle cx="124" cy="124" r="88" fill="none" stroke="var(--sb-raised)" strokeWidth="2" />
        <circle cx="124" cy="124" r="78" fill="none" stroke="var(--sb-raised)" strokeWidth="2" />
        <path d="M124 14l3 8h-6zM124 234l3-8h-6zM14 124l8 3v-6zM234 124l-8 3v-6z" fill="var(--sb-gold)" />
      </svg>
      <span className="sb-disc-core">{cover ? <img src={cover} alt="" /> : <Icon name="note" size={Math.max(10, Math.round(size / 5))} />}</span>
    </span>
  );
}
