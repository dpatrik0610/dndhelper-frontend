import { showNotification } from "@components/Notification/Notification";
import { updateCharacter } from "@services/characterService";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useCharacterStore } from "@store/character/characterStore";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { Character } from "@appTypes/Character/Character";

function apply(c: Character) {
  const store = useCharacterStore.getState();
  store.setCharacters(store.characters.map((x) => (x.id === c.id ? c : x)));
  if (store.character?.id === c.id) store.setCharacter(c);
}

/** Saves part of a character sheet from the table: shown right away, put back if the server refuses. */
export async function saveCharacter(character: Character, patch: Partial<Character>, failMessage: string) {
  const next = { ...character, ...patch };
  apply(next);
  const saved = await updateCharacter(next);
  apply(saved ?? character);
  if (!saved) showNotification({ message: failMessage, color: "red" });
}

/** 5e ability modifier: 10–11 → +0, 16 → +3, 8 → -1. */
export const abilityMod = (score: number | undefined) => Math.floor(((score ?? 10) - 10) / 2);

/** Pip rows (death saves, spell slots): clicking the last filled pip clears it; any other pip fills up to it. */
export const togglePip = (count: number, index: number) => (count === index + 1 ? index : index + 1);

/** The viewer's character on this table: the one whose turn it is, else the first placed. Null when they have none. */
export function useMyTableCharacter(): Character | null {
  const me = useCurrentUserId() ?? "";
  const snapshot = useTabletopStore((s) => s.snapshot);
  const characters = useCharacterList();
  if (!snapshot) return null;

  const mine = snapshot.tokens.filter((t) => t.characterId && t.layer !== "Dm" && t.ownerIds.includes(me));
  const current = mine.find((t) => t.id === snapshot.turn.currentTokenId);
  for (const token of current ? [current, ...mine] : mine) {
    const character = characters.find((c) => c.id === token.characterId);
    if (character) return character;
  }
  return null;
}
