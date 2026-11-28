// Self-check: bunx esbuild src/features/mine/mine.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { DepthInfo, MiningStats } from "@services/miningService";
import { FORGE_H, FORGE_LEVELS, FORGE_W, forgeSprite } from "./art/forge";
import { PET_ART } from "./art/pets";
import { ENEMIES } from "./art/world";
import {
  castBolt,
  createGame,
  drinkPotion,
  type Game,
  type Keys,
  GRAB_MS,
  playerPos,
  effects,
  bombKey,
  BOMB_SELF_DMG,
  occupies,
  WYRM_KIND,
  ELEMENTAL_KIND,
  revive,
  setBlessings,
  SHIELD_CUT,
  GLOW_BOOST,
  isZombie,
  rarify,
  ROT_RANGE,
  GRAB_NEED,
  MIMIC_KIND,
  minSwings,
  ORE0,
  OPEN,
  inTorchlight,
  lightRadius,
  placeTorch,
  placeTraps,
  addMonster,
  burden,
  strikable,
  showLoot,
  TORCH_LIGHT,
  stationAt,
  STONE,
  step,
  takePending,
  loadTrip,
} from "./engine";
import { boltHit, canAfford, characterSheet, discounted, fillUpTo, hpColor, renownBreakdown, statRows } from "./mine";
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
  dashMult: 1,
  dashTiles: 2,
  dashMs: 1200,
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
      hotOre: -1,
      oreColors: ["#c8743a"],
      depths: [depth],
      stats,
      tiers,
      forgeLevel: 1,
      houseLevel: 1,
      firebolt: false,
      potions: 0,
      maxTorches: 2,
      overload: 1.5,
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

const reload = newGame(-1);
const saved = { depth: 1, map: rows.join(""), ladders: [], torches: [], satchel: {} };
loadTrip(reload, { ...saved, hp: 7, pos: at(5, 2) }, 0);
assert.deepEqual([reload.player.x, reload.player.y, reload.player.hp], [5, 2, 7], "a reload puts you back where you were, as hurt as you were");
assert.equal(takePending(reload), null, "nothing to save right after a restore");
reload.player.hp = 5;
assert.deepEqual([takePending(reload)?.hp, takePending(reload)], [5, null], "a hit is saved once");
loadTrip(reload, { ...saved, hp: 99, pos: at(0, 0) }, 0);
assert.deepEqual([reload.player.x, reload.player.y, reload.player.hp], [3, 2, 20], "a saved spot inside rock falls back to the lift, hp caps at max");
loadTrip(reload, { ...saved, hp: 0 }, 0);
assert.ok(reload.fainted, "a reload at zero hp still faints");

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

{
  const gr = newGame(-1);
  gr.monsters = [];
  const chest = foe(gr, MIMIC_KIND, gr.player.x + 1, gr.player.y);
  for (let t = 0; t < 4000 && !gr.grab; t += 1000 / 60) step(gr, 1000 / 60, none, null);
  assert.ok(gr.grab?.m === chest, "a mimic grapples you when it bites");
  const x0 = gr.player.x;
  run(gr, 300, { left: true });
  assert.equal(gr.player.x, x0, "you can't walk away while grappled");
  run(gr, 50);
  for (let i = 0; i < 4; i++) {
    run(gr, 50, { left: true });
    run(gr, 50);
  }
  assert.equal(gr.grab?.got, 1, "only the A, D, A, D order counts");
  for (let i = 0; i < GRAB_NEED; i++) {
    run(gr, 40, i % 2 ? { left: true } : { right: true });
    run(gr, 40);
  }
  assert.equal(gr.grab, null, "mashing A, D breaks you free");
  assert.ok(gr.now < chest.stunUntil && chest.grappled, "and staggers the mimic");
  run(gr, 6000);
  assert.equal(gr.grab, null, "a mimic only grapples you once");

  const late = newGame(-1);
  late.monsters = [];
  foe(late, MIMIC_KIND, late.player.x + 1, late.player.y);
  for (let t = 0; t < 4000 && !late.grab; t += 1000 / 60) step(late, 1000 / 60, none, null);
  const hp = late.player.hp;
  run(late, GRAB_MS + 100);
  assert.ok(late.grab === null && late.player.hp < hp, "a slow escape costs health, then it spits you out");
}

