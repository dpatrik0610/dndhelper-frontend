import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Stack, Text, Group, SimpleGrid, Title } from "@mantine/core";
import { IconPlus, IconCloudUpload, IconTools, IconAlertCircle } from "@tabler/icons-react";

import { getAllEquipment, deleteEquipment } from "@services/equipmentService";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";

import FilterControls from "./components/FilterControls";
import ItemList from "./components/ItemList";
import Pagination from "./components/Pagination";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";
import { ItemFormModal } from "./components/ItemFormModal";
import { BulkImportModal } from "./components/BulkImportModal";
import styles from "./ItemManager.module.css";

export function ItemManager() {
  const [allData, setAllData] = useState<Equipment[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Equipment[]>([]);

  // Filters State
  const [filters, setFilters] = useState({
    name: "",
    tier: "",
    damageType: "",
    tags: [] as string[],
    tagsRule: "any" as "any" | "all",
  });

  // Modals & Item Selection States
  const [formOpen, setFormOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Load All Equipment
  const loadAllData = useCallback(async () => {
    try {
      const result = await getAllEquipment();
      setAllData(result);
      setFilteredData(result);

      // Extract unique tags
      const tags = result.flatMap((item) => item.tags || []);
      const uniqueTags = Array.from(new Set(tags)).filter(Boolean);
      setAllTags(uniqueTags);
    } catch (e) {
      console.error("Failed to load equipment:", e);
      showNotification({
        title: "Load Error",
        message: "Failed to load equipment list.",
        color: SectionColor.Red,
      });
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Filter logic whenever filters or allData changes
  useEffect(() => {
    let data = allData;

    if (filters.name) {
      const searchStr = filters.name.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchStr) ||
          (item.index && item.index.toLowerCase().includes(searchStr))
      );
    }

    if (filters.tier) {
      data = data.filter((item) => item.tier === filters.tier);
    }

    if (filters.damageType) {
      data = data.filter((item) => item.damage?.damageType?.name === filters.damageType);
    }

    if (filters.tags.length > 0) {
      if (filters.tagsRule === "any") {
        data = data.filter((item) => item.tags?.some((tag) => filters.tags.includes(tag)));
      } else {
        data = data.filter((item) => filters.tags.every((tag) => item.tags?.includes(tag)));
      }
    }

    setFilteredData(data);
    setPage(1); // reset to page 1 on filter
  }, [filters, allData]);

  // Calculate Stat Summaries
  const stats = useMemo(() => {
    let customCount = 0;
    let legendaryOrArtifact = 0;
    let deletedCount = 0;

    allData.forEach((item) => {
      if (item.isCustom) customCount++;
      if (item.tier === "Legendary" || item.tier === "Artifact") legendaryOrArtifact++;
      if (item.isDeleted) deletedCount++;
    });

    return {
      total: allData.length,
      customCount,
      legendaryOrArtifact,
      deletedCount,
    };
  }, [allData]);

  // Sliced paginated list
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, page]);

  // Handles
  const handleClearFilters = () => {
    setFilters({
      name: "",
      tier: "",
      damageType: "",
      tags: [],
      tagsRule: "any",
    });
  };

  const handleDeleteItem = async () => {
    if (!selectedItem?.id) return;
    try {
      await deleteEquipment(selectedItem.id);
      showNotification({
        title: "Deleted",
        message: `Removed "${selectedItem.name}" from the database.`,
        color: SectionColor.Green,
      });
      setDeleteOpen(false);
      setSelectedItem(null);
      loadAllData();
    } catch (err) {
      showNotification({
        title: "Delete Failed",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  const openFormModal = (item: Equipment | null) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  const openDetailsModal = (item: Equipment) => {
    setDetailsId(item.id || null);
  };

  const openDeleteConfirm = (item: Equipment) => {
    setSelectedItem(item);
    setDeleteOpen(true);
  };

  return (
    <div className={styles.dashboard}>
      <Stack gap="xl">
        {/* Header Title Section */}
        <Group justify="space-between" align="center">
          <Group gap="md">
            <IconTools size={32} color="#a855f7" style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.5))" }} />
            <div>
              <Title order={2} style={{ color: "white", textShadow: "0 0 12px rgba(255,255,255,0.15)" }}>
                Item Database & Equipment Manager
              </Title>
              <Text size="xs" c="dimmed">
                Manage visual & custom equipment, view stats block details, and import in bulk.
              </Text>
            </div>
          </Group>

          {/* Action buttons */}
          <Group gap="sm">
            <Button
              className={`${styles.neonButton} ${styles.neonCyan}`}
              leftSection={<IconCloudUpload size={16} />}
              onClick={() => setBulkOpen(true)}
            >
              Bulk Import JSON
            </Button>
            <Button
              className={`${styles.neonButton} ${styles.neonPurple}`}
              leftSection={<IconPlus size={16} />}
              onClick={() => openFormModal(null)}
            >
              Add New Equipment
            </Button>
          </Group>
        </Group>

        {/* Dynamic Glassy Stats Row */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <div className={`${styles.statCard} ${styles.statCardBlue}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Total Equipment</Text>
            <Text size="xl" fw={800} c="white">{stats.total}</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardPurple}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Custom Creations</Text>
            <Text size="xl" fw={800} c="purple.2">{stats.customCount}</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardGold}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Legendary & Artifacts</Text>
            <Text size="xl" fw={800} c="yellow.3">{stats.legendaryOrArtifact}</Text>
          </div>
          <div className={`${styles.statCard} ${styles.statCardRed}`}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>Deleted / Archived</Text>
            <Text size="xl" fw={800} c="red.3">{stats.deletedCount}</Text>
          </div>
        </SimpleGrid>

        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          onFilterChange={setFilters}
          onClear={handleClearFilters}
          allTags={allTags}
        />

        {/* Item Table View */}
        <ItemList
          items={paginatedData}
          onEdit={openFormModal}
          onDelete={openDeleteConfirm}
          onDetails={openDetailsModal}
        />

        {/* Pagination Section */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
          />
        )}
      </Stack>

      {/* Modals Layer */}

      {/* Details View Modal */}
      <EquipmentModal
        opened={!!detailsId}
        onClose={() => setDetailsId(null)}
        equipmentId={detailsId}
      />

      {/* Edit / Create Form Modal */}
      <ItemFormModal
        opened={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={loadAllData}
        item={selectedItem}
      />

      {/* Bulk JSON Import Modal */}
      <BulkImportModal
        opened={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onImported={loadAllData}
      />

      {/* Glassy Delete Confirmation Modal */}
      <AdminGlassModal
        opened={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedItem(null);
        }}
        title={
          <Group gap="xs" align="center">
            <IconAlertCircle size={22} color="#ef4444" />
            <Text size="lg" fw={700}>Archive / Delete Equipment?</Text>
          </Group>
        }
        variant="danger"
        size="md"
      >
        <Stack gap="md" p="xs">
          <Text size="sm">
            Are you sure you want to delete <b style={{ color: "white" }}>{selectedItem?.name}</b>?
          </Text>
          <Text size="xs" c="red.3" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px dashed rgba(239,68,68,0.2)", borderRadius: "4px", padding: "8px" }}>
            Warning: This action will completely remove this item from the default lists. Active character inventories referencing this item might experience sync issues unless marked as custom.
          </Text>

          <Group justify="flex-end" gap="sm" mt="md">
            <Button variant="subtle" onClick={() => { setDeleteOpen(false); setSelectedItem(null); }}>
              Cancel
            </Button>
            <Button
              className={`${styles.neonButton} ${styles.neonRed}`}
              onClick={handleDeleteItem}
            >
              Delete Permanently
            </Button>
          </Group>
        </Stack>
      </AdminGlassModal>
    </div>
  );
}
