import { getCharacters } from "@services/characterService";
import { useCharacterStore } from "@store/character/characterStore";
import { getAuthToken } from "@store/auth/authUtils";

export async function loadCharacters(tokenOverride?: string) {
  const token = tokenOverride || getAuthToken();
  const { setCharacter, setCharacters, character } = useCharacterStore.getState();
  const characters = await getCharacters(token);

  setCharacters(characters);

  if (character) {
    const updated = characters.find(x => x.id === character.id);
    if (updated) setCharacter(updated);
  }

  return characters;
}
