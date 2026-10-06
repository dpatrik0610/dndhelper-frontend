import { Tooltip } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import styles from "@styles/AdminDashboard.module.css";

interface AdminNavItemProps {
  icon: Icon;
  label: string;
  isSelected: boolean;
  collapsed: boolean;
  onClick: () => void;
}

export function AdminNavItem({ icon: Icon, label, isSelected, collapsed, onClick }: AdminNavItemProps) {
  return (
    <Tooltip label={label} position="left" withArrow disabled={!collapsed}>
      <button
        type="button"
        className={`${styles.navItem} ${isSelected ? styles.navItemSelected : ""}`}
        aria-current={isSelected ? "page" : undefined}
        aria-label={collapsed ? label : undefined}
        onClick={onClick}
      >
        <Icon size={18} stroke={1.6} />
        {!collapsed && <span className={styles.navItemLabel}>{label}</span>}
      </button>
    </Tooltip>
  );
}
