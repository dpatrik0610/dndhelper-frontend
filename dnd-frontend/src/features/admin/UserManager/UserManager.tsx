import { ActionIcon, Button, Group, Loader, Select, SimpleGrid, Text, TextInput, Tooltip } from "@mantine/core";
import {
  IconBan,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { useAdminUserStore } from "@store/admin/adminUserStore";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { UserStatus, type AdminUser } from "@appTypes/User";
import { AdminPage, AdminPanel, AdminStat } from "@features/admin/components/AdminPage";
import { UsersTable, type Sort } from "./components/UsersTable";
import { UserDrawer } from "./components/UserDrawer";
import { CreateUserModal } from "./components/CreateUserModal";
import { DeleteUsersModal } from "./components/DeleteUsersModal";
import { ROLE_FILTERS, STATUS_META, isSuperAdmin, matchesRole, seenThisWeek, type RoleFilter } from "./userUtils";

const STATUS_FILTERS = [
  { value: "all", label: "Any status" },
  ...[UserStatus.Active, UserStatus.Inactive, UserStatus.Banned].map((s) => ({ value: s, label: STATUS_META[s].label })),
];

const sorters: Record<Sort["key"], (a: AdminUser, b: AdminUser) => number> = {
  username: (a, b) => a.username.localeCompare(b.username),
  lastLogin: (a, b) => Date.parse(a.lastLogin ?? "0") - Date.parse(b.lastLogin ?? "0"),
  dateCreated: (a, b) => Date.parse(a.dateCreated) - Date.parse(b.dateCreated),
  characters: (a, b) => a.characters.length - b.characters.length,
};

/** Superadmin only: every account on the site, with bulk status changes and a per-user drawer. */
export function UserManager() {
  const { users, loading, fetchUsers, updateUsers } = useAdminUserStore();
  const me = useCurrentUserId();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<Sort>({ key: "username", desc: false });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<AdminUser[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorter = sorters[sort.key];
    return users
      .filter(
        (u) =>
          (!q || u.username.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q)) &&
          (status === "all" || u.status === status) &&
          matchesRole(u, role)
      )
      .sort((a, b) => (sort.desc ? sorter(b, a) : sorter(a, b)));
  }, [users, search, status, role, sort]);

  const stats = useMemo(
    () => ({
      active: users.filter((u) => u.status === UserStatus.Active).length,
      blocked: users.filter((u) => u.status !== UserStatus.Active).length,
      superAdmins: users.filter(isSuperAdmin).length,
      seenThisWeek: users.filter(seenThisWeek).length,
    }),
    [users]
  );

  // Only rows still on screen count, so a filter change can't act on hidden users.
  const selectedUsers = visible.filter((u) => selected.has(u.id));
  const openUser = users.find((u) => u.id === openId) ?? null;
  const filtered = search.trim() !== "" || status !== "all" || role !== "all";

  const select = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const setStatusFor = async (targets: AdminUser[], next: UserStatus) => {
    setBulkBusy(true);
    await updateUsers(
      targets.map((u) => u.id),
      { status: next },
      `Now ${STATUS_META[next].label.toLowerCase()}`
    );
    setBulkBusy(false);
  };

  return (
    <AdminPage
      icon={IconUsers}
      title="Users"
      subtitle="Every account on the site. Only you can see this page."
      actions={
        <>
          <Tooltip label="Reload" withArrow>
            <ActionIcon variant="default" size="lg" onClick={() => void fetchUsers()} loading={loading} aria-label="Reload users">
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Button color="neon" leftSection={<IconUserPlus size={16} />} onClick={() => setCreating(true)}>
            New user
          </Button>
        </>
      }
    >
      <SimpleGrid cols={{ base: 2, md: 5 }} spacing="sm">
        <AdminStat label="Accounts" value={users.length} tone="tertiary" />
        <AdminStat label="Active" value={stats.active} tone="accent" />
        <AdminStat label="Deactivated / banned" value={stats.blocked} tone={stats.blocked ? "danger" : "default"} />
        <AdminStat label="Seen this week" value={stats.seenThisWeek} tone="warning" />
        <AdminStat label="Superadmins" value={stats.superAdmins} tone="secondary" />
      </SimpleGrid>

      <AdminPanel
        flush
        title={
          selectedUsers.length > 0 ? (
            <Group gap="xs">
              <Text size="sm" fw={600}>
                {selectedUsers.length} selected
              </Text>
              <Button size="compact-sm" variant="subtle" color="gray" leftSection={<IconX size={12} />} onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </Group>
          ) : (
            <Group gap="xs" wrap="wrap">
              <TextInput
                size="xs"
                w={240}
                placeholder="Search name or email"
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
              <Select size="xs" w={150} data={STATUS_FILTERS} value={status} onChange={(v) => setStatus(v ?? "all")} allowDeselect={false} />
              <Select
                size="xs"
                w={170}
                data={ROLE_FILTERS}
                value={role}
                onChange={(v) => setRole((v as RoleFilter) ?? "all")}
                allowDeselect={false}
              />
              {filtered && (
                <Button
                  size="compact-sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setRole("all");
                  }}
                >
                  Reset
                </Button>
              )}
            </Group>
          )
        }
        actions={
          selectedUsers.length > 0 ? (
            <>
              <Button size="xs" variant="default" leftSection={<IconPlayerPlay size={14} />} loading={bulkBusy} onClick={() => void setStatusFor(selectedUsers, UserStatus.Active)}>
                Activate
              </Button>
              <Button size="xs" variant="default" leftSection={<IconPlayerPause size={14} />} loading={bulkBusy} onClick={() => void setStatusFor(selectedUsers, UserStatus.Inactive)}>
                Deactivate
              </Button>
              <Button size="xs" variant="light" color="orange" leftSection={<IconBan size={14} />} loading={bulkBusy} onClick={() => void setStatusFor(selectedUsers, UserStatus.Banned)}>
                Ban
              </Button>
              <Button size="xs" variant="light" color="red" leftSection={<IconTrash size={14} />} onClick={() => setToDelete(selectedUsers)}>
                Delete
              </Button>
            </>
          ) : (
            <Text size="xs" c="dimmed">
              {filtered ? `${visible.length} of ${users.length}` : `${users.length} users`}
            </Text>
          )
        }
      >
        {loading && users.length === 0 ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : visible.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl" size="sm">
            {users.length ? "No user matches these filters." : "No users."}
          </Text>
        ) : (
          <UsersTable
            users={visible}
            me={me}
            selected={selected}
            onSelect={select}
            sort={sort}
            onSort={setSort}
            onOpen={(u) => setOpenId(u.id)}
            onStatus={(u, s) => void setStatusFor([u], s)}
            onDelete={(u) => setToDelete([u])}
          />
        )}
      </AdminPanel>

      <UserDrawer user={openUser} me={me} onClose={() => setOpenId(null)} onDelete={(u) => setToDelete([u])} />
      <CreateUserModal opened={creating} onClose={() => setCreating(false)} />
      <DeleteUsersModal
        users={toDelete}
        onClose={() => setToDelete([])}
        onDeleted={() => {
          setToDelete([]);
          setSelected(new Set());
          setOpenId(null);
        }}
      />
    </AdminPage>
  );
}
