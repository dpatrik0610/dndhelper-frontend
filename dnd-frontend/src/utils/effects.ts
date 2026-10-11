import type { Character } from "@appTypes/Character/Character";
import type { AbilityScores } from "@appTypes/Character/AbilityScores";
import type { SavingThrows } from "@appTypes/Character/SavingThrows";
import type { CharacterEffect, StatModifier } from "@appTypes/Character/Effect";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";

export type Ability = keyof AbilityScores;
export type RollMode = "normal" | "advantage" | "disadvantage";

export const ABILITIES: { key: Ability; name: string; save: keyof SavingThrows }[] = [
  { key: "str", name: "Strength", save: "strength" },
  { key: "dex", name: "Dexterity", save: "dexterity" },
  { key: "con", name: "Constitution", save: "constitution" },
  { key: "int", name: "Intelligence", save: "intelligence" },
  { key: "wis", name: "Wisdom", save: "wisdom" },
  { key: "cha", name: "Charisma", save: "charisma" },
];

const SKILL_ABILITY: Record<string, Ability> = Object.fromEntries(DEFAULT_SKILLS.map((s) => [s.name, s.ability]));

/** One reason a stat differs from the sheet, e.g. { source: "Plate Armor", detail: "disadvantage" }. */
export interface Reason {
  source: string;
  detail: string;
}

export interface StatResult {
  base: number;
  value: number;
  roll: RollMode;
  why: Reason[];
  /** Saves and skills only: proficient after effects. */
  proficient?: boolean;
}

/** An applied effect; conditions are derived from `character.conditions` and never stored. */
export type AppliedEffect = Omit<CharacterEffect, "source"> & { source: CharacterEffect["source"] | "condition" };

export interface EffectiveStats {
  /** Keyed like modifier targets: "con", "save:con", "check:con", "skill:Stealth", "passive:Perception", "ac", ... */
  stats: Record<string, StatResult>;
  /** Non-numeric effects ("Resistance to fire damage"), granted proficiencies included. */
  notes: Reason[];
  /** Weapon, armor and tool proficiencies effects grant: { source, detail: "Thieves' tools" }. */
  proficiencies: Reason[];
  effects: AppliedEffect[];
}

const note = (text: string): StatModifier => ({ target: "", type: "note", text });
const SPEED_ZERO: StatModifier = { target: "speed", type: "set", value: 0 };
const AUTO_FAIL = "Automatically fails STR and DEX saves";

/** SRD 5e conditions, so a condition on the sheet changes the numbers with no setup. */
export const CONDITION_MODIFIERS: Record<string, StatModifier[]> = {
  blinded: [{ target: "attack", type: "disadvantage" }, note("Fails sight-based checks; attacks against you have advantage")],
  charmed: [note("Can't attack the charmer; the charmer has advantage on social checks against you")],
  deafened: [note("Fails hearing-based checks")],
  exhaustion: [{ target: "checks", type: "disadvantage" }, note("Level 1 shown; higher levels add more penalties")],
  frightened: [
    { target: "checks", type: "disadvantage" },
    { target: "attack", type: "disadvantage" },
    note("Only while the source of fear is in sight; can't move closer to it"),
  ],
  grappled: [SPEED_ZERO],
  incapacitated: [note("Can't take actions or reactions")],
  invisible: [{ target: "attack", type: "advantage" }, note("Attacks against you have disadvantage")],
  paralyzed: [SPEED_ZERO, note(`Incapacitated. ${AUTO_FAIL}; hits from within 5 ft are critical`)],
  petrified: [SPEED_ZERO, note(`Incapacitated. ${AUTO_FAIL}; resistance to all damage`)],
  poisoned: [
    { target: "attack", type: "disadvantage" },
    { target: "checks", type: "disadvantage" },
  ],
  prone: [{ target: "attack", type: "disadvantage" }, note("Melee attacks against you have advantage, ranged ones disadvantage")],
  restrained: [SPEED_ZERO, { target: "attack", type: "disadvantage" }, { target: "save:dex", type: "disadvantage" }],
  stunned: [SPEED_ZERO, note(`Incapacitated. ${AUTO_FAIL}`)],
  unconscious: [SPEED_ZERO, note(`Incapacitated and prone. ${AUTO_FAIL}; hits from within 5 ft are critical`)],
};

