import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  CopyButton,
  Divider,
  Drawer,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy, IconTrash } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";
import { UserStatus, type AdminUser, type AdminUserRequest } from "@appTypes/User";
import { useAdminUserStore } from "@store/admin/adminUserStore";
import { timeAgo } from "@utils/timeAgo";
import { PasswordField } from "./PasswordField";
import { STATUS_META, isSuperAdmin, withSuperAdmin } from "@features/admin/UserManager/userUtils";

const STATUS_OPTIONS = [UserStatus.Active, UserStatus.Inactive, UserStatus.Banned].map((s) => ({
  value: s,
  label: STATUS_META[s].label,
}));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap="xs">
      <Text size="xs" tt="uppercase" c="electric" style={{ fontFamily: "var(--cyber-font-label)", letterSpacing: "0.2em" }}>
        // {title}
      </Text>
      {children}
    </Stack>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="sm">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {children}
    </Group>
  );
}

/** Everything about one user, editable in place. Keyed by user id, so the form starts fresh per user. */
function UserDetails({ user, isMe, onDelete }: { user: AdminUser; isMe: boolean; onDelete: () => void }) {
  const updateUsers = useAdminUserStore((s) => s.updateUsers);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const save = async (key: string, request: AdminUserRequest, done: string) => {
    setBusy(key);
    const ok = await updateUsers([user.id], request, done);
    setBusy(null);
    return ok;
  };

  const profileChanged = username.trim() !== user.username || email.trim() !== (user.email ?? "");
  const campaignName = (id?: string | null) =>
    id ? (user.campaigns.find((c) => c.id === id)?.name ?? "Another campaign") : "No campaign";

  return (
    <Stack gap="lg">
      <Group gap={6}>
        <Badge variant="dot" color={STATUS_META[user.status].color}>
          {STATUS_META[user.status].label}
        </Badge>
        {isSuperAdmin(user) && (
          <Badge variant="light" color="magenta">
            Superadmin
          </Badge>
        )}
        {isMe && (
          <Badge variant="outline" color="gray">
            you
          </Badge>
        )}
      </Group>

      <Section title="Profile">
        <TextInput label="Username" value={username} onChange={(e) => setUsername(e.currentTarget.value)} />
        <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <Group justify="flex-end">
          <Button
            size="xs"
            color="neon"
            disabled={!profileChanged || !username.trim()}
            loading={busy === "profile"}
            onClick={() => void save("profile", { username: username.trim(), email: email.trim() }, "Profile saved")}
          >
            Save profile
          </Button>
        </Group>
      </Section>

      <Divider />

      <Section title="Access">
        <SegmentedControl
          fullWidth
          size="xs"
          data={STATUS_OPTIONS}
          value={user.status}
          disabled={isMe || busy === "status"}
          onChange={(status) => void save("status", { status: status as UserStatus }, "Status changed")}
        />
        <Switch
          label="Superadmin"
          description="Full access to every campaign and to this console."
          checked={isSuperAdmin(user)}
          disabled={isMe || busy === "role"}
          onChange={(e) =>
            void save("role", { roles: withSuperAdmin(user, e.currentTarget.checked) }, "Access changed")
          }
        />
        {isMe ? (
          <Text size="xs" c="dimmed">
            You can't change your own access.
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            Takes effect at their next sign-in; a session already open runs until it expires (24 hours).
          </Text>
        )}
      </Section>

      <Divider />

      <Section title="Reset password">
        <PasswordField value={password} onChange={setPassword} placeholder="New password" />
        <Group justify="flex-end">
          <Button
            size="xs"
            variant="light"
            color="neon"
            disabled={!password.trim()}
            loading={busy === "password"}
            onClick={async () => {
              if (await save("password", { password }, "Password reset")) setPassword("");
            }}
          >
            Set password
          </Button>
        </Group>
      </Section>

      <Divider />

      <Section title={`Characters (${user.characters.length})`}>
        {user.characters.length === 0 ? (
          <Text size="sm" c="dimmed">
            None yet.
          </Text>
        ) : (
          user.characters.map((c) => (
            <Row key={c.id} label={c.name || "Unnamed"}>
              <Text size="sm" ta="right">
                {c.characterClass} {c.level != null && `· Lv ${c.level}`}
                <Text span size="xs" c="dimmed">
                  {" "}
                  · {campaignName(c.campaignId)}
                </Text>
              </Text>
            </Row>
          ))
        )}
      </Section>

      <Section title={`Campaigns (${user.campaigns.length})`}>
        {user.campaigns.length === 0 ? (
          <Text size="sm" c="dimmed">
            Not in any campaign.
          </Text>
        ) : (
          user.campaigns.map((c) => (
            <Row key={c.id} label={c.name}>
              <Group gap={4}>
                {c.roles.map((r) => (
                  <Badge key={r} size="sm" variant="light" color={r === "DM" ? "neon" : "gray"}>
                    {r}
                  </Badge>
                ))}
              </Group>
            </Row>
          ))
        )}
      </Section>

      <Divider />

      <Section title="Account">
        <Row label="Joined">
          <Text size="sm">{new Date(user.dateCreated).toLocaleString()}</Text>
        </Row>
        <Row label="Last seen">
          <Text size="sm">{user.lastLogin ? timeAgo(user.lastLogin) : "Never"}</Text>
        </Row>
        <Row label="ID">
          <Group gap={4} wrap="nowrap">
            <Text size="xs" ff="monospace" c="dimmed">
              {user.id}
            </Text>
            <CopyButton value={user.id}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied" : "Copy ID"} withArrow>
                  <ActionIcon size="sm" variant="subtle" color={copied ? "neon" : "gray"} onClick={copy} aria-label="Copy ID">
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Row>
      </Section>

      {!isMe && (
        <Button variant="light" color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
          Delete account…
        </Button>
      )}
    </Stack>
  );
}

export function UserDrawer({
  user,
  me,
  onClose,
  onDelete,
}: {
  user: AdminUser | null;
  me: string | null;
  onClose: () => void;
  onDelete: (u: AdminUser) => void;
}) {
  return (
    <Drawer
      opened={!!user}
      onClose={onClose}
      position="right"
      size="md"
      // Inline, so the global .glass-paper tint on every Paper (Drawer content included) can't make it see-through.
      styles={{
        content: { background: "var(--cyber-card)", borderLeft: "2px solid var(--cyber-accent)", boxShadow: "var(--cyber-glow)" },
        header: { background: "var(--cyber-card)", borderBottom: "1px solid var(--cyber-border)" },
      }}
      title={
        user && (
          <Group gap="sm" wrap="nowrap">
            <Avatar radius="xl" color="neon" name={user.username} />
            <div>
              <Text fw={600}>{user.username}</Text>
              <Text size="xs" c="dimmed">
                {user.email || "No email"}
              </Text>
            </div>
          </Group>
        )
      }
    >
      {user && <UserDetails key={user.id} user={user} isMe={user.id === me} onDelete={() => onDelete(user)} />}
    </Drawer>
  );
}
