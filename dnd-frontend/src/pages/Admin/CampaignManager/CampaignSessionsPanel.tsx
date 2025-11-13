import {
  Paper,
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
import { useAdminCampaignStore } from "../../../store/admin/useAdminCampaignStore";
import { SectionColor } from "../../../types/SectionColor";
import { showNotification } from "../../../components/Notification/Notification";

export function CampaignSessionsPanel() {
  const { selectedCampaign, update } = useAdminCampaignStore();
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
    <Paper
      mt="md"
      p="md"
      radius="md"
      withBorder
      style={{
        background:
          "linear-gradient(145deg, rgba(20,0,50,0.5), rgba(10,0,20,0.35))",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Group mb="xs">
        <IconCalendarTime size={18} color="violet" />
        <Text fw={600} c="violet.1">
          Sessions
        </Text>
      </Group>

      <Group mb="sm">
        <TextInput
          placeholder="New session ID or title..."
          value={newSession}
          onChange={(e) => setNewSession(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="gradient"
          gradient={{ from: "indigo", to: "grape" }}
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
                <Badge color="violet" variant="light">
                  {id}
                </Badge>
                {campaign.currentSessionId === id && (
                  <Badge color="teal" variant="filled">
                    Current
                  </Badge>
                )}
              </Group>

              <Group gap="xs">
                <Tooltip label="Set as current">
                  <ActionIcon variant="light" color="teal" onClick={() => handleSetCurrent(id)}>
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
    </Paper>
  );
}
