import { IconBook2, IconDashboard, IconDice5, IconHome, IconMessageChatbot, IconNotes, IconSparkles, IconSwords, IconUsers, IconBuildingStore } from "@tabler/icons-react";

export type Section = "home" | "admin" | "character" | "campaign";

export interface TabItem {
  link: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const tabs: Record<Section, TabItem[]> = {
  home: [
    { link: "/home", label: "Home", icon: IconHome },
  ],
  admin: [
    { link: "/dashboard", label: "Dashboard", icon: IconDashboard },
    { link: "/ai-assistant", label: "AI Assistant", icon: IconMessageChatbot },
  ],
  character: [
    { link: "/profile", label: "Profile", icon: IconUsers },
    { link: "/spells", label: "Spellbook", icon: IconSparkles },
    { link: "/notes", label: "Notes", icon: IconNotes },
    { link: "/roll-history", label: "Rolls", icon: IconDice5 },
  ],
  campaign: [
    { link: "/shop", label: "Shopkeeper", icon: IconBuildingStore },
    { link: "/encounter-room", label: "Encounter", icon: IconSwords },
    { link: "/rules", label: "Rules", icon: IconBook2 },
  ],
  //settings: [],
};