export function appliedEffects(c: Character): AppliedEffect[] {
  const conditions = (c.conditions ?? []).flatMap((name): AppliedEffect[] => {
    const modifiers = CONDITION_MODIFIERS[name.trim().toLowerCase()];
    return modifiers ? [{ id: `condition:${name}`, name, source: "condition", active: true, modifiers }] : [];
  });
  return [...(c.effects ?? []).filter((e) => e.active), ...conditions];
}

const abilityMod = (score: number) => Math.floor((score - 10) / 2);
export const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
const toAbility = (word?: string) => ABILITIES.find((a) => a.key === word?.slice(0, 3).toLowerCase())?.key;

/** Layers the active effects over the base sheet. Nothing on the character is changed. */
const situationKey = (s: string) => s.trim().toLowerCase();

/** Whether a change counts right now: always, or while its situation is switched on. */
export function modifierApplies(c: Pick<Character, "activeSituations">, m: StatModifier) {
  if (!m.when?.trim()) return true;
  return (c.activeSituations ?? []).some((s) => situationKey(s) === situationKey(m.when!));
}

/** Every situation the character's effects mention, plus any still switched on, in first-seen spelling. */
export function situationsOf(c: Pick<Character, "effects" | "activeSituations">): string[] {
  const seen = new Map<string, string>();
  const labels = [...(c.effects ?? []).flatMap((e) => e.modifiers.map((m) => m.when ?? "")), ...(c.activeSituations ?? [])];
  for (const label of labels) if (label.trim() && !seen.has(situationKey(label))) seen.set(situationKey(label), label.trim());
  return [...seen.values()];
}

