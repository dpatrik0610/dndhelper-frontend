import { getCharacters } from "@services/characterService";
import { useCharacterStore } from "@store/character/characterStore";


export async function loadCharacters() {

  const { setCharacter, setCharacters, character } = useCharacterStore.getState();
  const characters = await getCharacters();

  setCharacters(characters);

  if (character) {
    const updated = characters.find(x => x.id === character.id);
    if (updated) setCharacter(updated);
  }

  return characters;
}
