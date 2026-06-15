import { getAuthTokenSafe } from "@store/auth/authUtils";
import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Grid, Button, Modal, Stack, Text, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { getAllEquipment, deleteEquipment } from '@services/equipmentService';
import type { Equipment } from '@appTypes/Equipment/Equipment';
const EquipmentFormModal = lazy(() => import("@components/EquipmentFormModal/EquipmentFormModal").then(m => ({ default: m.EquipmentFormModal })));
import { EquipmentModal } from '@features/inventory/components/EquipmentModal';
import { showNotification } from '@components/Notification/Notification';
import { SectionColor } from '@appTypes/SectionColor';
import FilterControls from './components/FilterControls';
import ItemList from './components/ItemList';
import Pagination from './components/Pagination';
import styles from './ItemManager.module.css';

import { usePagination } from '@mantine/hooks';

export function ItemManager() {
  const [allData, setAllData] = useState<Equipment[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<Equipment[]>([]);
  
  // loading removed as it was unused
  const [filters, setFilters] = useState({ name: '', tier: '', damageType: '', tags: [] as string[], tagsRule: 'any' as 'any' | 'all' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const token = getAuthTokenSafe()!;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / 10));
  const pagination = usePagination({ total: totalPages, page: 1, siblings: 1, boundaries: 1 });

  const loadAllData = useCallback(async () => {
    try {
      const result = await getAllEquipment(token);
      setAllData(result);
      setFilteredData(result);
      const tags = result.flatMap(item => item.tags || []);
      const uniqueTags = [...new Set(tags)];
      setAllTags(uniqueTags);
    } catch (e) {
      console.error('Failed to load equipment:', e);
      showNotification({ title: 'Error', message: 'Failed to load equipment', color: SectionColor.Red });
    }
  }, [token]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    let data = allData;

    if (filters.name) {
      data = data.filter(item => item.name.toLowerCase().includes(filters.name.toLowerCase()));
    }

    if (filters.tier) {
      data = data.filter(item => item.tier === filters.tier);
    }

    if (filters.damageType) {
      data = data.filter(item => item.damage?.damageType.name === filters.damageType);
    }

    if (filters.tags.length > 0) {
      if (filters.tagsRule === 'any') {
        data = data.filter(item => item.tags?.some(tag => filters.tags.includes(tag)));
      } else {
        data = data.filter(item => filters.tags.every(tag => item.tags?.includes(tag)));
      }
    }

    setFilteredData(data);
    pagination.setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, allData]);

  const paginatedData = filteredData.slice((pagination.active - 1) * 10, pagination.active * 10);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    // This is now handled by the useEffect
  };

  const handlePageChange = (page: number) => {
    pagination.setPage(page);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEquipment(deleteId, token);
      loadAllData();
      setDeleteId(null);
      showNotification({ title: 'Deleted', message: 'Item removed', color: SectionColor.Green });
    } catch (error) {
      showNotification({ title: 'Error', message: `Failed to delete ${error}`, color: SectionColor.Red });
    }
  };

  const openModal = (item: Equipment | null) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDetails = (item: Equipment) => {
    setDetailsId(item.id!);
  };

  return (
    <div className={styles.dashboard}>
      <Grid>
        <Grid.Col span={12}>
          <FilterControls filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} allTags={allTags} />
        </Grid.Col>
        <Grid.Col span={12}>
          <Button onClick={() => openModal(null)} leftSection={<IconPlus size={16} />}>
            Add New Item
          </Button>
        </Grid.Col>
        <Grid.Col span={12}>
          <ItemList
            items={paginatedData}
            onEdit={openModal}
            onDelete={(item) => setDeleteId(item.id!)}
            onDetails={handleDetails}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Pagination
            page={pagination.active}
            total={totalPages}
            onChange={handlePageChange}
          />
        </Grid.Col>
      </Grid>

      <Suspense fallback={null}>
        <EquipmentFormModal
          opened={modalOpen}
          initial={editingItem}
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={async () => {
            setModalOpen(false);
            loadAllData();
          }}
          title={editingItem?.id ? 'Edit Item' : 'Create Item'}
        />
      </Suspense>

      <EquipmentModal opened={!!detailsId} onClose={() => setDetailsId(null)} equipmentId={detailsId} />

      <Modal opened={!!deleteId} onClose={() => setDeleteId(null)} title="Delete item?" centered>
        <Stack>
          <Text>Are you sure you want to delete this item?</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
