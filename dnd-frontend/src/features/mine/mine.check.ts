// Self-check: bunx esbuild src/features/mine/mine.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { DepthInfo, MiningStats } from "@services/miningService";
import { PET_ART } from "./art/pets";
import { ENEMIES } from "./art/world";
import {
  castBolt,
  createGame,
  drinkPotion,
  type Game,
  type Keys,
  MIMIC_KIND,
  minSwings,
  ORE0,
  OPEN,
  placeTorch,
  stationAt,
  STONE,
  step,
  takePending,
} from "./engine";
import { canAfford, discounted, hpColor } from "./mine";
import { pickSwing } from "./render";
import { dreamsFor, engraving, PAGES, SEALS, wickLines } from "./story";

assert.equal(hpColor(1), "rgb(90,200,80)");
assert.equal(hpColor(0), "rgb(224,64,48)");
assert.equal(hpColor(2 / 3), "rgb(240,210,60)");
assert.equal(hpColor(1 / 3), "rgb(240,140,40)");
assert.ok(canAfford({ copper: 3 }, { copper: 3 }) && !canAfford({ copper: 1 }, {}) && !canAfford(null, { copper: 9 }));
assert.deepEqual(discounted({ tin: 45, copper: 90 }, 0.2), { tin: 36, copper: 72 });

const W = 12;
const rows = [
  "############",
  "#......0000#",
  "#......0000#",
  "#000000A000#",
  "#0000000000#",
  "#0000000000#",
  "#0000000000#",
  "############",
];
const stats: MiningStats = {
  power: 3,
  swingMs: 650,
  light: 2.2,
  maxHp: 20,
  critZone: 0.12,
  critMult: 1,
  luck: 0,
  yield: 1,
  capacity: 60,
  maxDepth: 1,
  reach: 1,
  wide: false,
  vein: false,
  oreSight: 0,
  setBonus: 0,
  armor: 0,
  chainCrit: false,
};
const depth: DepthInfo = {
  number: 1,
  name: "Shallow Seams",
  stoneHp: 5,
  sealHp: 40,
  monsterHp: 12,
  monsterDamage: 3,
  killLoot: 3,
};
const none: Keys = { left: false, right: false, up: false, down: false, jump: false, attack: false };
const tiers = { pickaxe: 0, gauntlets: 0, helm: 0, charm: 0, satchel: 0 };

const newGame = (pet: number, map = rows, liftY = 2) =>
  createGame(
    {
      W,
      H: map.length,
      liftX: 3,
      liftY,
      oreHp: [10],
      oreNames: ["Copper"],
      oreColors: ["#c8743a"],
      depths: [depth],
      stats,
      tiers,
      forgeLevel: 1,
      firebolt: false,
      potions: 0,
      maxTorches: 2,
      pet:
        pet >= 0
          ? {
              art: PET_ART[pet],
              key: ["bat", "moth", "toad", "ferret", "beetle", "owlbear", "blinkdog", "mimic", "wisp", "dragon"][pet],
            }
          : null,
    },
    { depth: 1, map: map.join(""), ladders: [], torches: [], satchel: {} },
    0,
  );
let minY = 99;
const run = (g: Game, ms: number, keys: Partial<Keys> = {}, aim: { x: number; y: number } | null = null) => {
  for (let t = 0; t < ms; t += 1000 / 60) {
    step(g, 1000 / 60, { ...none, ...keys }, aim);
    minY = Math.min(minY, g.player.y);
  }
};
const at = (x: number, y: number) => y * W + x;

let g = newGame(-1);
run(g, 4000, { right: true });
assert.equal(g.player.x, 7, "walked to the wall, then tunnelled into it");

const walker = newGame(-1);
const startX = walker.player.x;
run(walker, 1200, {}, { x: 6.5, y: 2.5 });
assert.equal(walker.player.x, startX, "holding the mouse only swings, it never walks");
assert.equal(walker.player.face, 1);
run(walker, 300, {}, { x: 2.5, y: 2.5 });
assert.equal(walker.player.face, -1, "the dwarf turns toward the cursor");
assert.equal(takePending(walker), null, "swinging at thin air breaks nothing");
const p = takePending(g);
assert.ok(p && p.breaks.length >= 2, "both blocks of the tunnel face were dug");
for (const b of p.breaks) {
  const hp = rows.join("")[b.i] === "A" ? 10 : 5;
  assert.ok((b.s - b.c) * 3 + b.c * 6 >= hp && b.c <= b.s, "every break carries enough swings for the server");
}

