import {
  Paper,
  Group,
  Text,
  ActionIcon,
  Button,
  TextInput,
  Stack,
  Tooltip,
  Badge,
} from "@mantine/core";
import { IconPlus, IconTrash, IconNote } from "@tabler/icons-react";
import { useState } from "react";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";

export function CampaignNotesPanel() {
  const { selectedCampaign, update } = useAdminCampaignStore();
  const campaign = selectedCampaign();

  const [newNote, setNewNote] = useState("");

  if (!campaign) return null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const updated = {
      ...campaign,
      noteIds: [...campaign.noteIds, newNote.trim()],
    };

    await update(campaign.id, updated);

    showNotification({
      title: "Note added",
      message: `Note "${newNote}" added.`,
      color: SectionColor.Green,
    });

    setNewNote("");
  };

  const handleRemoveNote = async (id: string) => {
    const updated = {
      ...campaign,
      noteIds: campaign.noteIds.filter((n) => n !== id),
    };

    await update(campaign.id, updated);

    showNotification({
      title: "Note removed",
      message: "Note deleted.",
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
          "linear-gradient(145deg, rgba(0,40,60,0.5), rgba(0,20,40,0.35))",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Group mb="xs">
        <IconNote size={18} color="cyan" />
        <Text fw={600} c="cyan.3">
          Notes
        </Text>
      </Group>

      <Group mb="sm">
        <TextInput
          placeholder="New note ID..."
          value={newNote}
          onChange={(e) => setNewNote(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="gradient"
          gradient={{ from: "cyan", to: "blue" }}
          leftSection={<IconPlus size={16} />}
          onClick={handleAddNote}
        >
          Add
        </Button>
      </Group>

      <Stack gap="xs">
        {campaign.noteIds.length === 0 ? (
          <Text size="sm" c="dimmed">
            No notes linked yet.
          </Text>
        ) : (
          campaign.noteIds.map((id) => (
            <Group
              key={id}
              justify="space-between"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 6,
                padding: "6px 8px",
              }}
            >
              <Badge color="cyan" variant="light">
                {id}
              </Badge>

              <Tooltip label="Remove note">
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => handleRemoveNote(id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))
        )}
      </Stack>
    </Paper>
  );
}


