import {
  Group,
  Text,
  ActionIcon,
  Button,
  TextInput,
  Stack,
  Badge,
  Tooltip,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconCalendarTime,
  IconCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { AdminPanel } from "@features/admin/components/AdminPage";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";

export function CampaignSessionsPanel() {
  const { selectedCampaign, update } = useCampaignStore();
  const campaign = selectedCampaign();

  const [newSession, setNewSession] = useState("");

  if (!campaign) return null;

  const handleAddSession = async () => {
    if (!newSession.trim()) return;

    const updated = {
      ...campaign,
      sessionIds: [...campaign.sessionIds, newSession.trim()],
    };

    await update(campaign.id, updated);

    showNotification({
      title: "Session added",
      message: `Session "${newSession}" added.`,
      color: SectionColor.Green,
    });

    setNewSession("");
  };

  const handleSetCurrent = async (id: string) => {
    const updated = { ...campaign, currentSessionId: id };

    await update(campaign.id, updated);

    showNotification({
      title: "Current session updated",
      message: `Current session set to "${id}".`,
      color: SectionColor.Green,
    });
  };

  const handleRemoveSession = async (id: string) => {
    const updated = {
      ...campaign,
      sessionIds: campaign.sessionIds.filter((s) => s !== id),
      currentSessionId: campaign.currentSessionId === id ? null : campaign.currentSessionId,
    };

    await update(campaign.id, updated);

    showNotification({
      title: "Session removed",
      message: "Session deleted successfully.",
      color: SectionColor.Red,
    });
  };

  return (
    <AdminPanel icon={IconCalendarTime} title="Sessions">
      <Group mb="sm">
        <TextInput
          placeholder="New session ID or title..."
          value={newSession}
          onChange={(e) => setNewSession(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          color="neon"
          leftSection={<IconPlus size={16} />}
          onClick={handleAddSession}
        >
          Add
        </Button>
      </Group>

      <Stack gap="xs">
        {campaign.sessionIds.length === 0 ? (
          <Text size="sm" c="dimmed">
            No sessions yet.
          </Text>
        ) : (
          campaign.sessionIds.map((id) => (
            <Group
              key={id}
              justify="space-between"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 6,
                padding: "6px 8px",
              }}
            >
              <Group gap="sm">
                <Badge color="magenta" variant="light">
                  {id}
                </Badge>
                {campaign.currentSessionId === id && (
                  <Badge color="neon" variant="filled">
                    Current
                  </Badge>
                )}
              </Group>

              <Group gap="xs">
                <Tooltip label="Set as current">
                  <ActionIcon variant="light" color="neon" onClick={() => handleSetCurrent(id)}>
                    <IconCheck size={16} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Remove session">
                  <ActionIcon variant="light" color="red" onClick={() => handleRemoveSession(id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          ))
        )}
      </Stack>
    </AdminPanel>
  );
}


