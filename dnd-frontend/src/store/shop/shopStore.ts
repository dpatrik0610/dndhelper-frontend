import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Shop, SellRequest, BuyRequest } from "@appTypes/Shop/Shop";
import * as shopService from "@services/shopService";

interface ShopState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  selectedShopId: string | null;

  loadShops: (campaignId: string) => Promise<void>;
  buyItem: (shopId: string, request: BuyRequest) => Promise<boolean>;
  submitSellRequest: (request: SellRequest) => Promise<void>;
  selectShop: (id: string | null) => void;
  syncShopUpdated: (updatedShop: Shop) => void;
  syncShopDeleted: (shopId: string) => void;
}

export const useShopStore = create<ShopState>()(
  devtools(
    immer((set) => ({
      shops: [],
      loading: false,
      error: null,
      selectedShopId: null,

      loadShops: async (campaignId) => {
        set({ loading: true, error: null });
        try {
          const shops = await shopService.getShopsForCampaign(campaignId);
          set({ shops });
        } catch (error: any) {
          set({ error: error.message || "Failed to load shops" });
        } finally {
          set({ loading: false });
        }
      },

      buyItem: async (shopId, request) => {
        set({ loading: true, error: null });
        try {
          const result = await shopService.buyItem(shopId, request);
          return result.success;
        } catch (error: any) {
          set({ error: error.message || "Failed to buy item" });
          return false;
        } finally {
          set({ loading: false });
        }
      },

      submitSellRequest: async (request) => {
        set({ loading: true, error: null });
        try {
          await shopService.submitSellRequest(request);
        } catch (error: any) {
          set({ error: error.message || "Failed to submit sell request" });
          throw error;
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
            state.shops = state.shops.filter(s => s.id !== shopId);
            if (state.selectedShopId === shopId) {
                state.selectedShopId = null;
            }
        });
     }

    }))
  )
);
