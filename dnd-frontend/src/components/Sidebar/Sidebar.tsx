import { useState } from 'react'
import { Text, SegmentedControl } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { IconLogout } from '@tabler/icons-react'
import { useAuthStore } from '../../store/useAuthStore'
import SidebarLink from './SidebarLink'
import { tabs, type Section } from './SidebarTabs'
import './Sidebar.css'

export default function Sidebar() {
  const [section, setSection] = useState<Section>('character')
  const [active, setActive] = useState('Members')
  const clearAuth = useAuthStore((state) => state.clearToken)
  const username = useAuthStore().username
  const roles = useAuthStore().roles || [] // assuming your token parsing sets this
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    localStorage.removeItem('authToken')
    localStorage.removeItem('username')
    navigate('/login')
  }

  // Build links dynamically
  const sectionTabs: Section[] = ['character', 'world']
  if (roles.includes('admin')) sectionTabs.push('admin')

  const links = tabs[section].map((item) => (
    <SidebarLink key={item.label} item={item} active={active} setActive={setActive} />
  ))

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Text fw={650} size="sm" c="dimmed" mb="xs" ta="center">
          {username?.toUpperCase() ?? 'NOT LOGGED IN'}
        </Text>

        <SegmentedControl
          value={section}
          onChange={(value) => setSection(value as Section)}
          transitionTimingFunction="ease"
          fullWidth
          data={sectionTabs.map((s) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
        />
      </div>

      <div className="sidebar-main">{links}</div>

      <div className="sidebar-footer">
        <button className="sidebar-button" onClick={handleLogout}>
          <IconLogout className="sidebar-link-icon" stroke={1.5} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  )
}
