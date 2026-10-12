import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Checkbox, Group, Loader, Progress, ScrollArea, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { SrdCredit } from "@components/common/SrdCredit";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { SrdImportResult, SrdMonsterEntry, SrdRuleset } from "@appTypes/Monster";
import { monsterService, SRD_IMPORT_BATCH } from "@services/Admin/monsterService";

type Show = "all" | "new" | "noArt";

/**
 * Superadmin: pick monsters from the official SRD (dnd5eapi.co) and import them into core content,
 * art included (stored in R2). Names already in core aren't duplicated; same-name monsters without art get it.
 */
export function SrdImportModal({ opened, onClose, onImported }: { opened: boolean; onClose: () => void; onImported: () => void }) {
  const [ruleset, setRuleset] = useState<SrdRuleset>("2014");
  const [catalog, setCatalog] = useState<SrdMonsterEntry[] | null>(null);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<Show>("new");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const load = () => {
    setCatalog(null);
    setSelected(new Set());
    monsterService
      .srdCatalog(ruleset)
      .then(setCatalog)
      .catch((err) => {
        setCatalog([]);
        showNotification({ title: "SRD unavailable", message: (err as Error).message, color: SectionColor.Red });
      });
  };

  useEffect(() => {
    if (opened) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on open and ruleset change only
  }, [opened, ruleset]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (catalog ?? []).filter(
      (e) => (show === "all" || (show === "new" ? !e.exists : !e.hasImage)) && (!q || e.name.toLowerCase().includes(q))
    );
  }, [catalog, search, show]);

  const toggle = (key: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const run = async () => {
    const keys = [...selected];
    const total: SrdImportResult = { created: 0, skipped: 0, imagesAdded: 0, failed: [] };
    setProgress({ done: 0, total: keys.length });
    for (let i = 0; i < keys.length; i += SRD_IMPORT_BATCH) {
      const batch = keys.slice(i, i + SRD_IMPORT_BATCH);
      try {
        const r = await monsterService.srdImport(ruleset, batch);
        total.created += r.created;
        total.skipped += r.skipped;
        total.imagesAdded += r.imagesAdded;
        total.failed.push(...r.failed);
      } catch (err) {
        total.failed.push(...batch.map((k) => `${k}: ${(err as Error).message}`));
      }
      setProgress({ done: Math.min(i + SRD_IMPORT_BATCH, keys.length), total: keys.length });
    }
    setProgress(null);
    showNotification({
      title: "SRD import finished",
      message: `${total.created} added, ${total.imagesAdded} existing got art, ${total.skipped} already in core.${
        total.failed.length ? ` ${total.failed.length} failed: ${total.failed.slice(0, 3).join("; ")}` : ""
      }`,
      color: total.failed.length ? SectionColor.Yellow : SectionColor.Green,
    });
    onImported();
    load();
  };

  const busy = progress !== null;

  return (
    <AdminGlassModal opened={opened} onClose={busy ? () => {} : onClose} size="lg" title="Import from the SRD" closeOnClickOutside={!busy}>
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Official System Reference Document monsters via dnd5eapi.co, with art stored in your R2 bucket. They land in core content, shared
          with every campaign that imports core monsters. A name already in core isn't duplicated, and same-name monsters without art
          (in core or a campaign) get the SRD art.
        </Text>
        <SrdCredit versions={ruleset === "2014" ? ["5.1"] : ["5.2"]} />
        <Group gap="sm" wrap="wrap">
          <SegmentedControl
            value={ruleset}
            onChange={(v) => setRuleset(v as SrdRuleset)}
            disabled={busy}
            data={[
              { label: "SRD 5.1 (2014)", value: "2014" },
              { label: "SRD 5.2 (2024)", value: "2024" },
            ]}
          />
          <SegmentedControl
            value={show}
            onChange={(v) => setShow(v as Show)}
            data={[
              { label: "Not in core", value: "new" },
              { label: "Missing art", value: "noArt" },
              { label: "All", value: "all" },
            ]}
          />
        </Group>
        <TextInput placeholder="Filter by name…" leftSection={<IconSearch size={16} />} value={search} onChange={(e) => setSearch(e.currentTarget.value)} />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {catalog ? `${shown.length} shown · ${selected.size} selected` : "Loading the SRD…"}
          </Text>
          <Group gap="xs">
            <Button size="xs" variant="subtle" disabled={busy || shown.length === 0}
              onClick={() => setSelected((s) => new Set([...s, ...shown.map((e) => e.key)]))}>
              Select shown
            </Button>
            <Button size="xs" variant="subtle" disabled={busy || selected.size === 0} onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </Group>
        </Group>

        <ScrollArea h={360} type="auto">
          {!catalog ? (
            <Group justify="center" p="xl"><Loader size="sm" /></Group>
          ) : (
            <Stack gap={4}>
              {shown.map((e) => (
                <Group key={e.key} justify="space-between" wrap="nowrap" pr="sm">
                  <Checkbox label={e.name} checked={selected.has(e.key)} onChange={() => toggle(e.key)} disabled={busy} />
                  <Group gap={4}>
                    {e.exists && <Badge size="xs" variant="light" color="gray">In core</Badge>}
                    {!e.hasImage && <Badge size="xs" variant="light" color="yellow">Missing art</Badge>}
                  </Group>
                </Group>
              ))}
              {shown.length === 0 && <Text ta="center" c="dimmed" p="lg">Nothing here.</Text>}
            </Stack>
          )}
        </ScrollArea>

        {progress && <Progress value={(progress.done / progress.total) * 100} animated />}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={busy}>Close</Button>
          <Button color="neon" onClick={() => void run()} loading={busy} disabled={selected.size === 0}>
            Import {selected.size || ""}
          </Button>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
}
