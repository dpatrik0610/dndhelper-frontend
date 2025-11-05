import { Divider, Stack } from "@mantine/core";
import { CharacterSelectPanel } from "./sections/CharacterSelectPanel";
import { InventorySelectPanel } from "./sections/InventorySelectPanel";
import { InventoryItemsPanel } from "./sections/InventoryItemsPanel";

export function InventoryManager() {
  
  return (
    <Stack gap="md" p="xl" >
      <CharacterSelectPanel />
      <Divider />
      <InventorySelectPanel />
      <Divider />
      <InventoryItemsPanel />
    </Stack>
  );
}
