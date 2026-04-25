import dayjs from "dayjs";
import type { Encounter, EncounterEntity } from "@appTypes/Encounter";

export const getDateTimeInputValue = (value: string | null) =>
  value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : "";

export const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const parseDateInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = dayjs(trimmed);
  return parsed.isValid() ? parsed.toISOString() : null;
};

export const cloneEncounter = (encounter: Encounter) => structuredClone(encounter);

export const sortEntities = (entities: EncounterEntity[]) =>
  [...entities].sort((left, right) => {
    const leftInitiative = left.initiative ?? Number.NEGATIVE_INFINITY;
    const rightInitiative = right.initiative ?? Number.NEGATIVE_INFINITY;

    if (leftInitiative !== rightInitiative) {
      return rightInitiative - leftInitiative;
    }

    return left.name.localeCompare(right.name);
  });

export const normalizeEncounterDraft = (draft: Encounter): Encounter => ({
  ...draft,
  name: draft.name.trim(),
  description: toNullableString(draft.description ?? ""),
  mapUrl: toNullableString(draft.mapUrl ?? ""),
  dmNote: toNullableString(draft.dmNote ?? ""),
  location: toNullableString(draft.location ?? ""),
  imageUrls: draft.imageUrls.map((url) => url.trim()).filter(Boolean),
  entities: draft.entities
    .map((entity) => ({
      ...entity,
      name: entity.name.trim(),
      referenceId: toNullableString(entity.referenceId ?? ""),
      note: toNullableString(entity.note ?? ""),
      quantity: entity.quantity > 0 ? entity.quantity : 1,
    }))
    .filter((entity) => entity.name.length > 0),
  loot: draft.loot
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      equipmentId: toNullableString(item.equipmentId ?? ""),
      note: toNullableString(item.note ?? ""),
      quantity: item.quantity > 0 ? item.quantity : 1,
    }))
    .filter((item) => item.name.length > 0),
});
