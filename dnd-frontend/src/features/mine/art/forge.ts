import { type Grid, mix, raster, ramp } from "./pixel";

export const FORGE_W = 44;
export const FORGE_H = 40;

interface Look {
  stone: string;
  fire: [string, string, string];
  trim: string | null;
  rune: string | null;
  anvil: string;
}

export const FORGE_LEVELS: {
  level: number;
  name: string;
  perk: string;
  cost: string;
  look: Look;
}[] = [
  {
    level: 1,
    name: "Fieldstone Forge",
    perk: "Forges gear up to tier 2.",
    cost: "Free. It's where every delver starts.",
    look: { stone: "#7a7066", fire: ["#b8401c", "#ff8a2a", "#ffd23f"], trim: null, rune: null, anvil: "#5a5c66" },
  },
  {
    level: 2,
    name: "Mudbrick Hearth",
    perk: "Forges up to tier 3. A clay hood holds the heat in: ores cost 3% less.",
    cost: "Copper, Tin and Iron",
    look: { stone: "#9a6a48", fire: ["#c0481c", "#ff922a", "#ffdc50"], trim: null, rune: null, anvil: "#5a5c66" },
  },
  {
    level: 3,
    name: "Brick Kiln Forge",
    perk: "Forges up to tier 4. A tall chimney draws the fire up: 5% cheaper.",
    cost: "Iron, Silver and Tin",
    look: { stone: "#9c4a32", fire: ["#c8501c", "#ff9a2a", "#ffe066"], trim: null, rune: null, anvil: "#5f626e" },
  },
  {
    level: 4,
    name: "Iron-Banded Forge",
    perk: "Forges up to tier 5. Iron bands and a quench barrel: 8% cheaper.",
    cost: "Gold, Electrum and Silver",
    look: { stone: "#8a4632", fire: ["#d05a1c", "#ffa22a", "#ffe880"], trim: "#c8a050", rune: null, anvil: "#6a6e7c" },
  },
  {
    level: 5,
    name: "Dwarven Bellows Forge",
    perk: "Forges up to tier 6. Great bellows push it hotter: 10% cheaper.",
    cost: "Cold Iron, Platinum and Gold",
    look: { stone: "#5b5f6b", fire: ["#e07a1c", "#ffd23f", "#fff6c8"], trim: "#d8b060", rune: null, anvil: "#6f90ab" },
  },
  {
    level: 6,
    name: "Deepstone Foundry",
    perk: "Forges up to tier 7. A crucible hangs over the coals: 12% cheaper.",
    cost: "Darksteel, Fever Iron and Platinum",
    look: { stone: "#3e4250", fire: ["#e0601c", "#ffb02a", "#fff0a0"], trim: "#e8c060", rune: "#8a5bb5", anvil: "#4a5060" },
  },
  {
    level: 7,
    name: "Magma Forge",
    perk: "Forges up to tier 8. Fed by the Fever Vents: 15% cheaper.",
    cost: "Fever Iron, Byeshk and Hizagkuur",
    look: { stone: "#2a2230", fire: ["#a01808", "#ff4a1a", "#ffb347"], trim: "#ff7a2a", rune: "#ff5a2a", anvil: "#3a3440" },
  },
  {
    level: 8,
    name: "Flamewell Crucible",
    perk: "Forges up to tier 9. Fire pours from the chimney itself: 18% cheaper.",
    cost: "Flametouched Iron, Targath and Byeshk",
    look: { stone: "#3a1e1a", fire: ["#d0300c", "#ff8a1a", "#fff1b0"], trim: "#ffd23f", rune: "#ffb020", anvil: "#e0782a" },
  },
  {
    level: 9,
    name: "Starfall Forge",
    perk: "Forges up to tier 10, the only fire hot enough for starmetal. 20% cheaper.",
    cost: "Mithral, Arandur and Dlarun",
    look: { stone: "#2c3b8a", fire: ["#3d5bd6", "#9db6ff", "#ffffff"], trim: "#bfe6ff", rune: "#e8f0ff", anvil: "#b5d8ef" },
  },
  {
    level: 10,
    name: "Starheart Forge",
    perk: "A fallen star burns above the hearth. Everything costs 25% less.",
    cost: "Starmetal, Adamantine and Khyber Dragonshard",
    look: { stone: "#1f2448", fire: ["#7f9cff", "#d8e4ff", "#ffffff"], trim: "#fff3b0", rune: "#fff6c8", anvil: "#ffcf5a" },
  },
];

type Canvas = string[][];

const HX = 3;
const HW = 22;
const HY = 20;
const CT = 8;
const GROUND = FORGE_H - 1;
const MOUTH = { x: HX + 5, y: HY + 6, w: 12, h: 7 };
const CHIM = { x: HX + 6, w: 10 };

export const FORGE_SPOTS = { x: HX + HW / 2, chimney: CT, hood: HY - 4, mouth: MOUTH.y };

