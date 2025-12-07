import { ActionIcon, Affix } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import styles from "./SidebarToggle.module.css";

interface SidebarToggleProps {
  opened: boolean;
  onToggle: () => void;
  isMobile: boolean;
  affixPosition?: { top?: number; bottom?: number; left?: number; right?: number };
}

export function SidebarToggle({ opened, onToggle, isMobile, affixPosition }: SidebarToggleProps) {
  const position = affixPosition ?? { top: isMobile ? 14 : 12, right: isMobile ? 14 : 12 };

  return (
    <Affix position={position} zIndex={1000}>
      <ActionIcon variant="light" size="lg" onClick={onToggle} className={styles.button}>
        <IconChevronRight size={24} className={opened ? styles.iconOpen : styles.icon} />
      </ActionIcon>
    </Affix>
  );
}
