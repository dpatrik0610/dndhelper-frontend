import type { Inventory } from '../../types/Inventory/Inventory';
import { useState, useEffect } from 'react';
import { getInventoriesByCharacter } from "../../services/inventoryService";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useAuthStore } from "../../store/useAuthStore";
import { notifications } from '@mantine/notifications';
import { Box, Title, Button, Group, Flex, Tooltip } from '@mantine/core';
import { IconBuildingWarehouse, IconError404, IconArrowLeft, IconReload } from '@tabler/icons-react';
import InventoryBox from './components/InventoryBox';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { loadInventories } from '../../utils/loadinventory';
import { CharacterCurrencyArea } from '../../components/CharacterCurrencyArea';

export function Inventory() {

  const character = useCharacterStore((state) => state.character);
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
      {/* Header Section */}
      <Flex
        direction={isMobile ? "column" : "row"}
        gap="md"
        mb="md"
        align={isMobile ? "center" : "flex-start"}
        justify="space-between"
        wrap="wrap"
      >
        {/* Left side: Title + currencies */}
        <Flex
          direction="column"
          gap="sm"
          align={isMobile ? "center" : "flex-start"}
        >
          <Title size="xl" style={{ display: "flex", alignItems: "center" }}>
            <IconBuildingWarehouse
              style={{ verticalAlign: "middle", marginRight: 8 }}
            />
            {character.name}'s Inventories
          </Title>
        </Flex>

        {/* Right side: Buttons */}
        <Flex
          gap="xs"
          align="center"
          justify={isMobile ? "center" : "flex-end"}
        >
          <Tooltip label="Reload inventory" position="top" withArrow>
            <Button
              variant="gradient"
              gradient={{ from: "violet", to: "cyan", deg: 45 }}
              size="sm"
              radius="md"
              onClick={() => loadInventories(token)}
            >
              <IconReload size={16} />
            </Button>
          </Tooltip>

          <Button
            leftSection={!isMobile && <IconArrowLeft size={16} />}
            variant="gradient"
            gradient={{ from: "violet", to: "cyan", deg: 45 }}
            size="sm"
            radius="md"
            onClick={() => navigate("/profile")}
          >
            {isMobile ? <IconArrowLeft size={16} /> : "Back to Profile"}
          </Button>
        </Flex>
      </Flex>

      <Flex w="100%" justify="center" align={"center"}>
        <CharacterCurrencyArea />
      </Flex>

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