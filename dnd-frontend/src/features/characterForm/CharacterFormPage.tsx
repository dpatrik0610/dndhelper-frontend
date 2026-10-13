import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Title,
  Select,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import {
  IconEdit,
  IconUserPlus,
  IconUser,
  IconBook,
  IconSword,
  IconBrain,
  IconWand,
  IconFlame,
  IconBook2,
  IconLock,
  IconBookmark,
  IconBolt,
} from "@tabler/icons-react";
import { useState, useMemo, useRef } from "react";
import { useCharacterForm } from "./useCharacterForm";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { CombatStatsSection } from "./sections/CombatStatsSection";
import { CollectionsSection } from "./sections/CollectionsSection";
import { AdminSection } from "./sections/AdminSection";
import { AbilitiesSection } from "./sections/AbilitiesSection";
import { LoreSection } from "./sections/LoreSection";
import { SpellSlotsSection } from "./sections/SpellSlotsSection";
import { ClassResourcesSection } from "./sections/ClassResourcesSection";
import { SpellsSection } from "./sections/SpellsSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { FormGroup } from "@features/characterForm/components/FormGroup";
import { useIsMobile } from "@hooks/useIsMobile";
import { useUiStore } from "@store/ui/uiStore";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";
import formStyles from "@styles/CharacterForm.module.css";

interface CharacterFormPageProps {
  editMode?: boolean;
}

type TabType =
  | "basic"
  | "lore"
  | "combat"
  | "abilities"
  | "slots"
  | "spells"
  | "features"
  | "collections"
  | "settings";

export function CharacterFormPage({ editMode = false }: CharacterFormPageProps) {
  const { handleSubmit, loading, isDm } = useCharacterForm(editMode);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const paneRef = useRef<HTMLDivElement>(null);
  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    paneRef.current?.scrollTo({ top: 0 });
  };

  const sidebarTheme = useUiStore((s) => s.sidebarTheme);

  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);

  const submitLabel = editMode ? "Save" : "Create";

  const tabItems = useMemo(() => {
    const items = [
      { id: "basic" as TabType, label: "Profile", icon: <IconUser size={16} /> },
      { id: "lore" as TabType, label: "Lore", icon: <IconBook size={16} /> },
      { id: "combat" as TabType, label: "Combat", icon: <IconSword size={16} /> },
      { id: "abilities" as TabType, label: "Abilities", icon: <IconBrain size={16} /> },
      { id: "slots" as TabType, label: "Resources", icon: <IconWand size={16} /> },
      { id: "spells" as TabType, label: "Spells", icon: <IconFlame size={16} /> },
      { id: "features" as TabType, label: "Features", icon: <IconBookmark size={16} /> },
      { id: "collections" as TabType, label: "Proficiencies", icon: <IconBook2 size={16} /> },
    ];
    // Admin-only; deleting a character lives in Settings → Characters
    if (isDm) {
      items.push({ id: "settings" as TabType, label: "Settings", icon: <IconLock size={16} /> });
    }
    return items;
  }, [isDm]);

  return (
    <Box
      className={activeThemeClass}
      maw={1000}
      mx={isMobile ? 0 : "auto"}
      mt={isMobile ? 0 : "xl"}
      px={0}
      pb="xl"
      w="100%"
      pos="relative"
    >
      <LoadingOverlay visible={loading} overlayProps={{ blur: 12, backgroundOpacity: 0.4 }} />

      <Paper
        p={isMobile ? "xs" : "xl"}
        radius={isMobile ? 0 : "lg"}
        withBorder={!isMobile}
        className="glass-panel"
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
          // Fixed frame so switching tabs never resizes the panel: desktop scrolls inside the pane,
          // phones flow with the page but never shrink below one screen.
          ...(isMobile
            ? { minHeight: "100dvh" }
            : { height: "calc(100dvh - 120px)", minHeight: 560, display: "flex", flexDirection: "column" }),
        }}
      >
        <Group justify="space-between" mb="lg" align="center" wrap="nowrap" gap="sm">
          <Group gap="sm" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
            {editMode ? (
              <IconEdit size={isMobile ? 20 : 24} style={{ color: "var(--theme-color-accent-primary)", flexShrink: 0 }} />
            ) : (
              <IconUserPlus size={isMobile ? 20 : 24} style={{ color: "var(--theme-color-accent-primary)", flexShrink: 0 }} />
            )}
            <Title order={isMobile ? 3 : 2} className="narrative-title" style={{ fontSize: isMobile ? "15px" : "18px" }}>
              {editMode ? "Edit Character" : "New Character"}
            </Title>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button
              size={isMobile ? "xs" : "sm"}
              className="glass-btn-secondary"
              onClick={() => navigate(editMode ? "/profile" : "/home")}
            >
              Cancel
            </Button>
            <Button size={isMobile ? "xs" : "sm"} type="submit" form="character-form" className="glass-btn-primary">
              {submitLabel}
            </Button>
          </Group>
        </Group>

        <form
          id="character-form"
          className={formStyles.body}
          style={isMobile ? undefined : { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {isMobile && (
            <Box mb="xl">
              <Select
                value={activeTab}
                onChange={(v) => v && switchTab(v as TabType)}
                data={tabItems.map((tab) => ({ value: tab.id, label: tab.label }))}
                label="Section"
                allowDeselect={false}
                classNames={{
                  input: "glassy-input",
                  label: "glassy-label",
                  dropdown: "glassy-dropdown",
                  option: "glassy-option",
                }}
              />
            </Box>
          )}

          <Group
            align={isMobile ? "flex-start" : "stretch"}
            gap="xl"
            wrap={isMobile ? "wrap" : "nowrap"}
            style={isMobile ? undefined : { flex: 1, minHeight: 0 }}
          >
            {!isMobile && (
              <nav className={formStyles.nav} aria-label="Form sections">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={formStyles.navItem}
                    data-active={activeTab === tab.id || undefined}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    onClick={() => switchTab(tab.id)}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            )}

            {/* Flat pane: sections sit directly on the panel, no inset box */}
            <Box
              ref={paneRef}
              data-form-pane
              w={isMobile ? "100%" : undefined}
              style={{
                flex: 1,
                minWidth: 0,
                ...(isMobile ? {} : { minHeight: 0, overflowY: "auto", paddingRight: 8, scrollbarGutter: "stable" }),
              }}
            >
              {activeTab === "basic" && <BasicInfoSection />}

              {activeTab === "lore" && <LoreSection />}

              {activeTab === "combat" && <CombatStatsSection />}

              {activeTab === "abilities" && <AbilitiesSection />}

              {activeTab === "slots" && (
                <Stack gap="xl">
                  <FormGroup icon={<IconBolt size={16} />} title="Class Resources">
                    <ClassResourcesSection />
                  </FormGroup>
                  <FormGroup icon={<IconWand size={16} />} title="Spell Slots">
                    <SpellSlotsSection />
                  </FormGroup>
                </Stack>
              )}

              {activeTab === "spells" && <SpellsSection />}

              {activeTab === "features" && <FeaturesSection />}

              {activeTab === "collections" && <CollectionsSection />}

              {activeTab === "settings" && <AdminSection />}
            </Box>
          </Group>
        </form>
      </Paper>
    </Box>
  );
}
