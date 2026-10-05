import { useEffect, useMemo, useState } from 'react';
import { getInventoriesByCharacter } from "@services/inventoryService";
import { getEquipmentByIdsForUser } from "@services/equipmentService";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import type { EquipmentUserResponse } from "@appTypes/Equipment/Equipment";

import { Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ListSkeleton } from "@components/common/Skeletons";
import { InventoryFilters } from '@features/inventory/components/InventoryFilters';
import { InventoryList } from '@features/inventory/components/InventoryList';
import { useInventoryFilters } from '@features/inventory/hooks/useInventoryFilters';
import { showNotification } from '@components/Notification/Notification';

export function Inventory() {

  const character = useCurrentCharacter();
  const characterId = character?.id;
  const allInventories = useInventoryStore((state) => state.inventories);
  const setInventories = useInventoryStore((state) => state.setInventories);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(new Map<string, EquipmentUserResponse>());
  const { searchTerm, setSearchTerm, sortBy, setSortBy, viewMode, setViewMode } = useInventoryFilters();
  const navigate = useNavigate();

  // Redirect if no character selected
  useEffect(() => {
    if (!character) {
      showNotification({
        title: 'No Character Selected',
        message: 'Please select a character first.',
        color: 'red',
      });
      navigate('/profile');
    }
  }, [character, navigate]);

  // Fetch once into the store; SignalR keeps it current from there.
  useEffect(() => {
    if (!characterId) return;

    setLoading(true);
    getInventoriesByCharacter(characterId)
      .then(setInventories)
      .catch(() => {
        showNotification({
          title: 'Error',
          message: 'An error occurred while fetching inventories.',
          color: 'red',
        });
      })
      .finally(() => setLoading(false));
  }, [characterId, setInventories]);

  // The store is persisted and fed by SignalR, so it can still hold another character's inventories.
  const inventories = useMemo(
    () => allInventories.filter((inv) => !!characterId && inv.characterIds?.includes(characterId)),
    [allInventories, characterId]
  );

  // Tier, weight and damage live on the equipment, not the inventory entry.
  const equipmentIds = useMemo(
    () => [...new Set(inventories.flatMap((inv) => inv.items ?? []).map((item) => item.equipmentId).filter((id): id is string => !!id))].sort().join(","),
    [inventories]
  );

  useEffect(() => {
    if (!equipmentIds) return;
    let cancelled = false;

    getEquipmentByIdsForUser(equipmentIds.split(","))
      .then((list) => {
        if (!cancelled) setDetails(new Map(list.map((e) => [e.id, e])));
      })
      // Cards still render without the extra stats.
      .catch((error) => console.warn("[Inventory] Failed to load equipment details", error));

    return () => {
      cancelled = true;
    };
  }, [equipmentIds]);

  // Render nothing if no character
  if (!character) return null;

  return (
    <Box>
      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {loading && !inventories.length ? (
        <Box mt="md">
          <ListSkeleton rows={3} height={56} />
        </Box>
      ) : (
        <InventoryList
          inventories={inventories}
          details={details}
          searchTerm={searchTerm}
          sortBy={sortBy}
          viewMode={viewMode}
        />
      )}
    </Box>
  );
}
