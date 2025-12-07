import { ActionIcon, Stack, Text, Tooltip } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { ConnectionStatus } from "@components/ConnectionStatus";
import classes from "@features/navigation/Sidebar/Sidebar.module.css";

interface SidebarHeaderProps {
  username: string;
  roleLabel: string;
  initials: string;
  onLogout: () => void;
}

export function SidebarHeader({ username, roleLabel, initials, onLogout }: SidebarHeaderProps) {
  return (
    <div className={classes.headerCard}>
      <Stack gap={6} align="stretch">
        <div className={classes.headerTopRow}>
          <ConnectionStatus />
        </div>
        <div className={classes.userBadge}>{initials || "?"}</div>
        <div className={classes.headerInfoRow}>
          <div>
            <Text fw={700} size="sm" c="gray.1" style={{ letterSpacing: 0.6 }}>
              {username.toUpperCase()}
            </Text>
            <Text size="xs" c="gray.5">
              {roleLabel}
            </Text>
          </div>
          <Tooltip label="Logout">
            <ActionIcon variant="subtle" color="red" onClick={onLogout} aria-label="Logout">
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
        </div>
      </Stack>
    </div>
  );
}
