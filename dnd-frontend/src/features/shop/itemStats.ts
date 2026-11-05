import type { Equipment } from "@appTypes/Equipment/Equipment";

export function describeStats(equipment?: Equipment): string | null {
    if (!equipment) return null;
    const parts = [
        equipment.damage ? `${equipment.damage.damageDice} ${equipment.damage.damageType?.name ?? ""}`.trim() : null,
        equipment.range?.normal ? `${equipment.range.normal}${equipment.range.long ? `/${equipment.range.long}` : ""} ft` : null,
        equipment.weight ? `${equipment.weight} lb` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(" · ") : null;
}
