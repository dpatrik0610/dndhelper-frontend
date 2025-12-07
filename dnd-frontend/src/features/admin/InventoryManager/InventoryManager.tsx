import { Box, Paper, Stack } from "@mantine/core";
import { CharacterDrawerPanel } from "./sections/CharacterSelectDrawer/CharacterDrawerPanel";
import { InventorySelectPanel } from "./sections/InventorySelectPanel/InventorySelectPanel";
import { InventoryHeader } from "./sections/InventoryItems/InventoryHeader";
import { InventoryItemsPanel } from "./sections/InventoryItems/InventoryItemsPanel";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { AdminCurrencyBox } from "../components/AdminCurrencyBox";

export function InventoryManager() {
  const selectedCharacter = useAdminCharacterStore((state) => state.selectedId);

  return (
    <Box style={{ width: "100%", margin: "0 auto" }}>
      <CharacterDrawerPanel />
      <Stack gap="md">
        <InventorySelectPanel />
        {selectedCharacter && 
        <Paper
          p="sm"
          mt="md"
          radius="md"
          withBorder
          style={{
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(145deg, rgba(50,0,90,0.55), rgba(20,0,40,0.45))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 15px rgba(150,50,255,0.15)",
          }}
        >
          <InventoryHeader />
          <AdminCurrencyBox />
          <InventoryItemsPanel />
        </Paper>
        }
      </Stack>
    </Box>
  );
}
