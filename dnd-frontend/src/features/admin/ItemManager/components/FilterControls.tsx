
import React from 'react';
import { TextInput, Select, Button, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import GlassyBox from './GlassyBox';

interface FilterControlsProps {
  filters: {
    name: string;
    tag: string;
    tier: string;
    damageType: string;
  };
  onFilterChange: (filters: FilterControlsProps['filters']) => void;
  onSearch: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, onFilterChange, onSearch }) => {
  const handleInputChange = (field: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    onFilterChange(newFilters);
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
    </GlassyBox>
  );
};

export default FilterControls;
