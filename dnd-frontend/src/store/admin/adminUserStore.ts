import { create } from "zustand";

import { UserService } from "@services/Admin/userService";
import type { AdminUser, AdminUserRequest } from "@appTypes/User";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

interface AdminUserStore {
  users: AdminUser[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (request: AdminUserRequest) => Promise<boolean>;
  /** Patches every listed user the same way; one summary notification. Resolves true if all succeeded. */
  updateUsers: (ids: string[], request: AdminUserRequest, done: string) => Promise<boolean>;
  removeUsers: (ids: string[]) => Promise<boolean>;
  clearStorage: () => void;
}

const fail = (title: string, err: unknown) =>
  showNotification({ title, message: (err as Error).message ?? String(err), color: SectionColor.Red });

/** Runs one request per id; reports the first failure and how many went through. */
async function runAll<T>(ids: string[], action: (id: string) => Promise<T>, failTitle: string) {
  const results = await Promise.allSettled(ids.map(action));
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  if (failed.length) fail(`${failTitle} (${failed.length} of ${ids.length})`, failed[0].reason);
  return results;
}

export const useAdminUserStore = create<AdminUserStore>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      set({ users: await UserService.getAll() });
    } catch (err) {
      fail("Failed to load users", err);
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (request) => {
    try {
      const created = await UserService.create(request);
      set((s) => ({ users: [...s.users, created].sort((a, b) => a.username.localeCompare(b.username)) }));
      showNotification({ title: "User created", message: created.username, color: SectionColor.Green });
      return true;
    } catch (err) {
      fail("Failed to create user", err);
      return false;
    }
  },

  updateUsers: async (ids, request, done) => {
    const results = await runAll(ids, (id) => UserService.update(id, request), "Not saved");
    // The response leaves out characters and campaigns (they don't change here); keep ours.
    const updated = new Map(
      results.flatMap((r) => (r.status === "fulfilled" ? [[r.value.id, r.value] as const] : []))
    );
    set((s) => ({
      users: s.users.map((u) => {
        const next = updated.get(u.id);
        return next ? { ...next, characters: u.characters, campaigns: u.campaigns } : u;
      }),
    }));
    if (updated.size) {
      const who = updated.size === 1 ? [...updated.values()][0].username : `${updated.size} users`;
      showNotification({ title: done, message: who, color: SectionColor.Green });
    }
    return updated.size === ids.length;
  },

  removeUsers: async (ids) => {
    const results = await runAll(ids, (id) => UserService.delete(id).then(() => id), "Not deleted");
    const removed = new Set(results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : [])));
    set((s) => ({ users: s.users.filter((u) => !removed.has(u.id)) }));
    if (removed.size) {
      showNotification({
        title: "Deleted",
        message: removed.size === 1 ? "1 user" : `${removed.size} users`,
        color: SectionColor.Green,
      });
    }
    return removed.size === ids.length;
  },

  clearStorage: () => set({ users: [], loading: false }),
}));
