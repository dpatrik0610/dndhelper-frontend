import { getCharacters } from '../services/characterService';
import { useCharacterStore } from '../store/useCharacterStore';

export async function loadCharacters(token: string) {
  const characters = await getCharacters(token);
  useCharacterStore.getState().setCharacters(characters);
  return characters;
}