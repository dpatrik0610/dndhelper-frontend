import { useMemo, type CSSProperties } from "react";
import { seededRandom } from "@utils/seededRandom";
import { pixels, type Palette } from "@utils/pixelArt";
import { BOTTLE, BROOM, CANDLE, MOUSE, POTION_COLOURS, SKULL, SPELLBOOK, type Sprite } from "./librarySprites";
import type { BackdropProps } from "./index";

/**
 * Wizard's Library: a 384×216 pixel-art room scaled up crisply to cover the screen. The room is
 * painted once (seeded, so identical every load): an arched moonlit window, a desk and a chair on the left,
 * red velvet curtains and a fringed valance framing the room, floor-to-ceiling shelves of books,
 * potions and skulls, a ladder and a rug. Animated sprites on top: the mouse wizard on its chair
 * (blinks, casts sparkles at its book), floating candles, a levitating spellbook turning its own
 * pages, drifting magic motes and an enchanted broom flying across.
 * The middle of the screen sits behind the app's panels, so the character pieces are at the sides.
 * Styles in styles/themes/library.css.
 */

const W = 384;
const H = 216;

type Ctx = CanvasRenderingContext2D;

function stamp(ctx: Ctx, rows: string[], palette: Palette, x: number, y: number) {
  for (const p of pixels(rows, palette)) {
    ctx.fillStyle = p.color;
    ctx.fillRect(x + p.x, y + p.y, 1, 1);
  }
}

/** All frames of a sprite side by side, as an image URL. */
function strip({ frames, palette }: Sprite) {
  const w = frames[0][0].length;
  const h = frames[0].length;
  const canvas = document.createElement("canvas");
  canvas.width = w * frames.length;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) frames.forEach((rows, i) => stamp(ctx, rows, palette, i * w, 0));
  return { url: canvas.toDataURL(), w, h, n: frames.length };
}

type Strip = ReturnType<typeof strip>;

const BOOK_COLOURS = [
  ["#4f1216", "#7a1f24", "#a8323a"],
  ["#1d3a21", "#2f5a34", "#447a4a"],
  ["#18284a", "#283f6e", "#3a5a99"],
  ["#3b2416", "#5a3820", "#7a4e2c"],
  ["#2f1a40", "#4b2a63", "#6a3f8a"],
  ["#8a6f42", "#b89a62", "#d8bf8a"],
];
const GOLD = "#e0b35a";
const GOLD_DARK = "#9c7230";

