import type { Inventory } from '../../types/Inventory/Inventory';
import { useState, useEffect } from 'react';
import { getInventoriesByCharacter } from "../../services/inventoryService";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useAuthStore } from "../../store/useAuthStore";
import { notifications } from '@mantine/notifications';
import { Box, Title, Button, Group, Grid, Tooltip } from '@mantine/core';
import { IconBuildingWarehouse, IconError404, IconArrowLeft, IconReload } from '@tabler/icons-react';
import InventoryBox from './components/InventoryBox';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { loadInventories } from '../../utils/loadinventory';

export function Inventory() {
  const character = useCharacterStore.getState().character;
  const token = useAuthStore.getState().token || '';
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    <Box
      maw={isMobile ? "100%" : 1200}
      p={isMobile ? undefined : "md"}
      m={isMobile ? undefined : "0 auto"}
    >
    <Grid mb="md" align="center">
      {/* Title on the left */}
      <Grid.Col span={isMobile ? 12 : 6}>
        <Title size="xl">
          <IconBuildingWarehouse style={{ verticalAlign: "middle", marginRight: 8 }} />
          {character.name}'s Inventories
        </Title>
      </Grid.Col>

      {/* Buttons on the right */}
      <Grid.Col span={isMobile ? 12 : 6} style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <Group lts="md">
          <Tooltip label="Reload inventory" position="right" withArrow>
            <Button
              variant="gradient"
              gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
              size="sm"
              radius="md"
              onClick={() => loadInventories(token)}
            >
              <IconReload size={16} />
            </Button>
          </Tooltip>

          <Button
            leftSection={ !isMobile && <IconArrowLeft size={16} />}
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
            size="sm"
            radius="md"
            onClick={() => navigate("/profile")}
          >
            {isMobile ? <IconArrowLeft size={16} /> : "Back to Profile"}
          </Button>
        </Group>
      </Grid.Col>
    </Grid>

      {inventories.length ? (
        inventories.map((inv) => <InventoryBox key={inv.id} inventory={inv} />)
      ) : (
        <Title order={4} c="dimmed" ta="center" mt="xl">
          No inventories found
        </Title>
      )}
    </Box>
  );
}
