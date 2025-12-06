import type { Inventory } from '../../types/Inventory/Inventory';
import { useEffect, useState } from 'react';
import { getInventoriesByCharacter } from "../../services/inventoryService";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useAuthStore } from "../../store/useAuthStore";
import { notifications } from '@mantine/notifications';
import { Box } from '@mantine/core';
import { IconError404 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { InventoryFilters } from './components/InventoryFilters';
import { InventoryList } from './components/InventoryList';
import { useInventoryFilters } from './hooks/useInventoryFilters';

export function Inventory() {

  const character = useCharacterStore((state) => state.character);
  const token = useAuthStore.getState().token || '';
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const { searchTerm, setSearchTerm } = useInventoryFilters();
  const navigate = useNavigate();

  // Redirect if no character selected
  useEffect(() => {
    if (!character) {
      notifications.show({
        title: 'No Character Selected',
        message: 'Please select a character first.',
        color: 'red',
      });
      navigate('/profile');
    }
  }, [character, navigate]);

  // Fetch inventories
  useEffect(() => {
    if (!character?.id) return;

    getInventoriesByCharacter(character.id, token)
      .then((data) => {
        if (!data || data.length <= 0) {
          notifications.show({
            title: 'No Inventories',
            message: 'This character has no inventories yet.',
            color: 'yellow',
            icon: <IconError404 />,
          });
        } else {
          setInventories(data);
        }
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'An error occurred while fetching inventories.',
          color: 'red',
        });
      });
  }, [character?.id, token]);

  // Render nothing if no character
  if (!character) return null;

  return (
    
    <Box>
      <InventoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <InventoryList
        inventories={inventories}
        searchTerm={searchTerm}
      />
    </Box>
  );
}
