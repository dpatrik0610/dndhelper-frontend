import { UnstyledButton, ThemeIcon, Text } from "@mantine/core";
import type { TabItem } from "./SidebarTabs";
import classes from "./Sidebar.module.css";

interface NavLinkButtonProps {
  item: TabItem;
  active: boolean;
  onClick: () => void;
}

export function NavLinkButton({ item, active, onClick }: NavLinkButtonProps) {
  const Icon = item.icon;

  return (
    <UnstyledButton
      onClick={onClick}
      className={`${classes.navButton} ${active ? classes.navButtonActive : classes.navButtonInactive}`}
      data-active={active}
      p={6}
    >
      <ThemeIcon variant={active ? "filled" : "light"} color={active ? "violet" : "gray"} radius="md">
        <Icon size={16} />
      </ThemeIcon>
      <Text size="md" fw={600} style={{ letterSpacing: 0.5 }}>
        {item.label}
      </Text>
    </UnstyledButton>
  );
}
