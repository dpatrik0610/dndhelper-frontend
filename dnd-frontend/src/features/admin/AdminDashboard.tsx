import {
  ActionIcon,
  Box,
  Button,
  Group,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconUsers,
  IconSettings,
  IconCategory,
  IconBox,
  type IconProps,
  IconCamera,
  IconGhost,
  IconLayoutGrid,
  IconRefresh,
  IconUsersGroup,
  IconCloudDownload,
  IconBook2,
  IconChevronLeft,
  IconChevronRight,
  IconBuildingStore,
  IconCompass,
  IconWorld,
} from "@tabler/icons-react";
import { DashboardCard } from "./components/DashboardCard";
import { AdminNavItem } from "./components/AdminNavItem";
import { useAdminDashboardStore, type AdminSection } from "@store/ui/adminDashboardStore";
import { InventoryDashboard } from "./InventoryDashboard/InventoryDashboard";
import { useEffect, useState, type JSX, type ForwardRefExoticComponent } from "react";
import { SelectCampaignModal } from "./components/SelectCampaignModal";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { useIsSuperAdmin } from "@store/auth/authSelectors";
import { CampaignManager } from "./CampaignManager/CampaignManager";
import { CacheManager } from "./CacheManager/CacheManager";
import { UserManager } from "./UserManager/UserManager";
import { MonsterManager } from "./MonsterManager/MonsterManager";
import { ItemManager } from "./ItemManager/ItemManager";
import { SessionManager } from "./SessionManager/SessionManager";
import { BackupManager } from "./BackupManager/BackupManager";
import { RuleManager } from "./RuleManager/RuleManager";
import { ShopManager } from "./ShopManager/ShopManager";
import { QuestManager } from "./QuestManager/QuestManager";
import { AllCampaigns } from "./AllCampaigns/AllCampaigns";
import styles from "@styles/AdminDashboard.module.css";

type NavItem = {
  icon: ForwardRefExoticComponent<IconProps>;
  label: string;
  key: AdminSection;
  component: JSX.Element;
  /** Site-wide tools, not campaign tools: superadmin only. */
  superAdminOnly?: boolean;
};

export const AdminDashboard: React.FC = () => {
  const { activeSection, setActiveSection } = useAdminDashboardStore();
  const { selectedId: selectedCampaignId } = useCampaignStore();
  const [campaignModal, setCampaignModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isSuperAdmin = useIsSuperAdmin();

  useEffect(() => {
    if (!selectedCampaignId) setCampaignModal(true);
  }, [selectedCampaignId]);

  const allNavItems: NavItem[] = [
    { icon: IconBox, label: "Inventories", key: "InventoryDashboard", component: <InventoryDashboard /> },
    { icon: IconSettings, label: "Campaigns", key: "CampaignManager", component: <CampaignManager /> },
    { icon: IconCamera, label: "Cache", key: "CacheManager", component: <CacheManager />, superAdminOnly: true },
    { icon: IconUsers, label: "Users", key: "UserManager", component: <UserManager />, superAdminOnly: true },
    { icon: IconGhost, label: "Monsters", key: "MonsterManager", component: <MonsterManager /> },
    { icon: IconCategory, label: "Items", key: "ItemManager", component: <ItemManager /> },
    { icon: IconBuildingStore, label: "Shop Manager", key: "ShopManager", component: <ShopManager /> },
    { icon: IconUsersGroup, label: "Sessions", key: "SessionManager", component: <SessionManager /> },
    { icon: IconCloudDownload, label: "Backups", key: "BackupManager", component: <BackupManager />, superAdminOnly: true },
    { icon: IconWorld, label: "All Campaigns", key: "AllCampaigns", component: <AllCampaigns />, superAdminOnly: true },
    { icon: IconBook2, label: "Rules", key: "RuleManager", component: <RuleManager /> },
    { icon: IconCompass, label: "Quests", key: "QuestManager", component: <QuestManager /> },
  ];
  const navItems = allNavItems.filter((item) => isSuperAdmin || !item.superAdminOnly);

  const currentItem = navItems.find((n) => n.key === activeSection);
  const isDashboard = activeSection === "Dashboard";

  return (
    <>
      <Box className={styles.shell}>
        {!selectedCampaignId ? null : (
          <>
            <aside
              className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}
            >
              <div className={styles.sidebarHeader}>
                {sidebarCollapsed ? (
                  <Stack gap={6} align="center">
                    <Tooltip label="Expand sidebar" position="left" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={() => setSidebarCollapsed(false)}
                        aria-label="Expand sidebar"
                      >
                        <IconChevronLeft size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Switch campaign" position="left" withArrow>
                      <ActionIcon
                        variant="light"
                        color="indigo"
                        size="sm"
                        onClick={() => setCampaignModal(true)}
                        aria-label="Switch campaign"
                      >
                        <IconRefresh size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Stack>
                ) : (
                  <Stack gap="xs">
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Group gap="xs" wrap="nowrap">
                        <ThemeIcon variant="light" color="indigo" size="md" radius="sm">
                          <IconLayoutGrid size={16} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" c="white">
                          Dungeon Master
                        </Text>
                      </Group>
                      <Tooltip label="Collapse sidebar" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => setSidebarCollapsed(true)}
                          aria-label="Collapse sidebar"
                        >
                          <IconChevronRight size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <Button
                      variant="light"
                      color="indigo"
                      size="compact-xs"
                      leftSection={<IconRefresh size={12} />}
                      onClick={() => setCampaignModal(true)}
                      fullWidth
                    >
                      Switch campaign
                    </Button>
                  </Stack>
                )}
              </div>

              <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
                <Stack gap={2}>
                  <AdminNavItem
                    icon={IconLayoutGrid}
                    label="Overview"
                    isSelected={isDashboard}
                    collapsed={sidebarCollapsed}
                    onClick={() => setActiveSection("Dashboard")}
                  />
                  {navItems.map((item) => (
                    <AdminNavItem
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      isSelected={activeSection === item.key}
                      collapsed={sidebarCollapsed}
                      onClick={() => setActiveSection(item.key)}
                    />
                  ))}
                </Stack>
              </ScrollArea>
            </aside>

            <main className={styles.main}>
              <div className={styles.mainInner}>
                {isDashboard ? (
                  <div className={styles.dashboardGrid}>
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                      {navItems.map((item) => (
                        <DashboardCard
                          key={item.key}
                          icon={<item.icon size={40} />}
                          title={item.label}
                          onClick={() => setActiveSection(item.key)}
                        />
                      ))}
                    </SimpleGrid>
                  </div>
                ) : (
                  currentItem?.component
                )}
              </div>
            </main>
          </>
        )}
      </Box>

      <SelectCampaignModal opened={campaignModal} onClose={() => setCampaignModal(false)} />
    </>
  );
};