{
  const ven = newGame(-1);
  ven.monsters = [];
  const spider = rarify(ven, foe(ven, 3, ven.player.x + 1, ven.player.y), true);
  assert.equal(spider.def.name, "Venom Spider", "a rare spider is a venom spider");
  for (let t = 0; t < 4000 && ven.now >= ven.player.poisonUntil; t += 1000 / 60) step(ven, 1000 / 60, none, null);
  assert.ok(ven.now < ven.player.poisonUntil, "its bite poisons you");
  ven.monsters = [];
  const hp = ven.player.hp;
  run(ven, 2000);
  assert.ok(ven.player.hp < hp, "poison keeps hurting after the bite");

  const zom = newGame(-1, ["############", "#..........#", "#..........#", "############"]);
  zom.monsters = [];
  const z = rarify(zom, foe(zom, 4, zom.player.x + ROT_RANGE, zom.player.y), true);
  z.moveMs = 1e9;
  z.nextMove = 1e12;
  const full = zom.player.hp;
  run(zom, 3000);
  assert.ok(isZombie(z) && zom.player.hp < full, "a zombie's necrotic burst reaches you from two tiles away");
}

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
lair.stats = { ...stats, critZone: 0 };
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

{
  const fb = newGame(-1, ["############", "#..........#", "#..........#", "############"]);
  fb.monsters = [];
  fb.firebolt = true;
  fb.fireball = true;
  fb.stats = { ...stats, critZone: 0 };
  const hit = [foe(fb, 1, 6, 2), foe(fb, 1, 7, 2), foe(fb, 1, 10, 2)];
  for (const m of hit) {
    m.hp = m.maxHp = 1e6;
    m.nextMove = m.nextHit = 1e12;
  }
  castBolt(fb, { x: 6.5, y: 2.5 });
  run(fb, 500);
  assert.equal(hit[0].hp, 1e6 - stats.power * 5, "a fireball hits for 5x pick damage");
  assert.equal(hit[1].hp, 1e6 - stats.power * 5, "and bursts on its neighbours");
  assert.equal(hit[2].hp, 1e6, "but not on monsters out of range");
  assert.equal(boltHit({ ...stats, setBonus: 7 }), Math.round(stats.power * 3 * 1.5), "the fire set stokes the bolt");
  assert.equal(boltHit(stats, false, true), Math.round(stats.power * 3 * stats.critMult), "bolts can crit");
}

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
sip.player.hp = 2;
sip.greater = 1;
sip.nextPotion = 0;
assert.ok(drinkPotion(sip) && sip.player.hp === sip.stats.maxHp && sip.greater === 0 && sip.pending.drankGreater === 1, "with no draughts left, Q falls back to a greater potion, which heals fully");
const pick = newGame(-1);
pick.player.hp = 2;
pick.potions = 1;
pick.greater = 1;
pick.drink = "greater";
assert.ok(drinkPotion(pick) && pick.greater === 0 && pick.potions === 1, "Q drinks the potion picked on the hotbar");

const chest = newGame(-1, den);
chest.monsters = [];
chest.player.x = chest.player.fromX = 9;
run(chest, 3000, {}, { x: 10.5, y: 2.5 });
assert.equal(chest.map[2 * W + 10], OPEN, "a chest breaks open");
assert.ok(chest.pending.breaks.some((b) => b.i === 2 * W + 10));
chest.trader = chest.player.y * W + chest.player.x - 2;
assert.equal(stationAt(chest), "trader", "walk up to Moss to trade");