function sketch(lv: number, flick: boolean, t: number): Canvas {
  const g: Canvas = Array.from({ length: FORGE_H }, () => Array(FORGE_W).fill("."));
  const put = (x: number, y: number, ch: string) => {
    if (y >= 0 && y < FORGE_H && x >= 0 && x < FORGE_W) g[y][x] = ch;
  };
  const rect = (x: number, y: number, w: number, h: number, ch: string) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, ch);
  };
  const box = (x: number, y: number, w: number, h: number, fill: string) => {
    rect(x, y, w, h, "o");
    rect(x + 1, y + 1, w - 2, h - 2, fill);
  };
  const stamp = (x: number, y: number, rows: string[]) =>
    rows.forEach((r, j) => {
      [...r].forEach((ch, i) => {
        if (ch !== ".") put(x + i, y + j, ch);
      });
    });

  if (lv >= 3) {
    const top = CT;
    box(CHIM.x, top, CHIM.w, HY - top + 1, "m");
    for (let y = top + 1; y < HY; y++) {
      put(CHIM.x + 1, y, "l");
      put(CHIM.x + CHIM.w - 2, y, "d");
      if ((y - top) % 3 === 0) for (let x = CHIM.x + 1; x < CHIM.x + CHIM.w - 1; x++) put(x, y, "d");
      else put(CHIM.x + 3 + (((y - top) / 3) | 0) % 2 * 3, y, "d");
    }
    rect(CHIM.x - 1, top, CHIM.w + 2, 2, "o");
    rect(CHIM.x, top, CHIM.w, 1, "h");
    if (lv >= 6) rect(CHIM.x - 1, top + 1, CHIM.w + 2, 1, "t");
    if (lv >= 7)
      for (let y = top + 3; y < HY - 1; y += 4) {
        put(CHIM.x + 4, y, "g");
        put(CHIM.x + 5, y + 1, "G");
      }
  }
  if (lv >= 2) {
    box(HX + 3, HY - 4, HW - 6, 5, "m");
    rect(HX + 4, HY - 3, HW - 8, 1, "l");
    rect(HX + 4, HY - 1, HW - 8, 1, "d");
    if (lv >= 4) rect(HX + 3, HY - 2, HW - 6, 1, "a");
    if (lv >= 4) for (let x = HX + 5; x < HX + HW - 4; x += 4) put(x, HY - 2, "n");
  }

  box(HX, HY, HW, GROUND - HY + 1, "m");
  rect(HX + 1, HY + 1, HW - 2, 1, "h");
  rect(HX + 1, HY + 2, HW - 2, 1, "l");
  for (let y = HY + 3; y < GROUND; y++) {
    put(HX + 1, y, "l");
    put(HX + HW - 2, y, "d");
  }
  if (lv === 1) {
    for (const [x, w] of [
      [HX, 3],
      [HX + 7, 2],
      [HX + 15, 2],
      [HX + HW - 3, 3],
    ])
      rect(x, HY, w, 1, ".");
    put(HX, HY + 1, ".");
    put(HX + HW - 1, HY + 1, ".");
    rect(HX + 1, HY + 1, 2, 1, "o");
    rect(HX + HW - 3, HY + 1, 2, 1, "o");
    rect(HX + 7, HY + 1, 2, 1, "o");
    rect(HX + 15, HY + 1, 2, 1, "o");
    for (const [x, y, w] of [
      [HX + 2, HY + 4, 3],
      [HX + 16, HY + 5, 3],
      [HX + 3, HY + 14, 4],
      [HX + 12, HY + 15, 5],
      [HX + 8, HY + 17, 3],
      [HX + 17, HY + 13, 2],
    ])
      for (let i = 0; i < w; i++) {
        put(x + i, y, "l");
        put(x + i, y + 1, "d");
      }
  } else {
    for (let y = HY + 4; y < GROUND; y += 2) {
      for (let x = HX + 1; x < HX + HW - 1; x++) put(x, y, "d");
      for (let x = HX + 2 + ((y / 2) % 2) * 2; x < HX + HW - 1; x += 4) put(x, y + 1, "d");
    }
  }
  if (lv >= 4) {
    for (const y of [HY + 3, GROUND - 3]) {
      rect(HX, y, HW, 1, "a");
      for (let x = HX + 1; x < HX + HW; x += 3) put(x, y, "n");
    }
  }
  if (lv >= 6) {
    rect(HX, HY, HW, 1, "t");
    put(HX, HY + 1, "t");
    put(HX + HW - 1, HY + 1, "t");
  }

  const M = MOUTH;
  box(M.x - 1, M.y - 1, M.w + 2, M.h + 2, "c");
  if (lv >= 5) {
    rect(M.x - 1, M.y - 1, M.w + 2, 1, "t");
    put(M.x - 2, M.y, "t");
    put(M.x + M.w + 1, M.y, "t");
  }
  const flame = [
    ".c..F..c..F.",
    "cF.FfF.cF.fF",
    "FfFfYfFFfFYf",
    "fYfYYYfYfYYY",
    "YYYYYYYYYYYY",
    "fYYfYYYYfYYf",
    "cfccfcfcfccc",
  ];
  flame.forEach((r, j) => {
    [...r].forEach((ch, i) => {
      const s = flick ? (ch === "f" ? "F" : ch === "F" ? "f" : ch) : ch;
      if (s !== ".") put(M.x + i, M.y + j, s);
    });
  });
  if (lv >= 7) rect(M.x, M.y + M.h - 1, M.w, 1, "r");

  if (lv >= 6) stamp(M.x + 3, HY + 1, ["..tttt..", ".tgGGgt.", "..tggt..", "...tt..."]);

  if (lv >= 5) {
    const bx = HX + HW - 1;
    stamp(bx - 3, HY - 1, ["....okkKo.....", "..okkKkKkko...", "okKKkKkKkkKo..", ".okkkkkkkko...", "...ookkoo.....", "......w......."]);
    if (flick) stamp(bx - 3, HY - 1, ["....oKKko.....", "..okKKKkKKo..."]);
  }

  if (lv >= 7) {
    rect(HX - 2, GROUND, HW + 4, 1, "o");
    for (let x = HX - 1; x < HX + HW + 1; x++) put(x, GROUND, (x + t) % 5 === 0 ? "R" : "r");
  }

  if (lv >= 8) {
    const fl = [
      ["..F...f.F.", ".fF.Ff.fFf", "FfYfYYfYfF"],
      [".F..f...F.", "Ff.fF.Ff.f", "fFYfYfYYfF"],
    ][flick ? 1 : 0];
    stamp(CHIM.x, CT - 3, fl);
  }

  if (lv >= 9) {
    stamp(CHIM.x - 3, CT - 2, ["...s", "..sS", ".sSs", "sSs."]);
    stamp(CHIM.x + CHIM.w - 1, CT - 2, ["s...", "Ss..", "sSs.", ".sSs"]);
    for (const x of [HX + 2, HX + HW - 4]) stamp(x, GROUND - 5, [".s.", "sSs", "sSs"]);
  }

  const AX = HX + HW + 3;
  const AY = GROUND - 9;
  if (lv <= 2) {
    stamp(AX, AY, [
      "..............",
      "..............",
      "..............",
      "oooooooooooo..",
      "onnnnnnnnnAAo.",
      ".oaAAAAAAAaoo.",
      "...oaAAao.....",
      "..okkKkkko....",
      "..okKkkKko....",
      ".ookkkkkkoo...",
    ]);
  } else {
    stamp(AX, AY, [
      "..............",
      "..............",
      ".oooooooooooo.",
      "onnnnnnnnnnAAo",
      "oAAAAAAAAAAAoo",
      ".oaAAAAAAAao..",
      "...oaAAAao....",
      "....oaAao.....",
      "...oaaAaao....",
      "..oooooooooo..",
    ]);
  }
  if (lv >= 6) rect(AX + 1, AY + 3, 10, 1, "t");
  if (lv >= 4) {
    const qx = AX - 3;
    stamp(qx, GROUND - 6, [".ooo.", "owqwo", "oaaao", "okKko", "oaaao", "okKko", ".ooo."]);
  }
  if (lv >= 3) stamp(AX + 2, AY - 1, ["..k", ".k.", "a.."]);

  if (lv >= 10) {
    const bob = Math.round(Math.sin(t / 3) * 1);
    stamp(CHIM.x + 2, bob, ["...S...", "..sSs..", "SsSSSsS", ".sSSSs.", "..sSs..", ".s...s."]);
    for (const [x, y] of [
      [HX + 1, HY - 3],
      [HX + HW - 2, HY - 5],
      [AX + 12, AY - 2],
    ])
      put(x, y + ((t + x) % 4 < 2 ? 0 : 1), "S");
  }
  return g;
}

const palette = (lv: number, flick: boolean) => {
  const L = FORGE_LEVELS[lv - 1].look;
  const r = ramp(L.stone);
  const [f0, f1, f2] = L.fire;
  const an = ramp(L.anvil);
  const trim = L.trim ?? r.l;
  const rune = L.rune ?? r.l;
  return {
    ...r,
    f: flick ? f1 : f0,
    F: flick ? f0 : f1,
    Y: f2,
    c: mix(f0, "#000000", 0.55),
    a: an.d,
    A: an.m,
    n: an.h,
    k: "#5a3a22",
    K: "#7d5433",
    w: "#6b4423",
    q: "#3d6a86",
    t: trim,
    g: rune,
    G: mix(rune, "#ffffff", 0.6),
    r: lv >= 7 ? "#c8381c" : f0,
    R: "#ffb347",
    s: "#9db6ff",
    S: "#ffffff",
  };
};

export const forgeSprite = (lv: number, flick = false, t = 0): Grid => {
  const level = Math.max(1, Math.min(FORGE_LEVELS.length, lv));
  return raster(
    sketch(level, flick, t).map((r) => r.join("")),
    palette(level, flick),
  );
};