export function computeEffects(c: Character): EffectiveStats {
  const effects = appliedEffects(c);
  const mods = effects.flatMap((e) => e.modifiers.filter((m) => modifierApplies(c, m)).map((m) => ({ ...m, source: e.name })));
  const stats: Record<string, StatResult> = {};

  // Order: "min" raises the floor, bonuses add up, then "set" overrides everything (restrained: speed 0 even with boots).
  const pb = c.proficiencyBonus ?? 2;

  // `proficient` (saves and skills) is whether the sheet already has proficiency; leave it out elsewhere.
  const resolve = (key: string, base: number, targets: string[], carried?: { source: string; value: number }, proficient?: boolean) => {
    const own = mods.filter((m) => targets.includes(m.target));
    const why: Reason[] = [];
    let value = base;
    if (carried?.value) {
      value += carried.value;
      why.push({ source: carried.source, detail: signed(carried.value) });
    }
    // Proficiency never stacks: the bonus is added once, and only where the sheet lacks it.
    let isProficient = proficient;
    if (proficient !== undefined) {
      for (const m of own.filter((o) => o.type === "proficiency")) {
        if (isProficient) {
          why.push({ source: m.source, detail: "proficiency (already proficient, no change)" });
        } else {
          value += pb;
          isProficient = true;
          why.push({ source: m.source, detail: `proficiency ${signed(pb)}` });
        }
      }
    }
    for (const m of own) {
      if (m.value == null) continue;
      if (m.type === "min" && m.value > value) {
        value = m.value;
        why.push({ source: m.source, detail: `raised to ${m.value}` });
      } else if (m.type === "bonus") {
        value += m.value;
        why.push({ source: m.source, detail: signed(m.value) });
      }
    }
    for (const m of own) {
      if (m.type === "set" && m.value != null) {
        value = m.value;
        why.push({ source: m.source, detail: `set to ${m.value}` });
      }
    }
    const adv = own.filter((m) => m.type === "advantage");
    const dis = own.filter((m) => m.type === "disadvantage");
    for (const m of [...adv, ...dis]) why.push({ source: m.source, detail: m.type });
    // 5e: any advantage and any disadvantage cancel out.
    const roll: RollMode = adv.length && !dis.length ? "advantage" : dis.length && !adv.length ? "disadvantage" : "normal";
    return (stats[key] = { base, value, roll, why, ...(isProficient !== undefined && { proficient: isProficient }) });
  };

  for (const a of ABILITIES) resolve(a.key, c.abilityScores?.[a.key] ?? 10, [a.key]);

  // A changed score moves everything built on its modifier: "+1 from CON (Amulet of Health)".
  const fromAbility = (key?: Ability) => {
    if (!key) return undefined;
    const s = stats[key];
    return {
      source: `${key.toUpperCase()} ${s.base}→${s.value} (${s.why.map((r) => r.source).join(", ")})`,
      value: abilityMod(s.value) - abilityMod(s.base),
    };
  };

  for (const a of ABILITIES) {
    const save = c.savingThrows?.[a.save] ?? 0;
    // Saves are stored as plain numbers: one at mod + proficiency bonus or more counts as proficient.
    const saveProficient = save >= abilityMod(stats[a.key].base) + pb;
    resolve(`save:${a.key}`, save, [`save:${a.key}`, "saves"], fromAbility(a.key), saveProficient);
    resolve(`check:${a.key}`, abilityMod(stats[a.key].base), ["checks"], fromAbility(a.key));
  }
  for (const s of c.skills ?? []) {
    resolve(`skill:${s.name}`, s.value, [`skill:${s.name}`, "checks"], fromAbility(SKILL_ABILITY[s.name] ?? "str"), !!s.proficient);
  }

  resolve("initiative", c.initiative ?? 0, ["initiative"], fromAbility("dex"));
  // ponytail: AC ignores DEX changes, since that depends on the armor worn. Use an "ac" modifier when it matters.
  resolve("ac", c.armorClass ?? 10, ["ac"]);
  resolve("speed", c.speed ?? 30, ["speed"]);
  resolve("attack", 0, ["attack"]);
  const con = fromAbility("con")!;
  resolve("maxHp", c.maxHitPoints ?? 0, ["maxHp"], { ...con, value: con.value * (c.level ?? 1) });
  const casting = fromAbility(toAbility(c.spellcastingAbility));
  resolve("spellDc", c.spellSaveDc ?? 10, ["spellDc"], casting);
  resolve("spellAttack", c.spellAttackBonus ?? 0, ["spellAttack"], casting);

  // Passive score = 10 + skill, and advantage/disadvantage is worth ±5.
  for (const name of ["Perception", "Investigation", "Insight"] as const) {
    const base = c[`passive${name}`] ?? 10;
    const skill = stats[`skill:${name}`];
    const shift = skill ? skill.value - skill.base + (skill.roll === "advantage" ? 5 : skill.roll === "disadvantage" ? -5 : 0) : 0;
    stats[`passive:${name}`] = { base, value: base + shift, roll: "normal", why: skill?.why ?? [] };
  }

  const proficiencies = mods
    .filter((m) => m.type === "proficiency" && !m.target && m.text?.trim())
    .map((m) => ({ source: m.source, detail: m.text!.trim() }));
  const notes = [
    ...mods.filter((m) => m.type === "note" && m.text).map((m) => ({ source: m.source, detail: m.text! })),
    ...proficiencies.map((p) => ({ ...p, detail: `Proficiency: ${p.detail}` })),
  ];
  return { stats, notes, proficiencies, effects };
}

// ---------- Labels ----------

const FIXED_TARGETS: Record<string, string> = {
  saves: "All saving throws",
  checks: "All ability checks",
  attack: "Attack rolls",
  ac: "Armor Class",
  speed: "Speed",
  initiative: "Initiative",
  maxHp: "Max HP",
  spellDc: "Spell save DC",
  spellAttack: "Spell attack",
};

export function targetLabel(target: string): string {
  const [kind, rest] = target.split(":");
  const ability = ABILITIES.find((a) => a.key === (rest ?? kind));
  if (kind === "save" && ability) return `${ability.name} saves`;
  if (kind === "skill") return rest;
  if (ability) return ability.name;
  return FIXED_TARGETS[target] ?? target;
}

/** Grouped for a Mantine Select. */
export const TARGET_OPTIONS = [
  { group: "Abilities", items: ABILITIES.map((a) => ({ value: a.key, label: a.name })) },
  {
    group: "Saving throws",
    items: [{ value: "saves", label: FIXED_TARGETS.saves }, ...ABILITIES.map((a) => ({ value: `save:${a.key}`, label: `${a.name} saves` }))],
  },
  {
    group: "Skills",
    items: [{ value: "checks", label: FIXED_TARGETS.checks }, ...DEFAULT_SKILLS.map((s) => ({ value: `skill:${s.name}`, label: s.name }))],
  },
  {
    group: "Combat",
    items: ["ac", "attack", "initiative", "speed", "maxHp", "spellDc", "spellAttack"].map((t) => ({ value: t, label: FIXED_TARGETS[t] })),
  },
];