assert.equal(dreamsFor(1).length, 4);
assert.equal(dreamsFor(10).length, 14);
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
{
  const arc = newGame(-1, ["############", "#..........#", "#..........#", "#..........#", "############"], 3);
  const ys: number[] = [];
  step(arc, 1000 / 60, { ...none, jump: true }, null);
  for (let t = 0; t < 900; t += 1000 / 60) {
    step(arc, 1000 / 60, none, null);
    ys.push(playerPos(arc).y);
  }
  const top = ys.indexOf(Math.min(...ys));
  const jumps = ys.slice(1).map((y, i) => Math.abs(y - ys[i]));
  assert.ok(Math.max(...jumps) < 0.2, `the jump arc moves smoothly frame to frame (${Math.max(...jumps).toFixed(2)})`);
  assert.ok(ys.slice(0, top).every((y, i) => i === 0 || y <= ys[i - 1]) && ys.slice(top).every((y, i, a) => i === 0 || y >= a[i - 1]), "it rises, then falls, without wobbling");
}
{
  const leap = newGame(-1, ["############", "#..........#", "#..........#", "#..........#", "#000.000000#", "############"], 3);
  leap.monsters = [];
  leap.nextSpawn = 1e12;
  const x0 = leap.player.x;
  const y0 = leap.player.y;
  step(leap, 1000 / 60, { ...none, jump: true, right: true }, null);
  assert.equal(leap.player.x, x0 + 1, "jumping while holding a direction leaps diagonally");
  assert.equal(leap.player.y, y0 - 1, "and still rises a block");
  let last = playerPos(leap);
  let worst = 0;
  for (let t = 0; t < 1200; t += 1000 / 60) {
    step(leap, 1000 / 60, { ...none, right: true }, null);
    const now = playerPos(leap);
    worst = Math.max(worst, Math.hypot(now.x - last.x, now.y - last.y));
    last = now;
  }
  assert.ok(worst < 0.25, `a running leap moves smoothly (${worst.toFixed(2)})`);
  assert.ok(leap.player.x >= x0 + 3 && leap.player.y === y0, "a running leap clears a one-block gap and keeps going");
}
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
{
  const sick = newGame(-1);
  assert.deepEqual(effects(sick), [], "no effects on a fresh trip");
  sick.player.poisonUntil = sick.now + 3000;
  sick.dimUntil = sick.now + 1000;
  assert.deepEqual(effects(sick).map((e) => [e.key, e.left]), [["poison", 3000], ["dim", 1000]], "active effects list with time left");
  sick.now += 1500;
  assert.deepEqual(effects(sick).map((e) => e.key), ["poison"], "expired effects drop off");
}
{
  const bare = newGame(-1);
  const warded = newGame(-1);
  for (const g of [bare, warded]) {
    g.monsters = [];
    g.nextSpawn = 1e12;
    g.player.poisonUntil = g.now + 5000;
    g.info = { ...g.info, monsterDamage: 100 };
    g.stats = { ...g.stats, maxHp: 1000 };
    g.player.hp = 1000;
  }
  setBlessings(warded, { shield: 60_000 });
  run(bare, 900);
  run(warded, 900);
  const lost = (g: Game) => g.stats.maxHp - g.player.hp;
  assert.ok(lost(warded) < lost(bare) && lost(warded) >= lost(bare) * (1 - SHIELD_CUT) - 1, "the ward blessing softens every hit");
  assert.ok(effects(warded).some((e) => e.key === "shield"), "an active blessing shows as an effect");
  const lit = newGame(-1);
  const r = lightRadius(lit);
  setBlessings(lit, { glow: 60_000 });
  assert.equal(lightRadius(lit), r * GLOW_BOOST, "the glow blessing widens your light");
  const mend = newGame(-1);
  mend.monsters = [];
  mend.nextSpawn = 1e12;
  mend.player.hp = mend.stats.maxHp / 2;
  mend.player.lastHurt = mend.now;
  const unblessed = mend.player.hp;
  setBlessings(mend, { regen: 60_000 });
  run(mend, 1000);
  assert.ok(mend.player.hp > unblessed, "the mending blessing heals you outside torchlight");
  setBlessings(mend, {});
  assert.ok(!effects(mend).some((e) => e.key === "regen"), "an expired blessing drops off");
  const fallen = newGame(-1);
  fallen.player.hp = 0;
  fallen.fainted = true;
  revive(fallen);
  assert.ok(!fallen.fainted && fallen.player.hp === fallen.stats.maxHp, "a revive scroll stands you back up at full health");
}
{
  const field = ["############", "#......0000#", "#......0000#", ...Array.from({ length: 15 }, (_, y) => (y === 6 ? "#.000000000#" : "#0000000000#")), "############"];
  const boom = newGame(-1, field);
  boom.monsters = [];
  boom.nextSpawn = 1e12;
  boom.seen.fill(1);
  boom.bombs = 1;
  const hp = boom.player.hp;
  boom.hover = { x: 1.5, y: 9.5 };
  bombKey(boom);
  assert.equal(boom.fuses.length, 0, "the first B only readies the bomb");
  bombKey(boom);
  assert.equal(boom.fuses.length, 1, "the second B lights it at the cursor");
  assert.equal(boom.bombs, 0, "lighting one spends it");
  run(boom, 2100);
  const at = (x: number, y: number) => boom.map[y * W + x];
  assert.ok(at(8, 9) === OPEN && at(1, 16) === OPEN && at(5, 14) === OPEN, "the blast clears everything 7 tiles out");
  assert.ok(at(6, 14) !== OPEN && at(2, 16) !== OPEN, "the blast is round, not square");
  assert.deepEqual(boom.pending.bombs, [{ i: 9 * W + 1, after: 0 }], "the blast is queued for the server in order");
  assert.equal(boom.player.hp, hp, "standing outside the ring keeps you safe");
  const close = newGame(-1, field);
  close.monsters = [];
  close.nextSpawn = 1e12;
  close.seen.fill(1);
  close.bombs = 1;
  close.stats = { ...close.stats, maxHp: 1000, armor: 0.25 };
  close.player.hp = 1000;
  close.hover = { x: 6.5, y: 2.5 };
  bombKey(close);
  bombKey(close);
  run(close, 2100);
  assert.equal(1000 - close.player.hp, BOMB_SELF_DMG * 0.75, "your own bomb hits you for 200, less armor");
}
{
  const lair = newGame(-1, ["############", ...Array.from({ length: 5 }, () => "#..........#"), "############"]);
  lair.monsters = [];
  lair.nextSpawn = 1e12;
  lair.seen.fill(1);
  const w = addMonster(lair, WYRM_KIND, 6, 5);
  assert.ok(occupies(w, 9, 3) && !occupies(w, 10, 5) && !occupies(w, 6, 2), "the wyrm fills a 4x3 footprint");
  const golem = addMonster(lair, 10, 2, 5);
  assert.ok(occupies(golem, 2, 3) && !occupies(golem, 2, 2), "the star golem stands three tiles tall");
  assert.ok(occupies(addMonster(lair, 8, 3, 5), 3, 4), "the cube stands two tiles tall");
  lair.monsters = lair.monsters.filter((m) => m === w);
  lair.player.x = lair.player.fromX = 5;
  lair.player.y = lair.player.fromY = 5;
  lair.lastInput = 1e15;
  w.hp = 1e6;
  step(lair, 16, { ...none, attack: true }, { x: 6.5, y: 4.5 });
  run(lair, 300);
  assert.ok(w.hp < 1e6 && w.x === 6, "the wyrm takes a pick hit but can't be knocked back");
  w.hp = 1;
  lair.player.nextSwing = 0;
  step(lair, 16, { ...none, attack: true }, { x: 6.5, y: 4.5 });
  run(lair, 300);
  assert.ok(!lair.monsters.includes(w) && lair.pending.wyrm, "slaying the wyrm tells the server");
}
{
  const hall = newGame(-1, ["############", ...Array.from({ length: 4 }, () => "#..........#"), "############"]);
  hall.monsters = [];
  hall.nextSpawn = 1e12;
  hall.seen.fill(1);
  hall.lastInput = 1e15;
  hall.player.x = hall.player.fromX = 4;
  hall.player.y = hall.player.fromY = 4;
  const fire = addMonster(hall, ELEMENTAL_KIND, 7, 4);
  fire.nextMove = 1e15;
  const hp = hall.player.hp;
  run(hall, 1200);
  assert.ok(hall.player.hp < hp && hall.player.burnUntil > hall.now, "a fire elemental's breath burns you from 3 tiles off");
  assert.equal(hall.player.x, 3, "and its gust blows you back a tile");
  const before = fire.hp;
  hall.firebolt = true;
  hall.nextBolt = 0;
  assert.ok(castBolt(hall, { x: fire.x + 0.5, y: fire.y + 0.5 }), "the test bolt flies");
  run(hall, 600);
  assert.equal(fire.hp, before, "fire does nothing to it");
}
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