g = newGame(-1);
run(g, 3000, { down: true });
assert.ok(g.player.y > 2, "digging down drops you a block");
assert.equal(g.map[at(3, 3)], OPEN);

g = newGame(-1);
g.map[at(3, 3)] = OPEN;
g.map[at(3, 4)] = OPEN;
g.player.y = 4;
g.player.fromY = 4;
run(g, 2000, { up: true });
assert.equal(g.player.y, 2, "climbing up places ladders under you");
assert.ok(g.ladders.has(at(3, 4)) && g.ladders.has(at(3, 3)));
run(g, 500);
assert.equal(g.player.y, 2, "ladders hold you up");

g = newGame(0);
g.monsters.push({
  id: 1,
  def: ENEMIES[0],
  kind: 1,
  x: 5,
  y: 2,
  fromX: 5,
  fromY: 2,
  t: 0,
  dur: 0,
  hp: 12,
  maxHp: 12,
  dmg: 0,
  moveMs: 99999,
  nextMove: 1e9,
  nextHit: 1e9,
  lungeUntil: 0,
  flashUntil: 0,
  stunUntil: 0,
  revived: false,
  petBlocked: false,
  leaving: 0,
  lost: 0,
});
g.nextSpawn = 1e12;
run(g, 30000);
assert.equal(g.monsters.length, 1, "a tier-1 pet never takes the last blow at depth 1");
assert.equal(g.monsters[0].hp, 1);
run(g, 2000, { right: true });
assert.equal(g.monsters.length, 0, "your pickaxe finishes it");
assert.equal(takePending(g)?.kills, 1);

const ledge = [
  "############",
  "#..........#",
  "#..........#",
  "#..........#",
  "#......0000#",
  "#0000000000#",
  "#0000000000#",
  "############",
];
g = newGame(-1, ledge, 4);
minY = 99;
run(g, 1500, { right: true });
assert.equal(minY, 4, "walking into a ledge never lifts you up");
g = newGame(-1, ledge, 4);
run(g, 2500, { right: true, jump: true });
assert.ok(g.player.x >= 8 && g.player.y <= 3, "space + D hops up onto the ledge");
assert.equal(g.pending.breaks.length, 0, "hopping digs nothing");

g = newGame(-1);
run(g, 1500, {}, { x: 2.5, y: 2.5 });
assert.equal(g.player.face, -1, "clicking turns you toward the cursor");
run(g, 3000, {}, { x: 3.5, y: 3.5 });
assert.equal(g.map[at(3, 3)], OPEN, "holding the mouse below you digs down");
g = newGame(-1);
g.player.x = 6;
g.player.fromX = 6;
run(g, 50);
assert.equal(g.target, at(7, 1), "the highlight marks the head-high block in front");
g.hover = { x: 6.5, y: 3.5 };
run(g, 50);
assert.equal(g.target, at(6, 3), "hovering the block below moves the highlight there");
g.hover = null;
run(g, 3000, { attack: true });
assert.equal(g.map[at(7, 1)], OPEN, "enter swings at the block you face");

g = newGame(-1);
g.nextSpawn = 1e12;
run(g, 61_000);
assert.ok(g.asleep, "a minute without input and he naps");

const foe = (gm: Game, kind: number, x: number, y: number) => {
  gm.monsters.push({
    ...structuredClone({ ...g.monsters[0], def: undefined }),
    def: ENEMIES[kind - 1],
    id: kind * 100 + x,
    kind,
    x,
    y,
    fromX: x,
    fromY: y,
    t: 0,
    dur: 0,
    hp: 50,
    maxHp: 50,
    dmg: 1,
    moveMs: 200,
    nextMove: 0,
    nextHit: 0,
    leaving: 0,
    lost: 0,
  });
  gm.nextSpawn = 1e12;
  return gm.monsters[gm.monsters.length - 1];
};
const reachedYou = (gm: Game, m: { x: number; y: number }) =>
  Math.abs(m.x - gm.player.x) <= 1 && (m.y === gm.player.y || m.y === gm.player.y - 1);

