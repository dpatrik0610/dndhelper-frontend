import { useEffect, useRef, useState } from "react";
import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { catchCritter, type CritterScore } from "@services/userService";
import { CRITTERS, type Critter, type Motion, type Trail } from "./critters";
import { GOLDEN_CRITTERS } from "./goldenCritters";
import s from "./ThemeCritter.module.css";

/**
 * The server spawns a critter for everyone at once (CritterSpawned); each player sees their theme's
 * critter cross the screen and the first click wins it (see the hidden /scoreboard page). It sits above
 * the page but only its own few pixels take clicks. The critters themselves are in critters.tsx.
 */

/** A critter's art at a given size (still uses its idle animation). */
export function CritterIcon({ name, size = 28 }: { name: string; size?: number }) {
  const critter = [...Object.values(CRITTERS), ...Object.values(GOLDEN_CRITTERS)].find((c) => c?.name === name);
  if (!critter) return null;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} overflow="visible" aria-hidden>
      {critter.art}
    </svg>
  );
}

interface Route {
  frames: Keyframe[];
  duration: number;
  leftward: boolean;
}

/** A meandering path across the viewport for the given motion. */
function plan(motion: Motion): Route {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const leftward = Math.random() < 0.5;
  const at = (x: number, y: number, extra: Keyframe = {}): Keyframe => ({
    transform: `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`,
    easing: "ease-in-out",
    ...extra,
  });
  const steps = 6;
  const across = (fromX: number, toX: number, baseY: number, wobble: number) =>
    Array.from({ length: steps + 1 }, (_, i) =>
      at(fromX + ((toX - fromX) * i) / steps, baseY + (i === 0 || i === steps ? 0 : (Math.random() - 0.5) * wobble))
    );
  const down = (fromY: number, toY: number, baseX: number, sway: number) =>
    Array.from({ length: steps + 1 }, (_, i) =>
      at(baseX + (i === 0 ? 0 : (Math.random() - 0.5) * sway), fromY + ((toY - fromY) * i) / steps)
    );
  const [startX, endX] = leftward ? [w + 40, -40] : [-40, w + 40];
  const dir = leftward ? -1 : 1;
  const lerpX = (t: number) => startX + (endX - startX) * t;
  const trace = (f: (t: number) => [number, number], n = 48) =>
    Array.from({ length: n + 1 }, (_, i) => at(...f(i / n), { easing: "linear" }));

  switch (motion) {
    case "fly":
      return { frames: across(startX, endX, h * (0.15 + Math.random() * 0.55), 160), duration: 13_000, leftward };
    case "roll":
      return {
        frames: [at(startX, h - 36, { easing: "linear" }), at(endX, h - 36)],
        duration: 15_000,
        leftward,
      };
    case "sink":
      return { frames: down(-40, h + 40, w * (0.1 + Math.random() * 0.8), 120), duration: 20_000, leftward };
    case "rise":
      return { frames: down(h + 40, -40, w * (0.1 + Math.random() * 0.8), 90), duration: 22_000, leftward };
    case "swoop": {
      const top = h * (0.08 + Math.random() * 0.1);
      return { frames: trace((t) => [lerpX(t), top + h * 0.6 * Math.sin(Math.PI * t)]), duration: 6_500, leftward };
    }
    case "bob": {
      const base = h * (0.25 + Math.random() * 0.4);
      return { frames: trace((t) => [lerpX(t), base + 30 * Math.sin(t * Math.PI * 10)], 80), duration: 11_000, leftward };
    }
    case "hop":
      return {
        frames: trace((t) => [lerpX(t), h - 34 - 120 * Math.abs(Math.sin(t * Math.PI * 6))], 96),
        duration: 8_500,
        leftward,
      };
    case "dart":
      return {
        frames: across(startX, endX, h * 0.45, h * 0.6).map((f) => ({ ...f, easing: "cubic-bezier(0.8, 0, 0.15, 1)" })),
        duration: 8_000,
        leftward,
      };
    case "shoot": {
      const top = h * (0.04 + Math.random() * 0.12);
      const drop = Math.min(0.35 * (w + 80), h * 0.75);
      return { frames: [at(startX, top, { easing: "ease-in" }), at(endX, top + drop)], duration: 4_000, leftward };
    }
    case "strut": {
      const stops = [0, 0.3, 0.3, 0.55, 0.55, 0.8, 0.8, 1];
      const offsets = [0, 0.2, 0.32, 0.5, 0.62, 0.8, 0.9, 1];
      return { frames: stops.map((p, i) => at(lerpX(p), h - 36, { offset: offsets[i] })), duration: 12_000, leftward };
    }
    case "loop": {
      const base = h * (0.4 + Math.random() * 0.25);
      const r = Math.min(110, h * 0.16);
      return {
        frames: trace((t) => {
          const a = Math.PI * 2 * Math.min(1, Math.max(0, (t - 0.35) / 0.3));
          return [lerpX(t) + dir * r * Math.sin(a), base - r * (1 - Math.cos(a))];
        }, 80),
        duration: 8_000,
        leftward,
      };
    }
    case "toss": {
      const x = w * (0.2 + Math.random() * 0.6);
      return {
        frames: trace((t) => [x + dir * w * 0.12 * (t - 0.5), h + 40 - h * 0.9 * 4 * t * (1 - t)]),
        duration: 5_500,
        leftward,
      };
    }
    case "glitch": {
      const hops = 7;
      const spots = Array.from({ length: hops }, () => [w * (0.08 + Math.random() * 0.84), h * (0.12 + Math.random() * 0.72)]);
      return {
        frames: [
          ...spots.flatMap(([x, y], i) => [
            at(x, y, { offset: i / hops, opacity: 1, easing: "step-end" }),
            at(x, y, { offset: (i + 0.9) / hops, opacity: 0, easing: "step-end" }),
          ]),
          at(...(spots[hops - 1] as [number, number]), { opacity: 0 }),
        ],
        duration: 9_800,
        leftward,
      };
    }
    case "lurk": {
      const x = Math.random() < 0.5 ? w * (0.02 + Math.random() * 0.04) : w * (0.92 + Math.random() * 0.04);
      const y = h * (0.2 + Math.random() * 0.6);
      return {
        frames: [
          at(x, y, { opacity: 0 }),
          at(x, y, { opacity: 1, offset: 0.12 }),
          at(x + 6, y - 4, { opacity: 1, offset: 0.85 }),
          at(x + 6, y - 4, { opacity: 0 }),
        ],
        duration: 9_000,
        leftward,
      };
    }
  }
}

