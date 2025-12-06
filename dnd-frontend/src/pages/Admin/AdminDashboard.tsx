import { Box, Button, Group, Paper, ScrollArea, SimpleGrid, Stack, Text, ThemeIcon, Transition } from "@mantine/core";
import {
  IconUsers,
  IconSettings,
  IconCategory,
  IconBox,
  type IconProps,
  IconWand,
  IconCamera,
  IconGhost,
  IconLayoutGrid,
  IconRefresh,
  IconUsersGroup,
  IconCloudDownload,
} from "@tabler/icons-react";
import { DashboardCard } from "./components/DashboardCard";
import { useAdminDashboardStore, type AdminSection } from "../../store/useAdminDashboardStore";
import { InventoryManager } from "./InventoryManager/InventoryManager";
import { useEffect, useState, type JSX, type ForwardRefExoticComponent } from "react";
import { SelectCampaignModal } from "./components/SelectCampaignModal";
import { useMediaQuery } from "@mantine/hooks";
import { useAdminCampaignStore } from "../../store/admin/useAdminCampaignStore";
import { CampaignManager } from "./CampaignManager/CampaignManager";
import { SpellForm } from "./SpellManager/SpellForm";
import { CacheManager } from "./CacheManager/CacheManager";
import { UserManager } from "./UserManager/UserManager";
import { MonsterManager } from "./MonsterManager/MonsterManager";
import { InventoryBrowser } from "./InventoryBrowser/InventoryBrowser";
import { ItemManager } from "./ItemManager/ItemManager";
import { SessionManager } from "./SessionManager/SessionManager";
import { BackupManager } from "./BackupManager/BackupManager";

export const AdminDashboard: React.FC = () => {
  const { activeSection, setActiveSection } = useAdminDashboardStore();
  const { selectedId: selectedCampaignId } = useAdminCampaignStore();
  const [campaignModal, setCampaignModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const mobileButtonHeight = 44;

  // --- force modal if no campaign selected ---
  useEffect(() => {
    if (!selectedCampaignId) setCampaignModal(true);
  }, [selectedCampaignId]);

  const baseNavItems: {
    icon: ForwardRefExoticComponent<IconProps>;
    label: string;
    key: AdminSection;
    component: JSX.Element;
  }[] = [
    { icon: IconBox, label: "Inventory Manager", key: "InventoryManager", component: <InventoryManager /> },
    { icon: IconLayoutGrid, label: "Inventory Browser", key: "InventoryBrowser", component: <InventoryBrowser /> },
    { icon: IconSettings, label: "Campaign Manager", key: "CampaignManager", component: <CampaignManager /> },
    { icon: IconWand, label: "Spells Manager", key: "SpellsManager", component: <SpellForm /> },
    { icon: IconCamera, label: "Cache Manager", key: "CacheManager", component: <CacheManager /> },
    { icon: IconUsers, label: "User Manager", key: "UserManager", component: <UserManager /> },
    { icon: IconGhost, label: "Monster Manager", key: "MonsterManager", component: <MonsterManager /> },
    { icon: IconCategory, label: "Item Manager", key: "ItemManager", component: <ItemManager /> },
    { icon: IconUsersGroup, label: "Session Manager", key: "SessionManager", component: <SessionManager /> },
    { icon: IconCloudDownload, label: "Backup Manager", key: "BackupManager", component: <BackupManager /> },
  ];

  const currentItem = baseNavItems.find((n) => n.key === activeSection);
  const isDashboard = activeSection === "Dashboard";

  const mobileNavExtras = isMobile
    ? [
        {
          icon: IconLayoutGrid,
          label: "Dashboard",
          key: "__dashboard",
          onClick: () => setActiveSection("Dashboard"),
          variant: "light" as const,
        },
        {
          icon: IconRefresh,
          label: "Switch campaign",
          key: "__switch",
          onClick: () => setCampaignModal(true),
          variant: "outline" as const,
        },
      ]
    : [];

  const visibleNavItems = [...mobileNavExtras, ...baseNavItems];

  return (
    <>
      <Box
        style={{
          minHeight: "100vh",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {!selectedCampaignId ? null : (
          <>
            {!isDashboard && (
              <Paper
                shadow="lg"
                radius="md"
                withBorder
                p="sm"
                style={{
                  background: "linear-gradient(135deg, rgba(38, 20, 60, 0.85), rgba(24, 12, 40, 0.85))",
                  borderColor: "rgba(150, 80, 255, 0.4)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="center" gap="xs" wrap="wrap" style={isMobile ? { alignItems: "flex-start" } : undefined}>
                  <Group gap="xs">
                    <ThemeIcon size={34} radius="xl" variant="gradient" gradient={{ from: "grape", to: "violet" }}>
                      <IconLayoutGrid size={16} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="md">
                        Admin Dashboard
                      </Text>
                      <Text size="xs" c="dimmed">
                        Quick jump between managers
                      </Text>
                    </Box>
                  </Group>
                    {!isMobile && (
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          color="grape"
                          onClick={() => setActiveSection("Dashboard")}
                        >
                          Dashboard
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          color="grape"
                          leftSection={<IconRefresh size={14} />}
                          onClick={() => setCampaignModal(true)}
                        >
                          Switch campaign
                        </Button>
                      </Group>
                    )}
                  </Group>

                  <ScrollArea type="hover" scrollbarSize={6} offsetScrollbars style={isMobile ? { width: "100%" } : undefined}>
                    <Group gap="xs" wrap={isMobile ? "wrap" : "nowrap"}>
                      {visibleNavItems.map((item) => {
                        const isSpecial = typeof item.key === "string" && item.key.startsWith("__");
                        const isActive = !isSpecial && item.key === activeSection;

                        return (
                          <Button
                            key={item.key}
                            size={isMobile ? "sm" : "xs"}
                            variant={"variant" in item && item.variant ? item.variant : isActive ? "filled" : "outline"}
                            color="grape"
                            leftSection={<item.icon size={16} />}
                            onClick={() => {
                              if (isSpecial && "onClick" in item && item.onClick) {
                                item.onClick();
                              } else {
                                setActiveSection(item.key as AdminSection);
                              }
                            }}
                            fullWidth={isMobile}
                            style={isMobile ? { minHeight: mobileButtonHeight, height: mobileButtonHeight } : undefined}
                          >
                            {item.label}
                          </Button>
                        );
                      })}
                    </Group>
                  </ScrollArea>
                </Stack>
              </Paper>
            )}

            <Box mt="md" style={{ position: "relative", minHeight: "70vh" }}>
              <Transition mounted={isDashboard} transition="slide-right" duration={300} timingFunction="ease">
                {(styles) => (
                  <Stack align="center" gap="lg" style={{ ...styles, position: "absolute", width: "100%", padding: "1rem" }}>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" mt="md">
                      {baseNavItems.map((item) => (
                        <DashboardCard
                          key={item.key}
                          icon={<item.icon size={48} />}
                          title={item.label}
                          onClick={() => setActiveSection(item.key)}
                        />
                      ))}
                    </SimpleGrid>
                  </Stack>
                )}
              </Transition>

              <Transition mounted={!isDashboard} transition="slide-left" duration={300} timingFunction="ease">
                {(styles) => (
                  <Box  pt={16} style={{ ...styles, position: "absolute", width: "100%" }}>
                    {currentItem?.component}
                  </Box>
                )}
              </Transition>
            </Box>
          </>
        )}
      </Box>

      {/* Always render modal */}
      <SelectCampaignModal opened={campaignModal} onClose={() => setCampaignModal(false)} />
    </>
  );
};