let gm = newGame(-1);
gm.monsters = [];
const rat = foe(gm, 1, 6, 1);
run(gm, 2500);
assert.ok(reachedYou(gm, rat) && rat.y === 2, "a rat drops to the floor and walks up to you");
assert.ok(gm.player.hp < gm.stats.maxHp, "and bites");

const shaft = [
  "############",
  "#..........#",
  "#..........#",
  "#000000000.#",
  "#000000000.#",
  "#000000000.#",
  "############",
];
gm = newGame(-1, shaft);
gm.monsters = [];
const stuck = foe(gm, 1, 10, 5);
run(gm, 4000);
assert.equal(stuck.y, 5, "a walker can't climb a sheer shaft");
run(gm, 9000);
assert.equal(gm.monsters.length, 0, "a monster with no way to you wanders off instead of hogging the spawn cap");

gm = newGame(-1, shaft);
gm.monsters = [];
const mephit = foe(gm, 5, 10, 5);
run(gm, 4000);
assert.ok(reachedYou(gm, mephit), "a flier comes up the shaft");
const vault = newGame(-1, ["############", "#...*......#", "#..........#", "#0000000000#", "############"]);
vault.monsters = [];
run(vault, 8000, {}, { x: 4.5, y: 1.5 });
assert.equal(vault.found, 1, "breaking a ledger block hands you that depth's page");
assert.equal(vault.map[W + 4], OPEN);
assert.equal(PAGES.length, 10);
assert.equal(SEALS.length, 9);
assert.equal(engraving(10), engraving(11), "below the last seal the floor just hums");
const camp = { deepestDepth: 1, pages: [] as number[], foxRevealed: false };
assert.ok(wickLines(camp as never).length >= 3);
assert.ok(
  wickLines({ ...camp, deepestDepth: 10, pages: PAGES.map((_, i) => i + 1) } as never).some((l) => l.includes("bell")),
);
const den = ["############", "#..........#", "#...&.....$#", "#0000000000#", "############"];
const lair = newGame(-1, den);
lair.monsters = [];
lair.nextSpawn = 1e12;
run(lair, 700, {}, { x: 4.5, y: 2.5 });
const mimic = lair.monsters.find((m) => m.kind === MIMIC_KIND);
assert.ok(mimic && lair.map[2 * W + 4] === OPEN, "hitting a mimic chest wakes it up");
run(lair, 3000, {}, { x: 4.5, y: 2.5 });
assert.equal(mimic.hp, mimic.maxHp, "a pickaxe only staggers a mimic");
assert.equal(castBolt(lair, { x: 4.5, y: 2.5 }), false, "no firebolt until you learn it");
lair.firebolt = true;
assert.ok(castBolt(lair, { x: 4.5, y: 2.5 }));
run(lair, 300);
assert.equal(mimic.hp, mimic.maxHp - stats.power * 3, "fire burns it for 3x pick damage");
assert.equal(castBolt(lair, { x: 4.5, y: 2.5 }), false, "the bolt has a cooldown");
mimic.hp = 1;
lair.nextBolt = 0;
castBolt(lair, { x: mimic.x + 0.5, y: mimic.y + 0.5 });
run(lair, 300);
assert.deepEqual(lair.pending.mimics, [2 * W + 4], "a slain mimic is reported for its loot");
assert.equal(lair.pending.kills, 0);

const bolt = newGame(-1);
bolt.firebolt = true;
const before = bolt.map.join();
castBolt(bolt, { x: 3.5, y: 6 });
run(bolt, 600);
assert.ok(!bolt.bolts.length && bolt.map.join() === before, "firebolt fizzles on rock without breaking it");

const sip = newGame(-1);
sip.player.hp = 2;
assert.equal(drinkPotion(sip), false, "no potion, no sip");
sip.potions = 1;
assert.ok(drinkPotion(sip) && sip.player.hp === 14 && sip.potions === 0 && sip.pending.drank === 1);

const chest = newGame(-1, den);
chest.monsters = [];
chest.player.x = chest.player.fromX = 9;
run(chest, 3000, {}, { x: 10.5, y: 2.5 });
assert.equal(chest.map[2 * W + 10], OPEN, "a chest breaks open");
assert.ok(chest.pending.breaks.some((b) => b.i === 2 * W + 10));
chest.trader = chest.player.y * W + chest.player.x - 2;
assert.equal(stationAt(chest), "trader", "walk up to Moss to trade");

