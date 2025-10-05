import { IconSword, IconShield, IconMap, IconUsers, IconAdjustmentsAlt } from '@tabler/icons-react'

export type Section = 'character' | 'world' | 'admin'

export interface TabItem {
  link: string
  label: string
  icon: any
}

export const tabs: Record<Section, TabItem[]> = {
  character: [
    { link: '/profile', label: 'Profile', icon: IconUsers },
    { link: '/members', label: 'Members', icon: IconUsers },
    { link: '/quests', label: 'Quests', icon: IconMap },
    { link: '/inventory', label: 'Inventory', icon: IconSword },
    { link: '/equipment', label: 'Equipment', icon: IconShield },
  ],
  world: [
    { link: '/map', label: 'World Map', icon: IconMap },
    { link: '/explorers', label: 'Explorers', icon: IconUsers },
  ],
  admin: [
    { link: '/admin', label: 'Admin Panel', icon: IconAdjustmentsAlt },
  ],
}
