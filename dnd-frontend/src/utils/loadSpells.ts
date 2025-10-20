import { getSpellById, getSpellNames } from "../services/spellService";
import { useSpellStore } from "../store/useSpellStore";

// Load all spell names and populate the store
export async function loadSpells(token: string): Promise<void> {
  try {
    const spells = await getSpellNames(token);
    useSpellStore.getState().setSpellNames(spells);
  } catch (err) {
    console.error("Failed to load spell names:", err);
  }
}

// Load a single spell by ID and set as current
export async function loadCurrentSpell(spellId: string, token: string): Promise<void> {
  try {
    const spell = await getSpellById(spellId, token);
    useSpellStore.getState().setCurrentSpell(spell);
  } catch (err) {
    console.error(`Failed to load spell ${spellId}:`, err);
  }
}
