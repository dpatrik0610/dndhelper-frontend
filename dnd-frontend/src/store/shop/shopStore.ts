import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Shop, SellRequest, BuyRequest } from "@appTypes/Shop/Shop";
import * as shopService from "@services/shopService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

interface ShopState {
  shops: Shop[];
  loading: boolean;
  error: string | null;
  selectedShopId: string | null;
  myRequests: SellRequest[];

  loadMyRequests: (characterId: string) => Promise<void>;
  respondToCounterOffer: (id: string, accept: boolean) => Promise<boolean>;
  syncMyRequest: (request: SellRequest) => void;
  loadShops: (campaignId: string) => Promise<void>;
  buyItem: (shopId: string, request: BuyRequest) => Promise<boolean>;
  submitSellRequest: (request: SellRequest) => Promise<void>;
  selectShop: (id: string | null) => void;
  syncShopUpdated: (updatedShop: Shop) => void;
  syncShopDeleted: (shopId: string) => void;
}

export const useShopStore = create<ShopState>()(
  devtools(
    immer((set, get) => ({
      shops: [],
      loading: false,
      error: null,
      selectedShopId: null,
      myRequests: [],

      loadMyRequests: async (characterId) => {
        try {
          set({ myRequests: await shopService.getCharacterSellRequests(characterId) });
        } catch (error) {
          console.error("Failed to load your shop requests", error);
        }
      },

      respondToCounterOffer: async (id, accept) => {
        try {
          get().syncMyRequest(await shopService.respondToCounterOffer(id, accept));
          return true;
        } catch (error) {
          showNotification({ title: "Could Not Respond", message: error instanceof Error ? error.message : "Failed to respond to the counter-offer", color: SectionColor.Red });
          return false;
        }
      },

      syncMyRequest: (request) => {
        set((state) => {
          const index = state.myRequests.findIndex((r) => r.id === request.id);
          if (index !== -1) {
            state.myRequests[index] = request;
          } else {
            state.myRequests.push(request);
          }
        });
      },

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
