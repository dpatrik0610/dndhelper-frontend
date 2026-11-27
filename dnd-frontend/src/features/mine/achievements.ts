import type { MiningConfig, MiningState } from "@services/miningService";

export interface AchCtx {
  config: MiningConfig;
  state: MiningState;
  feats: Record<string, number>;
}

export type AchGroup = "Digging" | "Delving" | "Combat" | "Bestiary" | "Treasure" | "Camp" | "Hidden";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  group: AchGroup;
  goal: number;
  value: (c: AchCtx) => number;
  hidden?: boolean;
}

type Value = (c: AchCtx) => number;
type Step = [goal: number, name: string, desc: string];

const feat =
  (key: string): Value =>
  (c) =>
    c.feats[key] ?? 0;
const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

const one = (id: string, group: AchGroup, icon: string, name: string, desc: string, value: Value, goal = 1): Achievement => ({
  id,
  group,
  icon,
  name,
  desc,
  value,
  goal,
});

const tiers = (id: string, group: AchGroup, icon: string, value: Value, steps: Step[]) =>
  steps.map(([goal, name, desc]) => one(`${id}-${goal}`, group, icon, name, desc, value, goal));

const secret = (id: string, icon: string, name: string, desc: string, value: Value, goal = 1): Achievement => ({
  ...one(id, "Hidden", icon, name, desc, value, goal),
  hidden: true,
});

const BEASTS: [kind: number, icon: string, name: string, desc: string][] = [
  [1, "🐀", "Pest Control", "Defeat 25 Giant Rats."],
  [2, "🦎", "Claim Jumper Jumped", "Defeat 25 Kobold Diggers."],
  [3, "🕷️", "Web Developer", "Defeat 25 Cave Spiders."],
  [4, "💀", "Rest in Pieces", "Defeat 25 Skeleton Miners."],
  [5, "🔥", "Fire Drill", "Defeat 25 Magma Mephits."],
  [6, "🪓", "Grey Matter", "Defeat 25 Duergar Raiders."],
  [7, "🦎", "Cold Blooded", "Defeat 25 Salamanders."],
  [8, "🧊", "Jelly Wrestler", "Defeat 25 Gelatinous Cubes."],
  [9, "🪨", "Stone Cold", "Defeat 25 Xorns."],
  [10, "⭐", "Star Breaker", "Defeat 25 Star Golems."],
];

