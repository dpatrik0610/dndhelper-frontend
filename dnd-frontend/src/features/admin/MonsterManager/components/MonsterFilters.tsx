import React from "react";
import { Select, TextInput, NumberInput, Button, Group, MultiSelect, SegmentedControl, Divider, Title, Stack, Text } from "@mantine/core";
import { IconSearch, IconX, IconFilter, IconTags } from "@tabler/icons-react";
import styles from "../MonsterManager.module.css";

interface MonsterFiltersProps {
  nameInput: string;
  setNameInput: (v: string) => void;
  typeInput: string;
  setTypeInput: (v: string) => void;
  npcFilter: "all" | "npc" | "creature";
  setNpcFilter: (v: "all" | "npc" | "creature") => void;
  minCR: number | undefined;
  setMinCR: (v: number | undefined) => void;
  maxCR: number | undefined;
  setMaxCR: (v: number | undefined) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  tagsRule: "any" | "all";
  setTagsRule: (v: "any" | "all") => void;
  allTags: string[];
  onApplyFilters: () => void;
  onClear: () => void;
}

export const MonsterFilters: React.FC<MonsterFiltersProps> = ({
  nameInput,
  setNameInput,
  typeInput,
  setTypeInput,
  npcFilter,
  setNpcFilter,
  minCR,
  setMinCR,
  maxCR,
  setMaxCR,
  tags,
  setTags,
  tagsRule,
  setTagsRule,
  allTags,
  onApplyFilters,
  onClear,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onApplyFilters();
    }
  };

  const hasActiveFilters =
    !!nameInput ||
    !!typeInput ||
    npcFilter !== "all" ||
    minCR !== undefined ||
    maxCR !== undefined ||
    tags.length > 0;

  return (
    <div className={`${styles.glassyBox} ${styles.glassyBoxHover}`}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconFilter size={18} color="#ef4444" style={{ filter: "drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))" }} />
            <Title order={4} style={{ color: "white", letterSpacing: "0.5px" }}>
              Filter & Search Bestiary
            </Title>
          </Group>
          <Button
            size="xs"
            variant="subtle"
            color="red.4"
            leftSection={<IconX size={14} />}
            onClick={onClear}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </Button>
        </Group>

        <Group align="flex-end" gap="md" style={{ flexWrap: "wrap" }}>
          {/* Name Search */}
          <TextInput
            placeholder="Search name (press Enter)..."
            label="Monster Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            leftSection={<IconSearch size={16} color="rgba(255,255,255,0.4)" />}
            style={{ flexGrow: 2, minWidth: "220px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />

          {/* Type Search */}
          <TextInput
            placeholder="Search type (press Enter)..."
            label="Monster Type"
            value={typeInput}
            onChange={(e) => setTypeInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            style={{ flexGrow: 1, minWidth: "150px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />

          {/* NPC Filter */}
          <Select
            label="NPC Classification"
            value={npcFilter}
            onChange={(v) => setNpcFilter((v as "all" | "npc" | "creature") ?? "all")}
            data={[
              { value: "all", label: "All Records" },
              { value: "npc", label: "NPCs Only" },
              { value: "creature", label: "Creatures Only" },
            ]}
            style={{ flexGrow: 1, minWidth: "150px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
              dropdown: { background: "rgba(20,12,12,0.95)", border: "1px solid rgba(255,255,255,0.1)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />
        </Group>

        <Group align="flex-end" gap="md" style={{ flexWrap: "wrap" }}>
          {/* CR Bounds */}
          <NumberInput
            label="Min CR"
            placeholder="0"
            value={minCR}
            onChange={(val) => setMinCR(typeof val === "number" ? val : undefined)}
            min={0}
            style={{ flexGrow: 1, minWidth: "100px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />

          <NumberInput
            label="Max CR"
            placeholder="30"
            value={maxCR}
            onChange={(val) => setMaxCR(typeof val === "number" ? val : undefined)}
            min={0}
            style={{ flexGrow: 1, minWidth: "100px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />
        </Group>

        <Divider style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Tags filter line */}
        <Group align="flex-end" gap="md" style={{ flexWrap: "wrap" }}>
          <div style={{ flexGrow: 2, minWidth: "220px" }}>
            <Group gap="xs" mb={4}>
              <IconTags size={14} color="#ef4444" />
              <Title order={6} style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>
                Filter By Tags
              </Title>
            </Group>
            <MultiSelect
              placeholder="Search / select monster tags..."
              data={allTags}
              value={tags}
              onChange={setTags}
              searchable
              clearable
              styles={{
                input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
                dropdown: { background: "rgba(20,12,12,0.95)", border: "1px solid rgba(255,255,255,0.1)" }
              }}
            />
          </div>

          <Stack gap={4} style={{ minWidth: "160px" }}>
            <Text size="xs" fw={600} c="dimmed" style={{ textTransform: "uppercase" }}>Tag Match Logic</Text>
            <SegmentedControl
              value={tagsRule}
              onChange={(value) => setTagsRule(value as "any" | "all")}
              data={[
                { label: "Matches Any Tag", value: "any" },
                { label: "Matches All Tags", value: "all" },
              ]}
              styles={{
                root: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)" },
                indicator: { background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)" }
              }}
            />
          </Stack>
        </Group>
      </Stack>
    </div>
  );
};
