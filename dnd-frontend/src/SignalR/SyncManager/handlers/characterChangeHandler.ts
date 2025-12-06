import { showNotification } from "../../../components/Notification/Notification";
import { useCharacterStore } from "../../../store/useCharacterStore";
import type { Character } from "../../../types/Character/Character";
import type { EntityChangeEvent } from "./EntitySyncTypes";

export function handleCharacterChange(event: EntityChangeEvent) {
  const characterStore = useCharacterStore.getState();
  const currentCharacter = characterStore.character;
  const existing = characterStore.characters.find((c) => c.id === event.entityId);
  const hasSameTimestamp = (a?: Character | null, b?: Character | null) =>
    Boolean(a?.updatedAt && b?.updatedAt && a.updatedAt === b.updatedAt);

  switch (event.action) {
    case "created": {
      const newCharacter = event.data as Character;

      if (hasSameTimestamp(existing, newCharacter)) break;

      characterStore.setCharacters([...characterStore.characters, newCharacter]);

      showNotification({
        title: "Character Created",
        message: `${newCharacter.name} was created by ${event.changedBy}`,
        color: "green",
        autoClose: 3000,
      });
      break;
    }

    case "updated": {
      const updatedCharacter = event.data as Character;

      if (hasSameTimestamp(existing, updatedCharacter)) break;

      characterStore.setCharacters(
        characterStore.characters.map((c) =>
          c.id === updatedCharacter.id ? updatedCharacter : c
        )
      );

      if (currentCharacter?.id === updatedCharacter.id) {
        if (hasSameTimestamp(currentCharacter, updatedCharacter)) break;
        characterStore.setCharacter(updatedCharacter);

        showNotification({
          title: "Character Updated",
          message: `${updatedCharacter.name} was updated by ${event.changedBy}`,
          color: "blue",
          autoClose: 3000,
        });
      }
      break;
    }

    case "deleted": {
      if (!existing) break;

      characterStore.setCharacters(
        characterStore.characters.filter((c) => c.id !== event.entityId)
      );

      if (currentCharacter?.id === event.entityId) {
        characterStore.setCharacter(null);

        showNotification({
          title: "Character Deleted",
          message: `Your character was deleted by ${event.changedBy}`,
          color: "red",
          autoClose: 5000,
        });
      }
      break;
    }
  }
}