function spark(x: number, y: number, kind: Trail, burst = false) {
  const el = document.createElement("span");
  el.className = `${s.spark} ${kind === "sparkle" ? "" : s[kind]}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  const angle = Math.random() * Math.PI * 2;
  const reach = burst ? 40 + Math.random() * 60 : 6 + Math.random() * 12;
  const dx = Math.cos(angle) * reach;
  const dy = burst ? Math.sin(angle) * reach : kind === "bubble" ? -30 : 22;
  el.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) scale(0.2) rotate(140deg)`, opacity: 0 },
    ],
    { duration: burst ? 750 : 950, easing: "ease-out" }
  ).onfinish = () => el.remove();
}

interface VisitProps {
  critter: Critter;
  golden: boolean;
  spawnId: string;
  takenBy: string | null;
  onDone: () => void;
}

function Visit({ critter, golden, spawnId, takenBy, onDone }: VisitProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const flight = useRef<Animation | null>(null);
  const [route] = useState(() => plan(critter.motion));
  const [clicked, setClicked] = useState(false);
  const [result, setResult] = useState<CritterScore | null | undefined>(undefined);
  const gone = clicked || takenBy !== null;

  useEffect(() => {
    const anim = rootRef.current?.animate(route.frames, { duration: route.duration, fill: "forwards" });
    if (!anim) return;
    flight.current = anim;
    anim.onfinish = onDone;
    return () => anim.cancel();
  }, [route, onDone]);

  useEffect(() => {
    const trail = critter.trail;
    if (!trail || gone) return;
    const timer = window.setInterval(() => {
      const box = rootRef.current?.getBoundingClientRect();
      if (box) spark(box.left + box.width / 2, box.top + box.height / 2, trail);
    }, 90);
    return () => window.clearInterval(timer);
  }, [critter, gone]);

  useEffect(() => {
    if (!gone) return;
    const box = rootRef.current?.getBoundingClientRect();
    if (golden && clicked && box) {
      for (let i = 0; i < 18; i++) spark(box.left + box.width / 2, box.top + box.height / 2, "sparkle", true);
    }
    if (flight.current) {
      flight.current.pause();
      flight.current.onfinish = null;
    }
    bodyRef.current?.animate(
      [
        { transform: "scale(1) rotate(0deg)", opacity: 1 },
        { transform: "scale(1.6) rotate(25deg)", opacity: 0 },
      ],
      { duration: 380, easing: "ease-out", fill: "forwards" }
    );
    const timer = window.setTimeout(onDone, 2000);
    return () => window.clearTimeout(timer);
  }, [gone, onDone, golden, clicked]);

  const catchIt = () => {
    if (gone) return;
    setClicked(true);
    catchCritter(critter.name, spawnId)
      .then(setResult)
      .catch(() => setResult(null));
  };

  const count = result?.caught[critter.name] ?? 0;
  const lost = result === null || (!clicked && takenBy !== null);
  const label = result
    ? `${critter.name} caught${count > 1 ? ` ×${count}` : ""}`
    : lost
      ? takenBy
        ? `${takenBy} got it first`
        : "It got away"
      : null;

  return (
    <button
      ref={rootRef}
      type="button"
      className={`${s.critter} ${golden ? s.golden : ""}`}
      onClick={catchIt}
      aria-label={`Catch the ${critter.name.toLowerCase()}`}
      tabIndex={-1}
    >
      <span ref={bodyRef} className={s.body} style={critter.facing && route.leftward ? { scale: "-1 1" } : undefined}>
        <svg viewBox="0 0 32 32" width="30" height="30" overflow="visible" aria-hidden>
          {critter.art}
        </svg>
      </span>
      {label && <span className={s.label}>{label}</span>}
    </button>
  );
}

