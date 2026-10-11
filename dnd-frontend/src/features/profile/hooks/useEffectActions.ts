import { useCharacterCoreActions, useCurrentCharacter } from "@store/character/characterSelectors";
import type { CharacterEffect } from "@appTypes/Character/Effect";

/** Add, replace (same id) and remove effects on the current character; saved like any other sheet change. */
export function useEffectActions() {
  const character = useCurrentCharacter();
  const { updateCharacter } = useCharacterCoreActions();
  const effects = character?.effects ?? [];

  return {
    effects,
    saveEffect: (effect: CharacterEffect) =>
      updateCharacter({
        effects: effects.some((e) => e.id === effect.id) ? effects.map((e) => (e.id === effect.id ? effect : e)) : [...effects, effect],
      }),
    removeEffect: (id: string) => updateCharacter({ effects: effects.filter((e) => e.id !== id) }),
  };
}