function paintRoom(ctx: Ctx) {
  const r = seededRandom(1347);
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };
  const pick = <T,>(list: T[]) => list[Math.floor(r() * list.length)];

  // Wall: dark wood panelling, ceiling beam
  rect(0, 0, W, H, "#1c110a");
  for (let x = 0; x < W; x += 12) {
    rect(x, 0, 1, H, "#140c07");
    rect(x + 6, 0, 1, H, "#24160d");
  }
  rect(0, 0, W, 5, "#2e1b0f");
  rect(0, 5, W, 1, "#3d2414");
  rect(0, 6, W, 1, "#0f0805");

  // Bookshelves across the middle and right
  const shelfL = 112;
  const shelfR = 346;
  rect(shelfL, 22, shelfR - shelfL, 164, "#0e0805");
  const boards = [22, 54, 86, 118, 150, 182];
  const uprights = [shelfL, 188, 264, shelfR - 4];
  for (let i = 0; i < boards.length - 1; i++) {
    const floor = boards[i + 1];
    for (let u = 0; u < uprights.length - 1; u++) {
      const x1 = uprights[u + 1];
      let x = uprights[u] + 4;
      while (x < x1 - 2) {
        const roll = r();
        const room = x1 - x;
        if (roll < 0.06) {
          x += 3 + Math.floor(r() * 4); // gap
        } else if (roll < 0.11 && room > 7) {
          stamp(ctx, BOTTLE.frames[0], { ...BOTTLE.palette, L: pick(POTION_COLOURS) }, x + 1, floor - 7);
          x += 7;
        } else if (roll < 0.14 && room > 8) {
          stamp(ctx, SKULL.frames[0], SKULL.palette, x + 1, floor - 5);
          x += 8;
        } else if (roll < 0.19 && room > 16) {
          // books lying flat in a pile
          for (let k = 0; k < 3; k++) {
            const [dark, mid, light] = pick(BOOK_COLOURS);
            const bx = x + 1 + Math.floor(r() * 2);
            const by = floor - 4 * (k + 1);
            rect(bx, by, 13, 4, mid);
            rect(bx, by, 13, 1, light);
            rect(bx, by + 3, 13, 1, dark);
            rect(bx + 12, by + 1, 1, 2, "#d8c08a");
          }
          x += 16;
        } else {
          // a standing book
          const [dark, mid, light] = pick(BOOK_COLOURS);
          const w = Math.min(3 + Math.floor(r() * 4), room);
          const h = 14 + Math.floor(r() * 11);
          const top = floor - h;
          rect(x, top, w, h, mid);
          rect(x, top, 1, h, light);
          rect(x + w - 1, top, 1, h, dark);
          rect(x, top, w, 1, dark);
          if (w > 2 && r() < 0.6) {
            rect(x + 1, top + 3, w - 2, 1, GOLD_DARK);
            rect(x + 1, floor - 4, w - 2, 1, GOLD_DARK);
          }
          if (w > 4 && r() < 0.4) rect(x + 1, top + Math.floor(h / 2) - 1, w - 2, 2, "#d8c08a");
          x += w;
        }
      }
    }
  }
  for (const by of boards) {
    rect(shelfL, by, shelfR - shelfL, 4, "#4a2d19");
    rect(shelfL, by, shelfR - shelfL, 1, "#6b4426");
    rect(shelfL, by + 3, shelfR - shelfL, 1, "#2a180d");
  }
  for (const ux of uprights) {
    rect(ux, 22, 4, 164, "#3b2416");
    rect(ux, 22, 1, 164, "#5a3820");
  }
  rect(shelfL - 2, 18, shelfR - shelfL + 4, 4, "#5a3820");
  rect(shelfL - 2, 18, shelfR - shelfL + 4, 1, "#7a4e2c");

  // Ladder leaning on the right shelves
  for (const lx of [296, 310]) {
    rect(lx, 26, 2, 160, "#7a4e2c");
    rect(lx + 1, 26, 1, 160, "#4a2d19");
  }
  for (let y = 34; y < 182; y += 10) {
    rect(296, y, 16, 2, "#6b4426");
    rect(296, y + 1, 16, 1, "#3b2416");
  }
  rect(295, 24, 4, 2, GOLD_DARK);
  rect(309, 24, 4, 2, GOLD_DARK);

  // Arched window with a moonlit night sky
  const wx = 80;
  const wTop = 58;
  const wr = 28;
  const wBottom = 140;
  const arch = (rad: number, fill: (x: number, y: number) => string) => {
    for (let y = wTop - rad; y < wBottom; y++) {
      for (let x = wx - rad; x < wx + rad; x++) {
        if (y >= wTop || (x - wx + 0.5) ** 2 + (y - wTop + 0.5) ** 2 < rad * rad) rect(x, y, 1, 1, fill(x, y));
      }
    }
  };
  arch(wr + 4, (x, y) => ((x + y) % 7 === 0 ? "#4a2d19" : "#5a3820"));
  arch(wr, (x, y) => {
    const t = (y - (wTop - wr)) / (wBottom - wTop + wr) + ((x + y) % 2) * 0.04; // dithered bands
    return t < 0.35 ? "#141638" : t < 0.7 ? "#1f2457" : "#2d3170";
  });
  for (let i = 0; i < 26; i++) {
    const x = wx - wr + Math.floor(r() * wr * 2);
    const y = wTop - wr + Math.floor(r() * (wBottom - wTop + wr));
    if (y >= wTop || (x - wx) ** 2 + (y - wTop) ** 2 < (wr - 2) ** 2) rect(x, y, 1, 1, r() < 0.3 ? "#f6f1d0" : "#8f95c8");
  }
  const mx = wx + 11;
  const my = wTop - 8;
  for (let y = -8; y <= 8; y++) {
    for (let x = -8; x <= 8; x++) {
      if (x * x + y * y <= 64) rect(mx + x, my + y, 1, 1, x * x + y * y > 49 ? "#d8cba0" : "#f2e8c4");
    }
  }
  rect(mx - 3, my - 2, 3, 2, "#d8cba0");
  rect(mx + 2, my + 3, 2, 2, "#d8cba0");
  rect(mx + 3, my - 4, 1, 1, "#d8cba0");
  // mullions + sill
  rect(wx - 1, wTop - wr, 2, wBottom - wTop + wr, "#4a2d19");
  rect(wx - wr, 98, wr * 2, 2, "#4a2d19");
  rect(wx - 1, wTop - wr, 1, wBottom - wTop + wr, "#6b4426");
  rect(wx - wr, 98, wr * 2, 1, "#6b4426");
  rect(wx - wr - 6, wBottom, wr * 2 + 12, 4, "#5a3820");
  rect(wx - wr - 6, wBottom, wr * 2 + 12, 1, "#7a4e2c");
  rect(wx - wr - 6, wBottom + 4, wr * 2 + 12, 1, "#0f0805");

  // Floor planks + rug
  rect(0, 186, W, 30, "#2e1b0f");
  for (let y = 186; y < H; y += 6) {
    rect(0, y, W, 1, "#1a0f08");
    rect(0, y + 1, W, 1, "#3d2414");
    for (let x = (y * 7) % 32; x < W; x += 32) rect(x, y + 1, 1, 5, "#1a0f08");
  }
  rect(128, 194, 176, 18, GOLD_DARK);
  rect(130, 196, 172, 14, "#7a1f24");
  for (let y = 198; y < 208; y++) {
    for (let x = 132; x < 300; x++) {
      if ((x + y) % 8 === 0 || (x - y + 400) % 8 === 0) rect(x, y, 1, 1, "#a8323a");
    }
  }
  rect(131, 197, 170, 1, "#4f1216");
  rect(131, 208, 170, 1, "#4f1216");

  // Desk under the window: open book, candle dish, inkwell + quill (the flame is a sprite)
  rect(60, 164, 84, 2, "#7a4e2c");
  rect(60, 166, 84, 4, "#5a3820");
  rect(60, 170, 84, 1, "#2a180d");
  rect(64, 171, 76, 6, "#4a2d19");
  rect(64, 171, 76, 1, "#3b2416");
  rect(100, 173, 4, 2, GOLD);
  rect(64, 177, 4, 9, "#3b2416");
  rect(136, 177, 4, 9, "#3b2416");
  rect(62, 163, 30, 2, "#7a1f24");
  rect(63, 158, 13, 5, "#f1e3c2");
  rect(77, 158, 13, 5, "#f1e3c2");
  rect(76, 158, 1, 5, "#cdb48a");
  rect(63, 158, 13, 1, "#cdb48a");
  rect(77, 158, 13, 1, "#cdb48a");
  for (const ly of [159, 161]) {
    for (let x = 64; x < 89; x++) if (x !== 76 && x !== 77 && r() < 0.7) rect(x, ly, 1, 1, "#8a6f42");
  }
  rect(98, 163, 9, 1, GOLD_DARK);
  rect(99, 162, 7, 1, GOLD);
  rect(112, 159, 6, 5, "#1c1c28");
  rect(113, 158, 4, 1, "#33334a");
  rect(113, 160, 1, 2, "#5a5a7a");
  for (let k = 0; k < 12; k++) {
    const qx = Math.round(116 - 0.55 * k);
    rect(qx, 157 - k, 1, 1, "#f1e6cf");
    if (k > 3) rect(qx - 1, 157 - k, 1, 1, "#c9b896");
  }

  // The mouse's chair: high back with a buttoned burgundy cushion and a gold finial
  rect(29, 136, 3, 50, "#5a3820");
  rect(29, 136, 1, 50, "#7a4e2c");
  rect(29, 132, 3, 1, GOLD);
  rect(28, 133, 5, 2, GOLD);
  rect(29, 135, 3, 1, GOLD_DARK);
  rect(32, 140, 4, 24, "#7a1f2b");
  rect(32, 140, 1, 24, "#a3303d");
  rect(35, 140, 1, 24, "#4f1219");
  for (const by of [146, 153, 160]) rect(33, by, 1, 1, GOLD);
  rect(29, 164, 28, 3, "#7a1f2b");
  rect(29, 164, 28, 1, "#a3303d");
  rect(29, 167, 28, 3, "#5a3820");
  rect(29, 167, 28, 1, "#7a4e2c");
  rect(29, 169, 28, 1, "#2a180d");
  rect(53, 170, 3, 16, "#5a3820");
  rect(53, 170, 1, 16, "#7a4e2c");
  rect(32, 179, 21, 2, "#3b2416");

  // A pile of big books on the floor by the ladder
  for (let k = 0; k < 3; k++) {
    const [dark, mid, light] = BOOK_COLOURS[(k * 2 + 1) % BOOK_COLOURS.length];
    const by = 180 - k * 6;
    const bx = 318 + (k % 2) * 2;
    rect(bx, by, 22, 6, mid);
    rect(bx, by, 22, 1, light);
    rect(bx, by + 5, 22, 1, dark);
    rect(bx + 20, by + 1, 2, 4, "#d8c08a");
  }

  // Red velvet curtains, tied back with gold rope, framing the room
  const curtainWidth = (y: number) => (y < 112 ? 38 - 24 * ((y - 8) / 104) ** 1.8 : 14 + 12 * ((y - 112) / 74) ** 0.7);
  for (let y = 8; y < 186; y++) {
    const cw = Math.floor(curtainWidth(y));
    for (let x = 0; x < cw; x++) {
      const u = (x / cw) * 6 + 0.15 * Math.sin(y * 0.08);
      const f = u - Math.floor(u);
      let c = f < 0.12 ? "#d4484f" : f < 0.5 ? "#a8262f" : f < 0.88 ? "#6e1620" : "#a8262f";
      if (x === cw - 1) c = "#3d0b12";
      if (y >= 183) c = y === 183 ? GOLD_DARK : GOLD;
      rect(x, y, 1, 1, c);
      rect(W - 1 - x, y, 1, 1, c);
    }
  }
  for (let y = 109; y < 113; y++) {
    const cw = Math.floor(curtainWidth(y)) + 1;
    for (let x = 0; x < cw; x++) {
      const c = (x + y) % 3 === 0 ? GOLD_DARK : GOLD;
      rect(x, y, 1, 1, c);
      rect(W - 1 - x, y, 1, 1, c);
    }
  }
  for (const tx of [13, W - 16]) {
    rect(tx, 113, 3, 3, GOLD);
    rect(tx, 116, 1, 6, GOLD_DARK);
    rect(tx + 1, 116, 1, 7, GOLD);
    rect(tx + 2, 116, 1, 6, GOLD_DARK);
  }

  // Valance across the top: folded velvet with a scalloped, gold-fringed hem
  rect(0, 6, W, 2, GOLD_DARK);
  for (let x = 0; x < W; x++) {
    const bottom = 18 + Math.round(3 * Math.sin((Math.PI * (x % 16)) / 16));
    const fold = x % 8;
    const c = fold === 0 ? "#d4484f" : fold < 4 ? "#a8262f" : fold < 7 ? "#6e1620" : "#a8262f";
    rect(x, 8, 1, bottom - 8, c);
    rect(x, bottom, 1, 1, GOLD);
    if (x % 2 === 0) rect(x, bottom + 1, 1, 1, GOLD_DARK);
  }
}

