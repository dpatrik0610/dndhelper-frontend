import { editPixels, type Palette } from "@utils/pixelArt";

/**
 * Wizard's Library pixel art (see utils/pixelArt.ts for the format). Used by LibraryBackdrop and,
 * for the scroll, by ThemeCritter. librarySprites.check.ts verifies every sprite is well formed.
 */

export interface Sprite {
  frames: string[][];
  palette: Palette;
}

/* The mouse wizard: sits upright on its chair facing right, legs dangling, wand pointed at the open book */
const MOUSE_IDLE = [
  "......KUUK..................",
  ".......KUVK.................",
  ".......KUUVK................",
  "......KUUUVK................",
  "..KKKKKUUUUVK...............",
  ".KMMMMKUUUUUVK..............",
  "KMMNNMUUUUYUUVK.............",
  "MMNNNNUUUYYYUUVK............",
  "MNNNNUUUUUYUUUUVK...........",
  "MNNnNUUUUUUUUUUUVK..........",
  "MMNNnUUUYUUUUYUUUVK.........",
  "KMMMUUUUUUUUUUUUUUVKKKK.....",
  ".KUUUUUUUUUUUUUUUUUUUUUK....",
  "KuuuuuuuuuuuuuuuuuuuuuuuK...",
  ".KKKMMMMMMMMMMMMMKKKKKKK....",
  "...KMMMMMMMMMLLWELLLLKK..HH.",
  "...KMMMMMMMMLLLLELLLLNNKH...",
  "...KMMMMMMMMLLLLLLLLLLNK....",
  "....KMMMMMMMMLLLLLLLLKK.H...",
  ".....KmmmmmmmmMKKKKKK....HH.",
  "....KuUUUMMMYYUUK...........",
  "...KUuUUUUUUUVVUUK..........",
  "...KUuUUUUVUUUUVVKKKK.......",
  "...KUuUUUUVUUUUUUVVNNK......",
  "...KUuUUUUVUUUUUUUUNKTT.....",
  "...KUuUUUUVUUUUUUKKK...TT...",
  "...KUuUUUUVUUUUUUKK......TT.",
  "...KUuUUUUVUUUUUUMMK........",
  "..KNYYYYYYYYYYYYYMMK........",
  ".KNKKKKKKKUKKKmmKMMK........",
  ".KNK......K..KmmKMMK........",
  ".KNK.........KmmKMMK........",
  ".KNK.........KnnnMMKKK......",
  "..KNK........KnnnNNNNNK.....",
  ".KKNK.........KKKNNNNnK.....",
  "KNNK.............KKKKK......",
  ".KK.........................",
  "............................",
];
const MOUSE_BLINK = editPixels(MOUSE_IDLE, [[15, 15, "L"], [16, 15, "L"], [15, 16, "K"], [16, 16, "K"]]);
const MOUSE_CAST_1 = editPixels(MOUSE_IDLE, [[26, 26, "Y"], [27, 25, "X"], [27, 27, "X"], [25, 27, "X"]]);
const MOUSE_CAST_2 = editPixels(MOUSE_IDLE, [[26, 26, "Y"], [27, 26, "X"], [26, 28, "X"], [24, 27, "X"]]);

export const MOUSE: Sprite = {
  // idle, idle, blink, idle, cast, cast, idle, idle (played at a steady rate, so repeats = holds)
  frames: [MOUSE_IDLE, MOUSE_IDLE, MOUSE_BLINK, MOUSE_IDLE, MOUSE_CAST_1, MOUSE_CAST_2, MOUSE_IDLE, MOUSE_IDLE],
  palette: {
    K: "#1b1020", // outline
    U: "#3c3a8f", // hat + cloak
    u: "#26245e",
    V: "#5c5ac0",
    Y: "#f2c94c", // stars, clasp, glowing wand tip
    M: "#9a8f86", // fur
    m: "#6d635c",
    L: "#c4bbb2",
    N: "#e89aa8", // ears, nose, paw, tail
    n: "#b8687a",
    E: "#0b0b0b", // eye, with a white glint
    W: "#ffffff",
    H: "#d9d2c8", // whiskers
    T: "#6b4423", // wand
    X: "#fff6c2", // sparkles
  },
};

/* The enchanted broom, flying right */
export const BROOM: Sprite = {
  frames: [
    [
      "..yy........................",
      ".yYYyy......................",
      "yYYYYYyyKKKKKKKKKKKKKKKKKKK.",
      "YYYYYYYYRRwwwwwwwwwwwwwwwwwK",
      "yYYYYYYYRRbbbbbbbbbbbbbbbbbK",
      "yyYYYYyyKKKKKKKKKKKKKKKKKKK.",
      ".yyYyy......................",
      "..y..y......................",
    ],
    [
      "...yy.......................",
      "..yYYy......................",
      "yyYYYYyyKKKKKKKKKKKKKKKKKKK.",
      "YYYYYYYYRRwwwwwwwwwwwwwwwwwK",
      "YyYYYYYYRRbbbbbbbbbbbbbbbbbK",
      "yYYYYYyyKKKKKKKKKKKKKKKKKKK.",
      "..yYyyy.....................",
      ".y..y.......................",
    ],
  ],
  palette: { Y: "#e8b84a", y: "#a8742a", R: "#a8262f", w: "#8a5a32", b: "#5a3820", K: "#2a1a10" },
};

