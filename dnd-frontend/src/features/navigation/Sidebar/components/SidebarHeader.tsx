import { Stack, Text } from "@mantine/core";
import { ConnectionStatus } from "@components/ConnectionStatus";
import classes from "@features/navigation/Sidebar/Sidebar.module.css"
interface SidebarHeaderProps {
  username: string;
  roleLabel: string;
  initials: string;
}

export function SidebarHeader({ username, roleLabel, initials }: SidebarHeaderProps) {
  return (
    <div className={classes.headerCard}>
      <Stack gap={8} align="flex-start">
        <ConnectionStatus />
        <div className={classes.userBadge}>{initials || "?"}</div>
        <Text fw={700} size="sm" c="gray.1" style={{ letterSpacing: 0.6 }}>
          {username.toUpperCase()}
        </Text>
        <Text size="xs" c="gray.5">
          {roleLabel}
        </Text>
      </Stack>
    </div>
  );
}
