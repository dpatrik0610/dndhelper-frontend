import {
  Box,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Avatar,
  Stack,
  Button,
  Select,
  MultiSelect,
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
  getCampaignMembers,
  addCharacterToCampaign,
  removeCharacterFromCampaign,
  setCharacterOwners,
} from "@services/campaignService";
import type { CampaignMemberView } from "@appTypes/Campaign";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { AdminPanel } from "@features/admin/components/AdminPage";

import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { Character } from "@appTypes/Character/Character";

export function CampaignCharactersPanel() {
  const {
    selectedCampaign,
    reload,
    allCharacters,
    loadAllCharacters,
  } = useCampaignStore();


  const campaign = selectedCampaign();
  const [members, setMembers] = useState<Character[]>([]);
  // People in the campaign: who a character can be handed to.
  const [people, setPeople] = useState<CampaignMemberView[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔍 Load campaign members
  useEffect(() => {
    if (campaign?.id) void fetchMembers();
  }, [campaign?.id]);

  // 🔍 Load all characters (light list)
  useEffect(() => {
    if (allCharacters.length === 0) void loadAllCharacters();
  }, [allCharacters.length, loadAllCharacters]);

  const fetchMembers = async () => {
    if (!campaign?.id) return;
    setLoading(true);
    try {
      const [data, campaignPeople] = await Promise.all([
        getCampaignCharacters(campaign.id),
        getCampaignMembers(campaign.id),
      ]);
      setMembers(data);
      setPeople(campaignPeople);
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

    // The server links both sides (campaign list + character.campaignId).
    await addCharacterToCampaign(campaign.id, selectedChar);

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

  // The server unlinks both sides.
  await removeCharacterFromCampaign(campaign.id, charId);

  await fetchMembers();
  await reload();

  showNotification({
    title: "Character removed",
    message: "Character unlinked from campaign.",
    color: SectionColor.Red,
  });
};

  const handleOwners = async (charId: string, ownerIds: string[]) => {
    if (!campaign?.id || ownerIds.length === 0) return;
    try {
      const updated = await setCharacterOwners(campaign.id, charId, ownerIds);
      setMembers((list) => list.map((c) => (c.id === charId ? { ...c, ownerIds: updated.ownerIds } : c)));
      showNotification({ title: "Player updated", message: updated.name, color: SectionColor.Green });
    } catch (err) {
      showNotification({ title: "Couldn't change player", message: (err as Error).message, color: SectionColor.Red });
    }
  };

  return (
    <AdminPanel
      icon={IconUsersGroup}
      title="Characters"
      actions={
        <>
          <Tooltip label="Reload" withArrow>
            <ActionIcon variant="subtle" color="gray" onClick={fetchMembers} loading={loading} aria-label="Reload characters">
              <IconReload size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add character" withArrow>
            <ActionIcon variant="light" color="neon" onClick={() => setAdding((v) => !v)} aria-label="Add character">
              <IconUserPlus size={16} />
            </ActionIcon>
          </Tooltip>
        </>
      }
    >
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
            color="neon"
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
                  {c.level ? `- lvl ${c.level}` : ""}
                </Text>
              </Box>

              <MultiSelect
                aria-label={`Who plays ${c.name}`}
                placeholder="Played by…"
                data={people.map((p) => ({ value: p.userId, label: p.username }))}
                value={(c.ownerIds ?? []).filter((id) => people.some((p) => p.userId === id))}
                onChange={(ids) => handleOwners(c.id!, ids)}
                size="xs"
                w={220}
              />

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
    </AdminPanel>
  );
}


