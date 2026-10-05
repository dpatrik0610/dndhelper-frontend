import { useState, useEffect } from "react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { createCharacter, updateCharacter } from "@services/characterService";
import { useIsDm } from "@store/campaign/campaignSelectors";
import { loadCharacters } from "@utils/loadCharacter";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";

export function useCharacterForm(editMode: boolean) {
  const isDm = useIsDm();
  const navigate = useNavigate()
  const { characterForm, replaceCharacterForm, resetCharacterForm } = useCharacterFormStore();
  const character = useCurrentCharacter();
  const { setCharacter, updateCharacter: updateInStore } = useCharacterCoreActions();

  const [loading, setLoading] = useState(false);

  // Load data on edit / reset on create
  useEffect(() => {
    if (editMode && character) replaceCharacterForm(character);
    else resetCharacterForm();
  }, [editMode, character]);

  async function handleSubmit() {
    setLoading(true);

    try {
      if (editMode && character) {
        updateInStore(characterForm);
        await updateCharacter(characterForm);

        showNotification({
          title: "Character Updated",
          message: `${characterForm.name} updated successfully!`,
          color: "teal",
        });
        loadCharacters()
      } else {
        // The server also creates the character's starting inventory.
        const newCharacter = await createCharacter(characterForm);
        if (newCharacter) {
          setCharacter(newCharacter);

          showNotification({
            title: "Character Created",
            message: `${newCharacter.name} has joined your roster.`,
            color: "cyan",
          });
        }
      }
      navigate("/profile");
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Character creation or update failed.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  return { handleSubmit, loading, isDm, characterForm };
}
