import { Tooltip } from "@mantine/core";
import type { IconProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent } from "react";
import styles from "@styles/AdminDashboard.module.css";

interface AdminNavItemProps {
  icon: ForwardRefExoticComponent<IconProps>;
  label: string;
  isSelected: boolean;
  collapsed: boolean;
  onClick: () => void;
}

export function AdminNavItem({
  icon: Icon,
  label,
  isSelected,
  collapsed,
  onClick,
}: AdminNavItemProps) {
  const item = (
    <div
      className={`${styles.navItem} ${isSelected ? styles.navItemSelected : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={styles.navItemIcon}>
        <Icon size={16} stroke={1.6} />
      </div>
      {!collapsed && <span className={styles.navItemLabel}>{label}</span>}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip label={label} position="right" withArrow>
        {item}
      </Tooltip>
    );
  }

  return item;
}
