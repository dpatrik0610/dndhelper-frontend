import { useMemo, useState } from 'react';
import {
  Drawer,
  Stack,
  Text,
  UnstyledButton,
  ThemeIcon,
  useMantineTheme,
  Box,
  Collapse,
} from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconChevronDown, IconLogout } from '@tabler/icons-react';
import { useAuthStore } from '@store/useAuthStore';
import { handleLogout } from '@utils/handleLogout';
import { tabs, type Section, type TabItem } from './SidebarTabs';
import { useMediaQuery } from '@mantine/hooks';
import { ConnectionStatus } from '@components/ConnectionStatus';

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

  const [section] = useState<Section>('character');
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
      size= {isMobile? "100%" : "280px"}
      overlayProps={{
        color: theme.colors.dark[9],
        opacity: 0.5,
        blur: 4
      }}
      withCloseButton={false}
    >
      <Stack justify="space-between" style={{ height: '100%' }}>
        <Stack gap="xs">
          {/* Header */}
          <Stack gap={4} align="center">
            <ConnectionStatus />
            <Text fw={700} size="sm" c="gray.4" ta="center">
              {username.toUpperCase()}
            </Text>
          </Stack>

          {/* Links */}
          <Stack mt="md" gap={4}>
            {currentLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeLabel === item.label;

              return (
                <UnstyledButton
                  key={item.label}
                  onClick={() => handleNavigate(item.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    backgroundColor: isActive
                      ? theme.colors.violet[6]
                      : 'transparent',
                    color: isActive ? theme.white : theme.colors.gray[0],
                  }}
                >
                  <ThemeIcon
                    variant={isActive ? 'filled' : 'light'}
                    color={isActive ? 'violet' : 'gray'}
                  >
                    <Icon size={16} />
                  </ThemeIcon>
                  <Text size="sm">{item.label}</Text>
                </UnstyledButton>
              );
            })}
          </Stack>

          {/* Admin Section */}
          {isAdmin && (
            <Box mt="md">
              <UnstyledButton
                onClick={() => setAdminOpen((o) => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.sm,
                }}
              >
                <Text size="sm" fw={700} color="gray.4">
                  Admin
                </Text>
                <IconChevronDown
                  size={16}
                  style={{
                    transform: adminOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </UnstyledButton>

              <Collapse in={adminOpen}>
                <Stack gap={4}>
                  {adminLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeLabel === item.label;

                    return (
                      <UnstyledButton
                        key={item.label}
                        onClick={() => handleNavigate(item.link)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.sm,
                          padding: theme.spacing.xs,
                          borderRadius: theme.radius.sm,
                          backgroundColor: isActive
                            ? theme.colors.violet[6]
                            : 'transparent',
                          color: isActive ? theme.white : theme.colors.gray[0],
                        }}
                      >
                        <ThemeIcon
                          variant={isActive ? 'filled' : 'light'}
                          color={isActive ? 'violet' : 'gray'}
                        >
                          <Icon size={16} />
                        </ThemeIcon>
                        <Text size="sm">{item.label}</Text>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </Collapse>
            </Box>
          )}


        </Stack>
        {/* Logout Button */}
        <UnstyledButton
          onClick={() => handleLogout()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.colors.red[5],
          }}
        >
          <ThemeIcon variant="light" color="red">
            <IconLogout size={16} />
          </ThemeIcon>
          <Text size="sm">Logout</Text>
        </UnstyledButton>
      </Stack>
    </Drawer>
  );
}
