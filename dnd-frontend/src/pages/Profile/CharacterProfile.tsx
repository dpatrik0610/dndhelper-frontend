import {
  Box,
  Text,
  Tabs,
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
import { useState } from "react";
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

export default function CharacterProfile() {
  const character = useCharacterStore((state) => state.character);
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!character) {
    return (
      <Box p="md" m="0 auto" maw={600}>
        <Text size="lg" c="dimmed">
          No character selected. Please select a character from the Home page.
        </Text>
      </Box>
    );
  }

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
          <Tabs.Tab value="magic" leftSection={<IconSparkles size={16} />}>Magic</Tabs.Tab>
          <Tabs.Tab value="proficiencies" leftSection={<IconMedal size={16} />}>Proficiencies</Tabs.Tab>
          <Tabs.Tab value="extras" leftSection={<IconInfoCircle size={16} />}>Extras</Tabs.Tab>
          <Tabs.Tab value="inventories" leftSection={<IconBox size={16} />}>Inventories</Tabs.Tab>
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

          {activeTab === "magic" && (
            <motion.div key="magic" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <SpellCastingBlock />
              <SpellsPanel />
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

          {activeTab === "inventories" && (
            <motion.div key="inventories" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
              <Inventory />
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </Box>
  );
}