/** Places a pixel-art element at (x, y) in room pixels. */
const at = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `calc(${x} * var(--px))`,
  top: `calc(${y} * var(--px))`,
  width: `calc(${w} * var(--px))`,
  height: `calc(${h} * var(--px))`,
});

/** A sprite's frame strip behind a one-frame window, stepped through by CSS (wl-frames). */
function SpriteImg({ s, duration }: { s: Strip; duration?: string }) {
  return (
    <div className="wl-clip">
      <img
        src={s.url}
        alt=""
        className={s.n > 1 ? "wl-frames" : undefined}
        style={{ width: `${s.n * 100}%`, ...({ "--n": s.n, "--dur": duration } as CSSProperties) }}
      />
    </div>
  );
}

const MOTE_COLOURS = ["#b48cff", "#7fe3ff", "#ffe08a"];

const FLOATING_CANDLES = [
  { x: 136, y: 40, bob: "3.1s", flick: "0.55s" },
  { x: 168, y: 30, bob: "3.7s", flick: "0.6s" },
  { x: 214, y: 44, bob: "2.9s", flick: "0.5s" },
  { x: 246, y: 32, bob: "3.4s", flick: "0.65s" },
  { x: 282, y: 50, bob: "3.9s", flick: "0.58s" },
  { x: 326, y: 38, bob: "3.2s", flick: "0.62s" },
];

