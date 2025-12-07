import { Box, Collapse, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import type { TabItem } from "@features/navigation/Sidebar/SidebarTabs";
import { NavLinkButton } from "@features/navigation/Sidebar/NavLinkButton";
import classes from "@features/navigation/Sidebar/Sidebar.module.css";

interface NavSectionProps {
  label: string;
  items: TabItem[];
  activeLabel: string;
  onNavigate: (link: string) => void;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

export function NavSection({ label, items, activeLabel, onNavigate, collapsible, open = true, onToggle, disabled }: NavSectionProps) {
  const sectionBody = (
    <Stack gap={10} className={classes.navGroup}>
      {items.map((item) => (
        <NavLinkButton
          key={item.label}
          item={item}
          active={activeLabel === item.label}
          onClick={() => onNavigate(item.link)}
          disabled={disabled}
        />
      ))}
    </Stack>
  );

  if (!collapsible) {
    return (
      <Box>
        <Text className={classes.sectionLabel}>{label}</Text>
        {sectionBody}
      </Box>
    );
  }

  return (
    <Box>
      <UnstyledButton className={classes.adminToggle} onClick={onToggle}>
        <Text size="sm" fw={700} color="gray.4">
          {label}
        </Text>
        <IconChevronDown
          size={16}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </UnstyledButton>
      <Collapse in={open}>{sectionBody}</Collapse>
    </Box>
  );
}
