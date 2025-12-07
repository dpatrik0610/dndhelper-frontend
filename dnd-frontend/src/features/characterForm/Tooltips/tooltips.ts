export const abilityTooltips = {
    strength: "Measures physical power. Modifier = (STR - 10) / 2 (rounded down).",
    dexterity: "Agility, reflexes, and balance. Modifier = (DEX - 10) / 2.",
    constitution: "Endurance and vitality. Modifier = (CON - 10) / 2.",
    intelligence: "Reasoning and memory. Modifier = (INT - 10) / 2.",
    wisdom: "Perception and insight. Modifier = (WIS - 10) / 2.",
    charisma: "Personality and leadership. Modifier = (CHA - 10) / 2.",
};

export const saveTooltips = {
    strength: "STR Save = STR Modifier + Proficiency (if proficient).",
    dexterity: "DEX Save = DEX Modifier + Proficiency (if proficient).",
    constitution: "CON Save = CON Modifier + Proficiency (if proficient).",
    intelligence: "INT Save = INT Modifier + Proficiency (if proficient).",
    wisdom: "WIS Save = WIS Modifier + Proficiency (if proficient).",
    charisma: "CHA Save = CHA Modifier + Proficiency (if proficient).",
};

export const DEFAULT_SKILLS = [
  { name: "Acrobatics", ability: "dex", desc: "Perform flips and balance-related stunts." },
  { name: "Animal Handling", ability: "wis", desc: "Calm or control animals and mounts." },
  { name: "Arcana", ability: "int", desc: "Knowledge of magic and magical history." },
  { name: "Athletics", ability: "str", desc: "Climbing, jumping, and physical feats of strength." },
  { name: "Deception", ability: "cha", desc: "Lying, disguises, and misleading others." },
  { name: "History", ability: "int", desc: "Knowledge of historical events and lore." },
  { name: "Insight", ability: "wis", desc: "Read emotions and intentions." },
  { name: "Intimidation", ability: "cha", desc: "Use fear or presence to influence others." },
  { name: "Investigation", ability: "int", desc: "Deduce clues and hidden details." },
  { name: "Medicine", ability: "wis", desc: "Diagnose and stabilize injuries." },
  { name: "Nature", ability: "int", desc: "Knowledge of terrain, plants, and wildlife." },
  { name: "Perception", ability: "wis", desc: "Spot traps, ambushes, or hidden things." },
  { name: "Performance", ability: "cha", desc: "Musical or theatrical skill." },
  { name: "Persuasion", ability: "cha", desc: "Convince, negotiate, or charm others." },
  { name: "Religion", ability: "int", desc: "Knowledge of deities and divine rites." },
  { name: "Sleight of Hand", ability: "dex", desc: "Pickpocketing and manual tricks." },
  { name: "Stealth", ability: "dex", desc: "Sneaking and hiding unseen." },
  { name: "Survival", ability: "wis", desc: "Tracking, foraging, and enduring the wilds." },
] as const;