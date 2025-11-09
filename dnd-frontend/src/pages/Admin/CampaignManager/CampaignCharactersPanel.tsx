import {
  Box,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Paper,
  Avatar,
  Stack,
  Divider,
  Button,
  Select,
} from "@mantine/core";
import {
  IconUserPlus,
  IconUserMinus,
  IconUsersGroup,
  IconReload,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  getCampaignCharacters,
  addCharacterToCampaign,
  removeCharacterFromCampaign,
} from "../../../services/campaignService";
import { useAdminCampaignStore } from "../../../store/admin/useAdminCampaignStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { showNotification } from "../../../components/Notification/Notification";
import { SectionColor } from "../../../types/SectionColor";
import type { Character } from "../../../types/Character/Character";

export function CampaignCharactersPanel() {
  const {
    selectedCampaign,
    reload,
    allCharacters,
    loadAllCharacters,
  } = useAdminCampaignStore();
  const token = useAuthStore((s) => s.token)!;

  const campaign = selectedCampaign();
  const [members, setMembers] = useState<Character[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Load campaign members
  useEffect(() => {
    if (campaign?.id) void fetchMembers();
  }, [campaign?.id]);

  // 🔹 Load all characters (light list)
  useEffect(() => {
    if (allCharacters.length === 0) void loadAllCharacters();
  }, [allCharacters.length, loadAllCharacters]);

  const fetchMembers = async () => {
    if (!campaign?.id) return;
    setLoading(true);
    try {
      const data = await getCampaignCharacters(campaign.id, token);
      setMembers(data);
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Error loading campaign characters",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!campaign?.id || !selectedChar) return;
    await addCharacterToCampaign(campaign.id, selectedChar, token);
    await fetchMembers();
    await reload();
    setSelectedChar(null);
    setAdding(false);
    showNotification({
      title: "Character added",
      message: "Character successfully linked to this campaign.",
      color: SectionColor.Green,
    });
  };

  const handleRemove = async (charId: string) => {
    if (!campaign?.id) return;
    const confirmDel = confirm("Remove this character from the campaign?");
    if (!confirmDel) return;
    await removeCharacterFromCampaign(campaign.id, charId, token);
    await fetchMembers();
    await reload();
    showNotification({
      title: "Character removed",
      message: "Character unlinked from campaign.",
      color: SectionColor.Red,
    });
  };

  return (
    <Paper
      p="sm"
      radius="md"
      withBorder
      style={{
        background:
          "linear-gradient(145deg, rgba(60,0,80,0.55), rgba(20,0,30,0.4))",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group>
          <IconUsersGroup size={18} color="violet" />
          <Text fw={600} c="violet.1">
            Campaign Characters
          </Text>
        </Group>
        <Group gap="xs">
          <Tooltip label="Reload" withArrow>
            <ActionIcon
              variant="subtle"
              color="violet"
              onClick={fetchMembers}
              loading={loading}
            >
              <IconReload size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add character" withArrow>
            <ActionIcon
              variant="gradient"
              gradient={{ from: "teal", to: "cyan" }}
              onClick={() => setAdding((v) => !v)}
            >
              <IconUserPlus size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Divider my="xs" color="rgba(255,255,255,0.1)" />

      {/* === Add form === */}
      {adding && (
        <Group mt="xs" gap="xs" wrap="nowrap">
          <Select
            placeholder="Select character..."
            searchable
            value={selectedChar}
            onChange={setSelectedChar}
            data={allCharacters
              .filter((c) => !members.some((m) => m.id === c.id))
              .map((c) => ({
                value: c.id!,
                label: c.name,
              }))}
            style={{ flex: 1 }}
          />
          <Button
            variant="gradient"
            gradient={{ from: "teal", to: "green" }}
            onClick={handleAdd}
          >
            Add
          </Button>
        </Group>
      )}

      {/* === Member list === */}
      <Stack mt="sm" gap="xs">
        {members.length === 0 ? (
          <Text size="sm" c="dimmed">
            No characters in this campaign.
          </Text>
        ) : (
          members.map((c) => (
            <Group
              key={c.id}
              gap="xs"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 6,
                padding: "6px 8px",
              }}
            >
              <Avatar
                src={c.imageUrl || undefined}
                alt={c.name}
                radius="xl"
                size="sm"
              >
                {c.name.charAt(0)}
              </Avatar>
              <Box style={{ flex: 1 }}>
                <Text fw={500}>{c.name}</Text>
                <Text size="xs" c="dimmed">
                  {c.characterClass ?? "Unknown"}{" "}
                  {c.level ? `— lvl ${c.level}` : ""}
                </Text>
              </Box>

              <Tooltip label="Remove" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemove(c.id!)}
                >
                  <IconUserMinus size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))
        )}
      </Stack>
    </Paper>
  );
}
