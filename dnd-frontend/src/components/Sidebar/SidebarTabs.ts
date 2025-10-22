import { IconSword, IconShield, IconMap, IconUsers, IconAdjustmentsAlt, IconDashboard } from '@tabler/icons-react'

export type Section = 'character' | 'campaign' | 'admin'

export interface TabItem {
  link: string
  label: string
  icon: any
}

export const tabs: Record<Section, TabItem[]> = {
  character: [
    { link: '/profile', label: 'Profile', icon: IconUsers },
    { link: '/inventory', label: 'Inventory', icon: IconSword },
  ],
  campaign: [
    { link: '/map', label: 'World Map', icon: IconMap },
    { link: '/quests', label: 'Quests', icon: IconMap },
    { link: '/members', label: 'Members', icon: IconUsers },
    { link: '/explorers', label: 'Explorers', icon: IconUsers },
  ],
  admin: [
    { link: '/dashboard', label: 'Dashboard', icon: IconDashboard },
    { link: '/questmanager', label: 'Quest Manager', icon: IconAdjustmentsAlt },
    { link: '/usermanager', label: 'User Manager', icon: IconUsers },
    { link: '/campaignmanager', label: 'Campaign Manager', icon: IconMap },
    { link: '/itemmanager', label: 'Item Manager', icon: IconSword },
    { link: '/equipmentmanager', label: 'Equipment Manager', icon: IconShield },
    { link: '/charactermanager', label: 'Character Manager', icon: IconUsers },
    { link: '/notifyuser', label: 'Notify User', icon: IconUsers },
  ],
}
