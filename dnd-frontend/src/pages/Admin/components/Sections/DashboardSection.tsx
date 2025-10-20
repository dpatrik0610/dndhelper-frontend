// components/Admin/sections/DashboardSection.tsx
import { SimpleGrid, Card, Group, Text, Stack, Title } from '@mantine/core';
import { IconUsers, IconPackage, IconShoppingCart, IconCurrencyDollar } from '@tabler/icons-react';

export const DashboardSection: React.FC = () => {
  const stats = [
    { icon: IconUsers, label: 'Total Users', value: '1,234', color: 'blue' },
    { icon: IconPackage, label: 'Products', value: '567', color: 'green' },
    { icon: IconShoppingCart, label: 'Orders', value: '89', color: 'orange' },
    { icon: IconCurrencyDollar, label: 'Revenue', value: '$12,345', color: 'grape' },
  ];

  return (
    <Stack>
      <Title order={2}>Dashboard Overview</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {stats.map((stat) => (
          <Card key={stat.label} shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <stat.icon size={24} color={stat.color} />
              <div>
                <Text fw={500}>{stat.label}</Text>
                <Text size="xl" fw={700}>{stat.value}</Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mt="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">Recent Activity</Text>
          {/* Add recent activity list */}
        </Card>
        
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">Performance</Text>
          {/* Add performance metrics */}
        </Card>
      </SimpleGrid>
    </Stack>
  );
};