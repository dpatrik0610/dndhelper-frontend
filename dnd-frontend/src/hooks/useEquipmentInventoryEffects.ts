import { useEffect, useMemo, useState } from "react";
import { getInventoriesByCharacter } from "@services/inventoryService";
import { getEquipmentByIdsForUser } from "@services/equipmentService";
import { useCharacterStore } from "@store/character/characterStore";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { syncEquippedEffects, wornInventoryId, type EquippedItem } from "@utils/effects";

/**
 * Whatever sits in the current character's worn inventory (see wornInventoryId) is equipped: its effects are added
 * when it arrives and removed when it leaves, on any page. SignalR keeps the inventories current.
 */
export function useEquipmentInventoryEffects() {
  const characterId = useCharacterStore((s) => s.character?.id);
  const choice = useCharacterStore((s) => s.character?.equipmentInventoryId);
  const inventories = useInventoryStore((s) => s.inventories);
  const setInventories = useInventoryStore((s) => s.setInventories);
  // Sync only once this character's inventories are really loaded: the persisted store may be empty or stale,
  // and syncing against that would drop (and later re-detect) effects the player edited.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) return;
    let cancelled = false;
    getInventoriesByCharacter(characterId)
      .then((list) => {
        if (cancelled) return;
        setInventories(list);
        setLoadedFor(characterId);
      })
      .catch((error) => console.warn("[Equipment] Failed to load inventories", error));
    return () => {
      cancelled = true;
    };
  }, [characterId, setInventories]);

  const items = useMemo(() => {
    const mine = inventories.filter((inv) => !!characterId && inv.characterIds?.includes(characterId));
    const worn = mine.find((inv) => inv.id === wornInventoryId(choice, mine));
    return (worn?.items ?? []).filter((item) => !!item.equipmentId);
  }, [inventories, characterId, choice]);
  const itemKey = items.map((i) => `${i.equipmentId}:${i.equipmentName ?? ""}`).sort().join("|");

  useEffect(() => {
    if (!characterId || loadedFor !== characterId) return;
    let cancelled = false;

    (async () => {
      const known = new Set((useCharacterStore.getState().character?.effects ?? []).map((e) => e.equipmentId));
      const missing = items.map((i) => i.equipmentId!).filter((id) => !known.has(id));
      // Descriptions are only needed to detect what new items do.
      const details = missing.length ? await getEquipmentByIdsForUser(missing).catch(() => []) : [];
      if (cancelled) return;

      const byId = new Map(details.map((d) => [d.id, d]));
      const equipped: EquippedItem[] = items.map((i) => {
        const d = byId.get(i.equipmentId!);
        return {
          equipmentId: i.equipmentId!,
          name: i.equipmentName || d?.name || "Item",
          description: d?.description,
          tags: [...(d?.tags ?? []), ...(i.tags ?? [])],
        };
      });

      // Read the latest sheet now, not the one from before the request.
      const store = useCharacterStore.getState();
      if (store.character?.id !== characterId) return;
      const next = syncEquippedEffects(store.character.effects ?? [], equipped);
      if (next) store.updateCharacter({ effects: next });
    })();

    return () => {
      cancelled = true;
    };
    // itemKey stands in for `items`, which is a new array on every inventory update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, loadedFor, itemKey]);
}
