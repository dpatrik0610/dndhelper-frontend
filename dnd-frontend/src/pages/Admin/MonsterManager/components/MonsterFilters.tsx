import { Button, Group, NumberInput, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";

interface MonsterFiltersProps {
  filterName: string;
  setFilterName: Dispatch<SetStateAction<string>>;
  filterType: string;
  setFilterType: Dispatch<SetStateAction<string>>;
  filterNpc: "all" | "npc" | "creature";
  setFilterNpc: Dispatch<SetStateAction<"all" | "npc" | "creature">>;
  filterMinCR?: number;
  setFilterMinCR: Dispatch<SetStateAction<number | undefined>>;
  filterMaxCR?: number;
  setFilterMaxCR: Dispatch<SetStateAction<number | undefined>>;
  onSearch: () => void;
  onReset: () => void;
}

export function MonsterFilters({
  filterName,
  setFilterName,
  filterType,
  setFilterType,
  filterNpc,
  setFilterNpc,
  filterMinCR,
  setFilterMinCR,
  filterMaxCR,
  setFilterMaxCR,
  onSearch,
  onReset,
}: MonsterFiltersProps) {
  return (
    <Group align="flex-end" gap="sm" wrap="wrap">
      <TextInput
        label="Name"
        placeholder="Search name"
        leftSection={<IconSearch size={14} />}
        value={filterName}
        onChange={(e) => setFilterName(e.currentTarget.value)}
        classNames={{ input: "glassy-input" }}
      />
      <TextInput
        label="Type"
        placeholder="e.g. Dragon"
        value={filterType}
        onChange={(e) => setFilterType(e.currentTarget.value)}
        classNames={{ input: "glassy-input" }}
      />
      <Select
        label="NPC filter"
        value={filterNpc}
        onChange={(v) => setFilterNpc((v as "all" | "npc" | "creature") ?? "all")}
        data={[
          { value: "all", label: "All" },
          { value: "npc", label: "Only NPC" },
          { value: "creature", label: "Only creature" },
        ]}
        classNames={{ input: "glassy-input" }}
      />
      <NumberInput
        label="Min CR"
        value={filterMinCR}
        onChange={(value) => setFilterMinCR(typeof value === "number" ? value : undefined)}
        classNames={{ input: "glassy-input" }}
        min={0}
      />
      <NumberInput
        label="Max CR"
        value={filterMaxCR}
        onChange={(value) => setFilterMaxCR(typeof value === "number" ? value : undefined)}
        classNames={{ input: "glassy-input" }}
        min={0}
      />
      <Button variant="outline" onClick={onReset}>
        Reset filters
      </Button>
      <Button leftSection={<IconSearch size={14} />} onClick={onSearch}>
        Search
      </Button>
    </Group>
  );
}
