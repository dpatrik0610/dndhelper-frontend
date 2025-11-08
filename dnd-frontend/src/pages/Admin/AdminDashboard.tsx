import { Box, SimpleGrid, Stack, Transition } from "@mantine/core";
import { IconUsers, IconSettings, IconCategory, IconBox, type IconProps } from "@tabler/icons-react";
import { DashboardCard } from "./components/DashboardCard";
import { BackToDashboardButton } from "./components/BackToDashboardButton";
import { useAdminDashboardStore, type AdminSection } from "../../store/useAdminDashboardStore";
import { InventoryManager } from "./InventoryManager/InventoryManager";
import { useEffect, useState, type JSX } from "react";
import { SelectCampaignModal } from "./components/SelectCampaignModal";
import { useAdminCampaignStore } from "../../store/admin/useAdminCampaignStore";

export const AdminDashboard: React.FC = () => {
  const { activeSection, setActiveSection } = useAdminDashboardStore();
  const { selectedId: selectedCampaignId } = useAdminCampaignStore();
  const [campaignModal, setCampaignModal] = useState(false);

  // --- force modal if no campaign selected ---
  useEffect(() => {
    if (!selectedCampaignId) setCampaignModal(true);
  }, [selectedCampaignId]);

  const navItems: {
    icon: React.ForwardRefExoticComponent<IconProps>;
    label: string;
    key: AdminSection;
    component: JSX.Element;
  }[] = [
    { icon: IconBox, label: "Inventory Manager", key: "InventoryManager", component: <InventoryManager /> },
    { icon: IconUsers, label: "User Manager", key: "UserManager", component: <Box ta="center">👤 User Manager (coming soon)</Box> },
    { icon: IconCategory, label: "Item Manager", key: "ItemManager", component: <Box ta="center">📦 Item Manager (coming soon)</Box> },
    { icon: IconSettings, label: "Campaign Manager", key: "CampaignManager", component: <Box ta="center">🎯 Campaign Manager (coming soon)</Box> },
  ];

  const currentItem = navItems.find((n) => n.key === activeSection);
  const isDashboard = activeSection === "Dashboard";

  return (
    <>
    <Box
      style={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
      }}
    >
    {/* Hide dashboard content until a campaign is selected */}
    {!selectedCampaignId ? null : (
      <>
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

        {!isDashboard && <BackToDashboardButton />}
      </>
    )}
    </Box>

    {/* 🧭 Always render modal */}
    <SelectCampaignModal opened={campaignModal} onClose={() => setCampaignModal(false)} />
  </>
  );
};
