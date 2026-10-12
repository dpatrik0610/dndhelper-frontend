import { useCallback, useEffect, useState } from "react";
import { ActionIcon, Alert, Button, Center, Group, List, Loader, Pagination, Stack, Text, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertTriangle, IconCloudDownload, IconPlus, IconRefresh, IconSkull } from "@tabler/icons-react";
import type { Monster, MonsterMigrationReport, MonsterSearch } from "@appTypes/Monster";
import { SectionColor } from "@appTypes/SectionColor";
import { monsterService } from "@services/Admin/monsterService";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { showNotification } from "@components/Notification/Notification";
import { AdminPage, AdminPanel } from "@features/admin/components/AdminPage";
import { useIsSuperAdmin } from "@store/auth/authSelectors";
import { MonsterFilters } from "./components/MonsterFilters";
import { MonsterTable } from "./components/MonsterTable";
import { MonsterFormModal } from "./components/MonsterFormModal";
import { MonsterViewModal } from "./components/MonsterViewModal";
import { SrdImportModal } from "./components/SrdImportModal";

const PAGE_SIZE = 25;

export function MonsterManager() {
  const isSuperAdmin = useIsSuperAdmin();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [filters, setFilters] = useState<MonsterSearch>({});
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ items: Monster[]; total: number }>({ items: [], total: 0 });
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Monster | null | undefined>(undefined); // undefined = closed, null = new
  const [viewing, setViewing] = useState<Monster | null>(null);
  const [deleting, setDeleting] = useState<Monster | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [migration, setMigration] = useState<MonsterMigrationReport | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await monsterService.search({ ...filters, query: debouncedQuery.trim() || undefined, page, pageSize: PAGE_SIZE }));
    } catch (err) {
      showNotification({ title: "Couldn't load monsters", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedQuery, page]);

  const loadTypes = useCallback(() => {
    monsterService.types().then(setTypes).catch(() => setTypes([]));
  }, []);

  useEffect(() => void load(), [load]);
  useEffect(loadTypes, [loadTypes]);

  const reload = () => {
    void load();
    loadTypes();
  };

  const changeFilters = (patch: Partial<MonsterSearch>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  // Documents still in the old 5etools shape come back without a name.
  const hasLegacy = result.items.some((m) => !m.name);

  const previewMigration = async () => {
    setBusy(true);
    try {
      setMigration(await monsterService.migrateLegacy(true));
    } catch (err) {
      showNotification({ title: "Dry run failed", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setBusy(false);
    }
  };

  const applyMigration = async () => {
    setBusy(true);
    try {
      const report = await monsterService.migrateLegacy(false);
      showNotification({ title: "Bestiary converted", message: `${report.converted} monsters now use the new stat block.`, color: SectionColor.Green });
      setMigration(null);
      reload();
    } catch (err) {
      showNotification({ title: "Conversion failed", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting?.id) return;
    setBusy(true);
    try {
      await monsterService.delete(deleting.id);
      showNotification({ title: "Deleted", message: `${deleting.name} is gone from the bestiary.`, color: SectionColor.Green });
      setDeleting(null);
      reload();
    } catch (err) {
      showNotification({ title: "Couldn't delete", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setBusy(false);
    }
  };

  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <AdminPage
      icon={IconSkull}
      title="Monsters"
      subtitle="Bestiary: stat blocks, art and NPCs. Art doubles as the tabletop token."
      actions={
        <>
          <Tooltip label="Reload" withArrow>
            <ActionIcon variant="default" size="lg" onClick={reload} loading={loading} aria-label="Reload monsters">
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          {isSuperAdmin && (
            <Button variant="light" leftSection={<IconCloudDownload size={16} />} onClick={() => setImportOpen(true)}>
              Import from SRD
            </Button>
          )}
          <Button color="neon" leftSection={<IconPlus size={16} />} onClick={() => setEditing(null)}>
            New monster
          </Button>
        </>
      }
    >
      {isSuperAdmin && hasLegacy && (
        <Alert color="yellow" icon={<IconAlertTriangle size={18} />} title="Monsters in the old format">
          <Group justify="space-between">
            <Text size="sm">Some monsters still use the old 5etools shape and show up empty. Convert them to the new stat block.</Text>
            <Button size="xs" color="yellow" loading={busy && !migration} onClick={() => void previewMigration()}>
              Review conversion
            </Button>
          </Group>
        </Alert>
      )}

      <MonsterFilters
        query={query}
        onQuery={(q) => {
          setQuery(q);
          setPage(1);
        }}
        filters={filters}
        onChange={changeFilters}
        types={types}
        onClear={() => {
          setQuery("");
          setFilters({});
          setPage(1);
        }}
      />

      <AdminPanel flush title={`${result.total.toLocaleString()} monsters`}>
        {loading && result.items.length === 0 ? (
          <Center p="xl"><Loader size="md" /></Center>
        ) : (
          <MonsterTable monsters={result.items} loading={loading} onView={setViewing} onEdit={setEditing} onDelete={setDeleting} onChanged={reload} />
        )}
      </AdminPanel>

      {pages > 1 && (
        <Group justify="center">
          <Pagination value={page} onChange={setPage} total={pages} size="sm" color="neon" />
        </Group>
      )}

      <MonsterFormModal opened={editing !== undefined} monster={editing ?? null} onClose={() => setEditing(undefined)} onSaved={reload} types={types} />
      <MonsterViewModal monster={viewing} onClose={() => setViewing(null)} />
      <SrdImportModal opened={importOpen} onClose={() => setImportOpen(false)} onImported={reload} />

      <AdminGlassModal opened={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${deleting?.name}?`} variant="danger" size="sm">
        <Stack gap="md">
          <Text size="sm">The stat block is removed from the bestiary. Tokens already on a board stay where they are.</Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleting(null)} disabled={busy}>Cancel</Button>
            <Button color="red" loading={busy} onClick={() => void remove()}>Delete</Button>
          </Group>
        </Stack>
      </AdminGlassModal>

      <AdminGlassModal opened={!!migration} onClose={() => setMigration(null)} title="Convert old monsters" size="md">
        {migration && (
          <Stack gap="sm">
            <Text size="sm">
              <b>{migration.legacy}</b> monsters will be rewritten in place (same id and campaign). {migration.copiesResolved} 5etools copies get
              their parent's stats merged in.
            </Text>
            {migration.missingParents.length > 0 && (
              <>
                <Text size="sm" c="yellow.4">{migration.missingParents.length} copies point at a monster that isn't in your data; they keep only their own fields:</Text>
                <List size="xs" c="dimmed" mah={140} style={{ overflow: "auto" }}>
                  {migration.missingParents.map((m) => <List.Item key={m}>{m}</List.Item>)}
                </List>
              </>
            )}
            {Object.keys(migration.skippedMods).length > 0 && (
              <Text size="xs" c="dimmed">
                Not applied (spell-list tweaks and templates): {Object.entries(migration.skippedMods).map(([k, v]) => `${k} ×${v}`).join(", ")}
              </Text>
            )}
            <Text size="xs" c="red.3">Download a backup from the Backups tab first. Once converted, the old fields are gone.</Text>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => setMigration(null)} disabled={busy}>Cancel</Button>
              <Button color="yellow" loading={busy} onClick={() => void applyMigration()} disabled={migration.legacy === 0}>
                Convert {migration.legacy}
              </Button>
            </Group>
          </Stack>
        )}
      </AdminGlassModal>
    </AdminPage>
  );
}
