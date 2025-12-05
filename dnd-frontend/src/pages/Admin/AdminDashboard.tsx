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
} from "@tabler/icons-react";
import { DashboardCard } from "./components/DashboardCard";
import { useAdminDashboardStore, type AdminSection } from "../../store/useAdminDashboardStore";
import { InventoryManager } from "./InventoryManager/InventoryManager";
import { useEffect, useState, type JSX, type ForwardRefExoticComponent } from "react";
import { SelectCampaignModal } from "./components/SelectCampaignModal";
import { useAdminCampaignStore } from "../../store/admin/useAdminCampaignStore";
import { CampaignManager } from "./CampaignManager/CampaignManager";
import { SpellForm } from "./SpellManager/SpellForm";
import { CacheManager } from "./CacheManager/CacheManager";
import { UserManager } from "./UserManager/UserManager";
import { MonsterManager } from "./MonsterManager/MonsterManager";
import { InventoryBrowser } from "./InventoryBrowser/InventoryBrowser";
import { ItemManager } from "./ItemManager/ItemManager";
import { SessionManager } from "./SessionManager/SessionManager";

export const AdminDashboard: React.FC = () => {
  const { activeSection, setActiveSection } = useAdminDashboardStore();
  const { selectedId: selectedCampaignId } = useAdminCampaignStore();
  const [campaignModal, setCampaignModal] = useState(false);

  // --- force modal if no campaign selected ---
  useEffect(() => {
    if (!selectedCampaignId) setCampaignModal(true);
  }, [selectedCampaignId]);

  const navItems: {
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
  ];

  const currentItem = navItems.find((n) => n.key === activeSection);
  const isDashboard = activeSection === "Dashboard";

  return (
    <>
      <Box
        p="md"
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
                  <Group justify="space-between" align="center">
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
                  </Group>

                  <ScrollArea type="hover" scrollbarSize={6} offsetScrollbars>
                    <Group gap="xs" wrap="nowrap">
                      {navItems.map((item) => {
                        const isActive = item.key === activeSection;

                        return (
                          <Button
                            key={item.key}
                            size="xs"
                            variant={isActive ? "filled" : "outline"}
                            color="grape"
                            leftSection={<item.icon size={16} />}
                            onClick={() => setActiveSection(item.key)}
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
                      {navItems.map((item) => (
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
                  <Box style={{ ...styles, position: "absolute", width: "100%", padding: "1rem" }}>
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
