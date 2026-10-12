import { Button, Group, Select, SegmentedControl, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import type { MonsterSearch } from "@appTypes/Monster";
import { CR_VALUES, crLabel } from "@utils/monster";
import styles from "@styles/AdminCatalog.module.css";

const CR_OPTIONS = CR_VALUES.map((cr) => ({ value: String(cr), label: crLabel(cr) }));
const toCr = (v: string | null) => (v === null ? undefined : Number(v));

interface MonsterFiltersProps {
  query: string;
  onQuery: (query: string) => void;
  filters: MonsterSearch;
  onChange: (patch: Partial<MonsterSearch>) => void;
  types: string[];
  onClear: () => void;
}

/** Search box (debounced by the page) plus type, CR range, NPC and sort. */
export function MonsterFilters({ query, onQuery, filters, onChange, types, onClear }: MonsterFiltersProps) {
  const npc = filters.isNpc === undefined ? "all" : filters.isNpc ? "npc" : "creature";
  const active = !!query || !!filters.type || filters.minCr !== undefined || filters.maxCr !== undefined || filters.isNpc !== undefined;

  return (
    <div className={styles.glassyBox}>
      <Group align="flex-end" gap="sm" wrap="wrap">
        <TextInput
          label="Search"
          placeholder="Name, type or tag…"
          value={query}
          onChange={(e) => onQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          style={{ flex: "2 1 220px" }}
        />
        <Select
          label="Type"
          placeholder="Any"
          data={types}
          value={filters.type ?? null}
          onChange={(v) => onChange({ type: v ?? undefined })}
          searchable
          clearable
          style={{ flex: "1 1 150px" }}
        />
        <Select
          label="Min CR"
          placeholder="0"
          data={CR_OPTIONS}
          value={filters.minCr === undefined ? null : String(filters.minCr)}
          onChange={(v) => onChange({ minCr: toCr(v) })}
          clearable
          w={100}
        />
        <Select
          label="Max CR"
          placeholder="30"
          data={CR_OPTIONS}
          value={filters.maxCr === undefined ? null : String(filters.maxCr)}
          onChange={(v) => onChange({ maxCr: toCr(v) })}
          clearable
          w={100}
        />
        <SegmentedControl
          value={npc}
          onChange={(v) => onChange({ isNpc: v === "all" ? undefined : v === "npc" })}
          data={[
            { label: "All", value: "all" },
            { label: "Creatures", value: "creature" },
            { label: "NPCs", value: "npc" },
          ]}
        />
        <SegmentedControl
          value={`${filters.sortBy ?? "name"}-${filters.desc ? "desc" : "asc"}`}
          onChange={(v) => {
            const [sortBy, dir] = v.split("-");
            onChange({ sortBy: sortBy as "name" | "cr", desc: dir === "desc" });
          }}
          data={[
            { label: "A–Z", value: "name-asc" },
            { label: "CR ↑", value: "cr-asc" },
            { label: "CR ↓", value: "cr-desc" },
          ]}
        />
        <Button variant="subtle" color="red.4" leftSection={<IconX size={14} />} onClick={onClear} disabled={!active}>
          Clear
        </Button>
      </Group>
    </div>
  );
}
