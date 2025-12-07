import { useMemo, useState } from "react";
import { Drawer, Stack, Text, UnstyledButton, ThemeIcon, useMantineTheme } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { IconLogout } from "@tabler/icons-react";
import { useAuthStore } from "@store/useAuthStore";
import { handleLogout } from "@utils/handleLogout";
import { tabs, type Section, type TabItem } from "./SidebarTabs";
import { useMediaQuery } from "@mantine/hooks";
import { SidebarHeader } from "./components/SidebarHeader";
import { NavSection } from "./components/NavSection";
import classes from "./Sidebar.module.css";

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
  position?: "left" | "right";
}

export default function Sidebar({ opened, onClose, position = "left" }: SidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const username = useAuthStore().username ?? "NOT LOGGED IN";
  const roles = useAuthStore().roles || [];
  const isAdmin = roles.includes("Admin");

  const [section] = useState<Section>("character");
  const [adminOpen, setAdminOpen] = useState(true);

  const activeLabel = useMemo(() => {
    const normalizedPath = location.pathname === "/" ? "/home" : location.pathname;
    const allTabs = [...tabs.character, ...tabs.admin];
    const match = allTabs.find((item) => normalizedPath.startsWith(item.link));
    return match?.label ?? "";
  }, [location.pathname]);

  const handleNavigate = (link: string) => {
    navigate(link);
    onClose();
  };

  const currentLinks: TabItem[] = tabs[section];
  const adminLinks: TabItem[] = tabs["admin"];

  const initials = username
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={position}
      padding="md"
      size={isMobile ? "100%" : "280px"}
      overlayProps={{
        color: theme.colors.dark[9],
        opacity: 0.5,
        blur: 4,
      }}
      withCloseButton={false}
      classNames={{ content: classes.drawerContent }}
    >
      <Stack justify="space-between" className={classes.drawerInner}>
        <Stack gap="md">
          <SidebarHeader username={username} roleLabel={isAdmin ? "Administrator" : ""} initials={initials} />

          <NavSection
            label="Character"
            items={currentLinks}
            activeLabel={activeLabel}
            onNavigate={handleNavigate}
          />

          {isAdmin && (
            <NavSection
              label="Admin"
              items={adminLinks}
              activeLabel={activeLabel}
              onNavigate={handleNavigate}
              open={adminOpen}
              onToggle={() => setAdminOpen((o) => !o)}
            />
          )}
        </Stack>

        <UnstyledButton onClick={() => handleLogout()} className={classes.logoutButton}>
          <ThemeIcon variant="light" color="red">
            <IconLogout size={16} />
          </ThemeIcon>
          <Text size="sm">Logout</Text>
        </UnstyledButton>
      </Stack>
    </Drawer>
  );
}
