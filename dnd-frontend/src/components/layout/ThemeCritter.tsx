import { useEffect, useRef, useState } from "react";
import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { catchCritter, type CritterScore } from "@services/userService";
import { CRITTERS, type Critter, type Motion } from "./critters";
import s from "./ThemeCritter.module.css";

/**
 * The server spawns a critter for everyone at once (CritterSpawned); each player sees their theme's
 * critter cross the screen and the first click wins it (see the hidden /scoreboard page). It sits above
 * the page but only its own few pixels take clicks. The critters themselves are in critters.tsx.
 */

/** A critter's art at a given size (still uses its idle animation). */
export function CritterIcon({ name, size = 28 }: { name: string; size?: number }) {
  const critter = Object.values(CRITTERS).find((c) => c?.name === name);
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

interface VisitProps {
  critter: Critter;
  spawnId: string;
  takenBy: string | null;
  onDone: () => void;
}

function Visit({ critter, spawnId, takenBy, onDone }: VisitProps) {
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
    if (!gone) return;
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
  }, [gone, onDone]);

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
      className={s.critter}
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
  const critter = CRITTERS[theme];
  const { connection } = useSignalRConnection();
  const [spawnId, setSpawnId] = useState<string | null>(null);
  const [taken, setTaken] = useState<{ spawnId: string; username: string } | null>(null);

  useEffect(() => {
    if (!connection) return;
    const onSpawned = (id: string) => {
      if (!document.hidden) setSpawnId(id);
    };
    const onCaught = (id: string, username: string) => setTaken({ spawnId: id, username });
    connection.on("CritterSpawned", onSpawned);
    connection.on("CritterCaught", onCaught);
    return () => {
      connection.off("CritterSpawned", onSpawned);
      connection.off("CritterCaught", onCaught);
    };
  }, [connection]);

  // Stable so the flight animation isn't restarted on re-render.
  const [end] = useState(() => () => setSpawnId(null));

  if (!critter || spawnId === null) return null;
  return (
    <Visit
      key={spawnId}
      critter={critter}
      spawnId={spawnId}
      takenBy={taken?.spawnId === spawnId ? taken.username : null}
      onDone={end}
    />
  );
}
