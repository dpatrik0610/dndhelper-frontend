import {
  ActionIcon,
  Button,
  Group,
  Pagination,
  Stack,
  Text,
  Title,
  Tooltip,
  SimpleGrid,
  Loader,
  Center,
} from "@mantine/core";
import {
  IconPlus,
  IconRefresh,
  IconSkull,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { Monster } from "@appTypes/Monster";
import { MonsterFilters } from "./components/MonsterFilters";
import { MonsterTable } from "./components/MonsterTable";
import { MonsterFormModal } from "./components/MonsterFormModal";
import { MonsterViewModal } from "./components/MonsterViewModal";
import { monsterService } from "@services/Admin/monsterService";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import styles from "./MonsterManager.module.css";

export function MonsterManager() {
  const [allData, setAllData] = useState<Monster[]>([]);
  const [filteredData, setFilteredData] = useState<Monster[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Text inputs local search states for "work on enter"
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

  // Filters state
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    npcFilter: "all" as "all" | "npc" | "creature",
    minCR: undefined as number | undefined,
    maxCR: undefined as number | undefined,
    tags: [] as string[],
    tagsRule: "any" as "any" | "all",
  });

  // Modal and Selection States
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMonster, setSelectedItem] = useState<Monster | null>(null);
  const [viewMonster, setViewMonster] = useState<Monster | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Load All Monsters from bestiary
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await monsterService.getAll();
      setAllData(result);
      setFilteredData(result);

      // Extract unique tags
      const tagsList = result.flatMap((m) => m.type?.tags || []);
      const uniqueTags = Array.from(new Set(tagsList)).filter(Boolean);
      setAllTags(uniqueTags);
    } catch (e) {
      console.error("Failed to load monsters:", e);
      showNotification({
        title: "Load Error",
        message: "Failed to load bestiary record stream.",
        color: SectionColor.Red,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Apply filters reactively when non-text filters update, or manually for text inputs
  useEffect(() => {
    let data = allData;

    if (filters.name) {
      const searchStr = filters.name.toLowerCase();
      data = data.filter((m) => m.name && m.name.toLowerCase().includes(searchStr));
    }

    if (filters.type) {
      const typeStr = filters.type.toLowerCase();
      data = data.filter((m) => m.type?.type && m.type.type.toLowerCase().includes(typeStr));
    }

    if (filters.npcFilter !== "all") {
      data = data.filter((m) => (filters.npcFilter === "npc" ? m.isNpc : !m.isNpc));
    }

    if (filters.minCR !== undefined) {
      data = data.filter((m) => m.cr !== undefined && m.cr >= filters.minCR!);
    }

    if (filters.maxCR !== undefined) {
      data = data.filter((m) => m.cr !== undefined && m.cr <= filters.maxCR!);
    }

    if (filters.tags.length > 0) {
      if (filters.tagsRule === "any") {
        data = data.filter((m) => m.type?.tags?.some((tag) => filters.tags.includes(tag)));
      } else {
        data = data.filter((m) => filters.tags.every((tag) => m.type?.tags?.includes(tag)));
      }
    }

    setFilteredData(data);
    setPage(1); // reset to page 1 on filter trigger
  }, [filters, allData]);

  // Stats derived from entire unfiltered dataset
  const stats = useMemo(() => {
    let npcsCount = 0;
    let bossesCount = 0;
    let customCount = 0;

    allData.forEach((m) => {
      if (m.isNpc) npcsCount++;
      if (m.cr !== undefined && m.cr >= 10) bossesCount++;
      if (m.createdByUserId) customCount++;
    });

    return {
      total: allData.length,
      npcs: npcsCount,
      bosses: bossesCount,
      custom: customCount,
    };
  }, [allData]);

  // Sliced paginated view list
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  // Apply Name & Type text filters on Enter key trigger
  const handleApplyTextFilters = () => {
    setFilters((prev) => ({
      ...prev,
      name: nameInput.trim(),
      type: typeInput.trim(),
    }));
  };

  const handleClearFilters = () => {
    setNameInput("");
    setTypeInput("");
    setFilters({
      name: "",
      type: "",
      npcFilter: "all",
      minCR: undefined,
      maxCR: undefined,
      tags: [],
      tagsRule: "any",
    });
  };

  const openFormModal = (monster: Monster | null) => {
    setSelectedItem(monster);
    setFormOpen(true);
  };

  const openDeleteConfirm = (monster: Monster) => {
    setSelectedItem(monster);
    setDeleteId(monster.id || null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await monsterService.delete(deleteId);
      showNotification({
        title: "Banishment Successful",
        message: `Successfully purged "${selectedMonster?.name}" from bestiary index.`,
        color: SectionColor.Green,
      });
      setDeleteId(null);
      setSelectedItem(null);
      loadAllData();
    } catch (err) {
      showNotification({
        title: "Purge Failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Stack gap="xl">
        {/* Header Title Section */}
        <Group justify="space-between" align="center">
          <Group gap="md">
            <IconSkull size={32} color="#ef4444" style={{ filter: "drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))" }} />
            <div>
              <Title order={2} style={{ color: "white", textShadow: "0 0 12px rgba(255,255,255,0.15)" }}>
                Bestiary & Monster Manager
              </Title>
              <Text size="xs" c="dimmed">
                Manage visual & custom creatures, NPC sheets, perception attributes, and combat stats.
              </Text>
            </div>
          </Group>

          {/* Action buttons */}
          <Group gap="sm">
            <Tooltip label="Reload bestiary list" withArrow>
              <ActionIcon
                className={`${styles.neonButton} ${styles.neonGray}`}
                size="lg"
                onClick={loadAllData}
                loading={loading}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              className={`${styles.neonButton} ${styles.neonRed}`}
              leftSection={<IconPlus size={16} />}
              onClick={() => openFormModal(null)}
            >
              Add New Monster
            </Button>
          </Group>
        </Group>

        {/* Dynamic Glassy Stats Row */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <div className={`${styles.statCard} ${styles.statCardRed}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Total Bestiary</Text>
            <Text size="xl" fw={800} c="white">{stats.total}</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardOrange}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>NPC Records</Text>
            <Text size="xl" fw={800} c="orange.2">{stats.npcs}</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardGold}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Bosses (CR 10+)</Text>
            <Text size="xl" fw={800} c="yellow.3">{stats.bosses}</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardGray}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Custom Creations</Text>
            <Text size="xl" fw={800} c="slate.2">{stats.custom}</Text>
          </div>
        </SimpleGrid>

        {/* Filter Controls */}
        <MonsterFilters
          nameInput={nameInput}
          setNameInput={setNameInput}
          typeInput={typeInput}
          setTypeInput={setTypeInput}
          npcFilter={filters.npcFilter}
          setNpcFilter={(val) => setFilters((prev) => ({ ...prev, npcFilter: val }))}
          minCR={filters.minCR}
          setMinCR={(val) => setFilters((prev) => ({ ...prev, minCR: val }))}
          maxCR={filters.maxCR}
          setMaxCR={(val) => setFilters((prev) => ({ ...prev, maxCR: val }))}
          tags={filters.tags}
          setTags={(val) => setFilters((prev) => ({ ...prev, tags: val }))}
          tagsRule={filters.tagsRule}
          setTagsRule={(val) => setFilters((prev) => ({ ...prev, tagsRule: val }))}
          allTags={allTags}
          onApplyFilters={handleApplyTextFilters}
          onClear={handleClearFilters}
        />

        {/* Loading Indicator or Monster Table View */}
        {loading ? (
          <Center p="xl">
            <Loader color="red" size="md" />
          </Center>
        ) : (
          <div className={styles.glassyBox}>
            <MonsterTable
              monsters={paginatedData}
              loading={loading}
              saving={saving}
              deleteId={deleteId}
              onView={(m) => setViewMonster(m)}
              onEdit={openFormModal}
              onDelete={openDeleteConfirm}
            />
          </div>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className={styles.glassyBox}>
            <Group justify="center">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                size="sm"
                radius="md"
                styles={{
                  control: {
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "rgba(255, 255, 255, 0.75)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "rgba(239, 68, 68, 0.1)",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      color: "#fca5a5",
                      transform: "translateY(-1px)",
                    },
                    "&[data-active]": {
                      background: "rgba(239, 68, 68, 0.35) !important",
                      borderColor: "rgba(239, 68, 68, 0.6) !important",
                      color: "#fee2e2 !important",
                      boxShadow: "0 0 10px rgba(239, 68, 68, 0.4)",
                    },
                  },
                }}
              />
            </Group>
          </div>
        )}
      </Stack>

      {/* Form Dialog Modal */}
      <MonsterFormModal
        opened={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={loadAllData}
        monster={selectedMonster}
      />

      {/* Detailed Stats View Modal */}
      <MonsterViewModal monster={viewMonster} onClose={() => setViewMonster(null)} />

      {/* Glassy Delete Confirmation Modal */}
      <AdminGlassModal
        opened={!!deleteId}
        onClose={() => {
          setDeleteId(null);
          setSelectedItem(null);
        }}
        title={
          <Group gap="xs" align="center">
            <IconAlertCircle size={22} color="#ef4444" />
            <Text size="lg" fw={700}>Ban / Purge Monster from Bestiary?</Text>
          </Group>
        }
        variant="danger"
        size="md"
      >
        <Stack gap="md" p="xs">
          <Text size="sm">
            Are you sure you want to banish <b style={{ color: "white" }}>{selectedMonster?.name}</b> from the database?
          </Text>
          <Text size="xs" c="red.3" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px dashed rgba(239,68,68,0.2)", borderRadius: "4px", padding: "8px" }}>
            Warning: This action will completely purge this record from default bestiary lists. Active sessions or encounter rooms referencing this creature might lose sync context.
          </Text>

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" onClick={() => { setDeleteId(null); setSelectedItem(null); }} disabled={saving}>
              Cancel
            </Button>
            <Button
              className={`${styles.neonButton} ${styles.neonRed}`}
              loading={saving}
              onClick={handleDelete}
            >
              Purge Permanently
            </Button>
          </Group>
        </Stack>
      </AdminGlassModal>
    </div>
  );
}
