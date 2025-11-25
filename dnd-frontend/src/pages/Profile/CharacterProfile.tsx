import {
  Box,
  Group,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconUser,
  IconSword,
  IconInfoCircle,
  IconSparkles,
  IconMedal,
  IconBox,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterHeader } from "./components/CharacterHeader";
import { CombatStats } from "./components/CombatStats";
import { AbilityScores } from "./components/AbilityScores";
import { ExtraInfo } from "./components/ExtraInfo";
import { SpellCastingBlock } from "./components/SpellCastingBlock";
import { ActionBar } from "./components/ActionsBar";
import { SkillsPanel } from "./components/SkillsPanel";
import { ConditionsPanel } from "./components/ConditionsPanel";
import { SpellsPanel } from "./components/SpellsPanel";
import { useMediaQuery } from "@mantine/hooks";
import { Inventory } from "../Inventory/Inventory";
import { ProficienciesPanel } from "./components/ProficienciesPanel";
import "./styles/CharacterProfile.styles.css"
import { FeaturesPanel } from "./components/FeaturesPanel";
import { CharacterNotesPanel } from "./components/CharacterNotesPanel";
import { SectionColor } from "../../types/SectionColor";
import { showNotification } from "../../components/Notification/Notification";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { getCampaignById } from "../../services/campaignService";

function useCampaignName(campaignId: string | null | undefined) {
  const [name, setName] = useState("Loading...");
  const token = useAuthStore.getState().token!;

  useEffect(() => {
    if (!campaignId) {
      setName("No Campaign");
      return;
    }
    (async () => {
      const data = await getCampaignById(campaignId, token);
      setName(data?.name ?? "Unknown Campaign");
    })();
  }, [campaignId, token]);

  return name;
}

export default function CharacterProfile() {
  const character = useCharacterStore((state) => state.character);
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  
  const isAdmin = useAuthStore.getState().roles.includes("Admin");
  const campaignName = useCampaignName(character?.campaignId);

  useEffect(() => {
    if (!character) {
      showNotification({
        id: "no-character-selected",
        title: "No Character Selected",
        message: "Please select a character first.",
        color: SectionColor.Red,
        withBorder: true,
      });

      navigate("/home", { replace: true });
    }
  }, [character, navigate]);

  if (!character) return null;

  return (
    <Box p={isMobile ? "xs" : "md"} m={isMobile ? "" : "0 auto"} maw={isMobile ? "100%" : 900}>
      <CharacterHeader />
      <ActionBar />
    <ConditionsPanel />

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="pills"
        radius="md"
        classNames={{
          list: "profile-tabs-list",
          tab: "profile-tab",
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>Skills</Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<IconSword size={16} />}>Stats</Tabs.Tab>
          <Tabs.Tab value="spellcasting" leftSection={<IconSparkles size={16} />}>Spellcasting</Tabs.Tab>
          <Tabs.Tab value="proficiencies" leftSection={<IconMedal size={16} />}>Proficiencies</Tabs.Tab>
          <Tabs.Tab value="features" leftSection={<IconSword size={16} />}>Features</Tabs.Tab>
          <Tabs.Tab value="extras" leftSection={<IconInfoCircle size={16} />}>Extras</Tabs.Tab>
          <Tabs.Tab value="inventories" leftSection={<IconBox size={16} />}>Inventories</Tabs.Tab>
          <Tabs.Tab value="notes" leftSection={<IconInfoCircle size={16} />}>Notes</Tabs.Tab>
        </Tabs.List>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <SkillsPanel />
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <AbilityScores />
              <CombatStats />
            </motion.div>
          )}

          {activeTab === "spellcasting" && (
            <motion.div key="spellcasting" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <SpellsPanel />
              <SpellCastingBlock />
            </motion.div>
          )}

          {activeTab === "proficiencies" && (
            <motion.div key="proficiencies" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <ProficienciesPanel />
            </motion.div>
          )}

          {activeTab === "extras" && (
            <motion.div key="extras" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <ExtraInfo />
            </motion.div>
          )}

          {activeTab === "features" && (
            <motion.div key="features" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <FeaturesPanel />
            </motion.div>
          )}

          {activeTab === "inventories" && (
            <motion.div key="inventories" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <Inventory />
            </motion.div>
          )}
          {activeTab === "notes" && (
            <motion.div key="notes" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <CharacterNotesPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
      {isAdmin && (
        <Group mb={10} gap={10} align="center" wrap="wrap">
          <Text size="xs" c="dimmed">ID: {character.id}</Text>
          <Text size="xs" c="dimmed">
            Campaign: {character.campaignId} ({campaignName})
          </Text>
      </Group>
      )}
    </Box>
  );
}
