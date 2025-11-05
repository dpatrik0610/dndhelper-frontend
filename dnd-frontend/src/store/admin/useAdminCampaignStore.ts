// store/admin/useAdminCampaignStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Campaign } from "../../types/Campaign";
import { useAuthStore } from "../useAuthStore";
import { apiClient } from "../../api/apiClient";
import { showNotification } from "../../components/Notification/Notification";
import { SectionColor } from "../../types/SectionColor";

interface AdminCampaignStore {
  campaigns: Campaign[];
  selectedId: string | null;
  loading: boolean;

  reload: () => Promise<void>;
  select: (id: string | null) => void;
  reset: () => void;
  selectedCampaign: () => Campaign | null;
}

export const useAdminCampaignStore = create<AdminCampaignStore>()(
  persist(
    (set, get) => ({
      campaigns: [],
      selectedId: null,
      loading: false,

      reload: async () => {
        const token = useAuthStore.getState().token!;
        set({ loading: true });
        try {
          const data = await apiClient<Campaign[]>("/campaign", { method: "GET", token });
          set({ campaigns: data });
        } catch (err) {
          console.error(err);
          showNotification({
            title: "Error loading campaigns",
            message: String(err),
            color: SectionColor.Red,
          });
        } finally {
          set({ loading: false });
        }
      },

      select: (id) => set({ selectedId: id }),

      reset: () => set({ selectedId: null }),

      selectedCampaign: () => {
        const { campaigns, selectedId } = get();
        return campaigns.find((c) => c.id === selectedId) ?? null;
      },
    }),
    {
      name: "admin-campaign-store",
      partialize: (state) => ({
        campaigns: state.campaigns,
        selectedId: state.selectedId,
      }),
    }
  )
);
