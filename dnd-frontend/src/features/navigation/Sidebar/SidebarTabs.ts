import { IconBook2, IconDashboard, IconHome, IconHistory, IconMessageChatbot, IconNotes, IconSparkles, IconUsers } from "@tabler/icons-react";

export type Section = "character" | "admin";

export interface TabItem {
  link: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export const tabs: Record<Section, TabItem[]> = {
  character: [
    { link: "/home", label: "Home", icon: IconHome },
    { link: "/profile", label: "Profile", icon: IconUsers },
    { link: "/spells", label: "Spellbook", icon: IconSparkles },
    { link: "/rules", label: "Rules", icon: IconBook2 },
    { link: "/notes", label: "Notes", icon: IconNotes },
    { link: "/roll-history", label: "Roll History", icon: IconHistory },
  ],
  admin: [
    { link: "/dashboard", label: "Dashboard", icon: IconDashboard },
    { link: "/ai-assistant", label: "AI Assistant", icon: IconMessageChatbot },
  ],
  //settings: [],
};
