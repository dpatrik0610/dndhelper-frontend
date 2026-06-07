
import React from 'react';
import { Table, ScrollArea, Badge, Group, ActionIcon, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { Equipment } from '@appTypes/Equipment/Equipment';
import GlassyBox from './GlassyBox';

interface ItemListProps {
  items: Equipment[];
  onEdit: (item: Equipment) => void;
  onDelete: (item: Equipment) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onEdit, onDelete }) => {
  const rows = items.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.name}</Table.Td>
      <Table.Td>
        <Badge>{item.tier}</Badge>
      </Table.Td>
      <Table.Td>{item.damage?.damageDice}</Table.Td>
      <Table.Td>
        <Group>
          <ActionIcon onClick={() => onEdit(item)}>
            <IconPencil size={16} />
          </ActionIcon>
          <ActionIcon color="red" onClick={() => onDelete(item)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <GlassyBox>
      <ScrollArea>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Tier</Table.Th>
              <Table.Th>Damage</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        {items.length === 0 && <Text style={{ marginTop: '20px', textAlign: 'center' }}>No items found</Text>}
      </ScrollArea>
    </GlassyBox>
  );
};

export default ItemList;
