import { useState } from "react";
import { ActionIcon, Button, Modal, Select, Stack, Tabs, TextInput, Tooltip } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import classes from "./CampaignSwitcher.module.css";

/** Current campaign picker at the top of the sidebar, plus create / join-by-code. */
export function CampaignSwitcher() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const visiting = useCampaignStore((s) => s.visiting);
  const selectedId = useCampaignStore((s) => s.selectedId);
  const select = useCampaignStore((s) => s.select);
  const [adding, setAdding] = useState(false);

  return (
    <div className={classes.row}>
      <Select
        className={classes.select}
        aria-label="Current campaign"
        placeholder={campaigns.length ? "Pick a campaign" : "No campaign yet"}
        data={[
          ...campaigns.map((c) => ({ value: c.id, label: c.name })),
          // Opened from the dashboard's all-campaigns list; gone once another campaign is picked.
          ...(visiting && !campaigns.some((c) => c.id === visiting.id)
            ? [{ value: visiting.id, label: `${visiting.name} (visiting)` }]
            : []),
        ]}
        value={selectedId}
        onChange={(id) => id && select(id)}
        allowDeselect={false}
        disabled={campaigns.length === 0 && !visiting}
        size="sm"
        radius="md"
        comboboxProps={{ zIndex: 300 }}
      />
      <Tooltip label="Create or join a campaign" withArrow zIndex={300}>
        <ActionIcon variant="light" size={36} radius="md" onClick={() => setAdding(true)} aria-label="Create or join a campaign">
          <IconPlus size={18} />
        </ActionIcon>
      </Tooltip>

      <AddCampaignModal opened={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function AddCampaignModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const create = useCampaignStore((s) => s.create);
  const join = useCampaignStore((s) => s.join);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      setName("");
      setCode("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add a campaign" centered zIndex={300}>
      <Tabs defaultValue="join">
        <Tabs.List grow mb="md">
          <Tabs.Tab value="join">Join with code</Tabs.Tab>
          <Tabs.Tab value="create">Create new</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="join">
          <form onSubmit={(e) => { e.preventDefault(); void run(() => join(code)); }}>
            <Stack>
              <TextInput
                label="Invite code"
                description="Ask your DM for it."
                value={code}
                onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
                maxLength={8}
                data-autofocus
              />
              <Button type="submit" loading={busy} disabled={code.trim().length === 0}>Join</Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="create">
          <form onSubmit={(e) => { e.preventDefault(); void run(() => create({ name: name.trim() })); }}>
            <Stack>
              <TextInput
                label="Campaign name"
                description="You'll be its Dungeon Master."
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
              <Button type="submit" loading={busy} disabled={name.trim().length === 0}>Create</Button>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
