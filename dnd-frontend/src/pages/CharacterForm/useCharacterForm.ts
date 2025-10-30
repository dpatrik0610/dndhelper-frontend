import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { createCharacter, updateCharacter } from "../../services/characterService";
import type { Character } from "../../types/Character/Character";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useAuthStore } from "../../store/useAuthStore";
import type { Inventory } from "../../types/Inventory/Inventory";
import { createInventory } from "../../services/inventoryService";

/**
 * Custom hook that manages character creation & editing.
 * Handles form state, validation, and backend communication.
 */
export function useCharacterForm(editMode: boolean) {
  const token = useAuthStore((s) => s.token);
  const isAdmin = useAuthStore.getState().roles.includes("Admin");

  const { character, setCharacter, updateCharacter: updateInStore } = useCharacterStore();
  const rollbackCharacter = character; // Used for rollback on failed update

  const [loading, setLoading] = useState(false);

  // 🧾 Initialize Mantine form with default values + validation
  const form = useForm({
    initialValues: {
      name: "",
      race: "",
      characterClass: "",
      background: "",
      alignment: "",
      level: 1,
      armorClass: 10,
      hitPoints: 10,
      maxHitPoints: 10,
      temporaryHitPoints: 0,
      speed: 30,
      initiative: 0,
      proficiencyBonus: 2,
      isDead: false,
      isNPC: false,
      experience: 0,
      description: "",
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      maxHitPoints: (value) =>
        value <= 0 ? "Max HP must be greater than 0" : null,
      hitPoints: (value, values) =>
        value > values.maxHitPoints ? "Current HP cannot exceed Max HP" : null,
    },
  });

  // ✏️ When editing, prefill the form with existing character data
  useEffect(() => {
    if (editMode && character) form.setValues(character);
  }, [editMode, character]);

async function handleSubmit(values: typeof form.values) {
  setLoading(true);
  try {
    if (editMode && character) {
      updateInStore(values);
      const response = await updateCharacter({ ...character, ...values }, token!);
      if (!response && rollbackCharacter) updateInStore(rollbackCharacter);

      notifications.show({
        title: "Character Updated",
        message: `${values.name} updated successfully!`,
        color: "teal",
      });
    } else {
      const newCharacter = await createCharacter(values as Character, token!);
      if (newCharacter) {
        // Create a default inventory
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
  } catch (error) {
    console.error("Character form submission failed:", error);
    notifications.show({
      title: "Error",
      message: "Character creation or update failed.",
      color: "red",
    });
  } finally {
    setLoading(false);
  }
}

  return {
    form,         // Mantine form instance
    handleSubmit, // Submission logic
    loading,      // Loading state for UI overlays
    isAdmin,      // Current user is admin (toggles extra form fields)
  };
}
