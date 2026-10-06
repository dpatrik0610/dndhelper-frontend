import { Button, Checkbox, Group, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { UserRole } from "@appTypes/User";
import { useAdminUserStore } from "@store/admin/adminUserStore";
import { PasswordField } from "./PasswordField";
import { generatePassword } from "@features/admin/UserManager/userUtils";

const blank = () => ({ username: "", email: "", password: generatePassword(), superAdmin: false });

export function CreateUserModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const createUser = useAdminUserStore((s) => s.createUser);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const valid = form.username.trim() && form.password.trim();

  const submit = async () => {
    setSaving(true);
    const ok = await createUser({
      username: form.username.trim(),
      email: form.email.trim() || undefined,
      password: form.password,
      roles: form.superAdmin ? [UserRole.User, UserRole.Admin] : [UserRole.User],
    });
    setSaving(false);
    if (ok) {
      setForm(blank());
      onClose();
    }
  };

  return (
    <AdminGlassModal opened={opened} onClose={onClose} title="New user" size="md" loading={saving}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) void submit();
        }}
      >
        <Stack gap="sm">
          <TextInput
            label="Username"
            required
            data-autofocus
            value={form.username}
            onChange={(e) => set({ username: e.currentTarget.value })}
          />
          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.currentTarget.value })}
          />
          <PasswordField label="Password" value={form.password} onChange={(password) => set({ password })} />
          <Checkbox
            label="Superadmin (full access to every campaign and this console)"
            checked={form.superAdmin}
            onChange={(e) => set({ superAdmin: e.currentTarget.checked })}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="neon" loading={saving} disabled={!valid}>
              Create user
            </Button>
          </Group>
        </Stack>
      </form>
    </AdminGlassModal>
  );
}
