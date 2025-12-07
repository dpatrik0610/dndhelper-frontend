import { ActionIcon } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./SidebarToggle.module.css";

interface SidebarToggleProps {
  opened: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function SidebarToggle({ opened, onToggle, isMobile }: SidebarToggleProps) {
  return (
    <ActionIcon
      variant="filled"
      size="lg"
      onClick={onToggle}
      className={styles.button}
      data-mobile={isMobile}
    >
      <IconChevronRight
        size={24}
        className={opened ? styles.iconOpen : styles.icon}
      />
    </ActionIcon>
  );
}
