import { IconDashboard, IconHome, IconNotes, IconSettings, IconSparkles, IconUsers } from "@tabler/icons-react";

export type Section = "character" | "admin" | "settings";

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
    { link: "/notes", label: "Notes", icon: IconNotes },
  ],
  admin: [{ link: "/dashboard", label: "Dashboard", icon: IconDashboard }],
  settings: [
    { link: "/settings", label: "Settings", icon: IconSettings },
  ],
};
