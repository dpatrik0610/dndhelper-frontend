import { IconMap, IconUsers, IconDashboard, IconHome, IconSparkles } from '@tabler/icons-react'

export type Section = 
'character' 
// | 'campaign' 
| 'admin'

export interface TabItem {
  link: string
  label: string
  icon: any
}

export const tabs: Record<Section, TabItem[]> = {
  character: [
    { link: '/home', label: 'Home', icon: IconHome },
    { link: '/profile', label: 'Profile', icon: IconUsers },
    { link: '/spells', label: 'Spellbook', icon: IconSparkles },
  ],
  // campaign: [
  //   { link: '/map', label: 'World Map', icon: IconMap },
  //   { link: '/quests', label: 'Quests', icon: IconMap },
  //   { link: '/members', label: 'Members', icon: IconUsers },
  // ],
  admin: [
    { link: '/dashboard', label: 'Dashboard', icon: IconDashboard }
  ],
}