const rusher = newGame(-1);
rusher.monsters = [];
const passed = foe(rusher, 1, 4, 2);
passed.moveMs = 1e9;
passed.nextMove = 1e12;
const hp3 = passed.hp;
run(rusher, 50, { right: true, dash: true });
assert.equal(rusher.player.x, 5, "the dash carries you through the monster");
assert.equal(hp3 - passed.hp, stats.power, "and strikes it on the way");
const kicker = newGame(-1);
kicker.monsters = [];
kicker.stats = { ...stats, dashMult: 2 };
const kicked = foe(kicker, 1, 4, 2);
kicked.moveMs = 1e9;
kicked.nextMove = 1e12;
const hp4 = kicked.hp;
run(kicker, 50, { right: true, dash: true });
assert.equal(hp4 - kicked.hp, stats.power * 2, "boots scale the dash strike");

const feather = newGame(-1);
feather.monsters = [];
feather.stats = { ...stats, setBonus: 8, dashTiles: 3 };
run(feather, 50, { right: true, dash: true });
assert.equal(feather.player.x, 6, "a longer dash stat carries you further");
const quick = newGame(-1);
quick.stats = { ...stats, dashMs: 800 };
run(quick, 50, { right: true, dash: true });
assert.ok(quick.player.nextDash - quick.now <= 800, "faster boots recharge the dash sooner");
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
assert.ok(minSwings(STONE, 0, 1) === 2 && minSwings(ORE0, 0, 1) === 3, "ore takes longer than stone");
assert.ok(minSwings(STONE, 2, 1) === 2 && minSwings(STONE, 4, 3) === 2, "two tiers over the depth still needs the full count");
assert.ok(minSwings(STONE, 3, 1) === 1 && minSwings(ORE0, 5, 1) === 2, "a far stronger pick shaves a swing off");
assert.ok(minSwings(ORE0, 9, 1) === 2, "but ore never drops to one");
console.log("tough ok");

