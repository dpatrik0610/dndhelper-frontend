import { type CSSProperties, type RefObject, useEffect, useRef, useState } from "react";
import { Tooltip } from "@mantine/core";
import { type Grid, raster } from "./art/pixel";
import { type EffectKey, effects, type Game } from "./engine";
import { Sprite } from "./Sprite";
import styles from "./Mine.module.css";

const ART: Record<EffectKey, { name: string; does: string; color: string; grid: Grid }> = {
  poison: {
    name: "Poisoned",
    does: "Venom in your blood. You lose health and nothing heals you until it wears off.",
    color: "#7ee05a",
    grid: raster(["...x....", "..xgx...", ".xgGgx..", ".xgggx..", "xgGgggx.", "xgggggx.", ".xgggx..", "..xxx..."], {
      x: "#14240e",
      g: "#5cbf3a",
      G: "#c8ff9a",
    }),
  },
  burn: {
    name: "Burning",
    does: "You're on fire and lose health every second.",
    color: "#ff8a2a",
    grid: raster(["...x....", "..xox...", "..xoox..", ".xoOox..", ".xoOOox.", "xoOYOox.", "xoOYYOx.", ".xxxxx.."], {
      x: "#3a160a",
      o: "#e0501a",
      O: "#ffa040",
      Y: "#fff3a0",
    }),
  },
  slow: {
    name: "Slowed",
    does: "Webbed or frozen. Your swings come slower.",
    color: "#9fe6ff",
    grid: raster(["...b....", ".b.b.b..", "..bbb...", "bbbWbbb.", "..bbb...", ".b.b.b..", "...b....", "........"], {
      b: "#7cc8e8",
      W: "#ffffff",
    }),
  },
  root: {
    name: "Engulfed",
    does: "Stuck inside the cube. You can't move until it lets go.",
    color: "#9be07a",
    grid: raster(["........", "..xxxx..", ".xsssSx.", "xsSssssx", "xssssssx", "xssssssx", ".xxxxxx.", "........"], {
      x: "#1e3a18",
      s: "#6ab84a",
      S: "#d4ffb0",
    }),
  },
  dim: {
    name: "Lantern guttered",
    does: "A draft choked your lantern. You see less until it flares back up.",
    color: "#c9b8ff",
    grid: raster(["..xxxx..", "..x..x..", ".xxxxxx.", ".xyYYyx.", ".xyYYyx.", ".xyyyyx.", ".xxxxxx.", "........"], {
      x: "#2a2238",
      y: "#6a5a90",
      Y: "#c9b8ff",
    }),
  },
};

type Shown = { key: EffectKey; left: number; total: number };

export function Effects({ gameRef }: { gameRef: RefObject<Game | null> }) {
  const [shown, setShown] = useState<Shown[]>([]);
  const totals = useRef(new Map<EffectKey, number>());

  useEffect(() => {
    const id = setInterval(() => {
      const g = gameRef.current;
      const now = g ? effects(g) : [];
      const seen = totals.current;
      for (const k of [...seen.keys()]) if (!now.some((e) => e.key === k)) seen.delete(k);
      const next = now.map(({ key, left }) => {
        const prev = seen.get(key) ?? 0;
        const total = left > prev ? left : prev;
        seen.set(key, total);
        return { key, left, total };
      });
      setShown((cur) => (cur.length === 0 && next.length === 0 ? cur : next));
    }, 100);
    return () => clearInterval(id);
  }, [gameRef]);

  if (!shown.length) return null;
  return (
    <div className={styles.effects}>
      {shown.map(({ key, left, total }) => {
        const a = ART[key];
        return (
          <Tooltip
            key={key}
            multiline
            w={220}
            withArrow
            position="top"
            label={
              <>
                <b>{a.name}</b> · {a.does}
              </>
            }
          >
            <div
              className={styles.effect}
              style={{ "--fx": a.color } as CSSProperties}
              aria-label={`${a.name}, ${Math.ceil(left / 1000)} seconds left`}
            >
              <div className={styles.effectLeft} style={{ height: `${(1 - left / total) * 100}%` }} />
              <Sprite grid={a.grid} scale={2} />
              <span className={styles.effectTime}>{Math.ceil(left / 1000)}</span>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}