const FIXED: Achievement[] = [
  ...tiers("dig", "Digging", "⛏️", (c) => c.state.nodesBroken, [
    [10, "First Swing", "Break 10 blocks."],
    [500, "Rockbreaker", "Break 500 blocks."],
    [5000, "Tunnel Vision", "Break 5,000 blocks."],
    [25000, "Mountain Mover", "Break 25,000 blocks."],
  ]),
  ...tiers("ore", "Digging", "💎", (c) => sum(c.state.mined), [
    [100, "Pocket Money", "Mine 100 ore in total."],
    [2500, "Seam Stripper", "Mine 2,500 ore in total."],
  ]),
  ...tiers("crit", "Digging", "✨", (c) => c.state.crits, [
    [10, "Sweet Spot", "Land 10 critical strikes."],
    [250, "Precision Work", "Land 250 critical strikes."],
  ]),
  ...tiers("ladder", "Digging", "🪜", feat("ladder"), [
    [50, "Rung by Rung", "Place 50 ladders."],
  ]),
  ...tiers("torch", "Digging", "🕯️", feat("torch"), [
    [25, "Light the Way", "Place 25 torches."],
  ]),

  ...tiers("trip", "Delving", "🛗", feat("trip"), [
    [1, "Back in One Piece", "Ride the lift home with your haul."],
    [25, "Commuter", "Return safely 25 times."],
  ]),
  ...tiers("full", "Delving", "🎒", feat("fullBag"), [
    [1, "Can't Carry Any More", "Fill your satchel to the brim."],
  ]),
  one("faint-1", "Delving", "😵", "Lights Out", "Faint in the mine. It happens to the best.", feat("faint")),
  ...tiers("motherlode", "Delving", "🌋", feat("motherlode"), [
    [1, "MOTHERLODE!", "Strike a motherlode vein."],
  ]),
  ...tiers("pages", "Delving", "📜", (c) => c.state.pages.length, [
    [1, "Dead Dwarf's Diary", "Find a ledger page."],
    [5, "Bookworm", "Find 5 ledger pages."],
  ]),

  ...tiers("kills", "Combat", "⚔️", (c) => c.state.kills, [
    [1, "First Blood", "Defeat a monster."],
    [50, "Exterminator", "Defeat 50 monsters."],
    [500, "Monster Mash", "Defeat 500 monsters."],
  ]),
  ...tiers("smash", "Combat", "💥", feat("smash"), [
    [1, "SMASH!", "Land a third-hit smash."],
    [250, "Combo Breaker", "Land 250 smashes."],
  ]),
  one("smashkill-50", "Combat", "🔨", "Finishing Move", "Finish 50 monsters with a smash.", feat("smashKill"), 50),
  ...tiers("jump", "Combat", "🦘", feat("jumpStrike"), [
    [1, "Death From Above", "Land a jump strike."],
  ]),
  ...tiers("dodge", "Combat", "💨", feat("dodge"), [
    [1, "Not Even Close", "Dash through a bite."],
    [50, "Untouchable", "Dash through 50 bites."],
  ]),
  one("sidestep-25", "Combat", "👣", "Footwork", "Step out of reach so 25 bites miss.", feat("sidestep"), 25),
  ...tiers("bolt", "Combat", "🔥", feat("bolt"), [
    [1, "Pew", "Cast a firebolt."],
  ]),
  ...tiers("ward", "Combat", "🛡️", feat("wardBreak"), [
    [1, "Wardbreaker", "Shatter a duergar's psionic ward."],
  ]),
  ...tiers("potion", "Combat", "🧪", feat("potion"), [
    [1, "Bottoms Up", "Drink a healing draught."],
  ]),
  ...tiers("pet", "Combat", "🐾", feat("petKill"), [
    [10, "Good Boy", "Let your pet finish 10 monsters."],
  ]),

  ...BEASTS.map(([kind, icon, name, desc]) => one(`beast-${kind}`, "Bestiary", icon, name, desc, feat(`kill${kind}`), 25)),
  one("beast-11", "Bestiary", "🧰", "Not a Chest", "Burn a chest mimic to cinders.", feat("kill11")),
  one("cubelet-50", "Bestiary", "🟩", "Mop Duty", "Clean up 50 tiny cubelets.", feat("cubelet"), 50),

  ...tiers("chest", "Treasure", "📦", feat("chest"), [
    [1, "Finders Keepers", "Open a wooden chest."],
  ]),
  ...tiers("iron", "Treasure", "🗝️", feat("iron"), [
    [1, "Iron Bound", "Crack an iron-bound chest."],
  ]),
  ...tiers("gilded", "Treasure", "👑", feat("gilded"), [
    [1, "Jackpot", "Break open a gilded chest."],
    [10, "Dragon's Hoard", "Break open 10 gilded chests."],
  ]),
  ...tiers("geode", "Treasure", "🔮", feat("geode"), [
    [1, "Crack the Egg", "Shatter a geode."],
    [25, "Crystal Clear", "Shatter 25 geodes."],
  ]),
  one("mimicwake-1", "Treasure", "😬", "It Has Teeth", "Wake a chest mimic.", feat("mimicWake")),

  one("firebolt", "Camp", "📕", "Spark of Genius", "Learn Firebolt from the trader.", (c) => +c.state.firebolt),
  ...tiers("gear", "Camp", "⚒️", (c) => Math.max(0, ...Object.values(c.state.gear).map((t) => t ?? 0)), [
    [3, "Apprentice Smith", "Forge any gear to tier 3."],
    [6, "Journeyman Smith", "Forge any gear to tier 6."],
  ]),
  ...tiers("forge", "Camp", "🏭", (c) => c.state.forgeLevel, [
    [5, "Starfall Smith", "Raise the forge to its final form."],
  ]),
  ...tiers("pets", "Camp", "🐕", (c) => c.state.pets.length, [
    [1, "Best Friend", "Adopt a pet."],
    [10, "Zookeeper", "Adopt 10 pets."],
  ]),

  secret("closeshave", "🩸", "Close Shave", "Win a fight with 10% health or less.", feat("closeShave")),
  secret("nottoday", "🙅", "Not Today", "Dash through a bite while badly hurt.", feat("notToday")),
  secret("blasted", "🎆", "Hot Hug", "Get caught in a mephit's dying blast.", feat("blasted")),
  secret("bigfall", "🪂", "Gravity Check", "Fall 8 blocks in one drop.", feat("bigFall")),
  secret("hattrick", "🎩", "Hat Trick", "Land three critical hits in a row on monsters.", feat("hatTrick")),
  secret("stairway", "🌈", "Stairway to Somewhere", "Place 40 ladders in a single trip.", feat("stairway")),
  secret("bouncy", "🏰", "Bouncy Castle", "Get booped by tiny cubelets 10 times.", feat("bounced"), 10),
  secret("night", "🌙", "Night Shift", "Come up from the mine between midnight and 5 AM.", feat("nightShift")),
  secret("fox", "🦊", "Starfell Sighting", "Catch sight of the Starfell Fox.", (c) => +c.state.foxRevealed),
  secret("clang", "🔔", "Ding Ding Ding", "Hit a mimic with your pickaxe 20 times. It still won't work.", feat("clang"), 20),
];

export function achievementsFor(config: MiningConfig): Achievement[] {
  const depths = config.depths
    .filter((d) => d.number > 1)
    .map((d) =>
      one(`depth-${d.number}`, "Delving", "🕳️", d.name, `Break through to depth ${d.number}.`, (c) => c.state.deepestDepth, d.number),
    );
  const ores = config.ores.map((o) =>
    one(`find-${o.key}`, "Digging", "🪙", `First ${o.name}`, `Mine your first ${o.name}.`, (c) => c.state.mined[o.key] ?? 0),
  );
  const gear = config.slots.map((s) =>
    one(
      `max-${s.key}`,
      "Camp",
      "🏆",
      `Perfect ${s.noun}`,
      `Forge the finest ${s.noun.toLowerCase()} there is: ${s.tiers[s.tiers.length - 1].name}.`,
      (c) => c.state.gear[s.key] ?? 0,
      s.tiers.length - 1,
    ),
  );
  return [...FIXED, ...depths, ...ores, ...gear];
}

export const unlockedNow = (list: Achievement[], c: AchCtx, have: ReadonlySet<string>) =>
  list.filter((a) => !have.has(a.id) && a.value(c) >= a.goal);

export const mergeFeats = (a: Record<string, number>, b: Record<string, number> = {}) => {
  const out = { ...a };
  for (const [k, n] of Object.entries(b)) out[k] = (out[k] ?? 0) + n;
  return out;
};