assert.equal(dreamsFor(1).length, 3);
assert.equal(dreamsFor(10).length, 12);
const reachy = newGame(-1);
reachy.monsters = [];
reachy.nextSpawn = 1e12;
reachy.stats = { ...stats, reach: 2 };
run(reachy, 300, {}, null);
reachy.hover = { x: 3.5, y: 4.5 };
run(reachy, 20);
assert.notEqual(reachy.target, 4 * W + 3, "reach never mines through solid rock");
for (let t = 0; t < 1400 && reachy.map[3 * W + 5] !== OPEN; t += 1000 / 60)
  run(reachy, 1000 / 60, {}, { x: 5.5, y: 3.5 });
assert.equal(reachy.map[3 * W + 5], OPEN, "a tier 6+ pick mines a block two cells away");
assert.equal(reachy.player.x, 3, "without walking to it");

const wide = newGame(-1);
wide.monsters = [];
wide.nextSpawn = 1e12;
wide.stats = { ...stats, reach: 2, wide: true };
wide.player.x = wide.player.fromX = 6;
const start = Uint8Array.from(wide.map);
run(wide, 1400, {}, { x: 7.5, y: 2.5 });
for (const [cx, cy] of [
  [7, 2],
  [8, 2],
  [7, 1],
  [8, 1],
])
  assert.equal(wide.map[cy * W + cx], OPEN, `a 2x2 pick clears ${cx},${cy} too`);
const replay = Uint8Array.from(start);
for (const b of wide.pending.breaks) {
  const n = [b.i - 1, b.i + 1, b.i - W, b.i + W];
  assert.ok(
    n.some((k) => replay[k] === OPEN),
    "every 2x2 break touches open space when the server replays it",
  );
  replay[b.i] = OPEN;
}
const seam = newGame(-1, [
  "############",
  "#..........#",
  "#..........#",
  "#00AAAAA000#",
  "#0000000000#",
  "############",
]);
seam.monsters = [];
seam.nextSpawn = 1e12;
seam.stats = { ...stats, power: 20, vein: true, swingMs: 100 };
seam.player.x = seam.player.fromX = 3;
const seamStart = Uint8Array.from(seam.map);
run(seam, 380, { down: true });
for (let x = 3; x <= 7; x++) assert.equal(seam.map[3 * W + x], OPEN, `a starmetal pick cracks the whole vein (${x})`);
assert.equal(seam.map[3 * W + 8], seamStart[3 * W + 8], "but not the stone around it");
const seamReplay = Uint8Array.from(seamStart);
for (const b of seam.pending.breaks) {
  assert.ok(
    [b.i - 1, b.i + 1, b.i - W, b.i + W].some((k) => seamReplay[k] === OPEN),
    "vein breaks stay server-valid",
  );
  seamReplay[b.i] = OPEN;
}
const tank = newGame(-1);
tank.stats = { ...stats, armor: 0.3 };
const hp0 = tank.player.hp;
tank.monsters = [];
const brute = foe(tank, 1, 4, 2);
brute.dmg = 10;
run(tank, 100);
assert.equal(tank.player.hp, hp0, "a monster winds up before it bites");
assert.ok(brute.windupUntil > tank.now, "and shows it");
run(tank, 400);
assert.equal(hp0 - tank.player.hp <= 7 && hp0 - tank.player.hp > 0, true, "armor softens hits");

const burner = newGame(-1);
burner.monsters = [];
burner.stats = { ...stats, setBonus: 7, critZone: 1 };
const torch = foe(burner, 1, 4, 2);
torch.hp = torch.maxHp = 400;
torch.dmg = 0;
run(burner, 100, {}, { x: 4.5, y: 2.5 });
const afterHit = torch.hp;
assert.ok(torch.burnUntil > burner.now, "a Silver Flame crit sets it burning");
run(burner, 1900);
assert.ok(torch.hp < afterHit, "and the fire keeps biting after the swing");

const slow = newGame(-1);
slow.monsters = [];
slow.stats = { ...stats, setBonus: 6, critZone: 1 };
const snail = foe(slow, 1, 4, 2);
snail.hp = snail.maxHp = 400;
snail.dmg = 0;
run(slow, 100, {}, { x: 4.5, y: 2.5 });
assert.ok(snail.slowUntil > slow.now, "a Starbiter crit slows it");

