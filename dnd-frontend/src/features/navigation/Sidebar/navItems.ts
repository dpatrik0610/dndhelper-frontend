import type { Icon } from "@tabler/icons-react";
import { IconBook2, IconDashboard, IconShieldLock, IconDice5, IconHome, IconNotes, IconSparkles, IconSwords, IconUsers, IconBuildingStore, IconCompass, IconChartBar } from "@tabler/icons-react";

export interface NavItemData {
  link: string;
  label: string;
  icon: Icon;
}

export interface NavSectionData {
  label?: string;
  items: NavItemData[];
  /** Only for the current campaign's DM (and the superadmin). */
  dmOnly?: boolean;
  /** Only for the superadmin. */
  superAdminOnly?: boolean;
}

/** Sidebar navigation, in display order. Settings lives in the footer. */
export const navSections: NavSectionData[] = [
  { items: [{ link: "/home", label: "Home", icon: IconHome }] },
  {
    label: "Character",
    items: [
      { link: "/profile", label: "Profile", icon: IconUsers },
      { link: "/spells", label: "Spellbook", icon: IconSparkles },
      { link: "/notes", label: "Notes", icon: IconNotes },
      { link: "/quests", label: "Quests", icon: IconCompass },
      { link: "/roll-history", label: "Rolls", icon: IconDice5 },
    ],
  },
  {
    label: "Campaign",
    items: [
      { link: "/shop", label: "Shopkeeper", icon: IconBuildingStore },
      { link: "/table", label: "Tabletop", icon: IconSwords },
      { link: "/polls", label: "Polls", icon: IconChartBar },
      { link: "/rules", label: "Rules", icon: IconBook2 },
    ],
  },
  {
    label: "Dungeon Master",
    dmOnly: true,
    items: [{ link: "/dashboard", label: "Dashboard", icon: IconDashboard }],
  },
  {
    label: "Superadmin",
    superAdminOnly: true,
    items: [{ link: "/admin", label: "Site Admin", icon: IconShieldLock }],
  },
];
