import { Badge, Group, Loader, SimpleGrid, Text } from "@mantine/core";
import { IconFlag } from "@tabler/icons-react";
import { useEffect } from "react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useToken } from "@store/auth/authSelectors";
import { AdminPage } from "@features/admin/components/AdminPage";
import { CampaignActions } from "./CampaignActions";
import { CampaignCharactersPanel } from "./CampaignCharactersPanel";
import { CampaignSessionsPanel } from "./CampaignSessionsPanel";
import { CampaignNotesPanel } from "./CampaignNotesPanel";
import { CampaignMembersPanel } from "./CampaignMembersPanel";

export function CampaignManager() {
  const { reload, loading, selectedCampaign } = useCampaignStore();
  const campaign = selectedCampaign();
  const token = useToken();

  useEffect(() => {
    if (token) void reload();
  }, [token, reload]);

  return (
    <AdminPage
      icon={IconFlag}
      title={
        <Group gap="xs" component="span">
          {campaign?.name || "Campaigns"}
          {campaign && (
            <Badge size="sm" variant="light" color={campaign.isActive ? "neon" : "gray"}>
              {campaign.isActive ? "Active" : "Paused"}
            </Badge>
          )}
        </Group>
      }
      subtitle={
        campaign?.createdAt ? `Created ${new Date(campaign.createdAt).toLocaleDateString()}` : "Members, characters, sessions and notes"
      }
      actions={<CampaignActions />}
    >
      {loading ? (
        <Group justify="center" py="xl">
          <Loader size="md" />
        </Group>
      ) : campaign ? (
        <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md">
          <CampaignMembersPanel />
          <CampaignCharactersPanel />
          <CampaignSessionsPanel />
          <CampaignNotesPanel />
        </SimpleGrid>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          Select or create a campaign to begin.
        </Text>
      )}
    </AdminPage>
  );
}
