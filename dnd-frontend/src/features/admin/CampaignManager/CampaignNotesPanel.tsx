import {
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
import { useCampaignStore } from "@store/campaign/campaignStore";
import { AdminPanel } from "@features/admin/components/AdminPage";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";

export function CampaignNotesPanel() {
  const { selectedCampaign, update } = useCampaignStore();
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
    <AdminPanel icon={IconNote} title="Notes">
      <Group mb="sm">
        <TextInput
          placeholder="New note ID..."
          value={newNote}
          onChange={(e) => setNewNote(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          color="neon"
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
              <Badge color="electric" variant="light">
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
    </AdminPanel>
  );
}


