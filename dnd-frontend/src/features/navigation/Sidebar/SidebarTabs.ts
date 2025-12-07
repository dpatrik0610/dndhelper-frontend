import { IconDashboard, IconHome, IconNotes, IconSparkles, IconUsers } from "@tabler/icons-react";

export type Section = "character" | "admin";

export interface TabItem {
  link: string;
  label: string;
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
};
