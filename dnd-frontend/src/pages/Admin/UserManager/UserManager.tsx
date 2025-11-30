import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconRefresh,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useAdminUserStore } from "../../../store/admin/useAdminUserStore";
import { UserRole, UserStatus } from "../../../types/User";
import { AddUserModal } from "./components/AddUserModal";
import { EditUserModal } from "./components/EditUserModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { UsersTable } from "./components/UsersTable";
import { StatsGrid } from "./components/StatsGrid";
import "../../../styles/glassyInput.css";

export function UserManager() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    users,
    loading,
    search,
    setSearch,
    fetchUsers,
    createUser,
    updateStatus,
    removeUser,
    updateUser,
    resetPassword,
  } = useAdminUserStore();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [editStatus, setEditStatus] = useState<UserStatus>(UserStatus.Active);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUserOpen, setNewUserOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRoles, setNewRoles] = useState<UserRole[]>([UserRole.User]);
  const [newStatus, setNewStatus] = useState<UserStatus>(UserStatus.Active);
  const [newPassword, setNewPassword] = useState("");
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>("");

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!editingUserId) return;
    const user = users.find((u) => u.id === editingUserId);
    if (!user) return;
    setEditName(user.username ?? "");
    setEditEmail(user.email ?? "");
    setEditRoles(user.roles ?? []);
    setEditStatus(user.isActive ?? UserStatus.Active);
  }, [editingUserId, users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const username = (u.username ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return username.includes(q) || email.includes(q);
    });
  }, [users, search]);

  const totals = useMemo(() => {
    const all = users.length;
    const active = users.filter((u) => u.isActive === UserStatus.Active).length;
    const banned = users.filter((u) => u.isActive === UserStatus.Banned).length;
    return { all, active, banned };
  }, [users]);

  const handleStatusToggle = async (userId: string, current: UserStatus) => {
    const next = current === UserStatus.Banned ? UserStatus.Active : UserStatus.Banned;
    setStatusBusyId(userId);
    await updateStatus(userId, next);
    setStatusBusyId(null);
  };

  const handleDelete = async (userId: string) => {
    setDeleteBusyId(userId);
    await removeUser(userId);
    setDeleteBusyId(null);
    setConfirmDeleteId(null);
  };

  const handleSave = async () => {
    if (!editingUserId) return;
    setSaving(true);
    await updateUser(editingUserId, {
      username: editName,
      email: editEmail,
      roles: editRoles,
      isActive: editStatus,
    });
    setSaving(false);
    setEditingUserId(null);
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!editName.trim() || !newPassword.trim()) return;
    setResetting(true);
    await resetPassword(editName.trim(), newPassword.trim());
    setResetting(false);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newPassword.trim()) return;
    setCreating(true);
    await createUser({
      username: newName.trim(),
      email: newEmail.trim() || undefined,
      roles: newRoles,
      isActive: newStatus,
      password: newPassword.trim(),
    });
    setCreating(false);
    setNewUserOpen(false);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRoles([UserRole.User]);
    setNewStatus(UserStatus.Active);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Title order={2} c="red.2">
            User Manager
          </Title>
          <Text c="dimmed" size="sm">
            Overview of all users
          </Text>
        </div>

        <Group gap="xs">
          <Button
            variant="light"
            leftSection={<IconUser size={14} />}
            onClick={() => setNewUserOpen(true)}
          >
            Add user
          </Button>
          <Tooltip label="Reload users">
            <ActionIcon
              size="lg"
              variant="filled"
              color="red"
              onClick={() => void fetchUsers()}
              loading={loading}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <StatsGrid total={totals.all} active={totals.active} banned={totals.banned} />

      <TextInput
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        placeholder="Search by username or email"
        leftSection={<IconSearch size={14} />}
        radius="md"
        variant="filled"
        size={isMobile ? "sm" : "md"}
        styles={{
          input: {
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          },
        }}
      />

      <UsersTable
        users={filteredUsers}
        loading={loading}
        statusBusyId={statusBusyId}
        deleteBusyId={deleteBusyId}
        isMobile={isMobile}
        onEdit={(id) => setEditingUserId(id)}
        onToggleStatus={(id, status) => void handleStatusToggle(id, status)}
        onDelete={(id, name) => {
          setConfirmDeleteId(id);
          setConfirmDeleteName(name);
        }}
      />

      <DeleteConfirmModal
        opened={!!confirmDeleteId}
        username={confirmDeleteName}
        loading={deleteBusyId === confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && void handleDelete(confirmDeleteId)}
      />

      <AddUserModal
        opened={newUserOpen}
        onClose={() => setNewUserOpen(false)}
        onSubmit={() => void handleCreate()}
        creating={creating}
        newName={newName}
        setNewName={setNewName}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        newRoles={newRoles}
        setNewRoles={setNewRoles}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
      />

      <EditUserModal
        opened={!!editingUserId}
        onClose={() => setEditingUserId(null)}
        onSave={() => void handleSave()}
        saving={saving}
        resetting={resetting}
        onResetPassword={(pwd) => void handleResetPassword(pwd)}
        editName={editName}
        setEditName={setEditName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editRoles={editRoles}
        setEditRoles={setEditRoles}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
      />
    </Stack>
  );
}
