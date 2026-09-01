import {
  Box,
  Group,
  Tabs,
  Text,
  Loader,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { CharacterHeader } from "./components/CharacterHeader";

import "./styles/CharacterProfile.styles.css"
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";
import { useNavigate } from "react-router-dom";
import { getCampaignById } from "@services/campaignService";
import { useIsAdmin, useToken } from "@store/auth/authSelectors";
import type { Campaign } from "@appTypes/Campaign";
import { useIsMobile } from "@hooks/useIsMobile";

// Lazy-loaded sub-panels to optimize initial bundle size, memory footprint, and rendering latency on mobile
const AbilityScores = lazy(() => import("./components/AbilityScores").then(m => ({ default: m.AbilityScores })));
const CombatStats = lazy(() => import("./components/CombatStats").then(m => ({ default: m.CombatStats })));
const ExperienceTableCard = lazy(() => import("./components/ExperienceTableCard").then(m => ({ default: m.ExperienceTableCard })));
const SpellsPanel = lazy(() => import("./components/SpellsPanel").then(m => ({ default: m.SpellsPanel })));
const SpellCastingBlock = lazy(() => import("./components/SpellCastingBlock").then(m => ({ default: m.SpellCastingBlock })));
const ExtraInfo = lazy(() => import("./components/ExtraInfo").then(m => ({ default: m.ExtraInfo })));
const FeaturesPanel = lazy(() => import("./components/FeaturesPanel").then(m => ({ default: m.FeaturesPanel })));
const Inventory = lazy(() => import("@features/inventory/Inventory").then(m => ({ default: m.Inventory })));

function useCampaignName(campaignId: string | null) {
  const [name, setName] = useState<string>("Loading...");
  const token = useToken();

  useEffect(() => {
    if (!campaignId || !token) {
      setName("No Campaign");
      return;
    }

    (async () => {
      let data: Campaign | null = null;
      try
      {
        const campaign = await getCampaignById(campaignId);
        if (campaign) data = campaign;
      }
      catch (err)
      {
        data = null;
        console.log(err);
      }

      setName(data?.name ?? "Unknown Campaign");
    })();
  }, [campaignId, token]);

  return name;
}

export default function CharacterProfile() {
  const character = useCurrentCharacter();
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isAdmin = useIsAdmin();
  const campaignName = useCampaignName(isAdmin ? character?.campaignId ?? null : null);
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
    <Box p={isMobile ? 0 : "md"} m={isMobile ? 0 : "0 auto"} maw={isMobile ? "100%" : 900}>
      <CharacterHeader />

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
          <Tabs.Tab value="overview">Skills</Tabs.Tab>
          <Tabs.Tab value="stats">Stats</Tabs.Tab>
          <Tabs.Tab value="spellcasting">Spellcasting</Tabs.Tab>
          <Tabs.Tab value="features">Features</Tabs.Tab>
          <Tabs.Tab value="extras">Extras</Tabs.Tab>
          <Tabs.Tab value="inventories">Inventories</Tabs.Tab>
        </Tabs.List>

        <Suspense
          fallback={
            <Group justify="center" py="xl" style={{ minHeight: "180px", width: "100%" }}>
              <Loader size="md" />
            </Group>
          }
        >
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
                <AbilityScores />
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
                {/* <AbilityScores /> */}
                <CombatStats />
                <ExperienceTableCard />
              </motion.div>
            )}

            {activeTab === "spellcasting" && (
              <motion.div key="spellcasting" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>
                <SpellsPanel />
                <SpellCastingBlock />
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
          </AnimatePresence>
        </Suspense>
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
