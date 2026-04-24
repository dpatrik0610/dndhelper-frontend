import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cloneAssistantConfig, defaultAssistantConfig } from "@features/aiAssistant/defaults";
import type { AssistantConfig } from "@features/aiAssistant/types";

interface AiAssistantConfigState {
  config: AssistantConfig;
  setConfig: (config: AssistantConfig) => void;
  resetConfig: () => void;
}

export const useAiAssistantConfigStore = create<AiAssistantConfigState>()(
  persist(
    (set) => ({
      config: cloneAssistantConfig(defaultAssistantConfig),
      setConfig: (config) => set({ config: cloneAssistantConfig(config) }),
      resetConfig: () => set({ config: cloneAssistantConfig(defaultAssistantConfig) }),
    }),
    {
      name: "ai-assistant-config",
      partialize: (state) => ({ config: state.config }),
    }
  )
);