/** Select value for a weapon, armor or tool proficiency; it is stored as no target plus the name in `text`. */
export const PROFICIENCY_OTHER = "other";

/** What a proficiency can be in: a save, a skill, or something named. */
export const PROFICIENCY_OPTIONS = [
  TARGET_OPTIONS[1],
  { group: "Skills", items: DEFAULT_SKILLS.map((s) => ({ value: `skill:${s.name}`, label: s.name })) },
  { group: "Other", items: [{ value: PROFICIENCY_OTHER, label: "Weapon, armor or tool…" }] },
];

export function describeModifier(m: StatModifier): string {
  const when = m.when?.trim() ? ` when ${m.when.trim()}` : "";
  return describeChange(m) + when;
}

function describeChange(m: StatModifier): string {
  const target = targetLabel(m.target);
  switch (m.type) {
    case "bonus": return `${signed(m.value ?? 0)} ${target}`;
    case "set": return `${target} set to ${m.value ?? 0}`;
    case "min": return `${target} at least ${m.value ?? 0}`;
    case "advantage": return `Advantage on ${target}`;
    case "disadvantage": return `Disadvantage on ${target}`;
    case "proficiency": return m.target ? `Proficiency in ${target}` : `Proficiency: ${m.text ?? ""}`;
    case "note": return m.text ?? "";
  }
}

// ---------- Detection ----------

const AB = "strength|dexterity|constitution|intelligence|wisdom|charisma|str|dex|con|int|wis|cha";
const N = "([+-]\\d+)";
const TO = "\\s*(?:bonus\\s+)?(?:to\\s+)?(?:your\\s+|their\\s+|all\\s+|the\\s+)?";
const AC = "(?:AC|armou?r class)\\b";
// Bonuses that only apply sometimes ("+2 to saves against poison") are left out instead of applied all the time.
const SITUATIONAL =
  /\b(against|when|whenever|if|on a hit|with|until|once|made to|based on|to resist|removes?|ignores?|chosen|choose|choice|one of|reaction|expend)\b/i;
// The trigger of a consumable is not a condition on its effect.
const USE_TRIGGER = /\b(?:when|after|once) you (?:drink|consume|eat|swallow|apply|use|inhale)\b[^,]*,/gi;
// SRD armor that imposes disadvantage on Stealth; its descriptions are empty, so go by name.
const STEALTH_ARMOR = /\b(padded|scale mail|half plate|ring mail|chain mail|splint|plate armou?r)\b/i;
const ARMOR_NAME = /\b(armou?r|shield|mail|plate|splint|padded|leather)\b/i;
const SKILL_STEMS = DEFAULT_SKILLS.map((s) => ({ name: s.name, re: new RegExp(`\\b${s.name.replace(/s$/, "")}s?\\b`, "i") }));

export const isConsumable = (name = "") => /\b(potion|elixir|philter|oil of)\b/i.test(name);

/**
 * Guesses the modifiers an item gives from its name, tags and description, so items need no setup.
 * The result is a suggestion the player confirms or edits when equipping.
 */
export function detectModifiers(item: { name?: string; description?: string[]; tags?: string[] }): StatModifier[] {
  const out: StatModifier[] = [];
  const add = (m: StatModifier) => {
    if (!out.some((o) => o.target === m.target && o.type === m.type && o.value === m.value && o.text === m.text)) out.push(m);
  };
  const name = item.name ?? "";

  if (STEALTH_ARMOR.test(name) || (item.tags ?? []).some((t) => /heavy armou?r|stealth disadvantage/i.test(t))) {
    add({ target: "skill:Stealth", type: "disadvantage" });
  }
  if (/^shield$/i.test(name.trim())) add({ target: "ac", type: "bonus", value: 2 });
  // "+1 Chain Mail", "Shield, +2"
  const enchant = name.match(/\+(\d)/);
  if (enchant && ARMOR_NAME.test(name)) add({ target: "ac", type: "bonus", value: Number(enchant[1]) });

  for (const sentence of (item.description ?? []).join("\n").split(/(?<=[.;!?])\s+|\n+/)) {
    // "proficiency with heavy armor" is not situational, though "with" usually is.
    const clean = sentence.replace(USE_TRIGGER, "").replace(/proficiency with\b/gi, "proficiency in");
    if (!SITUATIONAL.test(clean)) parseSentence(clean, add);
  }
  return out;
}

