import {
  Box,
  Tabs,
  Stack,
} from "@mantine/core";
import { CardGridSkeleton, LinesSkeleton } from "@components/common/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { CharacterHeader } from "./components/header/CharacterHeader";

import "./styles/CharacterProfile.styles.css"
import tabClasses from "./styles/ProfileTabs.module.css";
import { IconBackpack, IconListCheck, IconNotes, IconShieldHalf, IconSparkles, IconStars } from "@tabler/icons-react";
import { SectionColor } from "@appTypes/SectionColor";
import { showNotification } from "@components/Notification/Notification";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@hooks/useIsMobile";

// Lazy-loaded sub-panels to optimize initial bundle size, memory footprint, and rendering latency on mobile
const AbilityScores = lazy(() => import("./components/panels/AbilityScores").then(m => ({ default: m.AbilityScores })));
const CombatStats = lazy(() => import("./components/panels/CombatStats").then(m => ({ default: m.CombatStats })));
const ExperienceTableCard = lazy(() => import("./components/panels/ExperienceTableCard").then(m => ({ default: m.ExperienceTableCard })));
const SpellsPanel = lazy(() => import("./components/panels/SpellsPanel").then(m => ({ default: m.SpellsPanel })));
const SpellCastingBlock = lazy(() => import("./components/panels/SpellCastingBlock").then(m => ({ default: m.SpellCastingBlock })));
const ExtraInfo = lazy(() => import("./components/panels/ExtraInfo").then(m => ({ default: m.ExtraInfo })));
const FeaturesPanel = lazy(() => import("./components/panels/FeaturesPanel").then(m => ({ default: m.FeaturesPanel })));
const Inventory = lazy(() => import("@features/inventory/Inventory").then(m => ({ default: m.Inventory })));

/** `short` is the phone label, where six tabs share one row. */
const PROFILE_TABS: { value: string; label: string; short?: string; Icon: typeof IconBackpack }[] = [
  { value: "overview", label: "Skills", Icon: IconListCheck },
  { value: "stats", label: "Stats", Icon: IconShieldHalf },
  { value: "spellcasting", label: "Spellcasting", short: "Spells", Icon: IconSparkles },
  { value: "features", label: "Features", Icon: IconStars },
  { value: "extras", label: "Extras", Icon: IconNotes },
  { value: "inventories", label: "Inventories", short: "Items", Icon: IconBackpack },
];

export default function CharacterProfile() {
  const character = useCurrentCharacter();
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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
        unstyled
        classNames={{ list: tabClasses.list, tab: tabClasses.tab, tabSection: tabClasses.icon, tabLabel: tabClasses.label }}
      >
        <Tabs.List aria-label="Character sections">
          {PROFILE_TABS.map(({ value, label, short, Icon }) => (
            <Tabs.Tab key={value} value={value} aria-label={label} leftSection={<Icon size={isMobile ? 18 : 16} stroke={1.75} />}>
              {isMobile ? short ?? label : label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Suspense
          fallback={
            <Stack gap="md" py="md">
              <CardGridSkeleton count={3} cols={{ base: 1, sm: 3 }} height={110} />
              <LinesSkeleton lines={4} />
            </Stack>
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
    </Box>
  );
}
