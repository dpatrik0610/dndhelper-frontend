import {
  Box,
  Group,
  Text,
  Badge,
  Title,
  Button,
  Tabs,
  rem,
} from "@mantine/core";
import {
  IconStar,
  IconBackpack,
  IconUser,
  IconSword,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { useNavigate } from "react-router-dom";
import { CharacterHeader } from "./components/CharacterHeader";
import { CombatStats } from "./components/CombatStats";
import { AbilityScores } from "./components/AbilityScores";
import { ExtraInfo } from "./components/ExtraInfo";
import { SpellCastingBlock } from "./components/SpellBlock";
import { ActionBar } from "./components/ActionsBar";
import { SkillsPanel } from "./components/SkillsPanel";
import { ConditionsPanel } from "./components/ConditionsPanel";
import { SpellsPanel } from "./components/SpellsPanel";
import { useMediaQuery } from "@mantine/hooks";
import { Inventory } from "../Inventory/Inventory";

export default function CharacterProfile() {
  const character = useCharacterStore((state) => state.character);
  const navigate = useNavigate();
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
    <Box p={isMobile? "xs" : "md"} m={isMobile? "" : "0 auto"} maw={isMobile? "100%" : 900}>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Title order={2} mb="md" mt="xs">
          Character Profile
          <Badge ml="sm" color="yellow" variant="light" leftSection={<IconStar size={12} />}>
            BETA
          </Badge>
        </Title>

        {/* <Button
          leftSection={<IconBackpack size={20} />}
          onClick={() => navigate("/inventory")}
          variant="gradient"
          gradient={{ from: SectionColor.Grape, to: SectionColor.Orange, deg: 45 }}
          size="sm"
          radius="md"
        >
          Inventories
        </Button> */}
      </Group>

      <ActionBar />
      <CharacterHeader />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="pills"
        radius="md"
        styles={{
          list: {
            background: "rgba(61, 20, 4, 0.56)",
            backdropFilter: "blur(6px)",
            borderRadius: rem(3),
            padding: rem(10),
            border: "1px solid rgba(133, 42, 6, 0.79)",
          },
          tab: {
            fontWeight: 500,
            color: "#ddd",
            "&[data-active]": {
              background: "linear-gradient(135deg, #ffb34733, #ffcc334d)",
              color: "#fff",
              boxShadow: "1 1 10px rgba(155, 97, 50, 0.3)",
            },
          },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>Skills</Tabs.Tab>
          <Tabs.Tab value="stats" leftSection={<IconSword size={16} />}>Stats</Tabs.Tab>
          <Tabs.Tab value="magic" leftSection={<IconSparkles size={16} />}>Magic</Tabs.Tab>
          <Tabs.Tab value="extras" leftSection={<IconInfoCircle size={16} />}>Extras</Tabs.Tab>
          <Tabs.Tab value="inventories" leftSection={<IconInfoCircle size={16} />}>Inventories</Tabs.Tab>
        </Tabs.List>

        {/* Animated Panels */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ConditionsPanel />
              <SkillsPanel />
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <AbilityScores />
              <CombatStats />
            </motion.div>
          )}

          {activeTab === "magic" && (
            <motion.div
              key="magic"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <SpellCastingBlock />
              <SpellsPanel />
            </motion.div>
          )}

          {activeTab === "extras" && (
            <motion.div
              key="extras"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <ExtraInfo />
            </motion.div>
          )}

          {activeTab === "inventories" && (
            <motion.div
              key="inventories"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Inventory />
            </motion.div>
          )}

        </AnimatePresence>
      </Tabs>
    </Box>
  );
}
