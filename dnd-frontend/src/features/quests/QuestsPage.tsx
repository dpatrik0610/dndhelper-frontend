import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Text,
  Group,
  Button,
  MultiSelect,
  Paper,
  Stack,
  Loader,
  Center,
  SimpleGrid,
} from "@mantine/core";
import {
  IconPlus,
  IconCompass,
  IconSearch,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";
import { useCurrentCharacter, useCharacterList } from "@store/character/characterSelectors";
import { useQuestList, useQuestLoading, useQuestActions } from "@store/quest/questSelectors";
import { QuestType, QuestStatus } from "@appTypes/Quest";
import type { Quest, QuestObjective } from "@appTypes/Quest";
import { BaseModal } from "@components/BaseModal";
import { useIsMobile } from "@hooks/useIsMobile";
import { SectionColor } from "@appTypes/SectionColor";
import { QuestCard } from "./components/QuestCard";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";
import { QuestDetailsModal } from "./components/QuestDetailsModal";
import { CustomSelect } from "@components/common/CustomSelect";
import { GlassyTextInput } from "@components/common/GlassyTextInput";
import { GlassyTextarea } from "@components/common/GlassyTextarea";

export default function QuestsPage() {
  const character = useCurrentCharacter();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const quests = useQuestList();
  const loading = useQuestLoading();
  const {
    loadCampaignQuests,
    create,
    update,
    remove,
    addObjective,
    updateObjective,
    deleteObjective,
  } = useQuestActions();

  // Details Modal State
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);

  // Filters & Tabs State
  const [activeTab, setActiveTab] = useState<"campaign" | "personal">("campaign");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Fetch campaign characters for selecting co-participants (involved character IDs)
  const allCharacters = useCharacterList();
  const campaignMembers = useMemo(() => {
    if (!character || !allCharacters) return [];
    return allCharacters.filter(
      (c) => c.campaignId === character.campaignId && c.id !== character.id && !c.isDeleted
    );
  }, [character, allCharacters]);

  const selectedQuestForDetails = useMemo(() => {
    if (!selectedQuestId) return null;
    return quests.find((q) => q.id === selectedQuestId) || null;
  }, [quests, selectedQuestId]);

  // Equipment Inspect Modal State
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [equipmentModalOpened, setEquipmentModalOpened] = useState(false);

  // Create/Edit Quest Modal State (Spacious layout, supports involved character selection)
  const [questModal, setQuestModal] = useState<{
    opened: boolean;
    editId?: string;
    title: string;
    description: string;
    location: string;
    involvedCharacterIds: string[];
  }>({
    opened: false,
    title: "",
    description: "",
    location: "",
    involvedCharacterIds: [],
  });

  // Verification and redirection if no character
  useEffect(() => {
    if (!character) {
      showNotification({
        id: "no-character-selected-quests",
        title: "No Character Selected",
        message: "Please select a character to view quests.",
        color: SectionColor.Red,
        withBorder: true,
      });
      navigate("/home", { replace: true });
    }
  }, [character, navigate]);

  const campaignId = character?.campaignId;

  // Load campaign quests on mount / when campaignId changes
  useEffect(() => {
    if (campaignId) {
      void loadCampaignQuests(campaignId);
    }
  }, [campaignId, loadCampaignQuests]);

  // Group and filter quests
  const filteredQuests = useMemo(() => {
    if (!character) return [];
    return quests.filter((q) => {
      // 1. Hide unavailable quests
      if (q.status === QuestStatus.Unavailable) return false;

      // 2. Separate Personal and Campaign with complete security isolation
      const isPersonal = q.type === QuestType.Personal;
      const isParticipant = q.involvedCharacterIds?.includes(character.id || "") || false;

      // Rule: If it's a personal quest, the active character MUST be a participant to see it under any circumstances
      if (isPersonal && !isParticipant) return false;

      // Rule: Never leak personal quests into campaign quests, and vice-versa
      if (activeTab === "personal" && !isPersonal) return false;
      if (activeTab === "campaign" && isPersonal) return false;

      // 3. Filter by status
      if (statusFilter !== "All" && q.status !== statusFilter) return false;

      // 4. Filter by quest type
      if (typeFilter !== "All" && q.type !== typeFilter) return false;

      // 5. Filter by search
      if (search.trim()) {
        const query = search.toLowerCase();
        const titleMatches = q.title.toLowerCase().includes(query);
        const descMatches = q.description?.toLowerCase().includes(query) || false;
        const locMatches = q.location?.toLowerCase().includes(query) || false;
        return titleMatches || descMatches || locMatches;
      }

      return true;
    });
  }, [quests, activeTab, statusFilter, typeFilter, search, character]);

  // Modal Handlers
  const handleOpenQuestModal = (q?: Quest) => {
    if (q) {
      // Exclude self (current character) from the edit selection so they don't unselect themselves
      const others = q.involvedCharacterIds?.filter((id) => id !== character?.id) || [];
      setQuestModal({
        opened: true,
        editId: q.id,
        title: q.title,
        description: q.description || "",
        location: q.location || "",
        involvedCharacterIds: others,
      });
    } else {
      setQuestModal({
        opened: true,
        title: "",
        description: "",
        location: "",
        involvedCharacterIds: [],
      });
    }
  };

  const handleSaveQuest = async () => {
    if (!questModal.title.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Quest Title is required.",
        color: SectionColor.Red,
      });
      return;
    }

    if (!campaignId || !character?.id) return;

    // Merge current character (self) and other selected co-participants
    const mergedInvolved = Array.from(
      new Set([character.id, ...questModal.involvedCharacterIds])
    );

    try {
      if (questModal.editId) {
        await update(questModal.editId, {
          title: questModal.title,
          description: questModal.description,
          location: questModal.location,
          involvedCharacterIds: mergedInvolved,
        });
        showNotification({
          title: "Quest Updated",
          message: `Successfully updated quest: ${questModal.title}`,
          color: SectionColor.Green,
        });
      } else {
        await create({
          campaignId,
          involvedCharacterIds: mergedInvolved,
          title: questModal.title,
          description: questModal.description,
          location: questModal.location,
          type: QuestType.Personal,
          status: QuestStatus.Active,
          objectives: [],
          rewardItemIds: [],
          rewardCurrencies: [],
        });
        showNotification({
          title: "Quest Created",
          message: `Successfully created personal quest: ${questModal.title}`,
          color: SectionColor.Green,
        });
      }
      setQuestModal({ opened: false, title: "", description: "", location: "", involvedCharacterIds: [] });
    } catch (err) {
      showNotification({
        title: "Error Saving Quest",
        message: err instanceof Error ? err.message : "An unexpected error occurred.",
        color: SectionColor.Red,
      });
    }
  };

  const handleDeleteQuest = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the quest: "${title}"?`)) {
      try {
        await remove(id);
        showNotification({
          title: "Quest Deleted",
          message: `Successfully deleted quest: ${title}`,
          color: SectionColor.Green,
        });
      } catch (err) {
        showNotification({
          title: "Error Deleting Quest",
          message: err instanceof Error ? err.message : "An unexpected error occurred.",
          color: SectionColor.Red,
        });
      }
    }
  };

  // Inline Objective CRUD Handlers (Invoked seamlessly from the QuestDetailsModal inline form)
  const handleAddObjectiveInline = async (
    questId: string,
    description: string,
    threshold: number,
    progress: number
  ) => {
    await addObjective(questId, {
      description,
      completionThreshold: threshold,
      currentProgress: progress,
    });
  };

  const handleEditObjectiveInline = async (questId: string, obj: QuestObjective) => {
    await updateObjective(questId, obj);
  };

  const handleDeleteObjectiveInline = async (questId: string, objectiveId: string) => {
    await deleteObjective(questId, objectiveId);
  };

  const handleToggleObjectiveComplete = async (questId: string, obj: QuestObjective) => {
    const isNowCompleted = !obj.isCompleted;
    const targetProgress = isNowCompleted ? obj.completionThreshold : 0;

    await updateObjective(questId, {
      ...obj,
      isCompleted: isNowCompleted,
      currentProgress: targetProgress,
    });
  };

  const handleAdjustProgress = async (questId: string, obj: QuestObjective, amount: number) => {
    const nextProgress = Math.max(0, Math.min(obj.completionThreshold, obj.currentProgress + amount));
    if (nextProgress === obj.currentProgress) return;

    await updateObjective(questId, {
      ...obj,
      currentProgress: nextProgress,
      isCompleted: nextProgress >= obj.completionThreshold,
    });
  };

  const handleInspectEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setEquipmentModalOpened(true);
  };

  // Style Specs from GEMINI.md
  const panelStyle: React.CSSProperties = {
    backdropFilter: "blur(24px) saturate(130%)",
    WebkitBackdropFilter: "blur(24px) saturate(130%)",
    background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
    borderRadius: isMobile ? "0" : "12px",
  };

  if (!character) {
    return null;
  }

  return (
    <Box p={isMobile ? 0 : "md"} style={{ minHeight: "100%", position: "relative" }}>
      {/* Page Header */}
      <Group justify="space-between" align="center" mb="lg" px={isMobile ? "md" : 0} pt={isMobile ? "md" : 0}>
        <Text
          size="xl"
          fw={300}
          style={{
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "var(--theme-color-text-primary, #fff)",
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          }}
        >
          Quests
        </Text>
        {campaignId && activeTab === "personal" && (
          <Button
            onClick={() => handleOpenQuestModal()}
            leftSection={<IconPlus size={16} />}
            className="glass-btn-primary"
            style={{
              background: "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.1))",
              border: "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.2))",
              color: "var(--theme-color-accent-primary, #f59e0b)",
            }}
          >
            Create Personal Quest
          </Button>
        )}
      </Group>

      {/* Main Container */}
      {!campaignId ? (
        <Paper withBorder p="xl" style={panelStyle} mx={isMobile ? 0 : undefined}>
          <Stack align="center" gap="md">
            <IconAlertCircle size={48} color="var(--theme-color-accent-primary, #f59e0b)" />
            <Text size="md" fw={300} style={{ letterSpacing: "1px", textAlign: "center" }}>
              This character is not currently assigned to a campaign.
            </Text>
            <Text size="xs" c="var(--theme-color-text-secondary)" style={{ textAlign: "center" }}>
              Please speak with your Dungeon Master to register this character to a campaign to enable Quests.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="md" mx={isMobile ? 0 : undefined}>
          {/* Search and Filters panel */}
          <Paper withBorder p="md" style={panelStyle}>
            <Group gap="md" grow={!isMobile}>
              <GlassyTextInput
                placeholder="Search quests by title, description..."
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                leftSection={<IconSearch size={16} color="var(--theme-color-accent-primary, rgba(255, 255, 255, 0.4))" />}
              />
              <CustomSelect
                placeholder="Quest Category"
                value={activeTab}
                onChange={(val) => setActiveTab((val || "campaign") as "campaign" | "personal")}
                data={[
                  { label: "Campaign Quests", value: "campaign" },
                  { label: "Personal Quests", value: "personal" },
                ]}
              />
              <CustomSelect
                placeholder="Quest Type"
                value={typeFilter}
                onChange={(val) => setTypeFilter(val || "All")}
                data={["All", "Main", "Side", "Faction", "Personal", "Undefined"]}
              />
              <CustomSelect
                placeholder="Filter by Status"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val || "All")}
                data={["All", "Active", "Completed", "Failed"]}
              />
            </Group>
          </Paper>

          {/* Quests Content */}
          <Paper withBorder p={isMobile ? "sm" : "lg"} style={panelStyle}>
            {loading ? (
              <Center p="xl">
                <Loader color="var(--theme-color-accent-primary)" />
              </Center>
            ) : filteredQuests.length === 0 ? (
              <Center p="xl">
                <Stack align="center" gap="sm">
                  <IconCompass size={32} color="var(--theme-color-text-secondary, rgba(255,255,255,0.4))" />
                  <Text size="sm" c="var(--theme-color-text-secondary)">
                    No quests found matching your criteria.
                  </Text>
                </Stack>
              </Center>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="md">
                {filteredQuests.map((q) => (
                  <QuestCard
                    key={q.id}
                    quest={q}
                    isPersonal={q.type === QuestType.Personal}
                    onEditQuest={handleOpenQuestModal}
                    onDeleteQuest={handleDeleteQuest}
                    onOpenDetails={(quest) => {
                      setSelectedQuestId(quest.id || null);
                      setDetailsModalOpened(true);
                    }}
                  />
                ))}
              </SimpleGrid>
            )}
          </Paper>
        </Stack>
      )}

      {/* Quest Editor Modal (Expanded size to xl, supports Involved Character Selection) */}
      <BaseModal
        opened={questModal.opened}
        onClose={() => setQuestModal((prev) => ({ ...prev, opened: false }))}
        title={questModal.editId ? "Edit Personal Quest" : "Create Personal Quest"}
        size="xl" // spacious modal footprint
        onSave={handleSaveQuest}
        saveLabel={questModal.editId ? "Save Changes" : "Create Quest"}
      >
        <Stack gap="md">
          <GlassyTextInput
            label="Quest Title"
            placeholder="e.g. Find the Lost Scepter"
            required
            value={questModal.title}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setQuestModal((prev) => ({ ...prev, title: val }));
            }}
          />
          <GlassyTextarea
            label="Description / Lore Notes"
            placeholder="Detail any background information, clues, or thoughts on this quest..."
            minRows={4}
            value={questModal.description}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setQuestModal((prev) => ({ ...prev, description: val }));
            }}
          />
          <GlassyTextInput
            label="Location"
            placeholder="e.g. Neverwinter, Sword Coast"
            value={questModal.location}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setQuestModal((prev) => ({ ...prev, location: val }));
            }}
          />

          {/* Co-participants/Involved Characters MultiSelect Dropdown */}
          {campaignMembers.length > 0 && (
            <MultiSelect
              label="Involved Characters (Co-participants)"
              placeholder="Select other campaign members to join this quest..."
              data={campaignMembers
                .filter((c) => !!c.id)
                .map((c) => ({ label: c.name, value: c.id as string }))}
              value={questModal.involvedCharacterIds}
              onChange={(val) =>
                setQuestModal((prev) => ({ ...prev, involvedCharacterIds: val }))
              }
              classNames={{
                input: "glassy-input",
                label: "glassy-label",
              }}
              styles={{
                dropdown: {
                  background: "var(--theme-bg-panel-opaque, #140f28) !important",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.1)) !important",
                },
                option: {
                  color: "white !important",
                  "&[data-hovered]": {
                    background: "var(--theme-bg-hover, rgba(168, 85, 247, 0.14)) !important",
                  },
                  "&[data-selected]": {
                    background: "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.2)) !important",
                  },
                },
              }}
            />
          )}
        </Stack>
      </BaseModal>

      {/* Quest Details Modal (Directly contains full interactive checklists and rewards) */}
      <QuestDetailsModal
        quest={selectedQuestForDetails}
        opened={detailsModalOpened}
        onClose={() => {
          setDetailsModalOpened(false);
          setSelectedQuestId(null);
        }}
        isPersonal={selectedQuestForDetails?.type === QuestType.Personal}
        onAddObjective={handleAddObjectiveInline}
        onEditObjective={handleEditObjectiveInline}
        onDeleteObjective={handleDeleteObjectiveInline}
        onToggleObjective={handleToggleObjectiveComplete}
        onAdjustProgress={handleAdjustProgress}
        onViewEquipment={handleInspectEquipment}
      />

      {/* Equipment View Modal */}
      <EquipmentModal
        opened={equipmentModalOpened}
        onClose={() => setEquipmentModalOpened(false)}
        equipmentId={selectedEquipmentId}
      />
    </Box>
  );
}
