import { getCharacters } from "../services/characterService";
import { useCharacterStore } from "../store/useCharacterStore";

export async function loadCharacters(token: string) {
  const { setCharacter, setCharacters, character } = useCharacterStore.getState();
  const characters = await getCharacters(token);

  setCharacters(characters);

  if (character) {
    const updated = characters.find(x => x.id === character.id);
    if (updated) setCharacter(updated);
  }

  return characters;
}
