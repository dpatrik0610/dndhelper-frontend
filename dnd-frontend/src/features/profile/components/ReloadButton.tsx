import { ActionIcon, Tooltip } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { useAuthStore } from "@store/useAuthStore";
import { useCharacterStore } from "@store/useCharacterStore";
import { useInventoryStore } from "@store/useInventorystore";
import { useSpellStore } from "@store/useSpellStore";
import { useNoteStore } from "@store/useNoteStore";
import { useSessionStore } from "@store/session/useSessionStore";
import { getCharacters } from "@services/characterService";
import { getInventoriesByCharacter } from "@services/inventoryService";
import { getSpellNames } from "@services/spellService";
import { showNotification } from "@components/Notification/Notification";
import { getManyNotes } from "@services/noteService";

export default function ReloadButton() {
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) throw new Error("Missing auth token");

      const characterStore = useCharacterStore.getState();
      const inventoryStore = useInventoryStore.getState();
      const spellStore = useSpellStore.getState();
      const noteStore = useNoteStore.getState();
      const sessionStore = useSessionStore.getState();

      // Characters
      const characters = await getCharacters(token);
      characterStore.setCharacters(characters);
      if (characterStore.character) {
        const updated = characters.find((c) => c.id === characterStore.character?.id);
        if (updated) characterStore.setCharacter(updated);
      } else if (characters[0]) {
        characterStore.setCharacter(characters[0]);
      }

      const activeCharacter = useCharacterStore.getState().character;

      // Inventories (if a character is selected)
      if (activeCharacter?.id) {
        const inventories = await getInventoriesByCharacter(activeCharacter.id, token);
        inventoryStore.setInventories(inventories);
      } else {
        inventoryStore.clearInventories?.();
      }

      // Spells
      const spellNames = await getSpellNames(token);
      spellStore.setSpellNames(spellNames);

      // Notes for the active character
      if (activeCharacter?.noteIds?.length) {
        const uniqueIds = Array.from(new Set(activeCharacter.noteIds));
        if (noteStore.loadMany) {
          await noteStore.loadMany(uniqueIds);
        } else {
          const fetchedNotes = await getManyNotes(uniqueIds, token);
          useNoteStore.setState({ notes: fetchedNotes });
        }
      }

      // Sessions for the active campaign
      if (activeCharacter?.campaignId) {
        await sessionStore.loadByCampaign(activeCharacter.campaignId);
      }

      showNotification({
        id: "profile-reload-success",
        title: "Reload Successful",
        message: "Character data updated!",
        color: "green",
      });
    } catch (err) {
      console.error(err);
      showNotification({
        id: "profile-reload-error",
        title: "Reload Failed",
        message: "Could not update character data.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip label="Reload data" withArrow>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="lg"
        radius="md"
        loading={loading}
        onClick={handleReload}
      >
        <IconRefresh size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
