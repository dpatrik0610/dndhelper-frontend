import { useState, useEffect } from "react";
import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { CharacterDrawer } from "./CharacterDrawer";
import { FloatingCharacterButton } from "./FloatingCharacterButton";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";

export function CharacterDrawerPanel() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { selectedId, characters, loadAll: loadCharacters } = useAdminCharacterStore();
  const { loadByCharacter } = useAdminInventoryStore();
  const { selectedId: campaignId } = useAdminCampaignStore();

  useEffect(() => {
    if (selectedId) setDrawerOpen(false);
  }, [selectedId]);

  useEffect(() => {
    if (campaignId && characters.length === 0) loadCharacters(campaignId);
  }, [campaignId, characters, loadCharacters]);

  useEffect(() => {
    if (selectedId) loadByCharacter(selectedId);
  }, [selectedId, loadByCharacter]);

  return (
    <>
      <FloatingCharacterButton opened={drawerOpen} onClick={() => setDrawerOpen((o) => !o)} isMobile={isMobile} />
      <CharacterDrawer opened={drawerOpen} onClose={() => setDrawerOpen(false)} isMobile={isMobile} />
    </>
  );
}
