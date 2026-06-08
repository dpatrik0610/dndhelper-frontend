import React from 'react';
import { TextInput, Select, Button, Group, MultiSelect, SegmentedControl, Divider, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import GlassyBox from './GlassyBox';

interface FilterControlsProps {
  filters: {
    name: string;
    tier: string;
    damageType: string;
    tags: string[];
    tagsRule: 'any' | 'all';
  };
  onFilterChange: (filters: FilterControlsProps['filters']) => void;
  onSearch: () => void;
  allTags: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, onSearch, allTags }) => {
  const handleInputChange = (field: keyof FilterControlsProps['filters'], value: unknown) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <GlassyBox>
      <Group>
        <TextInput
          placeholder="Search by name"
          value={filters.name}
          onChange={(e) => handleInputChange('name', e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Tier"
          data={['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']}
          value={filters.tier}
          onChange={(value) => handleInputChange('tier', value || '')}
          clearable
        />
        <Select
          placeholder="Damage Type"
          data={['Slashing', 'Piercing', 'Bludgeoning', 'Fire', 'Cold', 'Acid', 'Poison', 'Lightning', 'Thunder', 'Radiant', 'Necrotic', 'Force', 'Psychic']}
          value={filters.damageType}
          onChange={(value) => handleInputChange('damageType', value || '')}
          clearable
        />
        <Button onClick={onSearch} leftSection={<IconSearch size={16} />}>
          Find
        </Button>
      </Group>
      <Divider my="md" />
      <Group>
        <Title order={5}>Tags</Title>
        <MultiSelect
          placeholder="Filter by tags"
          data={allTags}
          value={filters.tags}
          onChange={(value) => handleInputChange('tags', value)}
          searchable
          style={{ flex: 1 }}
        />
        <SegmentedControl
          value={filters.tagsRule}
          onChange={(value) => handleInputChange('tagsRule', value as 'any' | 'all')}
          data={[
            { label: 'Any', value: 'any' },
            { label: 'All', value: 'all' },
          ]}
        />
      </Group>
    </GlassyBox>
  );
};

export default FilterControls;
