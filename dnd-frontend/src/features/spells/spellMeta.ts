import {
  IconEye,
  IconFlame,
  IconHeartHandshake,
  IconMask,
  IconPentagram,
  IconShield,
  IconSkull,
  IconSparkles,
  IconTransform,
  type Icon,
} from "@tabler/icons-react";

export interface SchoolMeta {
  color: string;
  icon: Icon;
}

/** One distinct colour + glyph per school of magic, shared by the index and the spell card. */
export const SCHOOLS: Record<string, SchoolMeta> = {
  Abjuration: { color: "#60a5fa", icon: IconShield },
  Conjuration: { color: "#34d399", icon: IconPentagram },
  Divination: { color: "#a5b4fc", icon: IconEye },
  Enchantment: { color: "#f472b6", icon: IconHeartHandshake },
  Evocation: { color: "#f87171", icon: IconFlame },
  Illusion: { color: "#c084fc", icon: IconMask },
  Necromancy: { color: "#94a3b8", icon: IconSkull },
  Transmutation: { color: "#fb923c", icon: IconTransform },
};

const FALLBACK: SchoolMeta = { color: "#9ca3af", icon: IconSparkles };

export const getSchool = (name?: string | null): SchoolMeta => (name && SCHOOLS[name]) || FALLBACK;

const ordinal = (n: number) => {
  const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
  return `${n}${suffix}`;
};

/** Group heading in the index: "Cantrips", "1st Level", ... */
export const levelHeading = (level: number) => (level === 0 ? "Cantrips" : `${ordinal(level)} Level`);

/** Short chip label: "C", "1", ... */
export const levelChip = (level: number) => (level === 0 ? "C" : String(level));

/** PHB-style subtitle: "Evocation cantrip" / "3rd-level evocation (ritual)". */
export function spellSubtitle(level: number, school: string, ritual?: boolean) {
  const base = level === 0 ? `${school} cantrip` : `${ordinal(level)}-level ${school.toLowerCase()}`;
  return ritual ? `${base} (ritual)` : base;
}
