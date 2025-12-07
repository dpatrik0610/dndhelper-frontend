import { ActionIcon, Button, Center, Group, Modal, Paper, Pagination, Stack, Text, Title, Tooltip } from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import type { Monster } from "../../../types/Monster";
import { MonsterFilters } from "./components/MonsterFilters";
import { MonsterTable } from "./components/MonsterTable";
import { MonsterFormModal } from "./components/MonsterFormModal";
import { MonsterViewModal } from "./components/MonsterViewModal";
import { useAdminMonsterStore } from "@store/admin/useAdminMonsterStore";

export function MonsterManager() {
  const {
    monsters,
    total,
    page,
    pageSize,
    loading,
    filters,
    npcFilter,
    setFilters,
    setNpcFilter,
    applyFilters,
    resetFilters,
    loadMonsters,
    createMonster,
    updateMonster,
    deleteMonster,
  } = useAdminMonsterStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formMonster, setFormMonster] = useState<Monster>({
    name: "",
    cr: undefined,
    isNpc: false,
    type: { type: "", tags: [] },
    source: "",
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMonster, setViewMonster] = useState<Monster | null>(null);

  useEffect(() => {
    void loadMonsters({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(
    () => ({
      total,
      npcs: monsters.filter((m) => m.isNpc).length,
    }),
    [monsters, total]
  );

  const startCreate = () => {
    setIsEditing(false);
    setFormMonster({
      name: "",
      cr: undefined,
      isNpc: false,
      type: { type: "", tags: [] },
      source: "",
    });
    setModalOpen(true);
  };

  const startEdit = (monster: Monster) => {
    setIsEditing(true);
    setFormMonster({
      ...monster,
      type: monster.type ?? { type: "", tags: [] },
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formMonster.name?.trim()) return;
    setSaving(true);
    try {
      if (isEditing && formMonster.id) {
        await updateMonster(formMonster.id, formMonster);
      } else {
        await createMonster(formMonster);
      }
      setModalOpen(false);
      void loadMonsters({ page: 1 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await deleteMonster(id);
      void loadMonsters({ page: 1 });
    } finally {
      setSaving(false);
      setDeleteId(null);
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2} c="red.2">Monster Manager</Title>
          <Text c="dimmed" size="sm">Admin-only view of monsters</Text>
        </div>
        <Tooltip label="Reload">
          <ActionIcon
            size="lg"
            variant="filled"
            color="red"
            onClick={() => void loadMonsters()}
            loading={loading}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Group gap="md">
        <Paper
          withBorder
          p="sm"
          style={{
            background: "rgba(40,0,0,0.35)",
            border: "1px solid rgba(255,80,80,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Text size="sm" c="dimmed">Total</Text>
          <Title order={4}>{totals.total}</Title>
        </Paper>
        <Paper
          withBorder
          p="sm"
          style={{
            background: "rgba(20,20,0,0.35)",
            border: "1px solid rgba(255,180,80,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Text size="sm" c="dimmed">NPCs</Text>
          <Title order={4}>{totals.npcs}</Title>
        </Paper>
      </Group>

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(20,0,0,0.25)",
          border: "1px solid rgba(255,80,80,0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        <MonsterFilters
          filterName={filters.name ?? ""}
          setFilterName={(v) => setFilters({ name: typeof v === "function" ? v(filters.name ?? "") : v })}
          filterType={filters.type ?? ""}
          setFilterType={(v) => setFilters({ type: typeof v === "function" ? v(filters.type ?? "") : v })}
          filterNpc={npcFilter}
          setFilterNpc={(v) => setNpcFilter(typeof v === "function" ? v(npcFilter) : v)}
          filterMinCR={filters.minCR}
          setFilterMinCR={(v) => setFilters({ minCR: typeof v === "function" ? v(filters.minCR) : v })}
          filterMaxCR={filters.maxCR}
          setFilterMaxCR={(v) => setFilters({ maxCR: typeof v === "function" ? v(filters.maxCR) : v })}
          onReset={() => void resetFilters()}
          onSearch={() => void applyFilters()}
        />

        <Button leftSection={<IconPlus size={14} />} mt="sm" onClick={startCreate}>
          Add monster
        </Button>
      </Paper>

      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(15,0,0,0.25)",
          border: "1px solid rgba(255,60,60,0.35)",
          backdropFilter: "blur(10px)",
        }}
      >
        <MonsterTable
          monsters={monsters}
          loading={loading}
          saving={saving}
          deleteId={deleteId}
          onView={(m) => setViewMonster(m)}
          onEdit={startEdit}
          onDelete={(id) => setDeleteId(id)}
        />
      </Paper>

      <Center>
        <Pagination
          value={page}
          onChange={(p) => void loadMonsters({ page: p })}
          total={Math.max(1, Math.ceil((total || 0) / pageSize))}
          size="sm"
          radius="md"
          styles={{
            control: {
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "white",
            },
          }}
        />
      </Center>

      <MonsterFormModal
        opened={modalOpen}
        isEditing={isEditing}
        saving={saving}
        monster={formMonster}
        onChange={(fn) => setFormMonster((prev) => fn(prev))}
        onClose={() => setModalOpen(false)}
        onSubmit={() => void handleSave()}
      />

      <MonsterViewModal monster={viewMonster} onClose={() => setViewMonster(null)} />

      <Modal
        opened={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm delete"
        centered
        overlayProps={{ blur: 6, color: "rgba(0,0,0,0.35)" }}
        styles={{
          content: {
            background: "rgba(30, 0, 0, 0.55)",
            border: "1px solid rgba(255, 100, 100, 0.4)",
            backdropFilter: "blur(10px)",
          },
          header: { background: "transparent", borderBottom: "none" },
        }}
      >
        <Stack gap="md">
          <Text>Are you sure you want to delete this monster?</Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={saving}
              onClick={() => deleteId && void handleDelete(deleteId)}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
