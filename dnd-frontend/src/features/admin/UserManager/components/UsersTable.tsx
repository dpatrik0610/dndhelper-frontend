import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Group,
  Paper,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconShieldExclamation, IconTrash, IconUser } from "@tabler/icons-react";
import { UserRole, UserStatus } from "@appTypes/User";

const statusColor: Record<UserStatus, string> = {
  [UserStatus.Active]: "green",
  [UserStatus.Inactive]: "yellow",
  [UserStatus.Banned]: "red",
  [UserStatus.LogicDeleted]: "gray",
};

interface UsersTableProps {
  users: Array<{
    id: string;
    username: string;
    email?: string;
    roles: UserRole[];
    isActive: UserStatus;
    dateCreated?: string;
    lastLogin?: string;
    profilePictureUrl?: string;
  }>;
  loading: boolean;
  statusBusyId: string | null;
  deleteBusyId: string | null;
  isMobile: boolean;
  onEdit: (id: string) => void;
  onToggleStatus: (id: string, status: UserStatus) => void;
  onDelete: (id: string, name: string) => void;
}

export function UsersTable({
  users,
  loading,
  statusBusyId,
  deleteBusyId,
  isMobile,
  onEdit,
  onToggleStatus,
  onDelete,
}: UsersTableProps) {
  return (
    <Paper
      withBorder
      p="md"
      style={{
        background: "rgba(15, 0, 0, 0.25)",
        border: "1px solid rgba(255, 60, 60, 0.35)",
        backdropFilter: "blur(10px)",
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
            {users.map((user, index) => (
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
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Edit user">
                      <ActionIcon
                        size="sm"
                        variant="light"
                        onClick={() => onEdit(user.id)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip
                      label={user.isActive === UserStatus.Banned ? "Unban user" : "Ban user"}
                    >
                      <ActionIcon
                        size="sm"
                        variant="light"
                        color={user.isActive === UserStatus.Banned ? "green" : "red"}
                        loading={statusBusyId === user.id}
                        onClick={() => onToggleStatus(user.id, user.isActive)}
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
                        onClick={() => onDelete(user.id, user.username ?? "this user")}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}

            {!loading && users.length === 0 && (
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
  );
}

