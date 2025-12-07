import { ActionIcon, Affix } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./SidebarToggle.module.css";

interface SidebarToggleProps {
  opened: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export function SidebarToggle({ opened, onToggle, isMobile }: SidebarToggleProps) {
  return (
    <Affix position={{ top: isMobile ? 14 : 12, right: isMobile ? 14 : 12 }} zIndex={1000}>
      <ActionIcon variant="filled" size="lg" onClick={onToggle} className={styles.button}>
        <IconChevronRight size={24} className={opened ? styles.iconOpen : styles.icon} />
      </ActionIcon>
    </Affix>
  );
}
