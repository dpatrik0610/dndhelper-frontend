import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Stack,
  Loader,
  Text,
  Group,
  TextInput,
  Textarea,
  Button,
  SimpleGrid,
  NumberInput,
  Divider,
  ActionIcon,
  Badge,
  ScrollArea,
  Center,
  ThemeIcon,
  Tooltip,
  MultiSelect,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconCheck,
  IconCoins,
  IconBackpack,
  IconEye,
  IconEyeOff,
  IconCompass,
  IconRefresh,
  IconInbox,
  IconBookmark,
} from "@tabler/icons-react";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import {
  getCampaignQuests,
  createQuest,
  updateQuest,
  deleteQuest,
} from "@services/questService";
import { searchEquipmentByName, getEquipmentByIds } from "@services/equipmentService";
import type { Quest, QuestObjective } from "@appTypes/Quest";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import type { Currency } from "@appTypes/Currency";
import { QuestType, QuestStatus } from "@appTypes/Quest";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { CustomSelect } from "@components/common/CustomSelect";
import styles from "@styles/InventoryDashboard.module.css";

function generateObjectId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

export function QuestManager() {
  const { selectedId: campaignId, characters, loadCharacters } = useAdminCampaignStore();

  // Component State
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"campaign" | "personal">("campaign");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  // Editor Form State
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState<QuestType>(QuestType.Main);
  const [editStatus, setEditStatus] = useState<QuestStatus>(QuestStatus.Active);
  const [editInvolvedIds, setEditInvolvedIds] = useState<string[]>([]);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // Unified Rewards States
  const [rewardCurrencies, setRewardCurrencies] = useState<Currency[]>([]);
  const [rewardItemIds, setRewardItemIds] = useState<string[]>([]);
  const [addCurrencyCode, setAddCurrencyCode] = useState("gp");
  const [addCurrencyAmount, setAddCurrencyAmount] = useState(1);

  // Asynchronous Equipment Search States
  const [itemIdToNameMap, setItemIdToNameMap] = useState<Record<string, string>>({});
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [searchedItems, setSearchedItems] = useState<Equipment[]>([]);
  const [searchingItems, setSearchingItems] = useState(false);

  // Objectives Config State
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);
  const [newObjDesc, setNewObjectiveDesc] = useState("");
  const [newObjThreshold, setNewObjectiveThreshold] = useState(1);

  const fetchQuests = useCallback(async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const data = await getCampaignQuests(campaignId);
      setQuests(data);
    } catch (err) {
      showNotification({
        title: "Error fetching quests",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  // Bulk resolve names for active quest reward item IDs
  const fetchRewardItemNames = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setItemIdToNameMap({});
      return;
    }
    try {
      const resolved = await getEquipmentByIds(ids);
      const map: Record<string, string> = {};
      resolved.forEach((e) => {
        if (e.id) map[e.id] = e.name || "Unnamed Item";
      });
      setItemIdToNameMap(map);
    } catch (err) {
      console.error("Failed to bulk resolve reward item names", err);
    }
  }, []);

  // 1. Initial Load of Quests, Characters, and Equipment
  useEffect(() => {
    if (campaignId) {
      void fetchQuests();
      void loadCharacters(campaignId);
    } else {
      setQuests([]);
    }
  }, [campaignId, fetchQuests, loadCharacters]);

  // 2. Map Quests List for filtering
  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      const isPersonal = q.type === QuestType.Personal;
      if (activeCategory === "personal" && !isPersonal) return false;
      if (activeCategory === "campaign" && isPersonal) return false;

      if (statusFilter !== "All" && q.status !== statusFilter) return false;
      if (typeFilter !== "All" && q.type !== typeFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const titleMatch = q.title.toLowerCase().includes(query);
        const descMatch = q.description?.toLowerCase().includes(query) || false;
        const locMatch = q.location?.toLowerCase().includes(query) || false;
        return titleMatch || descMatch || locMatch;
      }
      return true;
    });
  }, [quests, activeCategory, statusFilter, typeFilter, search]);

  // Find currently active quest
  const activeQuest = useMemo(() => {
    return quests.find((q) => q.id === selectedQuestId) || null;
  }, [quests, selectedQuestId]);

  // Bind Editor Form when activeQuest changes
  useEffect(() => {
    if (activeQuest) {
      setEditTitle(activeQuest.title);
      setEditDesc(activeQuest.description || "");
      setEditLocation(activeQuest.location || "");
      setEditType(activeQuest.type);
      setEditStatus(activeQuest.status);
      setEditInvolvedIds(activeQuest.involvedCharacterIds || []);
      setObjectives(activeQuest.objectives || []);
      setRewardCurrencies(activeQuest.rewardCurrencies || []);
      setRewardItemIds(activeQuest.rewardItemIds || []);

      // Async fetch item names
      void fetchRewardItemNames(activeQuest.rewardItemIds || []);
    } else {
      // Clear form
      setEditTitle("");
      setEditDesc("");
      setEditLocation("");
      setEditType(QuestType.Main);
      setEditStatus(QuestStatus.Active);
      setEditInvolvedIds([]);
      setObjectives([]);
      setRewardCurrencies([]);
      setRewardItemIds([]);
      setItemIdToNameMap({});
    }
    setAddCurrencyCode("gp");
    setAddCurrencyAmount(1);
    setItemSearchQuery("");
    setSearchedItems([]);
    setShowMarkdownPreview(false);
  }, [activeQuest, fetchRewardItemNames]);

  // 3. Quest Metadata CRUD handlers
  const handleCreateQuest = async () => {
    if (!campaignId) return;
    try {
      const draft: Partial<Quest> = {
        campaignId,
        title: "New Custom Quest",
        description: "",
        location: "",
        type: activeCategory === "personal" ? QuestType.Personal : QuestType.Main,
        status: QuestStatus.Active,
        objectives: [],
        rewardCurrencies: [],
        rewardItemIds: [],
        involvedCharacterIds: [],
      };
      const created = await createQuest(draft);
      setQuests((prev) => [...prev, created]);
      setSelectedQuestId(created.id || null);
      showNotification({
        title: "Quest Created",
        message: "Select it on the left to start editing.",
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Failed to create quest",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  const handleSaveQuestDetails = async () => {
    if (!activeQuest || !campaignId) return;
    if (!editTitle.trim()) {
      showNotification({
        title: "Validation Error",
        message: "Quest Title is required.",
        color: SectionColor.Red,
      });
      return;
    }

    // Clean up objectives payload: strip out client-side temporary IDs (temp-) so the backend receives clean new objectives with no ID
    const cleanedObjectives = objectives.map((obj) => {
      if (obj.id && obj.id.startsWith("temp-")) {
        const copy = { ...obj };
        delete (copy as any).id;
        return copy;
      }
      return obj;
    });

    const updatedQuest: Quest = {
      ...activeQuest,
      title: editTitle,
      description: editDesc,
      location: editLocation,
      type: editType,
      status: editStatus,
      involvedCharacterIds: editInvolvedIds,
      rewardCurrencies: rewardCurrencies,
      rewardItemIds,
      objectives: cleanedObjectives,
    };

    try {
      const saved = await updateQuest(activeQuest.id || "", updatedQuest);
      setQuests((prev) => prev.map((q) => (q.id === saved.id ? saved : q)));
      showNotification({
        title: "Quest Saved Successfully",
        message: `Saved changes to "${saved.title}"`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Failed to save quest",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  const handleDeleteQuest = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete: "${title}"?`)) {
      try {
        await deleteQuest(id);
        setQuests((prev) => prev.filter((q) => q.id !== id));
        if (selectedQuestId === id) {
          setSelectedQuestId(null);
        }
        showNotification({
          title: "Quest Deleted",
          message: `Successfully deleted "${title}"`,
          color: SectionColor.Green,
        });
      } catch (err) {
        showNotification({
          title: "Failed to delete quest",
          message: String(err),
          color: SectionColor.Red,
        });
      }
    }
  };

  // 4. Objectives Actions in Form
  const handleAddObjective = () => {
    if (!newObjDesc.trim()) return;
    const newObj: QuestObjective = {
      id: generateObjectId(),
      description: newObjDesc,
      completionThreshold: newObjThreshold,
      currentProgress: 0,
      isCompleted: false,
    };
    setObjectives((prev) => [...prev, newObj]);
    setNewObjectiveDesc("");
    setNewObjectiveThreshold(1);
  };

  const handleDeleteObjective = (objId: string) => {
    setObjectives((prev) => prev.filter((o) => o.id !== objId));
  };

  const handleToggleObjComplete = (objId: string) => {
    setObjectives((prev) =>
      prev.map((o) => {
        if (o.id !== objId) return o;
        const isNowCompleted = !o.isCompleted;
        return {
          ...o,
          isCompleted: isNowCompleted,
          currentProgress: isNowCompleted ? o.completionThreshold : 0,
        };
      })
    );
  };

  const handleAdjustProgress = (objId: string, amount: number) => {
    setObjectives((prev) =>
      prev.map((o) => {
        if (o.id !== objId) return o;
        const nextProgress = Math.max(0, Math.min(o.completionThreshold, o.currentProgress + amount));
        return {
          ...o,
          currentProgress: nextProgress,
          isCompleted: nextProgress >= o.completionThreshold,
        };
      })
    );
  };

  // 5. Dynamic Currency Board Add/Remove handlers
  const handleAddCustomCurrency = () => {
    const code = addCurrencyCode.trim().toLowerCase();
    if (!code || addCurrencyAmount <= 0) return;

    setRewardCurrencies((prev) => {
      const existingIdx = prev.findIndex((c) => c.currencyCode.toLowerCase() === code);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          amount: updated[existingIdx].amount + addCurrencyAmount,
        };
        return updated;
      } else {
        // Strict Error-Alignment Mandate: BOTH type and currencyCode are set to the SAME string value
        const newCurrency: Currency = {
          currencyCode: code,
          type: code,
          amount: addCurrencyAmount,
        };
        return [...prev, newCurrency];
      }
    });

    setAddCurrencyAmount(1);
  };

  const handleRemoveCurrency = (code: string) => {
    setRewardCurrencies((prev) => prev.filter((c) => c.currencyCode.toLowerCase() !== code.toLowerCase()));
  };

  // 6. Asynchronous Equipment Search Board handlers
  const handleSearchEquipment = async () => {
    if (!itemSearchQuery.trim()) return;
    setSearchingItems(true);
    try {
      const results = await searchEquipmentByName(itemSearchQuery);
      setSearchedItems(results.slice(0, 10)); // Display the top 10 most relevant matches
    } catch (err) {
      console.error("Failed to query equipment by name", err);
    } finally {
      setSearchingItems(false);
    }
  };

  const handleAddEquipmentReward = (item: Equipment) => {
    if (!item.id) return;
    setRewardItemIds((prev) => {
      if (prev.includes(item.id!)) return prev;
      return [...prev, item.id!];
    });
    // Dynamically store the item name in our resolve map to render it instantly
    setItemIdToNameMap((prev) => ({
      ...prev,
      [item.id!]: item.name || "Unnamed Item",
    }));
  };

  const handleRemoveEquipmentReward = (id: string) => {
    setRewardItemIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  // 7. Stylings & Color Badges
  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case QuestStatus.Active:
        return "yellow";
      case QuestStatus.Completed:
        return "green";
      case QuestStatus.Failed:
        return "red";
      default:
        return "gray";
    }
  };

  const getAvatarLetter = (type: QuestType) => {
    switch (type) {
      case QuestType.Main:
        return "M";
      case QuestType.Side:
        return "S";
      case QuestType.Faction:
        return "F";
      default:
        return "P";
    }
  };

  const inputStyle = {
    input: {
      backgroundColor: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "white",
    },
  };

  const formLabelStyle = {
    color: "rgba(255, 255, 255, 0.95)",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    marginBottom: "4px",
  };

  if (!campaignId) {
    return (
      <Paper p="xl" style={{ background: "rgba(22, 24, 32, 0.85)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
        <Stack align="center" gap="md" py="xl">
          <IconAlertCircle size={48} color="var(--theme-color-accent-primary, #f59e0b)" />
          <Text size="md" fw={300} style={{ letterSpacing: "1px" }}>
            No Active Campaign Selected
          </Text>
          <Text size="xs" c="dimmed">
            Please select an active campaign in the dashboard header to manage campaign/personal quests.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.splitLayout}>
        
        {/* LEFT PANEL: Directory Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Group gap="xs" mb="sm">
              <ThemeIcon variant="light" color="indigo" size="md" radius="sm">
                <IconCompass size={16} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="md" c="var(--theme-color-accent-primary, #f59e0b)" style={{ letterSpacing: "1px" }}>Quest Journal</Text>
                <Text size="xs" c="rgba(255, 255, 255, 0.6)">{filteredQuests.length} shown</Text>
              </div>
            </Group>

            {/* Switch Category */}
            <Group grow gap="xs" mb="xs">
              <Button
                size="xs"
                variant={activeCategory === "campaign" ? "filled" : "subtle"}
                onClick={() => {
                  setActiveCategory("campaign");
                  setSelectedQuestId(null);
                }}
                className={activeCategory === "campaign" ? "glass-btn-primary" : "glass-btn-secondary"}
                styles={{
                  root: {
                    background: activeCategory === "campaign" ? "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.15))" : "transparent",
                    border: activeCategory === "campaign" ? "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.3))" : "1px solid rgba(255,255,255,0.04)",
                    color: activeCategory === "campaign" ? "var(--theme-color-accent-primary, #f59e0b)" : "rgba(255,255,255,0.85)",
                    height: "28px",
                    fontSize: "12px",
                    fontWeight: 600,
                  },
                }}
              >
                Campaign-wide
              </Button>
              <Button
                size="xs"
                variant={activeCategory === "personal" ? "filled" : "subtle"}
                onClick={() => {
                  setActiveCategory("personal");
                  setSelectedQuestId(null);
                }}
                className={activeCategory === "personal" ? "glass-btn-primary" : "glass-btn-secondary"}
                styles={{
                  root: {
                    background: activeCategory === "personal" ? "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.15))" : "transparent",
                    border: activeCategory === "personal" ? "1px solid var(--theme-border-glow, rgba(245, 158, 11, 0.3))" : "1px solid rgba(255,255,255,0.04)",
                    color: activeCategory === "personal" ? "var(--theme-color-accent-primary, #f59e0b)" : "rgba(255,255,255,0.85)",
                    height: "28px",
                    fontSize: "12px",
                    fontWeight: 600,
                  },
                }}
              >
                Personal
              </Button>
            </Group>

            {/* Search Input */}
            <TextInput
              placeholder="Search quests..."
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="xs"
              mb="xs"
              styles={inputStyle}
            />

            {/* Quick Filters */}
            <Stack gap={6} mb="sm">
              <CustomSelect
                placeholder="Quest Type"
                value={typeFilter}
                onChange={(val) => setTypeFilter(val || "All")}
                data={["All", "Main", "Side", "Faction", "Personal", "Undefined"]}
                size="xs"
                styles={inputStyle}
              />
              <CustomSelect
                placeholder="Status"
                value={statusFilter}
                onChange={(val) => setStatusFilter(val || "All")}
                data={["All", "Active", "Completed", "Failed"]}
                size="xs"
                styles={inputStyle}
              />
            </Stack>

            {/* Quick Action bar */}
            <Group gap="xs" grow>
              <Button
                variant="filled"
                color="indigo"
                leftSection={<IconPlus size={14} />}
                onClick={handleCreateQuest}
                size="xs"
                style={{ fontWeight: 600 }}
              >
                Add Quest
              </Button>
              <Tooltip label="Refresh Quests" withArrow>
                <ActionIcon
                  variant="light"
                  color="gray"
                  onClick={fetchQuests}
                  loading={loading}
                  size="md"
                >
                  <IconRefresh size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>

          {/* Scrollable list section */}
          <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
            {loading && quests.length === 0 ? (
              <Group justify="center" py="xl">
                <Loader color="indigo" size="sm" />
              </Group>
            ) : filteredQuests.length === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <IconInbox size={22} color="gray" />
                <Text c="rgba(255,255,255,0.5)" size="xs">No quests found.</Text>
              </Stack>
            ) : (
              <div>
                <div
                  className={styles.listGroupHeader}
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.85)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    padding: "0.5rem 0.25rem",
                  }}
                >
                  <span>{activeCategory === "campaign" ? "Campaign arcs" : "Personal Journals"}</span>
                  <span className={styles.listGroupCount} style={{ fontSize: "10px" }}>{filteredQuests.length}</span>
                </div>
                {filteredQuests.map((q) => (
                  <div
                    key={q.id}
                    className={`${styles.listItem} ${q.id === selectedQuestId ? styles.listItemSelected : ""}`}
                    onClick={() => setSelectedQuestId(q.id || null)}
                  >
                    <div className={styles.listItemAvatar} style={{ fontWeight: 800 }}>
                      {getAvatarLetter(q.type)}
                    </div>
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemName} style={{ fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>{q.title}</span>
                      <div className={styles.listItemMeta}>
                        <Badge size="xs" color={getStatusColor(q.status)} variant="filled" style={{ height: "14px", fontSize: "9px" }}>
                          {q.status}
                        </Badge>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>🎯 {q.objectives.length}</span>
                      </div>
                    </div>
                    <div className={styles.listItemActions}>
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (q.id) void handleDeleteQuest(q.id, q.title);
                        }}
                      >
                        <IconTrash size={12} />
                      </ActionIcon>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* RIGHT PANEL: Workspace WorkspaceArea */}
        <div className={styles.workspaceArea}>
          <Paper
            p="md"
            style={{
              flex: 1,
              background: "rgba(22, 24, 32, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              backdropFilter: "blur(20px)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {activeQuest ? (
              <Stack gap="md" style={{ flex: 1, overflow: "hidden" }}>
                {/* Workspace Header */}
                <Group justify="space-between" align="center" style={{ flexShrink: 0 }}>
                  <Box>
                    <Text size="sm" tt="uppercase" fw={700} c="var(--theme-color-accent-primary, #f59e0b)" style={{ letterSpacing: "1px" }}>
                      Quest Workspace
                    </Text>
                    <Text size="lg" fw={800} c="white" truncate="end" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
                      {activeQuest.title || "Untitled Quest"}
                    </Text>
                  </Box>
                  <Button
                    size="xs"
                    className="glass-btn-primary"
                    onClick={handleSaveQuestDetails}
                    leftSection={<IconCheck size={14} />}
                    styles={{
                      label: {
                        color: "white !important",
                      },
                    }}
                    style={{ fontWeight: 700 }}
                  >
                    Save Changes
                  </Button>
                </Group>

                <Divider style={{ borderColor: "rgba(255,255,255,0.05)" }} />

                {/* Main Scroll Content */}
                <ScrollArea style={{ flex: 1 }} offsetScrollbars>
                  <Stack gap="md" pr="xs" pb="lg">
                    {/* Metadata Section */}
                    <SimpleGrid cols={2} spacing="md">
                      <TextInput
                        label="Quest Title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.currentTarget.value)}
                        required
                        styles={{
                          label: formLabelStyle,
                          input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", color: "white" },
                        }}
                      />
                      <TextInput
                        label="Location"
                        placeholder="e.g. Castle Never, Waterdeep"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.currentTarget.value)}
                        styles={{
                          label: formLabelStyle,
                          input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", color: "white" },
                        }}
                      />
                    </SimpleGrid>

                    <SimpleGrid cols={2} spacing="md">
                      <CustomSelect
                        label="Quest Type"
                        value={editType}
                        onChange={(val) => setEditType((val || QuestType.Main) as QuestType)}
                        data={[QuestType.Main, QuestType.Side, QuestType.Faction, QuestType.Personal]}
                        styles={{
                          label: formLabelStyle,
                        }}
                      />
                      <CustomSelect
                        label="Quest Status"
                        value={editStatus}
                        onChange={(val) => setEditStatus((val || QuestStatus.Active) as QuestStatus)}
                        data={[QuestStatus.Active, QuestStatus.Completed, QuestStatus.Failed, QuestStatus.Unavailable]}
                        styles={{
                          label: formLabelStyle,
                        }}
                      />
                    </SimpleGrid>

                    {/* Involved Characters Selector */}
                    {characters.length > 0 && (
                      <MultiSelect
                        label="Assigned Participants / Involved Characters"
                        placeholder="Select campaign characters involved in this quest..."
                        data={characters.filter((c) => !!c.id).map((c) => ({ label: c.name, value: c.id as string }))}
                        value={editInvolvedIds}
                        onChange={setEditInvolvedIds}
                        styles={{
                          label: formLabelStyle,
                          input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", color: "white" },
                          dropdown: { background: "var(--theme-bg-panel-opaque, #140f28)", border: "1px solid rgba(255, 255, 255, 0.1)" },
                          option: {
                            color: "white",
                            "&[data-hovered]": { background: "var(--theme-bg-hover, rgba(168, 85, 247, 0.14))" },
                            "&[data-selected]": { background: "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.2))" },
                          },
                        }}
                      />
                    )}

                    {/* Description Textarea with Markdown Preview toggle */}
                    <Box>
                      <Group justify="space-between" align="center" mb={6}>
                        <Text size="sm" fw={700} tt="uppercase" c="rgba(255, 255, 255, 0.95)" style={{ letterSpacing: "0.5px" }}>
                          Lore & Description (Markdown)
                        </Text>
                        <Button
                          size="xs"
                          variant="subtle"
                          onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                          leftSection={showMarkdownPreview ? <IconEyeOff size={12} /> : <IconEye size={12} />}
                          styles={{ root: { height: "22px", color: "var(--theme-color-accent-primary, #f59e0b)", fontWeight: 600 } }}
                        >
                          {showMarkdownPreview ? "Edit Mode" : "Preview Markdown"}
                        </Button>
                      </Group>

                      {showMarkdownPreview ? (
                        <Box
                          p="md"
                          style={{
                            background: "rgba(0, 0, 0, 0.25)",
                            border: "1px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "8px",
                            minHeight: "120px",
                          }}
                        >
                          <MarkdownRenderer content={editDesc || "*No description recorded.*"} />
                        </Box>
                      ) : (
                        <Textarea
                          __staticSelector="true"
                          placeholder="Provide the background details, clues, and context for this quest journal..."
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.currentTarget.value)}
                          minRows={10}
                          autosize={true}
                          resize="vertical"
                          styles={{
                            input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", color: "white", fontSize: "14px" },
                          }}
                        />
                      )}
                    </Box>

                    <Divider style={{ borderColor: "rgba(255,255,255,0.05)" }} my="xs" />

                    {/* Objectives Checklist Manager */}
                    <Box>
                      <Text size="sm" fw={700} tt="uppercase" c="rgba(255, 255, 255, 0.95)" style={{ letterSpacing: "0.5px" }} mb="sm">
                        Quest Objectives ({objectives.length})
                      </Text>
                      
                      {/* Inline Add Objective Form */}
                      <Paper p="xs" style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }} mb="md">
                        <Group align="flex-end" gap="sm">
                          <TextInput
                            placeholder="Add objective goal..."
                            value={newObjDesc}
                            onChange={(e) => setNewObjectiveDesc(e.currentTarget.value)}
                            style={{ flex: 1 }}
                            styles={{
                              input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)", color: "white", fontSize: "12px", height: "32px" },
                            }}
                          />
                          <NumberInput
                            label="Target Goal"
                            min={1}
                            value={newObjThreshold}
                            onChange={(val) => setNewObjectiveThreshold(Number(val) || 1)}
                            style={{ width: "90px" }}
                            styles={{
                              label: { color: "rgba(255, 255, 255, 0.8)", fontSize: "10px", fontWeight: 600 },
                              input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)", color: "white", fontSize: "12px", height: "32px" },
                              control: { display: "none" },
                            }}
                          />
                          <ActionIcon size="md" className="glass-btn-primary" onClick={handleAddObjective} style={{ height: "32px", width: "32px" }}>
                            <IconPlus size={14} />
                          </ActionIcon>
                        </Group>
                      </Paper>

                      {/* Current Objectives List */}
                      {objectives.length === 0 ? (
                        <Text size="xs" c="rgba(255,255,255,0.4)" fs="italic">
                          No objectives configured for this quest.
                        </Text>
                      ) : (
                        <Stack gap="xs">
                          {objectives.map((obj) => (
                            <Paper
                              key={obj.id}
                              p="xs"
                              style={{
                                background: "rgba(0,0,0,0.15)",
                                border: "1px solid rgba(255,255,255,0.04)",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "sm",
                              }}
                            >
                              <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color={obj.isCompleted ? "green" : "gray"}
                                  onClick={() => handleToggleObjComplete(obj.id)}
                                >
                                  <IconCheck size={12} />
                                </ActionIcon>
                                <Box style={{ flex: 1 }}>
                                  <Text
                                    size="xs"
                                    c={obj.isCompleted ? "rgba(255,255,255,0.4)" : "white"}
                                    style={{ textDecoration: obj.isCompleted ? "line-through" : "none", fontWeight: 500 }}
                                  >
                                    {obj.description}
                                  </Text>
                                  {obj.completionThreshold > 1 && (
                                    <Text size="10px" c="var(--theme-color-accent-primary)" style={{ fontWeight: 600 }}>
                                      Progress: {obj.currentProgress} / {obj.completionThreshold}
                                    </Text>
                                  )}
                                </Box>
                              </Group>

                              {/* Action controls */}
                              <Group gap={4} wrap="nowrap">
                                {obj.completionThreshold > 1 && (
                                  <>
                                    <Button
                                      size="10px"
                                      variant="subtle"
                                      p={0}
                                      onClick={() => handleAdjustProgress(obj.id, -1)}
                                      style={{ height: "18px", width: "18px", minWidth: "18px", color: "white", fontWeight: 700 }}
                                    >
                                      -
                                    </Button>
                                    <Button
                                      size="10px"
                                      variant="subtle"
                                      p={0}
                                      onClick={() => handleAdjustProgress(obj.id, 1)}
                                      style={{ height: "18px", width: "18px", minWidth: "18px", color: "white", fontWeight: 700 }}
                                    >
                                      +
                                    </Button>
                                  </>
                                )}
                                <ActionIcon size="xs" variant="subtle" color="red" onClick={() => handleDeleteObjective(obj.id)}>
                                  <IconTrash size={11} />
                                </ActionIcon>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Divider style={{ borderColor: "rgba(255,255,255,0.05)" }} my="xs" />

                    {/* Rewards Manager Section: Dynamic Currency Board */}
                    <Box>
                      <Group gap="xs" mb="sm" align="center">
                        <IconCoins size={15} color="var(--theme-color-accent-primary)" />
                        <Text size="sm" fw={700} tt="uppercase" c="rgba(255, 255, 255, 0.95)" style={{ letterSpacing: "0.5px" }}>
                          Reward Currencies (Coins & Custom)
                        </Text>
                      </Group>
                      
                      {/* Current Currencies list panel */}
                      <Paper p="xs" style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }} mb="sm">
                        {rewardCurrencies.length === 0 ? (
                          <Text size="xs" c="rgba(255,255,255,0.45)" fs="italic">
                            No currencies allocated for this quest reward yet.
                          </Text>
                        ) : (
                          <Group gap="xs">
                            {rewardCurrencies.map((c) => (
                              <Badge
                                key={c.currencyCode}
                                size="sm"
                                variant="outline"
                                color="yellow"
                                pr={3}
                                styles={{
                                  root: {
                                    textTransform: "none",
                                    paddingLeft: "8px",
                                    height: "24px",
                                    background: "rgba(245, 158, 11, 0.05)",
                                    borderColor: "rgba(245, 158, 11, 0.2)",
                                  },
                                }}
                                rightSection={
                                  <ActionIcon
                                    size="10px"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => handleRemoveCurrency(c.currencyCode)}
                                    style={{ marginLeft: "4px" }}
                                  >
                                    <IconTrash size={10} />
                                  </ActionIcon>
                                }
                              >
                                <span style={{ color: "white", fontWeight: 600 }}>{c.amount}</span>{" "}
                                <span style={{ color: "var(--theme-color-accent-primary)", fontWeight: 700 }}>{c.currencyCode}</span>
                              </Badge>
                            ))}
                          </Group>
                        )}
                      </Paper>

                      {/* Add Currency Inline Form */}
                      <Paper p="xs" style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <Group align="flex-end" gap="sm">
                          <TextInput
                            label="Currency Code"
                            placeholder="e.g. gp, pp, cp, shards"
                            value={addCurrencyCode}
                            onChange={(e) => setAddCurrencyCode(e.currentTarget.value)}
                            style={{ flex: 1 }}
                            styles={{
                              label: { color: "rgba(255, 255, 255, 0.8)", fontSize: "10px", fontWeight: 600 },
                              input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)", color: "white", fontSize: "12px", height: "32px" },
                            }}
                          />
                          <NumberInput
                            label="Amount"
                            min={1}
                            value={addCurrencyAmount}
                            onChange={(val) => setAddCurrencyAmount(Number(val) || 1)}
                            style={{ width: "100px" }}
                            styles={{
                              label: { color: "rgba(255, 255, 255, 0.8)", fontSize: "10px", fontWeight: 600 },
                              input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)", color: "white", fontSize: "12px", height: "32px" },
                              control: { display: "none" },
                            }}
                          />
                          <ActionIcon size="md" className="glass-btn-primary" onClick={handleAddCustomCurrency} style={{ height: "32px", width: "32px" }}>
                            <IconPlus size={14} />
                          </ActionIcon>
                        </Group>
                      </Paper>
                    </Box>

                    <Divider style={{ borderColor: "rgba(255,255,255,0.05)" }} my="xs" />

                    {/* Rewards Manager Section: Asynchronous Equipment Search Board */}
                    <Box>
                      <Group gap="xs" mb="sm" align="center">
                        <IconBackpack size={15} color="var(--theme-color-accent-primary)" />
                        <Text size="sm" fw={700} tt="uppercase" c="rgba(255, 255, 255, 0.95)" style={{ letterSpacing: "0.5px" }}>
                          Reward Items (Equipment)
                        </Text>
                      </Group>
                      
                      {/* Current Items list panel */}
                      <Paper p="xs" style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }} mb="sm">
                        {rewardItemIds.length === 0 ? (
                          <Text size="xs" c="rgba(255,255,255,0.45)" fs="italic">
                            No equipment items allocated as rewards yet.
                          </Text>
                        ) : (
                          <Group gap="xs">
                            {rewardItemIds.map((itemId) => (
                              <Badge
                                key={itemId}
                                size="sm"
                                variant="outline"
                                color="indigo"
                                pr={3}
                                styles={{
                                  root: {
                                    textTransform: "none",
                                    paddingLeft: "8px",
                                    height: "24px",
                                    background: "rgba(99, 102, 241, 0.05)",
                                    borderColor: "rgba(99, 102, 241, 0.2)",
                                  },
                                }}
                                rightSection={
                                  <ActionIcon
                                    size="10px"
                                    color="red"
                                    variant="subtle"
                                    onClick={() => handleRemoveEquipmentReward(itemId)}
                                    style={{ marginLeft: "4px" }}
                                  >
                                    <IconTrash size={10} />
                                  </ActionIcon>
                                }
                              >
                                <span style={{ color: "white", fontWeight: 600 }}>
                                  {itemIdToNameMap[itemId] || "Resolving..."}
                                </span>
                              </Badge>
                            ))}
                          </Group>
                        )}
                      </Paper>

                      {/* Asynchronous Search Form */}
                      <Paper p="xs" style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <Group align="flex-end" gap="sm" mb={searchedItems.length > 0 ? "xs" : 0}>
                          <TextInput
                            label="Search Master Equipment Repository"
                            placeholder="Type item name (e.g. Sword, Shield, Potion...)"
                            value={itemSearchQuery}
                            onChange={(e) => setItemSearchQuery(e.currentTarget.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleSearchEquipment();
                              }
                            }}
                            style={{ flex: 1 }}
                            styles={{
                              label: { color: "rgba(255, 255, 255, 0.8)", fontSize: "10px", fontWeight: 600 },
                              input: { background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.05)", color: "white", fontSize: "12px", height: "32px" },
                            }}
                          />
                          <Button
                            size="xs"
                            variant="filled"
                            color="indigo"
                            onClick={handleSearchEquipment}
                            loading={searchingItems}
                            leftSection={<IconSearch size={12} />}
                            style={{ height: "32px", fontWeight: 600 }}
                          >
                            Search
                          </Button>
                        </Group>

                        {/* Search Results Display List */}
                        {searchedItems.length > 0 && (
                          <Box
                            p="xs"
                            style={{
                              background: "rgba(0,0,0,0.25)",
                              border: "1px solid rgba(255,255,255,0.05)",
                              borderRadius: "4px",
                              maxHeight: "150px",
                              overflowY: "auto",
                            }}
                          >
                            <Group justify="space-between" mb={6} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", pb: 4 }}>
                              <Text size="10px" fw={700} c="rgba(255,255,255,0.4)" tt="uppercase">Search Results ({searchedItems.length})</Text>
                              <Button
                                size="10px"
                                variant="subtle"
                                onClick={() => setSearchedItems([])}
                                styles={{ root: { height: "16px", padding: 0, color: "rgba(255,255,255,0.4)" } }}
                              >
                                Clear Results
                              </Button>
                            </Group>
                            <Stack gap={4}>
                              {searchedItems.map((item) => {
                                const isAdded = rewardItemIds.includes(item.id || "");
                                return (
                                  <Group key={item.id} justify="space-between" align="center" wrap="nowrap">
                                    <Text size="xs" fw={500} c="white" truncate="end" style={{ flex: 1 }}>
                                      ⚔️ {item.name || "Unnamed Item"}{" "}
                                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                                        ({item.tier || "Unknown Tier"})
                                      </span>
                                    </Text>
                                    <Button
                                      size="10px"
                                      variant={isAdded ? "light" : "filled"}
                                      color={isAdded ? "green" : "indigo"}
                                      onClick={() => !isAdded && handleAddEquipmentReward(item)}
                                      disabled={isAdded}
                                      style={{ height: "20px", fontWeight: 700, padding: "0 8px" }}
                                    >
                                      {isAdded ? "Added" : "+ Add"}
                                    </Button>
                                  </Group>
                                );
                              })}
                            </Stack>
                          </Box>
                        )}
                      </Paper>
                    </Box>

                  </Stack>
                </ScrollArea>
              </Stack>
            ) : (
              <Center style={{ flex: 1 }} py="xl">
                <Stack align="center" gap="sm">
                  <IconBookmark size={32} color="rgba(255,255,255,0.2)" />
                  <Text size="xs" c="rgba(255,255,255,0.45)">
                    Select a quest on the left directory to open its full administrative controls, or create a new quest.
                  </Text>
                </Stack>
              </Center>
            )}
          </Paper>
        </div>
        
      </div>
    </div>
  );
}