export function ThemeCritter({ theme }: { theme: SidebarThemeVariant }) {
  const { connection } = useSignalRConnection();
  const [spawn, setSpawn] = useState<{ id: string; golden: boolean } | null>(null);
  const critter = spawn?.golden ? GOLDEN_CRITTERS[theme] : CRITTERS[theme];
  const [taken, setTaken] = useState<{ spawnId: string; username: string } | null>(null);

  useEffect(() => {
    if (!connection) return;
    const onSpawned = (id: string, golden = false) => {
      if (!document.hidden) setSpawn({ id, golden });
    };
    const onCaught = (id: string, username: string) => setTaken({ spawnId: id, username });
    connection.on("CritterSpawned", onSpawned);
    connection.on("CritterCaught", onCaught);
    return () => {
      connection.off("CritterSpawned", onSpawned);
      connection.off("CritterCaught", onCaught);
    };
  }, [connection]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const test = (e: Event) => setSpawn({ id: `test-${Date.now()}`, golden: (e as CustomEvent).detail !== false });
    window.addEventListener("critter-test", test);
    return () => window.removeEventListener("critter-test", test);
  }, []);

  // Stable so the flight animation isn't restarted on re-render.
  const [end] = useState(() => () => setSpawn(null));

  if (!critter || spawn === null) return null;
  return (
    <>
      {spawn.golden && <div key={`flash-${spawn.id}`} className={s.goldFlash} />}
      <Visit
        key={spawn.id}
        critter={critter}
        golden={spawn.golden}
        spawnId={spawn.id}
        takenBy={taken?.spawnId === spawn.id ? taken.username : null}
        onDone={end}
      />
    </>
  );
}
