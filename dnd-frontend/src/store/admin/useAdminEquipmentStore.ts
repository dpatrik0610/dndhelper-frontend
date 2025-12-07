import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByIndex,
  searchEquipmentByName,
  createEquipment,
  updateEquipmentById,
  deleteEquipment,
} from "@services/equipmentService";
import { useAuthStore } from "@store/useAuthStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

interface AdminEquipmentStore {
  equipments: Equipment[];
  selected: Equipment | null;
  loading: boolean;

  loadAll: () => Promise<void>;
  getById: (id: string) => Promise<Equipment | null>;
  getByIndex: (index: string) => Promise<Equipment | null>;
  searchByName: (name: string) => Promise<void>;

  select: (id: string | null) => void;

  create: (equipment: Equipment) => Promise<void>;
  update: (equipment: Equipment) => Promise<void>;
  remove: (id: string) => Promise<void>;

  refresh: () => Promise<void>;
  clearStorage: () => void;
}

export const useAdminEquipmentStore = create<AdminEquipmentStore>()(
  persist(
    (set, get) => {
      const getToken = () => useAuthStore.getState().token!;

      return {
        equipments: [],
        selected: null,
        loading: false,

        loadAll: async () => {
          set({ loading: true });
          try {
            const data = await getAllEquipment(getToken());
            set({ equipments: data, selected: data[0] ?? null });
          } catch (err) {
            showNotification({
              title: "Error loading equipment list",
              message: String(err),
              color: SectionColor.Red,
            });
          } finally {
            set({ loading: false });
          }
        },

        getById: async (id) => {
          try {
            const eq = await getEquipmentById(id, getToken());
            set({ selected: eq });
            return eq;
          } catch (err) {
            showNotification({
              title: "Error loading equipment",
              message: String(err),
              color: SectionColor.Red,
            });
            return null;
          }
        },

        getByIndex: async (index) => {
          try {
            const eq = await getEquipmentByIndex(index, getToken());
            set({ selected: eq });
            return eq;
          } catch (err) {
            showNotification({
              title: "Error loading equipment by index",
              message: String(err),
              color: SectionColor.Red,
            });
            return null;
          }
        },

        searchByName: async (name) => {
          set({ loading: true });
          try {
            const results = await searchEquipmentByName(name, getToken());
            set({ equipments: results });
          } catch (err) {
            showNotification({
              title: "Search failed",
              message: String(err),
              color: SectionColor.Red,
            });
          } finally {
            set({ loading: false });
          }
        },

        select: (id) => {
          const { equipments } = get();
          set({ selected: equipments.find((e) => e.id === id) ?? null });
        },

        create: async (equipment) => {
          try {
            const created = await createEquipment(equipment, getToken());
            set((s) => ({
              equipments: [...s.equipments, created],
              selected: created,
            }));
            showNotification({
              title: "Equipment created",
              message: `${created.name} added successfully.`,
              color: SectionColor.Green,
            });
          } catch (err) {
            showNotification({
              title: "Error creating equipment",
              message: String(err),
              color: SectionColor.Red,
            });
          }
        },

        update: async (equipment) => {
          try {
            const updated = await updateEquipmentById(equipment.id!, equipment, getToken());
            set((s) => ({
              equipments: s.equipments.map((e) => (e.id === updated.id ? updated : e)),
              selected: updated,
            }));
            showNotification({
              title: "Equipment updated",
              message: `${updated.name} saved successfully.`,
              color: SectionColor.Green,
            });
          } catch (err) {
            showNotification({
              title: "Error updating equipment",
              message: String(err),
              color: SectionColor.Red,
            });
          }
        },

        remove: async (id) => {
          try {
            await deleteEquipment(id, getToken());
            set((s) => {
              const updated = s.equipments.filter((e) => e.id !== id);
              const newSelected =
                s.selected?.id === id ? updated[0] ?? null : s.selected;
              return { equipments: updated, selected: newSelected };
            });
            showNotification({
              title: "Equipment deleted",
              message: "Item removed successfully.",
              color: SectionColor.Red,
            });
          } catch (err) {
            showNotification({
              title: "Error deleting equipment",
              message: String(err),
              color: SectionColor.Red,
            });
          }
        },

        refresh: async () => {
          const sel = get().selected;
          if (sel?.id) await get().getById(sel.id);
          else await get().loadAll();
        },

        clearStorage: () => set({ equipments: [], selected: null, loading: false }),
      };
    },
    {
      name: "admin-equipment-storage",
      partialize: (state) => ({
        equipments: state.equipments,
        selected: state.selected,
      }),
    }
  )
);
