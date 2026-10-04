import { useEffect, useState, type FormEvent } from "react";
import { Avatar, Badge, Button, Group, PasswordInput, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconKey, IconUser } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useAuthStore } from "@store/auth/authStore";
import { changePassword, getSelf, type UserDataResponse } from "@services/userService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { SettingsSection } from "@features/settings/SettingsSection";

const accent = "var(--theme-color-accent-primary, #f59e0b)";

/** The backend sends DateTime.MinValue for "never". */
const formatDate = (value?: string) => (value && dayjs(value).year() > 1 ? dayjs(value).format("MMM D, YYYY") : "—");
const formatRole = (role: string) => role.replace(/([a-z])([A-Z])/g, "$1 $2");

function ProfileSection() {
  const username = useAuthStore((s) => s.username);
  const roles = useAuthStore((s) => s.roles);
  const [profile, setProfile] = useState<UserDataResponse | null>(null);

  useEffect(() => {
    getSelf().then(setProfile).catch((err) => console.warn("Could not load profile", err));
  }, []);

  const name = profile?.username ?? username ?? "Adventurer";

  return (
    <SettingsSection icon={<IconUser size={20} color={accent} />} title="Profile" description="Your account at a glance.">
      <Group gap="md" wrap="nowrap">
        <Avatar
          size={64}
          radius="md"
          style={{ background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))", color: "#121214", fontWeight: 800 }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        <Stack gap={6} style={{ minWidth: 0 }}>
          <Text fw={700} size="lg" truncate style={{ color: "var(--theme-color-text-primary, #fff)" }}>
            {name}
          </Text>
          <Group gap={6}>
            {(profile?.roles ?? roles).map((role) => (
              <Badge key={role} size="sm" variant="light" color={role === "Admin" ? "red" : "gray"}>
                {formatRole(role)}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Group>

      <SimpleGrid cols={2} spacing="md">
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>Member since</Text>
          <Text size="sm" fw={600}>{formatDate(profile?.dateCreated)}</Text>
        </Stack>
        <Stack gap={2}>
          <Text size="xs" c="dimmed" tt="uppercase" style={{ letterSpacing: 1 }}>Last login</Text>
          <Text size="sm" fw={600}>{formatDate(profile?.lastLogin)}</Text>
        </Stack>
      </SimpleGrid>
    </SettingsSection>
  );
}

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ current?: string; next?: string }>({});

  const mismatch = confirm.length > 0 && confirm !== next;
  const canSubmit = current && next && confirm && !mismatch;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setErrors({});
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      showNotification({ title: "Password changed", message: "Use your new password next time you sign in.", color: SectionColor.Green });
    } catch (err) {
      // Backend messages are developer-facing; map by status instead.
      const status = (err as { status?: number }).status;
      if (status === 401) setErrors({ current: "Current password is incorrect." });
      else if (status === 400) setErrors({ next: "New password must be different from your current one." });
      else showNotification({ title: "Could not change password", message: String(err), color: SectionColor.Red });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection icon={<IconKey size={20} color={accent} />} title="Password" description="Change the password you sign in with.">
      <form onSubmit={handleSubmit}>
        <Stack gap="sm" maw={420}>
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.currentTarget.value)}
            error={errors.current}
          />
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.currentTarget.value)}
            error={errors.next}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            error={mismatch ? "Passwords don't match." : undefined}
          />
          <Group justify="flex-end" mt="xs">
            <Button
              type="submit"
              loading={saving}
              disabled={!canSubmit}
              style={canSubmit ? { background: "var(--theme-gradient-primary)", color: "#121214", border: "none", fontWeight: 700 } : undefined}
            >
              Change password
            </Button>
          </Group>
        </Stack>
      </form>
    </SettingsSection>
  );
}

export function AccountSettings() {
  return (
    <Stack gap="xl">
      <ProfileSection />
      <PasswordSection />
    </Stack>
  );
}