function parseSentence(text: string, add: (m: StatModifier) => void) {
  let s = text;
  // Each rule consumes what it matched, so a later, looser rule can't read it again.
  const rule = (pattern: string, onMatch: (g: string[]) => void) => {
    s = s.replace(new RegExp(pattern, "gi"), (...m: string[]) => {
      onMatch(m);
      return " ";
    });
  };
  const bonus = (target: string, n: string) => add({ target, type: "bonus", value: parseInt(n, 10) });

  rule(`${N}${TO}${AC}\\s+and\\s+saving throws`, (g) => (bonus("ac", g[1]), bonus("saves", g[1])));
  rule(`${N}${TO}(${AB})\\s+saving throws?`, (g) => bonus(`save:${toAbility(g[2])}`, g[1]));
  rule(`${N}${TO}saving throws`, (g) => bonus("saves", g[1]));
  rule(`${N}${TO}${AC}`, (g) => bonus("ac", g[1]));
  rule(`${N}${TO}initiative`, (g) => bonus("initiative", g[1]));
  rule(`${N}${TO}spell save DC`, (g) => bonus("spellDc", g[1]));
  rule(`${N}${TO}spell attack(?:\\s+rolls?)?`, (g) => bonus("spellAttack", g[1]));
  rule(`${N}${TO}(?:hit point maximum|max(?:imum)? (?:hp|hit points))`, (g) => bonus("maxHp", g[1]));
  rule(`hit point maximum\\s+(increases|decreases|is increased|is reduced)\\s+by\\s+(\\d+)`, (g) =>
    bonus("maxHp", `${/increase/i.test(g[1]) ? "" : "-"}${g[2]}`));
  for (const skill of SKILL_STEMS) {
    rule(`${N}${TO}(?:(?:${AB})\\s*\\(\\s*)?${skill.re.source}\\)?(?:\\s+checks?)?`, (g) => bonus(`skill:${skill.name}`, g[1]));
  }
  rule(`${N}${TO}(${AB})\\b(?:\\s+score)?(?!\\s*(?:checks?|\\())`, (g) => bonus(toAbility(g[2])!, g[1]));
  rule(`\\b(${AB})(?:\\s+score)?\\s+(?:increases|is increased|goes up)\\s+by\\s+(\\d+)`, (g) => bonus(toAbility(g[1])!, g[2]));
  rule(`\\b(${AB})\\s+score\\s+(?:is|becomes|changes to|increases to|is raised to)\\s+(\\d+)`, (g) =>
    add({ target: toAbility(g[1])!, type: "min", value: parseInt(g[2], 10) }));

  rule(`speed\\s+(?:increases|is increased)\\s+by\\s+(\\d+)`, (g) => bonus("speed", g[1]));
  rule(`(?:speed\\s+(?:decreases|is reduced|is decreased)|(?:decreases|reduces|lowers)\\s+(?:your\\s+)?(?:movement\\s+|walking\\s+)?speed)\\s+by\\s+(\\d+)`, (g) =>
    bonus("speed", `-${g[1]}`));
  rule(`speed\\s+(?:becomes|is|drops to)\\s+0\\b`, () => add({ target: "speed", type: "set", value: 0 }));
  rule(`${N}\\s*(?:feet|ft\\.?)?\\s*(?:to\\s+)?(?:your\\s+)?(?:walking\\s+|movement\\s+)?speed`, (g) => bonus("speed", g[1]));

  // "You gain proficiency in Wisdom saving throws and the Stealth skill" / "...with heavy armor" ("with" was turned into "in").
  rule(`\\bproficiency in ([^.;]+)`, (g) => {
    let phrase = g[1];
    phrase = phrase.replace(new RegExp(`\\b(${AB})\\s+saving throws?`, "gi"), (_, a: string) => {
      add({ target: `save:${toAbility(a)}`, type: "proficiency" });
      return " ";
    });
    if (/\bsaving throws?\b/i.test(phrase)) {
      add({ target: "saves", type: "proficiency" });
      phrase = phrase.replace(/\bsaving throws?\b/gi, " ");
    }
    for (const skill of SKILL_STEMS) {
      if (skill.re.test(phrase)) {
        add({ target: `skill:${skill.name}`, type: "proficiency" });
        phrase = phrase.replace(skill.re, " ");
      }
    }
    // What is left names a weapon, armor or tool: "heavy armor", "thieves' tools".
    const rest = phrase.replace(/\b(and|or|the|skills?|a|an)\b|[,()]/gi, " ").replace(/\s+/g, " ").trim();
    if (/[a-z]{3}/i.test(rest) && rest.length <= 40) add({ target: "", type: "proficiency", text: rest[0].toUpperCase() + rest.slice(1) });
  });

  rule(`\\b(dis)?advantage on ([^.;]+)`, (g) => {
    const type = g[1] ? "disadvantage" : "advantage";
    let phrase = g[2].replace(new RegExp(`(${AB})\\s*\\(`, "gi"), "(");
    for (const skill of SKILL_STEMS) {
      if (skill.re.test(phrase)) {
        add({ target: `skill:${skill.name}`, type });
        phrase = phrase.replace(skill.re, " ");
      }
    }
    phrase = phrase.replace(new RegExp(`\\b(${AB})\\s+saving throws?`, "gi"), (_, a: string) => {
      add({ target: `save:${toAbility(a)}`, type });
      return " ";
    });
    if (/saving throws?/i.test(phrase)) add({ target: "saves", type });
    if (/\battack(s|\s+rolls?)?\b/i.test(phrase)) add({ target: "attack", type });
    if (/ability checks?/i.test(phrase)) add({ target: "checks", type });
  });

  rule(`(resistance|immunity) to ([a-z ,]+?) damage`, (g) => add(note(`${g[1][0].toUpperCase()}${g[1].slice(1)} to ${g[2]} damage`)));
  rule(`immune to ([a-z ,]+?) damage`, (g) => add(note(`Immunity to ${g[1]} damage`)));
}

