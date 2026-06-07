
import { useState, useEffect, useCallback } from 'react';
import { Grid, Button, Modal, Stack, Text, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useAuthStore } from '@store/auth/authStore';
import { getAllPaginatedEquipment, deleteEquipment } from '@services/equipmentService';
import type { Equipment } from '@appTypes/Equipment/Equipment';
import type { PagedResult } from '@appTypes/PagedResult';
import { EquipmentFormModal } from '@components/EquipmentFormModal/EquipmentFormModal';
import { EquipmentModal } from '@features/inventory/components/EquipmentModal';
import { showNotification } from '@components/Notification/Notification';
import { SectionColor } from '@appTypes/SectionColor';
import FilterControls from './components/FilterControls';
import ItemList from './components/ItemList';
import Pagination from './components/Pagination';
import styles from './ItemManager.module.css';

export function ItemManager() {
  const [data, setData] = useState<PagedResult<Equipment>>({ items: [], totalItems: 0, page: 1, pageSize: 10 });
  const [, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name: '', tag: '', tier: '', damageType: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const token = useAuthStore.getState().token!;

  const loadData = useCallback(async (page: number, currentFilters: typeof filters) => {
    setLoading(true);
    console.log('Loading Data', { page, filters: currentFilters });
    try {
      const result = await getAllPaginatedEquipment(
        page,
        10,
        currentFilters.tag,
        currentFilters.tier,
        currentFilters.damageType,
        currentFilters.name,
        token
      );
      setData(result);
    } catch (e) {
      console.error('Failed to load equipment:', e);
      showNotification({ title: 'Error', message: 'Failed to load equipment', color: SectionColor.Red });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData(1, appliedFilters);
  }, [appliedFilters, loadData]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    console.log('Search Applied', filters);
  };

  const handlePageChange = (page: number) => {
    loadData(page, appliedFilters);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteEquipment(deleteId, token);
      loadData(data.page, appliedFilters);
      setDeleteId(null);
      showNotification({ title: 'Deleted', message: 'Item removed', color: SectionColor.Green });
    } catch (e) {
      showNotification({ title: 'Error', message: 'Failed to delete', color: SectionColor.Red });
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
          <FilterControls filters={filters} onFilterChange={handleFilterChange} onSearch={handleSearch} />
        </Grid.Col>
        <Grid.Col span={12}>
          <Button onClick={() => openModal(null)} leftSection={<IconPlus size={16} />}>
            Add New Item
          </Button>
        </Grid.Col>
        <Grid.Col span={12}>
          <ItemList
            items={data.items}
            onEdit={(item) => openModal(item)}
            onDelete={(item) => setDeleteId(item.id!)}
            onDetails={handleDetails}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Pagination
            page={data.page}
            total={Math.ceil(data.totalItems / data.pageSize)}
            onChange={handlePageChange}
          />
        </Grid.Col>
      </Grid>

      <EquipmentFormModal
        opened={modalOpen}
        initial={editingItem}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={async () => {
          setModalOpen(false);
          loadData(data.page, appliedFilters);
        }}
        title={editingItem?.id ? 'Edit Item' : 'Create Item'}
      />

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
