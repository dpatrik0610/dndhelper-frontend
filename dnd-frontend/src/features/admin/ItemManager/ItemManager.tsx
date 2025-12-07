import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Skeleton,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconPlus, IconRefresh, IconSearch, IconTrash, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAdminEquipmentStore } from "@store/admin/useAdminEquipmentStore";
import { EQUIPMENT_TIERS, type Equipment } from "../../../types/Equipment/Equipment";
import { EquipmentFormModal } from "../../../components/admin/EquipmentFormModal";
import { ImportModal } from "./components/ImportModal";
import { useItemFilters } from "./components/useItemFilters";

export function ItemManager() {
  const { equipments, loading, loadAll, searchByName, create, update, remove } = useAdminEquipmentStore();
  const { draft, applied, setDraft, apply, reset, filterItems } = useItemFilters();
  const [searchDraft, setSearchDraft] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importPayload, setImportPayload] = useState("");
  const [importError, setImportError] = useState("");
  const [tagDraft, setTagDraft] = useState("");

  useEffect(() => {
    if (!equipments.length) void loadAll();
  }, [equipments.length, loadAll]);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowSkeleton(true), 150);
      return () => clearTimeout(timer);
    }
    setShowSkeleton(false);
  }, [loading]);

  const quickStats = {
    total: equipments.length,
    custom: equipments.filter((e) => e.isCustom).length,
  };

  const applyFilters = async () => {
    const term = searchDraft.trim();
    apply({ search: term });

    if (!term) {
      await loadAll();
      return;
    }
    await searchByName(term);
  };

  const resetFilters = () => {
    reset();
    setSearchDraft("");
    void loadAll();
  };

  const handleSave = async (item: Equipment) => {
    setSaving(true);
    if (item.id) {
      await update(item);
    } else {
      await create(item);
    }
    setSaving(false);
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    await remove(deleteId);
    setSaving(false);
    setDeleteId(null);
  };

  const filteredEquipments = filterItems(equipments);

  const rows = filteredEquipments.map((eq) => (
    <Table.Tr key={eq.id ?? eq.index}>
      <Table.Td>
        <Text fw={600}>{eq.name}</Text>
        <Text size="xs" c="dimmed">
          {eq.index}
        </Text>
      </Table.Td>
      <Table.Td>{eq.tier ?? "Unspecified"}</Table.Td>
      <Table.Td>{eq.damage?.damageDice ? `${eq.damage.damageDice} ${eq.damage.damageType?.name ?? ""}` : "-"}</Table.Td>
      <Table.Td>{eq.weight ?? 0}</Table.Td>
      <Table.Td>
        <Group gap={4} wrap="wrap">
          {(eq.tags ?? []).length
            ? (eq.tags ?? []).map((tag) => (
                <Badge key={tag} size="xs" variant="outline" color="grape">
                  {tag}
                </Badge>
              ))
            : <Text size="xs" c="dimmed">No tags</Text>}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" color="grape" onClick={() => { setEditingItem(eq); setModalOpen(true); }}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" onClick={() => eq.id && setDeleteId(eq.id)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const skeletonRows = Array.from({ length: 5 }, (_, idx) => (
    <Table.Tr key={`skeleton-${idx}`}>
      <Table.Td><Skeleton height={12} radius="sm" /></Table.Td>
      <Table.Td><Skeleton height={12} radius="sm" width="60%" /></Table.Td>
      <Table.Td><Skeleton height={12} radius="sm" width="70%" /></Table.Td>
      <Table.Td><Skeleton height={12} radius="sm" width="40%" /></Table.Td>
      <Table.Td><Skeleton height={12} radius="sm" width="80%" /></Table.Td>
      <Table.Td><Skeleton height={12} radius="sm" width="50%" /></Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2} c="grape.0">Item Manager</Title>
          <Text c="dimmed" size="sm">Create, edit, and remove equipment items.</Text>
        </div>
        <Group gap="xs">
          <Tooltip label="Reload">
            <ActionIcon size="lg" variant="filled" color="grape" onClick={() => void loadAll()} loading={loading}>
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          <Button leftSection={<IconPlus size={14} />} onClick={() => { setEditingItem(null); setModalOpen(true); }}>
            Add item
          </Button>
          <Button variant="outline" color="teal" onClick={() => setImportOpen(true)}>
            Import JSON
          </Button>
        </Group>
      </Group>

      <Group gap="md">
        <Paper
          withBorder
          p="sm"
          style={{
            background: "rgba(40, 0, 80, 0.3)",
            border: "1px solid rgba(160, 100, 255, 0.4)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Text size="xs" c="dimmed">Total</Text>
          <Title order={4}>{quickStats.total}</Title>
        </Paper>
        <Paper
          withBorder
          p="sm"
          style={{
            background: "rgba(0, 40, 80, 0.25)",
            border: "1px solid rgba(100, 200, 255, 0.35)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Text size="xs" c="dimmed">Custom</Text>
          <Title order={4}>{quickStats.custom}</Title>
        </Paper>
      </Group>

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(20,0,40,0.35)",
          border: "1px solid rgba(150, 80, 255, 0.3)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Stack gap="sm">
          <Group gap="sm">
            <TextInput
              placeholder="Search by name..."
              leftSection={<IconSearch size={14} />}
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void applyFilters();
                }
              }}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
              style={{ flex: 1 }}
            />
            <Button variant="light" color="grape" onClick={() => void applyFilters()} loading={loading}>
              Search
            </Button>
            <Button variant="subtle" onClick={resetFilters}>
              Reset
            </Button>
          </Group>

          <Divider label="Filters" labelPosition="center" />

          <Group gap="sm" wrap="wrap" align="flex-end">
            <Group align="flex-end" gap="sm" style={{ flex: 1, minWidth: "240px" }}>
              <TextInput
                label="Tag filters"
                placeholder="Add tag and click +"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.currentTarget.value)}
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                style={{ flex: 1 }}
              />
              <Button
                variant="outline"
                color="grape"
                onClick={() => {
                  const clean = tagDraft.trim();
                  if (!clean) return;
                  if (draft.tags.includes(clean)) {
                    setTagDraft("");
                    return;
                  }
                  setDraft((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
                  setTagDraft("");
                }}
              >
                Add
              </Button>
            </Group>

            <TextInput
              label="Damage"
              placeholder="1d8 or slashing"
              value={draft.damage}
              onChange={(e) => {
                const value = e.currentTarget?.value ?? "";
                setDraft((prev) => ({ ...prev, damage: value }));
              }}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
              style={{ flex: 1, minWidth: "200px" }}
            />

            <Select
              label="Tier"
              placeholder="Select tier"
              data={EQUIPMENT_TIERS.map((t) => ({ value: t, label: t }))}
              value={draft.tier || null}
              onChange={(v) => setDraft((prev) => ({ ...prev, tier: v ?? "" }))}
              clearable
              searchable
              classNames={{ input: "glassy-input", label: "glassy-label" }}
              style={{ flex: 1, minWidth: "180px" }}
            />

            <Button variant="outline" color="grape" onClick={applyFilters} style={{ minWidth: "120px" }}>
              Apply filters
            </Button>
          </Group>

          {applied.tags.length > 0 && (
            <Group gap="xs">
              {applied.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="gradient"
                  gradient={{ from: "grape", to: "violet" }}
                  rightSection={
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
                        apply({ tags: applied.tags.filter((t) => t !== tag) });
                      }}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  }
                >
                  {tag}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Paper>

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(15,0,30,0.4)",
          border: "1px solid rgba(120, 80, 200, 0.35)",
          backdropFilter: "blur(10px)",
        }}
      >
        <ScrollArea type="hover">
          <Table
            verticalSpacing="xs"
            highlightOnHover
            styles={{
              tr: {
                transition: "background-color 120ms ease, box-shadow 120ms ease",
                "&[data-hovered]": {
                  background: "linear-gradient(90deg, rgba(120, 80, 200, 0.12), rgba(80, 120, 200, 0.12))",
                  boxShadow: "inset 0 0 0 1px rgba(150, 120, 255, 0.25)",
                },
              },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Tier</Table.Th>
                <Table.Th>Damage</Table.Th>
                <Table.Th>Weight</Table.Th>
                <Table.Th>Tags</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{showSkeleton || loading ? skeletonRows : rows}</Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <EquipmentFormModal
        opened={modalOpen}
        saving={saving}
        initial={editingItem}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={async (item) => handleSave(item)}
        title={editingItem?.id ? "Edit Item" : "Create Item"}
        submitLabel={editingItem?.id ? "Save changes" : "Create item"}
      />

      <ImportModal
        opened={importOpen}
        payload={importPayload}
        error={importError}
        saving={saving}
        onChangePayload={setImportPayload}
        onError={setImportError}
        onClose={() => setImportOpen(false)}
        onImported={loadAll}
      />

      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete item?"
        centered
        overlayProps={{ blur: 6, color: "rgba(0,0,0,0.4)" }}
      >
        <Stack gap="sm">
          <Text>Are you sure you want to delete this item?</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button color="red" leftSection={<IconTrash size={14} />} loading={saving} onClick={() => void handleDelete()}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
