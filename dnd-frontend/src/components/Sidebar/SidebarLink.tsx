import { Link } from 'react-router-dom'
import './Sidebar.css'

interface SidebarLinkProps {
  item: any
  active: string
  setActive: (label: string) => void
}

export default function SidebarLink({ item, active, setActive }: SidebarLinkProps) {
  const Icon = item.icon
  return (
    <Link
      to={item.link}
      className={`sidebar-link ${item.label === active ? 'active' : ''}`}
      onClick={() => setActive(item.label)}
    >
      <Icon className="sidebar-link-icon" stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  )
}
