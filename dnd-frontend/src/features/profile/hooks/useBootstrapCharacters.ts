import { useEffect } from "react";
import { loadCharacters } from "@utils/loadCharacter";

export function useBootstrapCharacters(token: string | null, characterCount: number) {
  useEffect(() => {
    const fetchCharacters = async () => {
      if (token && characterCount === 0) {
        await loadCharacters(token);
      }
    };
    fetchCharacters();
  }, [token, characterCount]);
}
