import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Title,
  Divider,
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
} from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { useCharacterForm } from "./useCharacterForm";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { CombatStatsSection } from "./sections/CombatStatsSection";
import { CollectionsSection } from "./sections/CollectionsSection";
import { AdminSection } from "./sections/AdminSection";
import { AbilitiesSection } from "./sections/AbilitiesSection";
import { LoreSection } from "./sections/LoreSection";
import { DeleteCharacterSection } from "./sections/DeleteCharacterSection";
import { SpellSlotsSection } from "./sections/SpellSlotsSection";
import { SpellsSection } from "./sections/SpellsSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { useIsMobile } from "@hooks/useIsMobile";
import { useUiStore } from "@store/ui/uiStore";

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
  const { handleSubmit, loading, isAdmin } = useCharacterForm(editMode);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  const sidebarTheme = useUiStore((s) => s.sidebarTheme);

  const activeThemeClass = useMemo(() => {
    switch (sidebarTheme) {
      case "midnight":
        return "theme-midnight-arcane";
      case "crimson-vampire":
        return "theme-crimson-vampire";
      case "frost-glacier":
        return "theme-frost-glacier";
      case "sunset":
      default:
        return "theme-cyber-noir";
    }
  }, [sidebarTheme]);

  const submitLabel = editMode ? "Save Changes" : "Create Character";

  // Granular Navigation items definition with specific icons
  const tabItems = useMemo(() => {
    const items = [
      { id: "basic" as TabType, label: "Profile", icon: <IconUser size={16} /> },
      { id: "lore" as TabType, label: "Lore", icon: <IconBook size={16} /> },
      { id: "combat" as TabType, label: "Combat", icon: <IconSword size={16} /> },
      { id: "abilities" as TabType, label: "Abilities", icon: <IconBrain size={16} /> },
      { id: "slots" as TabType, label: "Slots", icon: <IconWand size={16} /> },
      { id: "spells" as TabType, label: "Spells", icon: <IconFlame size={16} /> },
      { id: "features" as TabType, label: "Features", icon: <IconBookmark size={16} /> },
      { id: "collections" as TabType, label: "Proficiencies", icon: <IconBook2 size={16} /> },
    ];
    // Show settings if admin or editing (which contains delete option)
    if (isAdmin || editMode) {
      items.push({ id: "settings" as TabType, label: "Settings", icon: <IconLock size={16} /> });
    }
    return items;
  }, [isAdmin, editMode]);

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
        p={isMobile ? "sm" : "xl"}
        radius={isMobile ? 0 : "lg"}
        withBorder={!isMobile}
        className="glass-panel"
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        }}
      >
        <Group justify="space-between" mb="lg" align="center" wrap="nowrap">
          <Group gap="sm" align="center">
            {editMode ? (
              <IconEdit size={isMobile ? 20 : 24} style={{ color: "var(--theme-color-accent-primary)" }} />
            ) : (
              <IconUserPlus size={isMobile ? 20 : 24} style={{ color: "var(--theme-color-accent-primary)" }} />
            )}
            <Title order={isMobile ? 3 : 2} className="narrative-title" style={{ fontSize: isMobile ? "15px" : "18px" }}>
              {editMode ? "Edit Character" : "Create New Character"}
            </Title>
          </Group>
        </Group>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* Header Action Buttons */}
          <Group justify="space-between" mb="xl" gap="sm">
            <Button
              type="button"
              onClick={() => navigate(editMode ? "/profile" : "/home")}
              className="glass-btn-secondary"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              Go Back
            </Button>

            <Button
              type="submit"
              className="glass-btn-primary"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              {submitLabel}
            </Button>
          </Group>

          {/* Mobile Select Dropdown Section Chooser */}
          {isMobile && (
            <Box mb="xl">
              <Select
                value={activeTab}
                onChange={(v) => setActiveTab(v as TabType)}
                data={tabItems.map((tab) => ({ value: tab.id, label: tab.label }))}
                label="Choose Form Section"
                classNames={{
                  input: "glassy-input",
                  label: "glassy-label",
                  dropdown: "glassy-dropdown",
                  option: "glassy-option",
                }}
                styles={{
                  label: {
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 300,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    marginBottom: "6px",
                    color: "var(--theme-color-text-secondary)",
                  },
                }}
              />
            </Box>
          )}

          {/* Core Sidebar + Content Split Grid */}
          <Group align="flex-start" gap="xl" wrap={isMobile ? "wrap" : "nowrap"}>
            
            {/* Desktop Left-side RPG Navigation Sidebar */}
            {!isMobile && (
              <Stack gap="xs" style={{ width: "220px", flexShrink: 0 }}>
                {tabItems.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      variant="unstyled"
                      leftSection={tab.icon}
                      style={{
                        height: "40px",
                        borderRadius: "8px",
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                        fontWeight: 400,
                        fontSize: "12px",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        color: isActive
                          ? "#121214"
                          : "var(--theme-color-text-secondary, rgba(255,255,255,0.6))",
                        background: isActive
                          ? "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))"
                          : "rgba(255, 255, 255, 0.01)",
                        border: isActive
                          ? "1px solid rgba(255, 255, 255, 0.1)"
                          : "1px solid rgba(255, 255, 255, 0.02)",
                        boxShadow: isActive
                          ? "var(--theme-glow-shadow-primary, 0 0 10px rgba(245, 158, 11, 0.3)), inset 0 1px 1px rgba(255, 255, 255, 0.12)"
                          : "none",
                        padding: "0 16px",
                        textAlign: "left",
                        width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.04))";
                          e.currentTarget.style.color = "white";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                          e.currentTarget.style.color = "var(--theme-color-text-secondary, rgba(255,255,255,0.6))";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.02)";
                        }
                      }}
                    >
                      {tab.label}
                    </Button>
                  );
                })}
              </Stack>
            )}

            {/* Active Section Content (Takes up remainder of width) */}
            <Box
              p={isMobile ? "xs" : "md"}
              style={{
                flex: 1,
                minWidth: 0,
                background: "rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.03)",
                minHeight: "450px",
              }}
            >
              {activeTab === "basic" && (
                <BasicInfoSection noBox />
              )}

              {activeTab === "lore" && (
                <LoreSection noBox />
              )}

              {activeTab === "combat" && (
                <CombatStatsSection noBox />
              )}

              {activeTab === "abilities" && (
                <AbilitiesSection noBox />
              )}

              {activeTab === "slots" && (
                <SpellSlotsSection noBox />
              )}

              {activeTab === "spells" && (
                <SpellsSection noBox />
              )}

              {activeTab === "features" && (
                <FeaturesSection noBox />
              )}

              {activeTab === "collections" && (
                <CollectionsSection noBox />
              )}

              {activeTab === "settings" && (
                <Stack gap="xl">
                  {isAdmin && (
                    <>
                      <AdminSection noBox />
                      <Divider color="rgba(255, 255, 255, 0.06)" />
                    </>
                  )}
                  {editMode && <DeleteCharacterSection noBox />}
                </Stack>
              )}
            </Box>
          </Group>
        </form>
      </Paper>
    </Box>
  );
}
