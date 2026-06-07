import { useEffect } from "react";
import { Box, SimpleGrid } from "@mantine/core";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { CharacterCard } from "./components/CharacterCard";

export function DMCharacterPanel() {
  const { selectedId: campaignId } = useAdminCampaignStore();
  const { characters, loadAll } = useAdminCharacterStore();

  useEffect(() => {
    if (campaignId) {
      void loadAll(campaignId);
    }
  }, [campaignId, loadAll]);

  return (
    <Box>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {characters.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </SimpleGrid>
    </Box>
  );
}