export function LibraryBackdrop({ isStatic = false }: BackdropProps) {
  const art = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (ctx) paintRoom(ctx);
    const r = seededRandom(77);
    const motes = Array.from({ length: 16 }, () => ({
      x: 8 + Math.floor(r() * 368),
      y: 30 + Math.floor(r() * 150),
      color: MOTE_COLOURS[Math.floor(r() * MOTE_COLOURS.length)],
      duration: 5 + r() * 5,
      delay: r() * 8,
    }));
    return { room: canvas.toDataURL(), mouse: strip(MOUSE), broom: strip(BROOM), candle: strip(CANDLE), book: strip(SPELLBOOK), motes };
  }, []);

  return (
    <div className={`theme-scene wl-scene ${isStatic ? "theme-scene--static" : ""}`}>
      <div className="wl-stage">
        <img className="wl-room" src={art.room} alt="" />

        {FLOATING_CANDLES.map((c, i) => (
          <div key={i} className="wl-candle" style={{ ...at(c.x, c.y, 5, 13), animationDuration: c.bob, animationDelay: `-${i * 0.7}s` }}>
            <span className="wl-glow" />
            <SpriteImg s={art.candle} duration={c.flick} />
          </div>
        ))}

        <div className="wl-sprite wl-desk-candle" style={at(100, 150, 5, 13)}>
          <span className="wl-glow wl-glow--big" />
          <SpriteImg s={art.candle} duration="0.6s" />
        </div>

        <div className="wl-sprite" style={at(31, 134, 28, 38)}>
          <SpriteImg s={art.mouse} duration="6s" />
        </div>

        <div className="wl-candle wl-spellbook" style={at(268, 120, 16, 12)}>
          <span className="wl-glow wl-glow--magic" />
          <SpriteImg s={art.book} duration="5s" />
        </div>

        {art.motes.map((m, i) => (
          <span
            key={i}
            className="wl-mote"
            style={{ ...at(m.x, m.y, 1, 1), color: m.color, animationDuration: `${m.duration}s`, animationDelay: `-${m.delay}s` }}
          />
        ))}

        <div className="wl-broom" style={at(0, 52, 28, 8)}>
          <div className="wl-broom-bob">
            <span className="wl-spark" style={at(-4, 3, 1, 1)} />
            <span className="wl-spark" style={{ ...at(-9, 5, 1, 1), animationDelay: "0.3s" }} />
            <span className="wl-spark" style={{ ...at(-14, 2, 1, 1), animationDelay: "0.6s" }} />
            <SpriteImg s={art.broom} duration="0.3s" />
          </div>
        </div>

        <div className="wl-light" />
      </div>
    </div>
  );
}
