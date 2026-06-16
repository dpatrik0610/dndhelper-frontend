import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Shop, SellRequest } from "@appTypes/Shop/Shop";
import * as shopService from "@services/shopService";
import { showNotification } from "@components/Notification/Notification";

interface AdminShopState {
  shops: Shop[];
  sellRequests: SellRequest[];
  loading: boolean;
  error: string | null;
  selectedShopId: string | null;

  loadShops: (campaignId: string) => Promise<void>;
  loadSellRequests: (campaignId: string) => Promise<void>;
  createShop: (shop: Shop) => Promise<void>;
  updateShop: (id: string, shop: Shop) => Promise<void>;
  toggleShopOpen: (id: string, isOpen: boolean) => Promise<void>;
  deleteShop: (id: string) => Promise<void>;
  approveSellRequest: (id: string) => Promise<void>;
  rejectSellRequest: (id: string) => Promise<void>;
  selectShop: (id: string | null) => void;
  syncShopUpdated: (updatedShop: Shop) => void;
  syncShopDeleted: (shopId: string) => void;
  syncSellRequestUpdated: (updatedRequest: SellRequest) => void;
}

export const useAdminShopStore = create<AdminShopState>()(
  devtools(
    immer((set) => ({
      shops: [],
      sellRequests: [],
      loading: false,
      error: null,
      selectedShopId: null,

      loadShops: async (campaignId) => {
        set({ loading: true, error: null });
        try {
          const shops = await shopService.getShopsForCampaign(campaignId);
          set({ shops });
        } catch (error: any) {
          const errMsg = error.message || "Failed to load shops";
          set({ error: errMsg });
          showNotification({
            title: "Error Loading Shops",
            message: errMsg,
            color: "red"
          });
        } finally {
          set({ loading: false });
        }
      },

      loadSellRequests: async (campaignId) => {
        set({ loading: true, error: null });
        try {
          const sellRequests = await shopService.getCampaignSellRequests(campaignId);
          set({ sellRequests });
        } catch (error: any) {
          const errMsg = error.message || "Failed to load sell requests";
          set({ error: errMsg });
          showNotification({
            title: "Error Loading Sell Requests",
            message: errMsg,
            color: "red"
          });
        } finally {
          set({ loading: false });
        }
      },

      createShop: async (shop) => {
        set({ loading: true, error: null });
        try {
          const newShop = await shopService.createShop(shop);
          set((state) => {
            state.shops.push(newShop);
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to create shop" });
        } finally {
          set({ loading: false });
        }
      },

      updateShop: async (id, shop) => {
        set({ loading: true, error: null });
        try {
          const updatedShop = await shopService.updateShop(id, shop);
          set((state) => {
            const index = state.shops.findIndex((s) => s.id === id);
            if (index !== -1) {
              state.shops[index] = updatedShop;
            }
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to update shop" });
        } finally {
          set({ loading: false });
        }
      },

      toggleShopOpen: async (id, isOpen) => {
        set({ loading: true, error: null });
        try {
          const updatedShop = await shopService.toggleShopOpen(id, isOpen);
          set((state) => {
            const index = state.shops.findIndex((s) => s.id === id);
            if (index !== -1) {
              state.shops[index] = updatedShop;
            }
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to toggle shop open status" });
        } finally {
          set({ loading: false });
        }
      },

      deleteShop: async (id) => {
        set({ loading: true, error: null });
        try {
          await shopService.deleteShop(id);
          set((state) => {
            state.shops = state.shops.filter((s) => s.id !== id);
            if (state.selectedShopId === id) {
              state.selectedShopId = null;
            }
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to delete shop" });
        } finally {
          set({ loading: false });
        }
      },

      approveSellRequest: async (id) => {
        set({ loading: true, error: null });
        try {
          const updatedRequest = await shopService.approveSellRequest(id);
          set((state) => {
            const index = state.sellRequests.findIndex((r) => r.id === id);
            if (index !== -1) {
              state.sellRequests[index] = updatedRequest;
            }
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to approve sell request" });
        } finally {
          set({ loading: false });
        }
      },

      rejectSellRequest: async (id) => {
        set({ loading: true, error: null });
        try {
          const updatedRequest = await shopService.rejectSellRequest(id);
          set((state) => {
            const index = state.sellRequests.findIndex((r) => r.id === id);
            if (index !== -1) {
              state.sellRequests[index] = updatedRequest;
            }
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to reject sell request" });
        } finally {
          set({ loading: false });
        }
      },

      selectShop: (id) => {
        set({ selectedShopId: id });
      },

      syncShopUpdated: (updatedShop: Shop) => {
         set((state) => {
            const index = state.shops.findIndex((s) => s.id === updatedShop.id);
            if (index !== -1) {
                state.shops[index] = updatedShop;
            } else {
                state.shops.push(updatedShop);
            }
        });
      },

      syncShopDeleted: (shopId: string) => {
        set((state) => {
          state.shops = state.shops.filter((s) => s.id !== shopId);
          if (state.selectedShopId === shopId) {
            state.selectedShopId = null;
          }
        });
      },

      syncSellRequestUpdated: (updatedRequest: SellRequest) => {
        set((state) => {
             const index = state.sellRequests.findIndex((r) => r.id === updatedRequest.id);
            if (index !== -1) {
                state.sellRequests[index] = updatedRequest;
            } else {
                state.sellRequests.push(updatedRequest);
            }
        });
      }

    }))
  )
);
