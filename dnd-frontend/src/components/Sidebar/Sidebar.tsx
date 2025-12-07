import { useMemo, useState } from "react";
import { Drawer, Stack, Text, UnstyledButton, ThemeIcon, useMantineTheme, Box, Collapse } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { IconChevronDown, IconLogout } from "@tabler/icons-react";
import { useAuthStore } from "@store/useAuthStore";
import { handleLogout } from "@utils/handleLogout";
import { tabs, type Section, type TabItem } from "./SidebarTabs";
import { useMediaQuery } from "@mantine/hooks";
import { ConnectionStatus } from "@components/ConnectionStatus";
import { NavLinkButton } from "./NavLinkButton";
import classes from "./Sidebar.module.css";

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
}

export default function Sidebar({ opened, onClose }: SidebarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const username = useAuthStore().username ?? 'NOT LOGGED IN';
  const roles = useAuthStore().roles || [];
  const isAdmin = roles.includes('Admin');

  const [section] = useState<Section>("character");
  const [adminOpen, setAdminOpen] = useState(true);

  const activeLabel = useMemo(() => {
    const normalizedPath = location.pathname === '/' ? '/home' : location.pathname;
    const allTabs = [...tabs.character, ...tabs.admin];
    const match = allTabs.find((item) => normalizedPath.startsWith(item.link));
    return match?.label ?? '';
  }, [location.pathname]);

  const handleNavigate = (link: string) => {
    navigate(link);
    onClose();
  };

  const currentLinks: TabItem[] = tabs[section];
  const adminLinks: TabItem[] = tabs['admin'];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      padding="md"
      size={isMobile ? "100%" : "280px"}
      overlayProps={{
        color: theme.colors.dark[9],
        opacity: 0.5,
        blur: 4,
      }}
      withCloseButton={false}
    >
      <Stack justify="space-between" className={classes.drawerContent}>
        <Stack gap="xs">
          <Stack gap={4} align="center">
            <ConnectionStatus />
            <Text fw={700} size="sm" c="gray.4" ta="center">
              {username.toUpperCase()}
            </Text>
          </Stack>

          <Stack mt="md" gap={4}>
            {currentLinks.map((item) => (
              <NavLinkButton
                key={item.label}
                item={item}
                active={activeLabel === item.label}
                onClick={() => handleNavigate(item.link)}
              />
            ))}
          </Stack>

          {isAdmin && (
            <Box mt="md">
              <UnstyledButton className={classes.adminToggle} onClick={() => setAdminOpen((o) => !o)}>
                <Text size="sm" fw={700} color="gray.4">
                  Admin
                </Text>
                <IconChevronDown
                  size={16}
                  style={{
                    transform: adminOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </UnstyledButton>

              <Collapse in={adminOpen}>
                <Stack gap={4}>
                  {adminLinks.map((item) => (
                    <NavLinkButton
                      key={item.label}
                      item={item}
                      active={activeLabel === item.label}
                      onClick={() => handleNavigate(item.link)}
                    />
                  ))}
                </Stack>
              </Collapse>
            </Box>
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