const forge = newGame(-1, [
  "############",
  "#..........#",
  "#..........#",
  "#AAAAAAAAAA#",
  "############",
]);
forge.monsters = [];
forge.nextSpawn = 1e12;
forge.hotOre = 0;
forge.player.x = forge.player.fromX = 4;
forge.player.y = forge.player.fromY = 2;
const forgeHp = forge.player.hp;
run(forge, 1100);
assert.ok(forge.player.hp < forgeHp, "standing on flametouched iron burns");
const cool = newGame(-1, ["############", "#..........#", "#..........#", "#AAAAAAAAAA#", "############"]);
cool.monsters = [];
cool.nextSpawn = 1e12;
cool.player.x = cool.player.fromX = 4;
cool.player.y = cool.player.fromY = 2;
run(cool, 1100);
assert.equal(cool.player.hp, cool.stats.maxHp, "ordinary ore is safe to stand on");
console.log("hot ore ok");

assert.equal(FORGE_LEVELS.length, 10, "one forge level per gear tier");
for (const L of FORGE_LEVELS)
  for (const flick of [false, true]) {
    const s = forgeSprite(L.level, flick, 7);
    assert.equal(s.length, FORGE_H, `forge ${L.level} height`);
    assert.ok(s.every((r) => r.length === FORGE_W), `forge ${L.level} width`);
    assert.ok(!s.flat().includes("#ff00ff"), `forge ${L.level} palette`);
  }
