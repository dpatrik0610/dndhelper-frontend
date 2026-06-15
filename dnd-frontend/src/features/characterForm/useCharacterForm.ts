import { useState, useEffect } from "react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { createCharacter, updateCharacter } from "@services/characterService";
import { assignInventoryToCharacter, createInventory } from "@services/inventoryService";
import { useToken, useIsAdmin } from "@store/auth/authSelectors";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import { loadCharacters } from "@utils/loadCharacter";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";

export function useCharacterForm(editMode: boolean) {
  const token = useToken();
  const isAdmin = useIsAdmin();
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
        await updateCharacter(characterForm, token!);

        showNotification({
          title: "Character Updated",
          message: `${characterForm.name} updated successfully!`,
          color: "teal",
        });
        loadCharacters(token!)
      } else {
        const newCharacter = await createCharacter(characterForm, token!);
        if (newCharacter) {
          const newInventory: Inventory = {
            name: `${newCharacter.name}'s Equipment`,
            ownerIds: newCharacter.ownerIds ?? [],
            characterIds: [newCharacter.id!],
            currencies: [],
            items: [],
          };
          const createdInventory = await createInventory(newInventory, token!);

          if (createdInventory.id) {
            await assignInventoryToCharacter(createdInventory.id, newCharacter.id!, token!);
          }

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

  return { handleSubmit, loading, isAdmin, characterForm };
}
