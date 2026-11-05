export type ItemKind =
  | "potion"
  | "scroll"
  | "ammo"
  | "ranged"
  | "weapon"
  | "armor"
  | "jewelry"
  | "arcane"
  | "clothing"
  | "tool"
  | "light"
  | "food"
  | "container"
  | "gear";

export const ITEM_KIND_LABEL: Record<ItemKind, string> = {
  potion: "Potion",
  scroll: "Scroll & Book",
  ammo: "Ammunition",
  ranged: "Ranged",
  weapon: "Weapon",
  armor: "Armor",
  jewelry: "Jewelry",
  arcane: "Arcane",
  clothing: "Clothing",
  tool: "Tool",
  light: "Light",
  food: "Provisions",
  container: "Container",
  gear: "Gear",
};

const RULES: [ItemKind, RegExp][] = [
  ["potion", /\b(potions?|elixirs?|philt(er|re)s?|oil of|antitoxin|poisons?|vials?)\b/],
  ["scroll", /\b(scrolls?|spellbooks?|books?|tomes?|maps?|parchment|paper|ink)\b/],
  ["ammo", /\b(arrows?|bolts?|bullets?|needles?|ammunition)\b/],
  ["ranged", /\b(ranged|bows?|longbows?|shortbows?|crossbows?|slings?|darts?|blowguns?|javelins?)\b/],
  ["armor", /\b(armou?r|shields?|chain mail|ring mail|splint|plate|breastplate|helm|helmet|gauntlets|bracers)\b/],
  ["weapon", /\b(weapons?|swords?|longswords?|shortswords?|greatswords?|scimitars?|rapiers?|daggers?|axes?|handaxes?|greataxes?|battleaxes?|maces?|morningstars?|flails?|warhammers?|light hammer|mauls?|spears?|pikes?|halberds?|glaives?|lances?|tridents?|clubs?|greatclubs?|quarterstaffs?|sickles?|scythes?|whips?|war picks?|blades?)\b/],
  ["jewelry", /\b(rings?|amulets?|necklaces?|pendants?|gems?|gemstones?|jewel(s|ry)?|brooch|circlet|crown|diamonds?|rubies|ruby|pearls?|trinkets?)\b/],
  ["arcane", /\b(wands?|staff|staves|rods?|orbs?|crystals?|arcane focus|holy symbol|totem|component pouch)\b/],
  ["clothing", /\b(cloaks?|robes?|boots|gloves|clothes|clothing|hats?|capes?|belts?|mantle|vestments|costume|outfit|sandals|shoes)\b/],
  ["tool", /\b(tools?|kits?|supplies|instruments?|lute|drum|flute|horn|bagpipes|lyre|viol|pick|shovel|crowbar|hammer|lock|manacles|rope|chain|ladder|pole|spyglass|magnifying glass|hourglass)\b/],
  ["light", /\b(torch(es)?|lanterns?|candles?|lamps?|tinderbox)\b/],
  ["food", /\b(rations?|food|bread|cheese|meat|ale|wine|feed|apples?|provisions)\b/],
  ["container", /\b(backpack|bags?|pouch(es)?|sacks?|chests?|barrels?|cases?|quivers?|baskets?|jugs?|bottles?|flasks?|waterskin|crates?)\b/],
];

const match = (text: string): ItemKind | null => RULES.find(([, re]) => re.test(text))?.[0] ?? null;

/** Guesses what an item is from its name first (most specific), then its tags, then whether it deals damage. */
export function itemKind(item: { name?: string; tags?: string[]; damage?: unknown; range?: { long?: number } }): ItemKind {
  return (
    match((item.name ?? "").toLowerCase()) ??
    match((item.tags ?? []).join(" ").toLowerCase()) ??
    (item.damage ? (item.range?.long ? "ranged" : "weapon") : "gear")
  );
}
