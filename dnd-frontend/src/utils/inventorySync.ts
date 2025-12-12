import { getCharacterById, updateCharacter } from "@services/characterService";

/**
 * Ensure a character includes an inventory id in its inventoryIds list.
 * No-op if already present.
 */
export async function ensureInventoryLinkedToCharacter(
  characterId: string,
  inventoryId: string,
  token: string
) {
  const character = await getCharacterById(characterId, token);
  if (!character) return;

  const current = character.inventoryIds ?? [];
  if (current.includes(inventoryId)) return;

  const next = [...current, inventoryId];
  await updateCharacter({ ...character, inventoryIds: next }, token);
}

/**
 * Remove an inventory id from a character's inventoryIds list if present.
 */
export async function removeInventoryFromCharacter(
  characterId: string,
  inventoryId: string,
  token: string
) {
  const character = await getCharacterById(characterId, token);
  if (!character) return;

  const current = character.inventoryIds ?? [];
  if (!current.includes(inventoryId)) return;

  const next = current.filter((id) => id !== inventoryId);
  await updateCharacter({ ...character, inventoryIds: next }, token);
}