console.log("forge ok");

{
  const base = { power: 10, swingMs: 500, light: 3, maxHp: 50, critZone: 0.2, critMult: 2, luck: 0.1, yield: 1, capacity: 100, maxDepth: 3, reach: 1, wide: false, vein: false, oreSight: 0, chainCrit: false } as unknown as MiningStats;
  const pick = statRows("pickaxe", base, { ...base, power: 20, wide: true });
  assert.equal(pick.rows.find((r) => r.label === "Damage")?.gain, "+10");
  assert.equal(pick.rows.find((r) => r.label === "Reach")?.gain, null);
  assert.deepEqual(pick.perks, [{ label: "Digs 2×2", fresh: true }]);
  const charm = statRows("charm", base, { ...base, critZone: 0.25 });
  assert.equal(charm.rows.find((r) => r.label === "Crit chance")?.gain, "+5%");
  assert.equal(statRows("helm", base, base).rows.some((r) => r.label === "Ore sense"), false);
}
console.log("stat rows ok");
{
  const ores = [
    { key: "copper", name: "Copper", value: 1 },
    { key: "tin", name: "Tin", value: 2 },
    { key: "iron", name: "Iron", value: 3 },
  ] as never;
  const rows = renownBreakdown(ores, { copper: 10, iron: 5 });
  assert.deepEqual(rows.map((r) => [r.name, r.total, r.index]), [["Iron", 15, 2], ["Copper", 10, 0]]);
}
console.log("renown breakdown ok");
{
  const g = newGame(-1);
  g.oreNames = ["Copper", "Tin"];
  g.oreColors = ["#c8743a", "#aaaaaa"];
  g.texts = [];
  showLoot(g, W + 2, [{ index: 1, n: 4 }, { index: 0, n: 12000 }]);
  assert.deepEqual(g.texts.map((t) => t.text), ["+12K Copper", "+4 Tin"]);
  assert.ok(g.texts[1].y < g.texts[0].y);
  g.texts = [];
  showLoot(g, W + 2, []);
  assert.match(g.texts[0].text, /Satchel full/);
}
console.log("loot popups ok");
{
  const g = newGame(-1);
  const base = lightRadius(g);
  g.depth = 10;
  assert.ok(Math.abs(lightRadius(g) - base * 0.6) < 1e-9, "the lantern shrinks to 60% at the bottom");
  g.boons.add("oil");
  assert.ok(Math.abs(lightRadius(g) - base * 0.9) < 1e-9, "Moss's lamp oil burns half again as far");
  g.boons.clear();
  g.depth = 1;
  assert.ok(inTorchlight(g, g.liftX, g.liftY), "the lift torch lets you mend");
  const hp = g.stats.maxHp;
  g.player.hp = hp / 2;
  g.now = 10_000;
  run(g, 1000);
  assert.ok(g.player.hp > hp / 2 + hp * 0.05, "resting by the lift heals faster than a torch");
  const far = { x: g.W - 2, y: g.H - 2 };
  assert.ok(!inTorchlight(g, far.x, far.y), "far tunnels are dark");
  g.torches.add((far.y - TORCH_LIGHT) * g.W + far.x);
  assert.ok(inTorchlight(g, far.x, far.y), "a torch lights its radius");
}
console.log("torchlight ok");
{
  const g = newGame(-1);
  const p = g.player;
  g.map[at(9, 5)] = OPEN;
  g.map[at(9, 6)] = OPEN;
  p.x = p.fromX = 9;
  p.y = p.fromY = 6;
  p.hp = 1;
  p.lastHurt = -1e9;
  step(g, 1000, none, null);
  assert.equal(p.hp, 1, "no healing in the dark");
  g.torches.add((p.y - 1) * g.W + p.x);
  step(g, 1000, none, null);
  assert.ok(p.hp > 1, "torchlight mends wounds");
}
console.log("torch healing ok");
{
  const TW = 40;
  const map = new Uint8Array(TW * 10).fill(STONE);
  for (let y = 2; y <= 7; y += 5) for (let x = 1; x < TW - 1; x++) map[y * TW + x] = OPEN;
  const fake = (depth: number) => ({ W: TW, map, liftX: 3, trader: -1, depth }) as unknown as Game;
  assert.equal(placeTraps(fake(1), "seed").length, 0, "no traps at depth 1");
  const two = placeTraps(fake(2), "seed");
  assert.ok(two.length > 0 && two.every((t) => t.key === "spikes"), "depth 2 brings spike plates");
  assert.deepEqual(placeTraps(fake(2), "seed"), two, "same map, same traps");
  assert.ok(two.every((t) => t.i % TW > 11 && map[t.i + TW] !== OPEN), "on a floor, away from the lift");
  const deep = placeTraps(fake(10), "seed");
  assert.ok(new Set(deep.map((t) => t.key)).size >= 3, "the deep mixes old traps with new");

  const g = newGame(-1);
  const p = g.player;
  g.traps = [{ i: p.y * g.W + p.x, key: "spikes", phase: 0, armedAt: 0, sprung: false, fireAt: 0, firedAt: -1e9, hitCycle: -1, target: -1 }];
  const before = p.hp;
  step(g, 16, none, null);
  assert.ok(p.hp < before, "a spike plate jabs");
  const after = p.hp;
  step(g, 16, none, null);
  assert.equal(p.hp, after, "and needs a moment to re-arm");
}
console.log("traps ok");
{
  const p = { x: 5, y: 5 } as Parameters<typeof strikable>[0];
  const foe = (x: number, y: number, fromX = x, fromY = y, t = 1, dur = 1) =>
    ({ x, y, fromX, fromY, t, dur }) as Parameters<typeof strikable>[1];
  assert.ok(strikable(p, foe(6, 5)), "next to you");
  assert.ok(!strikable(p, foe(7, 5)), "two tiles off is out of reach");
  assert.ok(strikable(p, foe(7, 5, 6, 5, 10, 100)), "still hittable while it slides away");
  assert.ok(strikable(p, foe(6, 6)), "diagonal below, in a dip");
  assert.ok(strikable(p, foe(6, 6), 1) && !strikable(p, foe(6, 6), -1), "facing matters");
}
console.log("strikes ok");
{
  const g = newGame(-1);
  const p = g.player;
  g.embers.set(p.y * g.W + p.x, g.now + 3000);
  step(g, 16, none, null);
  assert.ok(p.burnUntil > g.now, "salamander embers set you burning");

  const h = newGame(-1);
  const q = h.player;
  const startX = q.x;
  q.rootUntil = h.now + 1000;
  step(h, 16, { ...none, right: true }, null);
  assert.equal(q.x, startX, "engulfed: you can't walk away");
  q.rootUntil = 0;
  step(h, 16, { ...none, right: true }, null);
  step(h, 16, { ...none, left: true }, null);
  assert.notEqual(q.x, startX, "free again, you can walk");
}
console.log("enemy traits ok");
{
  const g = newGame(
    -1,
    ["############", "#..........#", "#..........#", "#..........#", "#..........#", "#0000000000#", "############"],
    4,
  );
  const p = g.player;
  g.monsters = [];
  g.nextSpawn = 1e12;
  g.carried = g.stats.capacity + 1;
  const y = p.y;
  step(g, 16, { ...none, jump: true }, null);
  assert.notEqual(p.y, y, "a little over capacity, you can still jump");
  p.y = y;
  p.x = 5;
  p.t = p.dur = 0;
  p.hangUntil = 0;
  for (let k = 0; k < 120; k++) step(g, 16, none, null);
  g.carried = Math.floor(g.stats.capacity * 1.5);
  const y2 = p.y;
  step(g, 16, { ...none, jump: true }, null);
  assert.equal(p.y, y2, "overloaded: too heavy to jump");
  g.carried = 0;
  step(g, 16, { ...none, jump: true }, null);
  assert.notEqual(p.y, y, "light again, you can jump");
}
console.log("encumbrance ok");
{
  const sheet = characterSheet(stats);
  assert.ok(sheet.find((r) => r.slot === "satchel")?.rows.some((r) => r.label === "Carries"), "sheet lists every slot's stats");
}
console.log("character ok");
{
  const pile = { copper: 30, gold: 8, mithral: 5 };
  assert.deepEqual(fillUpTo(pile, ["mithral", "gold", "copper"], 10), { mithral: 5, gold: 5 }, "rarest first, up to the room");
  assert.deepEqual(fillUpTo(pile, ["mithral", "gold", "copper"], 0), {}, "no room, take nothing");
  assert.deepEqual(fillUpTo(pile, ["mithral", "gold", "copper"], 999), pile, "plenty of room, take it all");

  const g = newGame(-1);
  g.carried = g.stats.capacity;
  assert.equal(burden(g), 0, "full but not over: no burden");
  g.carried = g.stats.capacity + Math.round((g.stats.capacity * (g.overload - 1)) / 2);
  assert.ok(Math.abs(burden(g) - 0.5) < 0.05, "halfway into the overload");
  g.carried = g.stats.capacity * 10;
  assert.equal(burden(g), 1, "burden tops out at the hard cap");
}
console.log("loot pile ok");
{
  const g = newGame(-1);
  const p = g.player;
  g.riding = true;
  const hp = p.hp;
  g.traps = [{ i: p.y * g.W + p.x, key: "spikes", phase: 0, armedAt: 0, sprung: false, fireAt: 0, firedAt: -1e9, hitCycle: -1, target: -1 }];
  step(g, 16, none, null);
  assert.equal(p.hp, hp, "once you pull the lift lever, nothing down there can hurt you");
}
console.log("lift ok");
{
  const open = ["############", "#..........#", "#..........#", "#..........#", "#..........#", "#0000000000#", "############"];
  const fresh = () => {
    const g = newGame(-1, open, 4);
    g.monsters = [];
    g.nextSpawn = 1e12;
    g.player.x = 5;
    return g;
  };
  const walkRight = (g: Game) => {
    g.player.nextSwing = g.now + 99999;
    step(g, 16, { ...none, right: true }, null);
    return g.player.x;
  };

  const g1 = fresh();
  addMonster(g1, 1, 5, 4);
  assert.equal(walkRight(g1), 6, "a monster on your own tile doesn't pin you");

  const g2 = fresh();
  addMonster(g2, 1, 6, 4);
  assert.equal(walkRight(g2), 5, "a monster in the way blocks you while your swing recovers");

  const g3 = fresh();
  addMonster(g3, 1, 6, 4).stunUntil = g3.now + 1000;
  assert.equal(walkRight(g3), 6, "you can slip past a staggered monster");
}
console.log("movement ok");
