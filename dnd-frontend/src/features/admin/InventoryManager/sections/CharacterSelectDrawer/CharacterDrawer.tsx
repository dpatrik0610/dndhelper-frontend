import { Drawer, Group, Text, Tooltip, ActionIcon } from "@mantine/core";
import { IconUser, IconReload } from "@tabler/icons-react";
import { DrawerContent } from "./DrawerContent";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";

interface CharacterDrawerProps {
  opened: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function CharacterDrawer({ opened, onClose, isMobile }: CharacterDrawerProps) {
  const { selectedId: campaignId } = useAdminCampaignStore();
  const { loadAll: loadCharacters } = useAdminCharacterStore();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      closeOnClickOutside
      closeOnEscape
      size={isMobile ? "100%" : "22%"}
      overlayProps={{ backgroundOpacity: 0, blur: 0 }}
      withOverlay
      padding="md"
      styles={{
        content: {
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "rgba(20,0,30,0.9)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
        },
        header: {
          paddingBottom: "0.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(25,0,35,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 2,
        },
        title: { color: "var(--mantine-color-grape-3)" },
        body: {
          flex: 1,
          paddingTop: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
      title={
        <Group justify="space-between">
          <Group gap="xs">
            <IconUser size={20} color="var(--mantine-color-grape-4)" />
            <Text fw={600}>Characters</Text>
          </Group>
          <Tooltip label="Reload characters" withArrow>
            <ActionIcon
              variant="gradient"
              gradient={{ from: "grape", to: "violet" }}
              onClick={() => campaignId && loadCharacters(campaignId)}
            >
              <IconReload size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      }
    >
      <DrawerContent />
    </Drawer>
  );
}
