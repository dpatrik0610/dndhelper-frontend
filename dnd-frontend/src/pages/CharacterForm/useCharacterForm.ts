import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useCharacterFormStore } from "../../store/useCharacterFormStore";
import { useCharacterStore } from "../../store/useCharacterStore";
import { createCharacter, updateCharacter } from "../../services/characterService";
import { createInventory } from "../../services/inventoryService";
import { useAuthStore } from "../../store/useAuthStore";
import type { Inventory } from "../../types/Inventory/Inventory";
import { loadCharacters } from "../../utils/loadCharacter";
import { useNavigate } from "react-router-dom";

export function useCharacterForm(editMode: boolean) {
  const token = useAuthStore((s) => s.token);
  const isAdmin = useAuthStore.getState().roles.includes("Admin");
  const navigate = useNavigate()
  const { characterForm, replaceCharacterForm, resetCharacterForm } = useCharacterFormStore();
  const { character, setCharacter, updateCharacter: updateInStore } = useCharacterStore();

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

        notifications.show({
          title: "Character Updated",
          message: `${characterForm.name} updated successfully!`,
          color: "teal",
        });
        loadCharacters(token!)
      } else {
        const newCharacter = await createCharacter(characterForm, token!);
        if (newCharacter) {
          const newInventory: Inventory = {
            name: "Equipment",
            ownerIds: [newCharacter.ownerId!],
            characterId: newCharacter.id,
            currencies: [],
            items: [],
          };
          await createInventory(newInventory, token!);
          setCharacter(newCharacter);

          notifications.show({
            title: "Character Created",
            message: `${newCharacter.name} has joined your roster.`,
            color: "cyan",
          });
        }
      }
      navigate("/profile");
    } catch (err) {
      console.error(err);
      notifications.show({
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
