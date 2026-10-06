import { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Stack, Text, Group, SimpleGrid } from "@mantine/core";
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
import { AdminPage, AdminStat } from "@features/admin/components/AdminPage";

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
    <AdminPage
      icon={IconTools}
      title="Items"
      subtitle="Equipment database: custom items, stat blocks and bulk import."
      actions={
        <>
          <Button variant="light" color="electric" leftSection={<IconCloudUpload size={16} />} onClick={() => setBulkOpen(true)}>
            Bulk import JSON
          </Button>
          <Button color="neon" leftSection={<IconPlus size={16} />} onClick={() => openFormModal(null)}>
            New equipment
          </Button>
        </>
      }
    >
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
        <AdminStat label="Total equipment" value={stats.total} tone="tertiary" />
        <AdminStat label="Custom creations" value={stats.customCount} tone="secondary" />
        <AdminStat label="Legendary & artifacts" value={stats.legendaryOrArtifact} tone="warning" />
        <AdminStat label="Deleted / archived" value={stats.deletedCount} tone="danger" />
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
        onChanged={() => void loadAllData()}
      />

      {/* Pagination Section */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          total={totalPages}
          onChange={setPage}
        />
      )}

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
            <Button color="red" onClick={handleDeleteItem}>
              Delete Permanently
            </Button>
          </Group>
        </Stack>
      </AdminGlassModal>
    </AdminPage>
  );
}
