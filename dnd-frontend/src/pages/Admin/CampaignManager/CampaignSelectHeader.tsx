import {
  Group,
  Select,
  Button,
  ActionIcon,
  Tooltip,
  TextInput,
  Box,
} from "@mantine/core";
import {
  IconFlag,
  IconPlus,
  IconTrash,
  IconReload,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useAdminCampaignStore } from "../../../store/admin/useAdminCampaignStore";
import { showNotification } from "../../../components/Notification/Notification";
import { SectionColor } from "../../../types/SectionColor";

export function CampaignSelectPanel() {
  const {
    campaigns,
    selectedId,
    select,
    reload,
    create,
    remove,
  } = useAdminCampaignStore();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (campaigns.length === 0) void reload();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) {
      showNotification({
        title: "Invalid name",
        message: "Please enter a campaign name.",
        color: SectionColor.Red,
      });
      return;
    }
    await create({
      id: "",
      name: newName.trim(),
      description: null,
      characterIds: [],
      ownerIds: [],
      worldIds: [],
      questIds: [],
      noteIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      isActive: true,
      currentSessionId: null,
      sessionIds: [],
    });
    setNewName("");
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirmDelete = confirm("Are you sure you want to delete this campaign?");
    if (confirmDelete) await remove(selectedId);
  };

  return (
    <Box
      p="sm"
      bdrs="md"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Group justify="space-between" align="center" gap="xs" wrap="nowrap">
        {/* === Select Existing === */}
        <Group gap="xs" style={{ flex: 1 }}>
          <IconFlag size={18} color="violet" />
          <Select
            style={{ flex: 1 }}
            placeholder="Select campaign..."
            data={campaigns.map((c) => ({ value: c.id!, label: c.name }))}
            value={selectedId}
            onChange={(id) => select(id ?? null)}
            nothingFoundMessage="No campaigns"
            searchable
            radius="md"
          />
        </Group>

        {/* === Action Buttons === */}
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Reload" withArrow>
            <ActionIcon
              variant="subtle"
              color="violet"
              radius="xl"
              onClick={reload}
            >
              <IconReload size={18} />
            </ActionIcon>
          </Tooltip>

          {selectedId && (
            <Tooltip label="Delete selected campaign" withArrow>
              <ActionIcon
                variant="gradient"
                gradient={{ from: "red", to: "pink" }}
                radius="xl"
                onClick={handleDelete}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Tooltip>
          )}

          <Tooltip label="Create new campaign" withArrow>
            <ActionIcon
              variant="gradient"
              gradient={{ from: "grape", to: "violet" }}
              radius="xl"
              onClick={() => setCreating((v) => !v)}
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* === Create Campaign Inline Form === */}
      {creating && (
        <Group mt="sm" gap="xs" wrap="nowrap">
          <TextInput
            placeholder="Campaign name..."
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            style={{ flex: 1 }}
            radius="md"
          />
          <Button
            variant="gradient"
            gradient={{ from: "teal", to: "green" }}
            onClick={handleCreate}
            radius="md"
          >
            Create
          </Button>
        </Group>
      )}
    </Box>
  );
}
