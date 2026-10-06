import { ActionIcon, Button, Tooltip } from "@mantine/core";
import {
  IconBook2,
  IconBox,
  IconBuildingStore,
  IconCategory,
  IconCompass,
  IconGhost,
  IconRefresh,
  IconSettings,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { AdminShell, type AdminSectionDef } from "./components/AdminShell";
import { SelectCampaignModal } from "./components/SelectCampaignModal";
import { InventoryDashboard } from "./InventoryDashboard/InventoryDashboard";
import { CampaignManager } from "./CampaignManager/CampaignManager";
import { MonsterManager } from "./MonsterManager/MonsterManager";
import { ItemManager } from "./ItemManager/ItemManager";
import { ShopManager } from "./ShopManager/ShopManager";
import { SessionManager } from "./SessionManager/SessionManager";
import { RuleManager } from "./RuleManager/RuleManager";
import { QuestManager } from "./QuestManager/QuestManager";

const sections: AdminSectionDef[] = [
  { path: "inventories", label: "Inventories", icon: IconBox, component: InventoryDashboard },
  { path: "campaigns", label: "Campaigns", icon: IconSettings, component: CampaignManager },
  { path: "monsters", label: "Monsters", icon: IconGhost, component: MonsterManager },
  { path: "items", label: "Items", icon: IconCategory, component: ItemManager },
  { path: "shops", label: "Shop Manager", icon: IconBuildingStore, component: ShopManager },
  { path: "sessions", label: "Sessions", icon: IconUsersGroup, component: SessionManager },
  { path: "rules", label: "Rules", icon: IconBook2, component: RuleManager },
  { path: "quests", label: "Quests", icon: IconCompass, component: QuestManager },
];

/** The DM's tools for the current campaign. Site-wide tools live in the superadmin console (/admin). */
export function DmDashboard() {
  const selectedCampaignId = useCampaignStore((s) => s.selectedId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const switchCampaign = (collapsed: boolean) =>
    collapsed ? (
      <Tooltip label="Switch campaign" position="left" withArrow>
        <ActionIcon variant="light" color="neon" size="sm" onClick={() => setPickerOpen(true)} aria-label="Switch campaign">
          <IconRefresh size={14} />
        </ActionIcon>
      </Tooltip>
    ) : (
      <Button
        variant="light"
        color="neon"
        size="compact-xs"
        leftSection={<IconRefresh size={12} />}
        onClick={() => setPickerOpen(true)}
        fullWidth
      >
        Switch campaign
      </Button>
    );

  return (
    <>
      {selectedCampaignId && (
        <AdminShell title="Dungeon Master" basePath="/dashboard" sections={sections} headerAction={switchCampaign} />
      )}
      {/* Every tool here works on one campaign: ask for it first. */}
      <SelectCampaignModal opened={pickerOpen || !selectedCampaignId} onClose={() => setPickerOpen(false)} />
    </>
  );
}
