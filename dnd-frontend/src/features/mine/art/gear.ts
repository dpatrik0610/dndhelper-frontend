import { blank, blit, type Grid, mix, raster, ramp, rotateCW } from "./pixel";

export type GearSlot = "pickaxe" | "gauntlets" | "helm" | "charm" | "satchel";
export type Tiers = Record<GearSlot, number>;
export const GEAR_SLOTS: GearSlot[] = ["pickaxe", "gauntlets", "helm", "charm", "satchel"];

type Detail = { from: number; shape: number; rows: Record<number, string> };
type DollSlot = "helm" | "gauntlets" | "satchel" | "charm";

const G: Record<GearSlot, string[][]> = {
  pickaxe: [
    [
      "................",
      "....oooooo......",
      "...ohhlllmoo....",
      "..ohlmmmmmddo...",
      "..olmoooooomdo..",
      "..ooo...owoodo..",
      ".......owWo.odo.",
      "......owWo..odo.",
      ".....owWo...oo..",
      "....owWo........",
      "...owWo.........",
      "..owWo..........",
      ".owWo...........",
      ".oWo............",
      ".oo.............",
      "................",
    ],
    [
      "....ooooooo.....",
      "..oohhllllmoo...",
      ".ohhlllmmmmmdoo.",
      "ohlmmogGgommddo.",
      "olmo.ogggo.omdo.",
      "oo....oko...odo.",
      ".....okKo...odo.",
      "....owWo....oo..",
      "...okKo.........",
      "..owWo..........",
      ".okKo...........",
      "owWo............",
      "olo.............",
      "oo..............",
      "................",
      "................",
    ],

    [
      "...ooooooo......",
      "..ohhhllllmoo...",
      ".ohhlllmmmmddo..",
      "ohllmmmmmmmmddo.",
      "olmmooooooommddo",
      "olmo...owwo.omdo",
      "ooo...owWo...odo",
      ".....owWo....odo",
      "....omlo.....oo.",
      "...owWo.........",
      "..owWo..........",
      ".omlo...........",
      "owWo............",
      "oWo.............",
      "oo..............",
      "................",
    ],
    [
      ".......og.......",
      "....ooogGooo....",
      "..oohhlggllmoo..",
      ".ohhlllmgmmmmdoo",
      "ohlmmogGgommmddo",
      "olmo.ogggo.ommdo",
      "ohho..oko...omdo",
      ".oo..okKo....odo",
      "....ogWo.....oho",
      "...okKo......oo.",
      "..owgo..........",
      ".okKo...........",
      "ogWo............",
      "oGo.............",
      "oo..............",
      "................",
    ],
    [
      "...a.aAa.a......",
      "..aoooooooooa...",
      ".ohhlllmmmmmdoo.",
      "ohlmmoaAaommddo.",
      "olmo.oaAao.omdo.",
      "aa....oko...oda.",
      "Aa...okKo...oaA.",
      ".a..owWo....aa..",
      "...okKo.........",
      "..owWo..........",
      ".okKo...........",
      "owWo............",
      "olo.............",
      "oo..............",
      "................",
      "................",
    ],
    [
      ".....oooooo.....",
      "...oohhllmmoo...",
      ".oohllmmmmmmddo.",
      "ohlmooagGaoommdo",
      "hlo...oggo...odh",
      "h.....oko.....dh",
      "h....okKo.....h.",
      "....owWo........",
      "...okKo.........",
      "..owWo..........",
      ".okKo...........",
      "owWo............",
      "olo.............",
      "oo..............",
      "................",
      "................",
    ],
    [
      "A......A......A.",
      "......aGa.......",
      "..oooAGgGAooo...",
      ".ohhllaGallmdoo.",
      "ohlmmoGgGommmddo",
      "olmo.ogggo.ommdo",
      "ohho..oko...omdo",
      ".oo..okKo....odo",
      "....oaWo.....oho",
      "...okKo......oA.",
      "..owao..........",
      ".okKo...........",
      "oaWo............",
      "oAo.............",
      "oo..............",
      "................",
    ],
  ],
  gauntlets: [
    [
      "................",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      "..oddoddoddoddo.",
      ".oohhlllllmmmdo.",
      "ohlolmmgGmmmmdo.",
      "olmolmmggmmmddo.",
      ".oddommmmmmmddo.",
      "..oooddddddddo..",
      ".oooooooooooooo.",
      "ohhllllmmmmmmddo",
      "oooooooooooooooo",
    ],
    [
      "......ll.ll.....",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      "..ohhohhohhohho.",
      ".oohhlllllmmmdo.",
      "ohlolmmgGmmmmdo.",
      "olmolmmggmmmddo.",
      ".oddommmmmmmddo.",
      "..oooddddddddo..",
      ".oooooooooooooo.",
      "ohhllllgGlmmmddo",
      "oooooooooooooooo",
    ],
    [
      "................",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      "..oaaoaaoaaoaao.",
      ".oohhlllAlmmmdo.",
      "ohlolmmaAammmdo.",
      "olmolmaAgAammddo",
      ".oddommaaammddo.",
      "a.oooddddddddo.a",
      "Aaoooooooooooooa",
      "ahhllllmmmmmmdda",
      "oooooooooooooooo",
    ],
    [
      "................",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmoA",
      "..olmolmolmolmAA",
      "..ohhohhohhohAAo",
      ".oohhlallalmAAo.",
      "ohlolmagGamAAdo.",
      "olmolmmaammAAdo.",
      ".oddommmmmmmmdo.",
      "..oooddddddddo..",
      ".oooooooooooooo.",
      "ohhlaallaalladdo",
      "oooooooooooooooo",
    ],
    [
      "...a..a..a......",
      "...o..o..o.o....",
      "..oholoholoho...",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      ".aoaaoaaoaaoaaoa",
      ".oohhlllllmmmdo.",
      "ohlolmmgGmmmmdo.",
      "olmolmmggmmmddo.",
      ".oddoaommmamddo.",
      "a.oooddddddddo.a",
      "aaoooooooooooooa",
      "ahhlalllmmamddda",
      "oooooooooooooooo",
    ],
    [
      "......A..A......",
      "......oo.oo.....",
      "...ooohlohlo....",
      "..ohlolmolmooo..",
      "..olmolmolmohlo.",
      "..olmolmolmolmo.",
      "..olmolmolmolmo.",
      "..ohhohhohhohho.",
      ".oohhllAllmmmdo.",
      "ohlolmAGGAmmmdo.",
      "olmolmGgGGmmddo.",
      ".oddommAGAmmddo.",
      "..oooddAddddo...",
      ".oooooooooooooo.",
      "ohhlAllmmAmmAddo",
      "oooooooooooooooo",
    ],
  ],
  helm: [
    [
      "................",
      "................",
      "......oooo......",
      "....oohhllmoo...",
      "...ohhllmmmmdo..",
      "..ohllmoooommdo.",
      "..olmmoyYyommdo.",
      "..olmmoYyYommdo.",
      "..ommmooooommdo.",
      ".oooooooooooooo.",
      "ohhllllgGmmmmddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
      "................",
    ],
    [
      "................",
      ".b............b.",
      ".bB...oooo...Bb.",
      "..bB.ohhllo.Bb..",
      "...Bohllmmmob...",
      "...ohllmmmmmdo..",
      "..ohlmooooommdo.",
      "..olmmoyYyommdo.",
      "..olmmoYgYommdo.",
      "..ommmooooommdo.",
      ".oooooooooooooo.",
      "ohhllllgGlmmmddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
    [
      "......a.........",
      ".....aA...a.....",
      ".....aAa.aa.....",
      "..a..aAAaAa..a..",
      "..aa.oaAAAo.aa..",
      "...aohhllmmoa...",
      "...ohllmmmmmdo..",
      "..ohlmooooommdo.",
      "..olmmoyYyommdo.",
      "..olmmoYgYommdo.",
      "..ommmooooommdo.",
      "aooooooooooooooa",
      "ohhllllgGlmmmddo",
      "aoddddddddddddoa",
      ".aooooooooooooa.",
      "................",
    ],
    [
      "................",
      "A..............A",
      "AA....oooo....AA",
      ".AA..ohhllo..AA.",
      ".aAAohllmmmoAAa.",
      "..aAhllmmmmmAa..",
      "..ohlmooooommdo.",
      "..olmmoyYyommdo.",
      "..olmmoYgYommdo.",
      "..ommmooooommdo.",
      ".oooooooooooooo.",
      "ohhllllgGlmmmddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
    [
      ".......aa.......",
      ".......oo.......",
      "......ohlo......",
      "....oohhllmoo...",
      "...ohhllmmmmdo..",
      "a..ohllmmmmmdo.a",
      "aaohlmooooommdoa",
      ".aolmmoyYyommdo.",
      "..olmmoYgYommdo.",
      "..olmoaoaoaomdo.",
      ".oooooooooooooo.",
      "ohhlalaggalamddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
    [
      "........A.......",
      "..A.....a.....A.",
      "..a..A.aAa.A..a.",
      "..aa.a.aAa.a.aa.",
      "..oaaaaaaaaaaao.",
      "..ohllmmmmmmmdo.",
      "..ohlmooooommdo.",
      "..olmmoGGGommdo.",
      "..olmmoGgGommdo.",
      "..ommmooooommdo.",
      ".oooooooooooooo.",
      "ohhllAlgGlAmmddo",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
  ],
  charm: [
    [
      "................",
      "....kk....kk....",
      ".....k....k.....",
      "......k..k......",
      "......oooo......",
      ".....ohllmo.....",
      "....ohlggmdo....",
      "....olgGgmdo....",
      "....omggmmdo....",
      "....odmmmddo....",
      ".....oddddo.....",
      "......oooo......",
      "................",
      "................",
      "................",
      "................",
    ],
    [
      "................",
      "...kk......kk...",
      ".....k....k.....",
      "......k..k......",
      "...o..oooo..o...",
      "...ooohllmooo...",
      "....ohlgggmdo...",
      "...ohlgGGggmdo..",
      "...olggGgggddo..",
      "...omgggggmddo..",
      "....omgggmddo...",
      "...ooommmddooo..",
      "...o..oooo..o...",
      "......o..o......",
      "......g..g......",
      "................",
    ],
    [
      "................",
      "...kk......kk...",
      ".....k....k.....",
      "..a...k..k...a..",
      "..A...oaao...A..",
      "..a..oaAAao..a..",
      ".....oaAgAao....",
      "..a.oaAgGGao.a..",
      "...oagGGgggao...",
      "...oaggggggao...",
      "....oaggggao....",
      ".....oaaaao.....",
      "......oooo......",
      ".......aa.......",
      "........A.......",
      "................",
    ],
    [
      "................",
      "...kk......kk...",
      ".....k....k.....",
      "......k..k......",
      "......oooo......",
      "A....ohllmo....A",
      "AA..ohlgggdo..AA",
      ".AAaolgGGgdoaAA.",
      "..AaomgGggdoaA..",
      "...aomggggdoa...",
      "....omgggdo.....",
      ".....oddddo.....",
      "......oooo......",
      ".......oo.......",
      ".......g........",
      "................",
    ],
    [
      "................",
      "...kk......kk...",
      ".....k....k.....",
      ".......aa.......",
      ".......oo.......",
      "....oaaaaaao....",
      "...oallmmmmdo...",
      "aaoalgggggmdoaa.",
      ".aoalgGGgggdoa..",
      "aaoalgGggggdoaa.",
      "...oamggggmdo...",
      "....oaaaaaao....",
      ".......oo.......",
      ".......aa.......",
      "................",
      "................",
    ],
    [
      "................",
      "...kk......kk...",
      ".....k....k.....",
      "A.....k..k.....A",
      ".......oo.......",
      "......ohdo......",
      "......olmo......",
      ".oooooolGmooooo.",
      "..ohhllGgGmmdo..",
      "...ohllGGGmdo...",
      "....olmmmmdo....",
      "...olmo..omdo...",
      "..olmo....omdo..",
      "..ooo......ooo..",
      "A..............A",
      "................",
    ],
  ],
  satchel: [
    [
      "................",
      ".....kkkkkk.....",
      "....k......k....",
      "...k........k...",
      "..oooooooooooo..",
      "..ohhllllmmmdo..",
      "..ohllllmmmmdo..",
      "..olmmmgGmmmdo..",
      "..oooooooooooo..",
      ".olmmmmmmmmmddo.",
      ".olmmmmmmmmmddo.",
      ".ommmmmmmmmdddo.",
      ".oddddddddddddo.",
      "..oooooooooooo..",
      "................",
      "................",
    ],
    [
      "................",
      "....kkkkkkkk....",
      "...k........k...",
      "..k..........k..",
      ".oooooooooooooo.",
      ".ohhlllllmmmmdo.",
      ".ohlllooooommdo.",
      ".olmmmogGgommdo.",
      ".olmmmogggommdo.",
      ".oddddooooodddo.",
      "oooooooooooooooo",
      "ohlmmmmmmmmmmddo",
      "olmmmmmmmmmmmddo",
      "oddddddddddddddo",
      ".oooooooooooooo.",
      "................",
    ],
    [
      "................",
      "....kkkkkkkk....",
      "...k........k...",
      "..k....a.....k..",
      ".ooooooaaoooooo.",
      ".ohhlloaAaommdo.",
      ".ohlllaAgAammdo.",
      ".olmmmaggGammdo.",
      ".olmmmoaaaommdo.",
      ".oddddooooodddo.",
      "oooooooooooooooo",
      "ohlmmmmmmmmmmddo",
      "olmmmmmmmmmmmddo",
      "odadddaddaddadao",
      ".oaooaooaooaoao.",
      "..a..a..a..a.a..",
    ],
    [
      "................",
      "....hhhhhhhh....",
      "...h........h...",
      "..h..........h..",
      ".oooooooooooooo.",
      ".ohhlllllmmmmdo.",
      ".ohlAAoooooAAdo.",
      ".olAAAogGgoAAAo.",
      ".olmAAogggoAAdo.",
      ".oddddooooodddo.",
      "oooooooooooooooo",
      "ohlmmmmmmmmmmddo",
      "olmmmmmmmmmmmddo",
      "odddAdddddAddddo",
      ".oooooooooooooo.",
      "................",
    ],
    [
      "................",
      "....kkkkkkkk....",
      "...k........k...",
      "a.k..........k.a",
      "aaoooooooooooooa",
      ".oahlllllmmmado.",
      ".ohlllooooommdo.",
      ".olmmmogGgommdo.",
      ".olmmmogggommdo.",
      ".oddddooooodddo.",
      "oaoooooooooooaoo",
      "ohlamaaaaaamaddo",
      "olmmmmmmmmmmmddo",
      "oddddddddddddddo",
      "aoooooooooooooa.",
      "a..............a",
    ],
    [
      "................",
      "....kkkkkkkk....",
      "...k........k...",
      "..k..........k..",
      ".oooooooooooooo.",
      ".ohhllAllmmmmdo.",
      ".ohlllooAoommdo.",
      ".olmmoAGgGAmmdo.",
      ".olmmmoGGGommdo.",
      ".oddddoAoAodddo.",
      "oooooooooooooooo",
      "ohlmAmmmmmAmmddo",
      "olmmmmmAmmmmmddo",
      "oddAddddddddAddo",
      ".oooooooooooooo.",
      "................",
    ],
  ],
};

const DETAILS: Record<GearSlot, Detail[]> = {
  pickaxe: [
    { from: 2, shape: 0, rows: { 10: "....kK", 12: "..kK" } },
    { from: 3, shape: 2, rows: { 3: ".......gG" } },
    { from: 4, shape: 2, rows: { 10: "...kK", 12: ".kK" } },
    { from: 5, shape: 2, rows: { 6: ".h", 8: ".............l" } },
  ],
  gauntlets: [
    { from: 2, shape: 0, rows: { 7: "...l..l..l..l" } },
    { from: 4, shape: 0, rows: { 14: "....d...d...d" } },
    { from: 5, shape: 0, rows: { 12: "......kKlKk" } },
  ],
  helm: [
    { from: 2, shape: 0, rows: { 7: "...h........l" } },
    { from: 4, shape: 0, rows: { 1: ".......oo", 2: ".......hl" } },
    { from: 5, shape: 0, rows: { 13: "..olo......olo", 14: "...o.......o" } },
  ],
  charm: [
    { from: 2, shape: 0, rows: { 1: "....lm....ml", 2: ".....l....l", 3: "......m..m" } },
    { from: 4, shape: 0, rows: { 12: ".......o", 13: "......olo", 14: ".......o" } },
    { from: 5, shape: 0, rows: { 6: "...o........o", 7: "..ol........lo", 8: "...o........o" } },
  ],
  satchel: [
    { from: 2, shape: 0, rows: { 9: "..h.........h", 12: "..l.........l" } },
    { from: 4, shape: 0, rows: { 9: ".......hd", 10: ".......hd", 11: ".......hd" } },
    { from: 5, shape: 0, rows: { 2: ".....uUUUu", 3: "....uUuuuUu" } },
  ],
};

const DWARF = [
  "................",
  "................",
  "................",
  "................",
  ".....xxxxxx.....",
  "....xssssssx....",
  "....xsxssxsx....",
  "....xSssssSx....",
  "...xrrsSSsrrx...",
  "...xrRrrrrRrx...",
  ".xxuxrRrrRrxuxx.",
  "xuUuuxrRRrxuuUux",
  "xuUuuuxrrxuuuUux",
  "xsxuUuuxxuuUuxsx",
  "xssxkkkkkkkkxssx",
  ".xxxuUuuuuUuxxx.",
  "...xuuuxxuuux...",
  "...xkkkx.xkkkx..",
  "..xkKkkx.xkKkkx.",
  "..xxxxxx.xxxxxx.",
];

const DOLL: Record<DollSlot, (string | number)[][]> = {
  helm: [
    ["", "......oooo......", "....oohhllmoo...", "...ohhlmmmmmdo..", "...olmmoyommdo..", "..ohhllgGmmddo.."],
    ["", ".b....oooo....b.", ".bB.oohhllmoo.Bb", "..bBohlmmmmmdBb.", "...olmmogommdo..", "..ohhllgGmmddo.."],
    ["......a.........", ".....aAa..a.....", "....oaAAaaoo....", "..aohhlAllmmoa..", "...olmmogommdo..", "..ohhllgGmmddo.."],
    ["A..............A", "AA....oooo....AA", ".AA.oohhllmoo.AA", "..AAohlmmmmmdAA.", "...olmmogommdo..", "..ohhllgGmmddo.."],
    [".......oa.......", "a.....oaao.....a", "aa..oohhllmoo.aa", ".aaohlmmmmmmdaa.", "...olmaoGoamdo..", "..ohhlaaGaaddo.."],
    ["..A.....A.....A.", "..a..A.aAa.A..a.", "..aaaaaaaaaaaaa.", "...ohlmmmmmmdo..", "...olmmoGommdo..", "..ohhllGgmmddo.."],
  ],
  gauntlets: [
    [13, "ol............lo", "olm..........mlo", ".dd..........dd."],
    [12, "o..............o", "ol............lo", "olm..........mlo", ".dd..........dd."],
    [9, "a..............a", "Aa............aA", "oo............oo", "ol............lo", "olm..........mlo", ".aa..........aa."],
    [9, "A..............A", "AA............AA", "oA............Ao", "ol............lo", "olm..........mlo", ".hh..........hh."],
    [9, "a..............a", "ao............oa", "oao..........oao", "ol............lo", "olm..........mlo", ".aa..........aa."],
    [9, "A..............A", "o..............o", "oa............ao", "ol............lo", "olG..........Glo", ".dd..........dd."],
  ],
  satchel: [
    [15, "........oooooo..", "........ohlgdo..", "........odmmdo..", "........oooooo.."],
    [14, "........oooooo..", "........ohllmo..", "........olgGdo..", "........odmmdo..", "........oooooo.."],
    [14, "........ooaooo..", "........ohaAmo..", "........olgGdo..", "........odmmdo..", "........oaoaoo.."],
    [14, "........oooooo..", ".......AohllmoA.", ".......AolgGdoA.", "........odmmdo..", "........oooooo.."],
    [14, ".......aoooooa..", "........ohllmo..", "........olgGdo..", "........oaaado..", ".......aoooooa.."],
    [14, "........ooAooo..", "........ohllmo..", "........oAgGAo..", "........odmmdo..", "........ooAooo.."],
  ],
  charm: [
    [11, "......olmo......", "......ogGo......", ".......oo......."],
    [10, ".......oo.......", "......olmo......", ".....ogGGgo.....", "......oggo......", ".......oo......."],
    [9, ".......aa.......", "......oAAo......", "......olmo......", ".....agGGga.....", "......oggo......", ".......oo......."],
    [10, ".......oo.......", "....A.olmo.A....", "...AAogGGgoAA...", "....A.oggo.A....", ".......oo......."],
    [10, ".......aa.......", "......oaao......", ".....agGGga.....", "......oaao......", ".......aa......."],
    [9, ".......AA.......", ".......oo.......", "......oGGo......", "....AoGgGGoA....", "......oGGo......", ".......oo......."],
  ],
};

export const BASE: Record<string, string> = {
  x: "#1c1410",
  s: "#e2aa7c",
  S: "#b97a52",
  r: "#c4562b",
  R: "#8a3418",
  u: "#3d6a86",
  U: "#5c8fae",
  k: "#5a3a22",
  K: "#7d5433",
  w: "#6b4423",
  W: "#9a6a3c",
  y: "#ffd77a",
  Y: "#fff4c2",
  b: "#e8dcc0",
  B: "#b8a88a",
};

export const SETS: {
  tier: number;
  name: string;
  base: string;
  gem: string | null;
  accent?: string;
  perSlot?: Partial<Record<GearSlot, string>>;
}[] = [
  {
    tier: 0,
    name: "Scrapper's Kit",
    base: "#8b4a2b",
    gem: null,
    perSlot: { gauntlets: "#b5a58a", helm: "#8a5a36", charm: "#8f8c86", satchel: "#a88d5e" },
  },
  { tier: 1, name: "Copper", base: "#c8743a", gem: null },
  { tier: 2, name: "Iron", base: "#8a9099", gem: null },
  { tier: 3, name: "Gold", base: "#e8b53e", gem: "#e0314b" },
  { tier: 4, name: "Cold Iron", base: "#6f90ab", gem: "#9fe6ff" },
  { tier: 5, name: "Darksteel", base: "#4a5060", gem: "#ffb020" },
  { tier: 6, name: "Byeshk", base: "#8a5bb5", gem: "#f0a8ff", accent: "#d9b8ff" },
  { tier: 7, name: "Flametouched", base: "#e0782a", gem: "#fff1b0", accent: "#ffd23f" },
  { tier: 8, name: "Mithral", base: "#b5d8ef", gem: "#3d7bff", accent: "#ffffff" },
  { tier: 9, name: "Adamantine", base: "#b3242c", gem: "#ffcf5a", accent: "#ffcf5a" },
  { tier: 10, name: "Starmetal", base: "#7f9cff", gem: "#ffffff", accent: "#fff6c8" },
];

const ITEM_NAMES: Record<GearSlot, [string, string]> = {
  pickaxe: ["Rusty Pickaxe", "Pickaxe"],
  gauntlets: ["Bare Knuckles", "Gauntlets"],
  helm: ["Candle Cap", "Lantern Helm"],
  charm: ["Lucky Pebble", "Strike Charm"],
  satchel: ["Torn Sack", "Satchel"],
};

const PICK_SHAPES = [0, 0, 0, 2, 2, 2, 1, 4, 5, 3, 6];
export const pickShape = (tier: number) => PICK_SHAPES[tier];
const shapeOf = (tier: number) => Math.max(0, tier - 5);

const detailed = (slot: GearSlot, tier: number) => {
  const shape = slot === "pickaxe" ? pickShape(tier) : shapeOf(tier);
  const g = G[slot][shape].map((r) => [...r]);
  for (const d of DETAILS[slot])
    if (d.shape === shape && tier >= d.from)
      for (const [y, row] of Object.entries(d.rows))
        [...row].forEach((ch, x) => {
          if (ch !== ".") g[+y][x] = ch;
        });
  return g.map((r) => r.join(""));
};

export const itemName = (slot: GearSlot, tier: number) =>
  tier === 0 ? ITEM_NAMES[slot][0] : `${SETS[tier].name}${tier === 7 ? " Iron" : ""} ${ITEM_NAMES[slot][1]}`;

const paletteFor = (slot: GearSlot, tier: number) => {
  const set = SETS[tier];
  const r = ramp(set.perSlot?.[slot] ?? set.base);
  const accent = set.accent ?? r.l;
  return { ...BASE, ...r, g: set.gem ?? r.m, G: set.gem ? mix(set.gem, "#ffffff", 0.6) : r.l, a: accent, A: mix(accent, "#ffffff", 0.55) };
};

export const item = (slot: GearSlot, tier: number) => raster(detailed(slot, tier), paletteFor(slot, tier));

const overlay = (spec: (string | number)[], pal: Record<string, string>) =>
  typeof spec[0] === "number"
    ? { y: spec[0], px: raster(spec.slice(1) as string[], pal) }
    : { y: 0, px: raster(spec as string[], pal) };

export const fullSet = (tiers: Tiers) => {
  const t = tiers.pickaxe;
  return t >= 6 && GEAR_SLOTS.every((s) => tiers[s] === t) ? t : 0;
};

const tunicFor = (tiers: Tiers) => {
  const set = fullSet(tiers);
  if (!set) return BASE;
  const r = ramp(SETS[set].base);
  return { ...BASE, u: r.d, U: r.m, k: mix(r.o, "#5a3a22", 0.4), K: r.d };
};

export const dwarfOnly = (tiers: Tiers) => {
  const out = blank(30, 20);
  blit(out, raster(DWARF, tunicFor(tiers)), 0, 0);
  for (const slot of ["gauntlets", "satchel", "charm", "helm"] as DollSlot[]) {
    const t = tiers[slot];
    const o = overlay(DOLL[slot][shapeOf(t)], paletteFor(slot, t));
    blit(out, o.px, 0, o.y);
  }
  return out;
};

export const dwarfParts = (tiers: Tiers) => {
  const full = dwarfOnly(tiers);
  const base = raster(DWARF, tunicFor(tiers));
  const body = full.map((r) => [...r]);
  const left = blank(30, 20);
  const right = blank(30, 20);
  for (let y = 17; y < 20; y++)
    for (let x = 0; x < 16; x++) {
      if (!base[y][x] || full[y][x] !== base[y][x]) continue;
      (x < 8 ? left : right)[y][x] = full[y][x];
      body[y][x] = null;
    }
  const blink = body.map((r) => [...r]);
  for (const x of [6, 9]) if (blink[6][x] === BASE.x) blink[6][x] = BASE.S;
  return { body, blink, left, right };
};

export const sleeper = (tiers: Tiers): Grid => {
  const g = dwarfOnly(tiers).map((r) => [...r]);
  for (const x of [6, 9]) g[6][x] = BASE.S;
  g[7][7] = BASE.x;
  g[7][8] = BASE.x;
  g.splice(16, 1);
  return g;
};

export type Pose = "raise" | "strike";

export const compose = (tiers: Tiers, pose: Pose): Grid => {
  const out = blank(34, 32);
  blit(out, dwarfOnly(tiers), 0, 8);
  const pick = item("pickaxe", tiers.pickaxe);
  if (pose === "strike") blit(out, rotateCW(pick), 12, 13);
  else blit(out, pick, 12, 1);
  return out;
};
