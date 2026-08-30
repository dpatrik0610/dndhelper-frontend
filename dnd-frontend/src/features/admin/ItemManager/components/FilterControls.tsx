import React from "react";
import { TextInput, Select, Button, Group, MultiSelect, SegmentedControl, Divider, Title, Stack, Text } from "@mantine/core";
import { IconSearch, IconX, IconFilter, IconTags } from "@tabler/icons-react";
import GlassyBox from "./GlassyBox";
import styles from "@features/admin/ItemManager/ItemManager.module.css";

interface FilterControlsProps {
  filters: {
    name: string;
    tier: string;
    damageType: string;
    tags: string[];
    tagsRule: "any" | "all";
  };
  onFilterChange: (filters: FilterControlsProps["filters"]) => void;
  onClear: () => void;
  allTags: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, onClear, allTags }) => {
  const handleInputChange = (field: keyof FilterControlsProps["filters"], value: unknown) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <GlassyBox className={`${styles.glassyBox} ${styles.glassyBoxHover}`}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconFilter size={18} color="#00ffff" />
            <Title order={4} style={{ color: "white", letterSpacing: "0.5px" }}>
              Filter & Search Equipment
            </Title>
          </Group>
          <Button
            size="xs"
            variant="subtle"
            color="red.4"
            leftSection={<IconX size={14} />}
            onClick={onClear}
            disabled={!filters.name && !filters.tier && !filters.damageType && filters.tags.length === 0}
          >
            Clear Filters
          </Button>
        </Group>

        <Group align="flex-end" gap="md" style={{ flexWrap: "wrap" }}>
          {/* Name Search */}
          <TextInput
            placeholder="Search item by name..."
            label="Item Name"
            value={filters.name}
            onChange={(e) => handleInputChange("name", e.currentTarget.value)}
            leftSection={<IconSearch size={16} color="rgba(255,255,255,0.4)" />}
            style={{ flexGrow: 2, minWidth: "220px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />

          {/* Tier Select */}
          <Select
            placeholder="Select Rarity"
            label="Rarity Tier"
            data={["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"]}
            value={filters.tier || null}
            onChange={(value) => handleInputChange("tier", value || "")}
            clearable
            style={{ flexGrow: 1, minWidth: "150px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
              dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />

          {/* Damage Type Select */}
          <Select
            placeholder="Damage Type"
            label="Damage Type"
            data={[
              "Slashing", "Piercing", "Bludgeoning", "Fire", "Cold", "Acid", "Poison", "Lightning", "Thunder", "Radiant", "Necrotic", "Force", "Psychic"
            ]}
            value={filters.damageType || null}
            onChange={(value) => handleInputChange("damageType", value || "")}
            clearable
            style={{ flexGrow: 1, minWidth: "150px" }}
            styles={{
              input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
              dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" },
              label: { color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }
            }}
          />
        </Group>

        <Divider style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Tags filter line */}
        <Group align="flex-end" gap="md" style={{ flexWrap: "wrap" }}>
          <div style={{ flexGrow: 2, minWidth: "220px" }}>
            <Group gap="xs" mb={4}>
              <IconTags size={14} color="#a855f7" />
              <Title order={6} style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", margin: 0 }}>
                Filter By Tags
              </Title>
            </Group>
            <MultiSelect
              placeholder="Search / select tags..."
              data={allTags}
              value={filters.tags}
              onChange={(value) => handleInputChange("tags", value)}
              searchable
              clearable
              styles={{
                input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" }
              }}
            />
          </div>

          <Stack gap={4} style={{ minWidth: "160px" }}>
            <Text size="xs" fw={600} c="dimmed" style={{ textTransform: "uppercase" }}>Tag Match Logic</Text>
            <SegmentedControl
              value={filters.tagsRule}
              onChange={(value) => handleInputChange("tagsRule", value as "any" | "all")}
              data={[
                { label: "Matches Any Tag", value: "any" },
                { label: "Matches All Tags", value: "all" },
              ]}
              styles={{
                root: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)" },
                indicator: { background: "rgba(0, 255, 255, 0.15)", border: "1px solid rgba(0, 255, 255, 0.3)" }
              }}
            />
          </Stack>
        </Group>
      </Stack>
    </GlassyBox>
  );
};

export default FilterControls;