/* A candle with a three-frame flicker */
const CANDLE_BODY = ["..K..", ".WWW.", "WWWw.", "WWWw.", ".WWw.", ".WWw.", ".WWw.", ".WWw.", ".WWw.", ".www."];
const flame = (top: string[]) => [...top, ...CANDLE_BODY];

export const CANDLE: Sprite = {
  frames: [
    flame(["..O..", ".OFO.", ".OYO."]),
    flame([".O...", ".OFO.", "..YO."]),
    flame(["...O.", ".OFO.", ".OY.."]),
  ],
  palette: { O: "#ff9a3c", F: "#ffd27a", Y: "#fff6d6", K: "#2a1a10", W: "#f1e6cf", w: "#c9b896" },
};

/* The levitating spellbook */
const BOOK_FLAT = [
  "................",
  "................",
  "................",
  "................",
  ".KK..........KK.",
  "KPPKK......KKPPK",
  "KPRRPK....KPRRPK",
  "KPPRRRKKKKRRRPPK",
  "KPPPPPPppPPPPPPK",
  "KCCCCCCccCCCCCCK",
  ".KKKKKKKKKKKKKK.",
  "................",
];
const BOOK_LIFT = [
  "................",
  "................",
  "............K...",
  "...........KPK..",
  ".KK.......KPPKK.",
  "KPPKK....KPPKPPK",
  "KPRRPK..KPPPRRPK",
  "KPPRRRKKKPRRRPPK",
  "KPPPPPPppPPPPPPK",
  "KCCCCCCccCCCCCCK",
  ".KKKKKKKKKKKKKK.",
  "................",
];
const BOOK_UP = [
  "................",
  ".......KK.......",
  "......KPPK......",
  "......KPPK......",
  ".KK...KPPK...KK.",
  "KPPKK.KPPK.KKPPK",
  "KPRRPKKPPKKPRRPK",
  "KPPRRRKPPKRRRPPK",
  "KPPPPPPppPPPPPPK",
  "KCCCCCCccCCCCCCK",
  ".KKKKKKKKKKKKKK.",
  "................",
];
const BOOK_OVER = [
  "................",
  "................",
  "...K............",
  "..KPK...........",
  ".KKPPK.......KK.",
  "KPPKPPK....KKPPK",
  "KPRRPPPK..KPRRPK",
  "KPPRRRPKKKRRRPPK",
  "KPPPPPPppPPPPPPK",
  "KCCCCCCccCCCCCCK",
  ".KKKKKKKKKKKKKK.",
  "................",
];

/* Pages turning by themselves: flat, lifting, upright, falling over */
export const SPELLBOOK: Sprite = {
  frames: [
    BOOK_FLAT,
    BOOK_FLAT,
    BOOK_FLAT,
    BOOK_LIFT,
    BOOK_UP,
    BOOK_OVER,
    BOOK_FLAT,
    BOOK_FLAT,
  ],
  palette: { K: "#1a0f1f", P: "#fff1cf", p: "#d9c38f", R: "#9d6bff", C: "#4b2a63", c: "#2f1a40" },
};

/* Shelf clutter; L is the potion colour, swapped per bottle */
export const BOTTLE: Sprite = {
  frames: [[".KCK.", ".KGK.", "KGGGK", "KWLLK", "KLLLK", "KLLLK", ".KKK."]],
  palette: { K: "#2a2a33", C: "#a8742a", G: "#9fb7bb", W: "#e8f4f4", L: "#4fbf7a" },
};

export const POTION_COLOURS = ["#4fbf7a", "#9b5fd1", "#d14a52", "#4f8fd1", "#e8b84a"];

export const SKULL: Sprite = {
  frames: [[".BBBB.", "BBBBBb", "BEbBEb", ".BBEB.", ".bBbB."]],
  palette: { B: "#e6dcc0", b: "#b8ab8a", E: "#1a0f0a" },
};

/* The flying-scroll critter */
export const SCROLL: Sprite = {
  frames: [
    [
      ".KK..........KK.",
      "KPpK........KPpK",
      "KPpKKKKKKKKKKPpK",
      "KPpKPPPPPPPPKPpK",
      "KPpKPkkkkkPPKPpK",
      "KPpKPPPPPPPPKPpK",
      "KPpKPkkkkPPPKPpK",
      "KPpKPPPPPPPPKPpK",
      "KPpKPkkkPPRPKPpK",
      "KPpKKKKKKKRKKPpK",
      "KPpK......R.KPpK",
      ".KK.......R..KK.",
    ],
  ],
  palette: { K: "#3b2416", P: "#f1e3c2", p: "#cdb48a", k: "#8a6f42", R: "#b8323a" },
};

export const SPRITES: Record<string, Sprite> = { MOUSE, BROOM, CANDLE, SPELLBOOK, BOTTLE, SKULL, SCROLL };
