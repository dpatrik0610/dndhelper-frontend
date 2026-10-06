import { ActionIcon, Avatar, Badge, Checkbox, Group, Menu, Table, Text, Tooltip, UnstyledButton } from "@mantine/core";
import {
  IconBan,
  IconChevronDown,
  IconChevronUp,
  IconDots,
  IconPlayerPause,
  IconPlayerPlay,
  IconSelector,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react";
import { UserStatus, type AdminUser } from "@appTypes/User";
import { timeAgo } from "@utils/timeAgo";
import { STATUS_META, dmCampaigns, isSuperAdmin } from "@features/admin/UserManager/userUtils";

export type SortKey = "username" | "lastLogin" | "dateCreated" | "characters";
export type Sort = { key: SortKey; desc: boolean };

function SortHeader({ label, sortKey, sort, onSort }: { label: string; sortKey: SortKey; sort: Sort; onSort: (s: Sort) => void }) {
  const active = sort.key === sortKey;
  const SortIcon = !active ? IconSelector : sort.desc ? IconChevronDown : IconChevronUp;
  return (
    <Table.Th>
      <UnstyledButton
        onClick={() => onSort({ key: sortKey, desc: active ? !sort.desc : sortKey !== "username" })}
        aria-sort={active ? (sort.desc ? "descending" : "ascending") : undefined}
      >
        <Group gap={4} wrap="nowrap" c={active ? "gray.2" : undefined}>
          {label}
          <SortIcon size={13} />
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

export function UsersTable({
  users,
  me,
  selected,
  onSelect,
  sort,
  onSort,
  onOpen,
  onStatus,
  onDelete,
}: {
  users: AdminUser[];
  me: string | null;
  selected: Set<string>;
  onSelect: (ids: string[], on: boolean) => void;
  sort: Sort;
  onSort: (s: Sort) => void;
  onOpen: (u: AdminUser) => void;
  onStatus: (u: AdminUser, status: UserStatus) => void;
  onDelete: (u: AdminUser) => void;
}) {
  // You can't ban or delete yourself, so you're never in a bulk selection either.
  const selectable = users.filter((u) => u.id !== me).map((u) => u.id);
  const allSelected = selectable.length > 0 && selectable.every((id) => selected.has(id));
  const someSelected = selectable.some((id) => selected.has(id));

  return (
    <Table.ScrollContainer minWidth={860}>
      <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={40}>
              <Checkbox
                size="xs"
                aria-label="Select all"
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={() => onSelect(selectable, !allSelected)}
              />
            </Table.Th>
            <SortHeader label="User" sortKey="username" sort={sort} onSort={onSort} />
            <Table.Th>Access</Table.Th>
            <Table.Th>Status</Table.Th>
            <SortHeader label="Characters" sortKey="characters" sort={sort} onSort={onSort} />
            <Table.Th>Campaigns</Table.Th>
            <SortHeader label="Last seen" sortKey="lastLogin" sort={sort} onSort={onSort} />
            <SortHeader label="Joined" sortKey="dateCreated" sort={sort} onSort={onSort} />
            <Table.Th w={48} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => {
            const isMe = u.id === me;
            const status = STATUS_META[u.status];
            const dmCount = dmCampaigns(u).length;
            return (
              <Table.Tr
                key={u.id}
                bg={selected.has(u.id) ? "rgba(0, 255, 136,0.08)" : undefined}
                style={{ cursor: "pointer" }}
                onClick={() => onOpen(u)}
              >
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    size="xs"
                    aria-label={`Select ${u.username}`}
                    disabled={isMe}
                    checked={selected.has(u.id)}
                    onChange={(e) => onSelect([u.id], e.currentTarget.checked)}
                  />
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar size={32} radius="xl" color="neon" name={u.username} />
                    <div style={{ minWidth: 0 }}>
                      <Group gap={6} wrap="nowrap">
                        <Text size="sm" fw={600} truncate>
                          {u.username}
                        </Text>
                        {isMe && (
                          <Badge size="xs" variant="outline" color="gray">
                            you
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed" truncate>
                        {u.email || "No email"}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {isSuperAdmin(u) && (
                      <Badge size="sm" variant="light" color="magenta">
                        Superadmin
                      </Badge>
                    )}
                    {dmCount > 0 && (
                      <Badge size="sm" variant="light" color="neon">
                        DM ×{dmCount}
                      </Badge>
                    )}
                    {!isSuperAdmin(u) && dmCount === 0 && (
                      <Text size="sm" c="dimmed">
                        {u.campaigns.length ? "Player" : "—"}
                      </Text>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="dot" color={status.color}>
                    {status.label}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{u.characters.length}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" truncate maw={180}>
                    {u.campaigns.map((c) => c.name).join(", ") || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {u.lastLogin ? (
                    <Tooltip label={new Date(u.lastLogin).toLocaleString()} withArrow>
                      <Text size="sm">{timeAgo(u.lastLogin)}</Text>
                    </Tooltip>
                  ) : (
                    <Text size="sm" c="dimmed">
                      Never
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {new Date(u.dateCreated).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td onClick={(e) => e.stopPropagation()}>
                  <Menu position="bottom-end" withinPortal shadow="md">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" aria-label={`Actions for ${u.username}`}>
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconUserCircle size={14} />} onClick={() => onOpen(u)}>
                        Open details
                      </Menu.Item>
                      {!isMe && (
                        <>
                          <Menu.Divider />
                          {u.status !== UserStatus.Active && (
                            <Menu.Item leftSection={<IconPlayerPlay size={14} />} onClick={() => onStatus(u, UserStatus.Active)}>
                              Activate
                            </Menu.Item>
                          )}
                          {u.status === UserStatus.Active && (
                            <Menu.Item
                              leftSection={<IconPlayerPause size={14} />}
                              onClick={() => onStatus(u, UserStatus.Inactive)}
                            >
                              Deactivate
                            </Menu.Item>
                          )}
                          {u.status !== UserStatus.Banned && (
                            <Menu.Item
                              color="orange"
                              leftSection={<IconBan size={14} />}
                              onClick={() => onStatus(u, UserStatus.Banned)}
                            >
                              Ban
                            </Menu.Item>
                          )}
                          <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete(u)}>
                            Delete…
                          </Menu.Item>
                        </>
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
