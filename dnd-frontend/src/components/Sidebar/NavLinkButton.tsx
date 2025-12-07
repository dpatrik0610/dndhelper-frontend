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
    >
      <ThemeIcon variant={active ? "filled" : "light"} color={active ? "violet" : "gray"}>
        <Icon size={16} />
      </ThemeIcon>
      <Text size="sm">{item.label}</Text>
    </UnstyledButton>
  );
}