export const newEffectId = () => crypto.randomUUID();

/**
 * The inventory holding what the character wears or wields: the one they picked, or, until they pick
 * (choice empty), the one named like "Aria's Equipment". "none" means they chose to wear nothing.
 */
export function wornInventoryId(choice: string | undefined, inventories: { id?: string | null; name?: string }[]) {
  if (choice === "none") return undefined;
  if (choice && inventories.some((i) => i.id === choice)) return choice;
  return inventories.find((i) => /\bequipment$/i.test(i.name?.trim() ?? ""))?.id;
}

export interface EquippedItem {
  equipmentId: string;
  name: string;
  description?: string[];
  tags?: string[];
}

/**
 * Lines the effects up with the worn inventory: items without an effect get one (switched on),
 * automatic effects whose item left are dropped. Effects the player made, edited or switched off stay as they are.
 * Consumables are skipped, since carrying a potion is not drinking it. Returns null when nothing changes.
 */
export function syncEquippedEffects(effects: CharacterEffect[], items: EquippedItem[]): CharacterEffect[] | null {
  const worn = new Map(items.filter((i) => !isConsumable(i.name)).map((i) => [i.equipmentId, i]));
  const kept = effects.filter((e) => !e.auto || !e.equipmentId || worn.has(e.equipmentId));
  const added: CharacterEffect[] = [...worn.values()]
    .filter((i) => !effects.some((e) => e.equipmentId === i.equipmentId))
    .map((i) => ({
      id: newEffectId(),
      name: i.name,
      source: "item",
      equipmentId: i.equipmentId,
      auto: true,
      active: true,
      modifiers: detectModifiers(i),
    }));

  return added.length || kept.length !== effects.length ? [...kept, ...added] : null;
}

/** Text color for a number that effects moved away from the sheet value. */
export const changedColor = (stat?: StatResult) =>
  !stat || stat.value === stat.base ? undefined : stat.value > stat.base ? "#4ade80" : "#f87171";
