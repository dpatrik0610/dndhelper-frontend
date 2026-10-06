import { ActionIcon, Button, Group, Select, TextInput, Tooltip } from "@mantine/core";
import {
  IconCheck,
  IconPencil,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlus,
  IconReload,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useDmCampaigns } from "@store/campaign/campaignSelectors";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

/** Campaign page header actions: pick, reload, pause, rename, delete, or create a campaign. */
export function CampaignActions() {
  const { selectedId, selectedCampaign, select, reload, create, update, remove } = useCampaignStore();
  const dmCampaigns = useDmCampaigns();
  const campaign = selectedCampaign();
  const [busy, setBusy] = useState(false);
  const [newName, setNewName] = useState<string | null>(null);

  const toggleActive = async () => {
    if (!campaign) return;
    setBusy(true);
    try {
      await update(campaign.id!, { ...campaign, isActive: !campaign.isActive });
      showNotification({
        title: "Campaign updated",
        message: `${campaign.name} is now ${campaign.isActive ? "paused" : "active"}.`,
        color: SectionColor.Green,
      });
    } finally {
      setBusy(false);
    }
  };

  const rename = async () => {
    if (!campaign) return;
    const name = prompt("New campaign name:", campaign.name)?.trim();
    if (name && name !== campaign.name) await update(campaign.id!, { ...campaign, name });
  };

  const handleDelete = async () => {
    if (campaign && confirm(`Delete "${campaign.name}"? This can't be undone.`)) await remove(campaign.id!);
  };

  const handleCreate = async () => {
    const name = newName?.trim();
    if (!name) return;
    const now = new Date().toISOString();
    await create({
      id: "",
      name,
      description: null,
      characterIds: [],
      ownerIds: [],
      activeEncounterId: null,
      worldIds: [],
      questIds: [],
      noteIds: [],
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      isActive: true,
      currentSessionId: null,
      sessionIds: [],
    });
    setNewName(null);
  };

  if (newName !== null)
    return (
      <Group gap="xs" wrap="nowrap">
        <TextInput
          size="xs"
          w={220}
          placeholder="New campaign name"
          data-autofocus
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleCreate()}
        />
        <Button size="xs" color="neon" leftSection={<IconCheck size={14} />} disabled={!newName.trim()} onClick={() => void handleCreate()}>
          Create
        </Button>
        <ActionIcon variant="subtle" color="gray" onClick={() => setNewName(null)} aria-label="Cancel">
          <IconX size={16} />
        </ActionIcon>
      </Group>
    );

  return (
    <Group gap="xs" wrap="nowrap">
      <Select
        size="xs"
        w={200}
        placeholder="Select campaign…"
        data={dmCampaigns.map((c) => ({ value: c.id!, label: c.name }))}
        value={selectedId}
        onChange={(id) => select(id ?? null)}
        nothingFoundMessage="No campaigns"
        searchable
        allowDeselect={false}
      />
      <Tooltip label="Reload" withArrow>
        <ActionIcon variant="default" size="md" onClick={() => void reload()} aria-label="Reload campaigns">
          <IconReload size={15} />
        </ActionIcon>
      </Tooltip>
      {campaign && (
        <>
          <Tooltip label={campaign.isActive ? "Pause campaign" : "Resume campaign"} withArrow>
            <ActionIcon variant="default" size="md" onClick={() => void toggleActive()} loading={busy} aria-label="Pause or resume">
              {campaign.isActive ? <IconPlayerPauseFilled size={15} /> : <IconPlayerPlayFilled size={15} />}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Rename" withArrow>
            <ActionIcon variant="default" size="md" onClick={() => void rename()} aria-label="Rename campaign">
              <IconPencil size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete campaign" withArrow>
            <ActionIcon variant="light" color="red" size="md" onClick={() => void handleDelete()} aria-label="Delete campaign">
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        </>
      )}
      <Button size="xs" color="neon" leftSection={<IconPlus size={14} />} onClick={() => setNewName("")}>
        New campaign
      </Button>
    </Group>
  );
}
