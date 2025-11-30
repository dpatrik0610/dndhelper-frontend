import { create } from "zustand";
import { useAuthStore } from "../useAuthStore";
import { UserService } from "../../services/Admin/userService";
import type { User } from "../../types/User";
import { showNotification } from "../../components/Notification/Notification";
import { SectionColor } from "../../types/SectionColor";

interface AdminUserStore {
  users: User[];
  loading: boolean;
  search: string;
  setSearch: (value: string) => void;
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  updateStatus: (id: string, status: User["isActive"]) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
}

export const useAdminUserStore = create<AdminUserStore>((set, get) => ({
  users: [],
  loading: false,
  search: "",

  setSearch: (value) => set({ search: value }),

  fetchUsers: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      showNotification({
        title: "Not authenticated",
        message: "Please log in to load users.",
        color: SectionColor.Red,
      });
      return;
    }

    set({ loading: true });

    try {
      const data = await UserService.getAll(token);
      set({ users: data });
    } catch (err) {
      showNotification({
        title: "Failed to load users",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id, updates) => {
    const token = useAuthStore.getState().token;
    const user = get().users.find((u) => u.id === id);
    if (!token || !user) return;

    try {
      const body: User = { ...user, ...updates };
      const updated = await UserService.update(id, body, token);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
      showNotification({
        title: "User updated",
        message: `${updated.username} saved.`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Failed to update user",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  },

  updateStatus: async (id, status) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const updated = await UserService.updateStatus(id, status, token);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
      }));
      showNotification({
        title: "Status updated",
        message: `${updated.username} is now ${updated.isActive}.`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Failed to update status",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  },

  removeUser: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      await UserService.delete(id, token);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      showNotification({
        title: "User removed",
        message: "User deleted successfully.",
        color: SectionColor.Red,
      });
    } catch (err) {
      showNotification({
        title: "Failed to delete user",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  },
}));
