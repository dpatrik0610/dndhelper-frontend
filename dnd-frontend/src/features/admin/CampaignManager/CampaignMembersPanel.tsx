import { ActionIcon, Badge, Chip, CopyButton, Group, MultiSelect, Stack, Text, Tooltip } from "@mantine/core";
import { IconBrandDiscord, IconCheck, IconCopy, IconLock, IconRefresh, IconUserMinus, IconUsers } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { AdminPanel } from "@features/admin/components/AdminPage";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { CORE_CONTENT_TYPES, CampaignRoles, type Campaign, type CampaignMemberView, type CoreContentType } from "@appTypes/Campaign";
import {
  getCampaignMembers,
  regenerateInviteCode,
  removeCampaignMember,
  setCampaignCoreImports,
  setCampaignDiscordWebhook,
  setCampaignMemberRoles,
} from "@services/campaignService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { loadSpells } from "@utils/loadSpells";
import { GlassyTextInput } from "@components/common/GlassyTextInput";

const ROLE_OPTIONS = [CampaignRoles.Dm, CampaignRoles.Player, CampaignRoles.Poll];

/** DM tools for the current campaign: invite code, member roles, imported core content, Discord webhook. */
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
      return true;
    } catch (err) {
      showNotification({ title: "Not saved", message: (err as Error).message, color: SectionColor.Red });
      return false;
    }
  };

  return (
    <AdminPanel
      icon={IconUsers}
      title="Members"
      actions={
        <>
          <Text size="sm" c="dimmed">Invite code</Text>
          <Badge size="lg" variant="light" color="neon" style={{ fontFamily: "monospace", letterSpacing: 2 }}>
            {campaign.inviteCode ?? "—"}
          </Badge>
          {campaign.inviteCode && (
            <CopyButton value={campaign.inviteCode}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy code"} withArrow>
                  <ActionIcon variant="subtle" color={copied ? "neon" : "gray"} onClick={copy} aria-label="Copy invite code">
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
        </>
      }
    >
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
        <IconLock size={16} color="var(--cyber-accent-3)" />
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
            <Chip key={t} value={t} size="sm" color="electric">
              Core {t}
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      <DiscordWebhookRow
        key={`table-${campaign.tablePingRoleId ?? ""}`}
        title="Tabletop Discord channel"
        hint={'"Notify players" posts the table invite, with its join link, here.'}
        connected={campaign.hasTableWebhook}
        roleId={campaign.tablePingRoleId}
        onSave={(changes, done) => apply(() => setCampaignDiscordWebhook(campaign.id, "Table", changes), done)}
      />
      <DiscordWebhookRow
        key={`poll-${campaign.pollPingRoleId ?? ""}`}
        title="Polls Discord channel"
        hint="New polls and announced results are posted here."
        connected={campaign.hasPollWebhook}
        roleId={campaign.pollPingRoleId}
        onSave={(changes, done) => apply(() => setCampaignDiscordWebhook(campaign.id, "Poll", changes), done)}
      />
    </AdminPanel>
  );
}

interface DiscordWebhookRowProps {
  title: string;
  hint: string;
  connected: boolean;
  roleId: string | null;
  onSave: (changes: { url?: string; roleId?: string }, done: string) => Promise<boolean>;
}

function DiscordWebhookRow({ title, hint, connected, roleId, onSave }: DiscordWebhookRowProps) {
  const [url, setUrl] = useState("");
  const [role, setRole] = useState(roleId ?? "");
  const urlChanged = url.trim() !== "";
  const roleChanged = role.trim() !== (roleId ?? "");

  const save = () =>
    onSave(
      { url: urlChanged ? url : undefined, roleId: roleChanged ? role : undefined },
      urlChanged ? `${title} connected` : "Ping role saved",
    ).then((saved) => saved && setUrl(""));

  return (
    <>
      <Group mt="md" gap="xs" align="center">
        <IconBrandDiscord size={16} color="var(--cyber-accent-3)" />
        <Text size="sm" fw={600}>{title}</Text>
        <Text size="xs" c="dimmed">{hint}</Text>
        {connected && <Badge size="sm" variant="light" color="neon">Connected</Badge>}
      </Group>
      <Group mt="xs" gap="xs" wrap="nowrap" align="flex-end">
        <GlassyTextInput
          aria-label={`${title} webhook URL`}
          placeholder={connected ? "Paste a new webhook URL to replace it" : "https://discord.com/api/webhooks/…"}
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <GlassyTextInput
          aria-label={`${title} role to ping`}
          placeholder="@role ID to ping (optional)"
          value={role}
          onChange={(e) => setRole(e.currentTarget.value)}
          w={220}
        />
        <button type="button" className="glass-btn-primary" disabled={!urlChanged && !roleChanged} onClick={save}>
          Save
        </button>
        {connected && (
          <button type="button" className="glass-btn-secondary" onClick={() => onSave({ url: "", roleId: "" }, `${title} disconnected`)}>
            Remove
          </button>
        )}
      </Group>
    </>
  );
}
