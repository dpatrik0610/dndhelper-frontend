import { ActionIcon, Badge, Chip, CopyButton, Group, MultiSelect, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconLock, IconRefresh, IconUserMinus, IconUsers } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { CORE_CONTENT_TYPES, CampaignRoles, type Campaign, type CampaignMemberView, type CoreContentType } from "@appTypes/Campaign";
import {
  getCampaignMembers,
  regenerateInviteCode,
  removeCampaignMember,
  setCampaignCoreImports,
  setCampaignMemberRoles,
} from "@services/campaignService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { loadSpells } from "@utils/loadSpells";

const ROLE_OPTIONS = [CampaignRoles.Dm, CampaignRoles.Player];

const panelStyle = {
  background: "linear-gradient(145deg, rgba(0,40,60,0.5), rgba(0,20,40,0.35))",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(10px)",
};

/** DM tools for the current campaign: invite code, member roles, imported core content. */
export function CampaignMembersPanel() {
  const campaign = useCampaignStore((s) => s.selectedCampaign());
  const patch = useCampaignStore((s) => s.patch);
  const me = useCurrentUserId();
  const [members, setMembers] = useState<CampaignMemberView[]>([]);

  const campaignId = campaign?.id;
  const loadMembers = useCallback(async () => {
    if (!campaignId) return;
    try {
      setMembers(await getCampaignMembers(campaignId));
    } catch (err) {
      showNotification({ title: "Couldn't load members", message: (err as Error).message, color: SectionColor.Red });
    }
  }, [campaignId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  if (!campaign) return null;

  // Every call returns the updated campaign; keep the store (and so the role selectors) in sync.
  const apply = async (action: () => Promise<Campaign>, done?: string) => {
    try {
      patch(await action());
      await loadMembers();
      if (done) showNotification({ title: done, message: campaign.name, color: SectionColor.Green });
    } catch (err) {
      showNotification({ title: "Not saved", message: (err as Error).message, color: SectionColor.Red });
    }
  };

  return (
    <Paper mt="md" p="md" radius="md" withBorder style={panelStyle}>
      <Group mb="sm" justify="space-between">
        <Group gap="xs">
          <IconUsers size={18} color="cyan" />
          <Text fw={600} c="cyan.3">Members</Text>
        </Group>

        <Group gap={6}>
          <Text size="sm" c="dimmed">Invite code</Text>
          <Badge size="lg" variant="light" color="cyan" style={{ fontFamily: "monospace", letterSpacing: 2 }}>
            {campaign.inviteCode ?? "—"}
          </Badge>
          {campaign.inviteCode && (
            <CopyButton value={campaign.inviteCode}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy code"} withArrow>
                  <ActionIcon variant="subtle" color={copied ? "teal" : "gray"} onClick={copy} aria-label="Copy invite code">
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          )}
          <Tooltip label="New code (the old one stops working)" withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => apply(() => regenerateInviteCode(campaign.id), "Invite code replaced")}
              aria-label="Regenerate invite code"
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Stack gap="xs">
        {members.map((m) => (
          <Group
            key={m.userId}
            wrap="nowrap"
            justify="space-between"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: 6, padding: "6px 8px" }}
          >
            <Text fw={600} truncate style={{ minWidth: 0 }}>
              {m.username}
              {m.userId === me && <Text span c="dimmed" size="sm"> (you)</Text>}
            </Text>
            <Group gap="xs" wrap="nowrap">
              <MultiSelect
                aria-label={`Roles of ${m.username}`}
                data={Array.from(new Set([...ROLE_OPTIONS, ...m.roles]))}
                value={m.roles}
                onChange={(roles) => roles.length > 0 && apply(() => setCampaignMemberRoles(campaign.id, m.userId, roles))}
                size="xs"
                w={200}
              />
              <Tooltip label={m.userId === me ? "Leave campaign" : "Remove from campaign"} withArrow>
                <ActionIcon
                  color="red"
                  variant="light"
                  onClick={() => apply(() => removeCampaignMember(campaign.id, m.userId), "Member removed")}
                  aria-label={`Remove ${m.username}`}
                >
                  <IconUserMinus size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        ))}
      </Stack>

      <Group mt="md" gap="xs" align="center">
        <IconLock size={16} color="var(--mantine-color-blue-4)" />
        <Text size="sm" fw={600}>Import core content</Text>
        <Text size="xs" c="dimmed">Shared and read-only; your own homebrew stays editable.</Text>
      </Group>
      <Chip.Group
        multiple
        value={campaign.coreImports ?? []}
        onChange={(types) =>
          apply(() => setCampaignCoreImports(campaign.id, types as CoreContentType[]), "Core imports saved").then(() => loadSpells())
        }
      >
        <Group gap="xs" mt="xs">
          {CORE_CONTENT_TYPES.map((t) => (
            <Chip key={t} value={t} size="sm" color="blue">
              Core {t}
            </Chip>
          ))}
        </Group>
      </Chip.Group>
    </Paper>
  );
}