const hopper = newGame(
  -1,
  ["############", "#..........#", "#..........#", "#..........#", "#..........#", "#0000000000#", "############"],
  4,
);
hopper.monsters = [];
hopper.nextSpawn = 1e12;
hopper.stats = { ...stats, setBonus: 8 };
minY = 99;
run(hopper, 400, { jump: true });
assert.equal(minY, 2, "Featherlight jumps two blocks high");
const plain = newGame(
  -1,
  ["############", "#..........#", "#..........#", "#..........#", "#..........#", "#0000000000#", "############"],
  4,
);
plain.monsters = [];
plain.nextSpawn = 1e12;
minY = 99;
run(plain, 400, { jump: true });
assert.equal(minY, 3, "everyone else jumps one");
const sparky = newGame(-1);
sparky.monsters = [];
sparky.nextSpawn = 1e12;
sparky.stats = { ...stats, critZone: 1, chainCrit: true };
run(sparky, 100, { down: true });
assert.equal(sparky.dmg.size, 2, "a crit with a tier 8 charm sparks a free hit into a neighbouring block");
const dull = newGame(-1);
dull.monsters = [];
dull.nextSpawn = 1e12;
dull.stats = { ...stats, critZone: 1 };
run(dull, 100, { down: true });
assert.equal(dull.dmg.size, 1, "a plain crit stays on its block");
console.log("mine.check ok");

const cave = ["############", "#...%..A...#", "#..........#", "#0000000000#", "############"];
const rich = newGame(-1, cave);
rich.monsters = [];
rich.nextSpawn = 1e12;
run(rich, 8000, {}, { x: 4.5, y: 1.5 });
assert.equal(rich.map[W + 4], OPEN, "a geode shatters");
assert.ok(rich.pending.breaks.some((b) => b.i === W + 4), "and is reported for its loot");
assert.equal(rich.richFound, false, "no motherlode on this map");

const lode = newGame(-1, cave);
lode.monsters = [];
lode.nextSpawn = 1e12;
lode.motherlode = W + 8;
lode.player.x = lode.player.fromX = 6;
run(lode, 50);
assert.ok(lode.warned.has("hum"), "the rock hums when a motherlode is near");
lode.sfx.length = 0;
run(lode, 4000, {}, { x: 7.5, y: 1.5 });
assert.ok(lode.richFound && lode.sfx.includes("motherlode"), "the first ore broken in it calls out the motherlode");
console.log("rewards ok");

const lamps = newGame(-1, cave);
for (const x of [2, 3, 5]) {
  lamps.player.x = x;
  placeTorch(lamps);
}
assert.equal(lamps.torches.size, 2, "torches stop at the trip's limit");
assert.ok(lamps.warned.has("torches"), "and the dwarf says he's out");

const duel = newGame(-1);
duel.monsters = [];
const dummy = foe(duel, 1, 5, 2);
dummy.hp = dummy.maxHp = 999;
dummy.stunUntil = 0;
dummy.dmg = 0;
dummy.moveMs = 1e9;
dummy.nextMove = 1e12;
duel.player.x = duel.player.fromX = 4;
duel.stats = { ...duel.stats, critZone: 0, swingMs: 100 };
run(duel, 20, { attack: true });
assert.equal(dummy.x, 6, "a hit knocks the monster back a tile");
assert.ok(dummy.stunUntil > duel.now, "and staggers it");
dummy.x = dummy.fromX = 5;
dummy.stunUntil = 0;
const hp1 = dummy.hp;
run(duel, 110, { attack: true });
dummy.x = dummy.fromX = 5;
run(duel, 110, { attack: true });
assert.equal(hp1 - dummy.hp, 3 + Math.round(3 * 1.5), "every third hit in a row smashes for half again");

const dodger = newGame(-1);
dodger.monsters = [];
const biter = foe(dodger, 1, 4, 2);
biter.dmg = 5;
biter.moveMs = 1e9;
biter.nextMove = 1e12;
const hp2 = dodger.player.hp;
run(dodger, 100);
assert.ok(biter.windupUntil > 0, "the bite is coming");
run(dodger, 50, { left: true, dash: true });
assert.ok(dodger.player.invulnUntil > dodger.now, "dashing grants a moment of safety");
run(dodger, 600);
assert.equal(dodger.player.hp, hp2, "dashing away dodges the bite");
assert.ok(dodger.player.nextDash > dodger.now, "the dash has a cooldown");
console.log("combat ok");

