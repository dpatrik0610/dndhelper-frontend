import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  MultiSelect,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconEdit,
  IconRefresh,
  IconSearch,
  IconShieldExclamation,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { useAdminUserStore } from "../../../store/admin/useAdminUserStore";
import { UserRole, UserStatus } from "../../../types/User";

const statusColor: Record<UserStatus, string> = {
  [UserStatus.Active]: "green",
  [UserStatus.Inactive]: "yellow",
  [UserStatus.Banned]: "red",
  [UserStatus.LogicDeleted]: "gray",
};

export function UserManager() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    users,
    loading,
    search,
    setSearch,
    fetchUsers,
    updateStatus,
    removeUser,
    updateUser,
  } = useAdminUserStore();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [editStatus, setEditStatus] = useState<UserStatus>(UserStatus.Active);

  const [saving, setSaving] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

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

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Paper
          withBorder
          p="md"
          style={{
            background: "rgba(40, 0, 0, 0.35)",
            border: "1px solid rgba(255, 80, 80, 0.3)",
          }}
        >
          <Text size="sm" c="dimmed">
            Total users
          </Text>
          <Title order={3}>{totals.all}</Title>
        </Paper>

        <Paper
          withBorder
          p="md"
          style={{
            background: "rgba(20, 40, 20, 0.35)",
            border: "1px solid rgba(80, 200, 120, 0.3)",
          }}
        >
          <Text size="sm" c="dimmed">
            Active
          </Text>
          <Title order={3}>{totals.active}</Title>
        </Paper>

        <Paper
          withBorder
          p="md"
          style={{
            background: "rgba(60, 0, 0, 0.35)",
            border: "1px solid rgba(255, 100, 100, 0.3)",
          }}
        >
          <Text size="sm" c="dimmed">
            Banned
          </Text>
          <Title order={3}>{totals.banned}</Title>
        </Paper>
      </SimpleGrid>

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

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(15, 0, 0, 0.25)",
          border: "1px solid rgba(255, 60, 60, 0.35)",
        }}
      >
        <ScrollArea h={isMobile ? 400 : 520}>
          <Table verticalSpacing="md" highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Roles</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Joined</Table.Th>
                <Table.Th>Last Login</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredUsers.map((user, index) => (
                <Table.Tr
                  key={user.id}
                  bg={
                    index % 2 === 0
                      ? "rgba(255, 150, 0, 0.06)"
                      : "rgba(255, 60, 60, 0.06)"
                  }
                  style={{ transition: "background 120ms ease" }}
                >
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar radius="xl" src={user.profilePictureUrl} color="orange">
                        <IconUser size={16} />
                      </Avatar>
                      <Box>
                        <Text fw={600}>{user.username}</Text>
                        <Text size="xs" c="dimmed">
                          {user.id}
                        </Text>
                      </Box>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={user.email ? undefined : "dimmed"}>
                      {user.email ?? "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6}>
                      {user.roles?.map((role) => (
                        <Badge
                          key={role}
                          color={role === UserRole.Admin ? "violet" : "gray"}
                          variant="light"
                          size="sm"
                        >
                          {role}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColor[user.isActive]} variant="dot">
                      {user.isActive}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {user.dateCreated
                        ? new Date(user.dateCreated).toLocaleDateString()
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit user">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          onClick={() => setEditingUserId(user.id)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip
                        label={
                          user.isActive === UserStatus.Banned ? "Unban user" : "Ban user"
                        }
                      >
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color={user.isActive === UserStatus.Banned ? "green" : "red"}
                          loading={statusBusyId === user.id}
                          onClick={() => void handleStatusToggle(user.id, user.isActive)}
                        >
                          <IconShieldExclamation size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete user">
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="red"
                          loading={deleteBusyId === user.id}
                          onClick={() => void handleDelete(user.id)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}

              {!loading && filteredUsers.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text ta="center" c="dimmed">
                      No users found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Modal
        opened={!!editingUserId}
        onClose={() => setEditingUserId(null)}
        title="Edit user"
        centered
      >
        <Stack gap="sm">
          <TextInput
            label="Username"
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
          />
          <TextInput
            label="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.currentTarget.value)}
          />
          <MultiSelect
            label="Roles"
            data={Object.values(UserRole).map((r) => ({ value: r, label: r }))}
            value={editRoles}
            onChange={(values) => setEditRoles(values as UserRole[])}
          />
          <Select
            label="Status"
            data={Object.values(UserStatus).map((s) => ({ value: s, label: s }))}
            value={editStatus}
            onChange={(value) => setEditStatus((value as UserStatus) ?? UserStatus.Active)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setEditingUserId(null)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void handleSave()}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
