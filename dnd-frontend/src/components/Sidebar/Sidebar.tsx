import { useEffect, useState } from 'react'
import { Text, SegmentedControl } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { IconHome, IconLogout } from '@tabler/icons-react'
import { useAuthStore } from '../../store/useAuthStore'
import SidebarLink from './SidebarLink'
import { tabs, type Section } from './SidebarTabs'
import './Sidebar.css'
import { handleLogout } from '../../utils/handleLogout'
import { useMediaQuery } from '@mantine/hooks'
export default function Sidebar() {
  const [section, setSection] = useState<Section>('character')
  const [active, setActive] = useState('Home')
  const username = useAuthStore().username
  const roles = useAuthStore().roles || []
  const navigate = useNavigate()
  const isAdmin = roles.includes('Admin');
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Build links dynamically
  const sectionTabs: Section[] = ['character', 'campaign']
  if (isAdmin) sectionTabs.push("admin");

  const links = tabs[section].map((item) => (
    <SidebarLink key={item.label} item={item} active={active} setActive={setActive} />
  ))

  useEffect(() => {
    setActive(tabs[section][0]?.label ?? '')
  }, [section])

  return (
    <nav className="sidebar" style={{width: isMobile? "100%": "250px"}}>
      <div className="sidebar-header">
        <Text fw={650} size="sm" c="dimmed" mb="xs" ta="center">
          {username?.toUpperCase() ?? 'NOT LOGGED IN'}
        </Text>

        <button className="sidebar-button home-button" onClick={() => {
          navigate('/')
          setActive('Home')
        }}>
            <IconHome className='sidebar-link-icon'/><span>Home</span>
        </button>

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
        <button className="sidebar-button logout-button" onClick={() => handleLogout(navigate)}>
          <IconLogout className="sidebar-link-icon" stroke={1.5} />
          <Text ta={'center'}>Logout</Text>
        </button>
      </div>
    </nav>
  )
}