assert.equal(pickSwing(1e9, false).active, false, "a resting pick isn't swinging");
assert.ok(pickSwing(20, false).off < pickSwing(0, false).off, "the swing winds up first");
assert.ok(pickSwing(100, false).trail, "the strike leaves a motion trail");
assert.ok(pickSwing(105, true).off > pickSwing(105, false).off, "a smash swings further");
assert.ok(pickSwing(105, true).spark && !pickSwing(105, false).spark, "and sparks");
console.log("pick ok");

const wardHall = newGame(-1);
wardHall.monsters = [];
wardHall.nextSpawn = 1e12;
wardHall.player.x = wardHall.player.fromX = 4;
wardHall.stats = { ...wardHall.stats, critZone: 0, swingMs: 100 };
const raider = foe(wardHall, 6, 5, 2);
raider.ward = 2;
raider.poise = 2;
raider.stunUntil = 0;
raider.moveMs = 1e9;
raider.nextMove = 1e12;
raider.nextHit = 1e12;
const raiderHp = raider.hp;
run(wardHall, 250, { attack: true });
assert.equal(raider.hp, raiderHp, "a warded duergar shrugs off the pickaxe");
wardHall.firebolt = true;
for (let k = 0; k < 2; k++) {
  wardHall.nextBolt = 0;
  castBolt(wardHall, { x: raider.x + 0.5, y: raider.y + 0.5 });
  run(wardHall, 300);
}
assert.equal(raider.ward, 0, "two firebolts shatter the ward");
assert.equal(raider.hp, raiderHp, "the bolts spent themselves on the ward");
raider.stunUntil = 0;
raider.x = raider.fromX = 5;
run(wardHall, 20, { attack: true });
assert.ok(raider.hp < raiderHp, "then steel bites");
assert.equal(raider.x, 5, "a tough monster shrugs off one plain hit without staggering");
console.log("ward ok");

const goo = newGame(-1);
goo.monsters = [];
goo.player.x = goo.player.fromX = 4;
goo.stats = { ...goo.stats, critZone: 0, swingMs: 100 };
const cube = foe(goo, 8, 5, 2);
Object.assign(cube, { gen: 0, hp: 1, stunUntil: 0, nextHit: 1e12, nextMove: 1e12, ward: 0, poise: 3 });
run(goo, 20, { attack: true });
const halves = goo.monsters.filter((m) => m.kind === 8);
assert.equal(halves.length, 2, "a slain cube splits in two");
assert.ok(halves.every((m) => m.gen === 1 && m.hp > 0 && m.dmg > 0), "into weaker halves that still bite");
assert.equal(goo.pending.kills, 1, "only the parent cube pays out loot");
assert.ok(!halves.some((m) => m.x === goo.player.x), "the halves never land on the dwarf");

const boop = newGame(-1);
boop.monsters = [];
boop.player.x = boop.player.fromX = 4;
const cubelet = foe(boop, 8, 5, 2);
Object.assign(cubelet, { gen: 2, dmg: 0, stunUntil: 0, nextHit: 0, nextMove: 1e12, ward: 0, poise: 1 });
const boopHp = boop.player.hp;
run(boop, 700);
assert.equal(boop.player.hp, boopHp, "a tiny cubelet deals no damage");
assert.equal(boop.player.x, 3, "but boops the dwarf back a tile");
assert.equal(boop.feats.bounced, 1, "which counts toward Bouncy Castle");
console.log("cube ok");

const tough = newGame(-1);
tough.monsters = [];
tough.nextSpawn = 1e12;
tough.stats = { ...stats, power: 1e6, critZone: 0, swingMs: 100 };
tough.player.x = tough.player.fromX = 6;
const below = (tough.player.y + 1) * W + 6;
const wasCell = tough.map[below];
run(tough, 20, { down: true });
assert.equal(tough.map[below], wasCell, "even a legendary pick can't one-shot stone");
run(tough, 120, { down: true });
assert.notEqual(tough.map[below], wasCell, "but it's through on the second swing");
assert.ok(minSwings(STONE) === 2 && minSwings(ORE0) === 3, "ore takes longer than stone");
console.log("tough ok");
