import { Link } from "react-router-dom";
import type { NavItemData } from "@features/navigation/Sidebar/navItems";
import classes from "./NavItem.module.css";

interface NavItemProps {
  item: NavItemData;
  active: boolean;
  onNavigate: () => void;
}

export function NavItem({ item, active, onNavigate }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link to={item.link} onClick={onNavigate} className={classes.item} aria-current={active ? "page" : undefined}>
      <Icon size={18} stroke={1.7} className={classes.icon} aria-hidden />
      <span className={classes.label}>{item.label}</span>
    </Link>
  );
}
