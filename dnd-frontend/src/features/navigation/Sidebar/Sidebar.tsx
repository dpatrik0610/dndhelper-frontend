import { useMemo, useState } from "react";
import { Drawer, Stack, useMantineTheme } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@store/useAuthStore";
import { handleLogout } from "@utils/handleLogout";
import { tabs, type Section, type TabItem } from "./SidebarTabs";
import { useMediaQuery } from "@mantine/hooks";
import { SidebarHeader } from "./components/SidebarHeader";
import { NavSection } from "./components/NavSection";
import classes from "./Sidebar.module.css";
import { sidebarThemes, type SidebarThemeVariant } from "./sidebarThemes";

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
  position?: "left" | "right";
  themeVariant?: SidebarThemeVariant;
}

export default function Sidebar({ opened, onClose, position = "left", themeVariant = "midnight" }: SidebarProps) {
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
    const allTabs = [...tabs.character, ...tabs.admin, ...tabs.settings];
    const match = allTabs.find((item) => normalizedPath.startsWith(item.link));
    return match?.label ?? "";
  }, [location.pathname]);

  const handleNavigate = (link: string) => {
    navigate(link);
    onClose();
  };
  const themeTokens = sidebarThemes[themeVariant] ?? sidebarThemes.midnight;

  const currentLinks: TabItem[] = tabs[section];
  const adminLinks: TabItem[] = tabs["admin"];
  const settingsLinks: TabItem[] = tabs["settings"];

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
      styles={{
        content: {
          ["--sidebar-bg" as string]: themeTokens.background,
          ["--sidebar-header" as string]: themeTokens.header,
          ["--sidebar-panel" as string]: themeTokens.panel,
          ["--sidebar-border" as string]: themeTokens.border,
          ["--sidebar-border-strong" as string]: themeTokens.borderStrong,
          ["--sidebar-active" as string]: themeTokens.active,
          ["--sidebar-active-border" as string]: themeTokens.activeBorder,
        },
      }}
    >
      <Stack justify="space-between" className={classes.drawerInner}>
        <Stack gap="md">
          <SidebarHeader
            username={username}
            roleLabel={isAdmin ? "Administrator" : "Player"}
            initials={initials}
            onLogout={() => {
              handleLogout();
              onClose();
              navigate("/login");
            }}
          />

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

          <NavSection
            label="Settings (coming soon)"
            items={settingsLinks}
            activeLabel={activeLabel}
            onNavigate={handleNavigate}
          />
        </Stack>
      </Stack>
    </Drawer>
  );
}
