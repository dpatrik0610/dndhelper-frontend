import { ActionIcon, Group, Table, Text, Tooltip } from "@mantine/core";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import type { Monster } from "@appTypes/Monster";

interface MonsterTableProps {
  monsters: Monster[];
  loading: boolean;
  saving: boolean;
  deleteId: string | null;
  onView: (monster: Monster) => void;
  onEdit: (monster: Monster) => void;
  onDelete: (id: string) => void;
}

export function MonsterTable({
  monsters,
  loading,
  saving,
  deleteId,
  onView,
  onEdit,
  onDelete,
}: MonsterTableProps) {
  return (
    <Table verticalSpacing="md" highlightOnHover withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>CR</Table.Th>
          <Table.Th>NPC</Table.Th>
          <Table.Th>Owner count</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {monsters.map((m, idx) => (
          <Table.Tr
            key={m.id}
            bg={idx % 2 === 0 ? "rgba(255, 100, 100, 0.05)" : "rgba(255, 200, 150, 0.06)"}
            style={{ transition: "background 120ms ease" }}
          >
            <Table.Td>
              <Text fw={600}>{m.name ?? "Unnamed"}</Text>
            </Table.Td>
            <Table.Td>{m.type?.type ?? "-"}</Table.Td>
            <Table.Td>{m.cr ?? "-"}</Table.Td>
            <Table.Td>{m.isNpc ? "Yes" : "No"}</Table.Td>
            <Table.Td>{m.ownerIds?.length ?? 0}</Table.Td>
            <Table.Td>
              <Group gap="xs">
                <Tooltip label="View">
                  <ActionIcon size="sm" variant="light" onClick={() => onView(m)}>
                    <IconEye size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Edit">
                  <ActionIcon size="sm" variant="light" onClick={() => onEdit(m)}>
                    <IconEdit size={14} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="red"
                    onClick={() => onDelete(m.id!)}
                    loading={saving && deleteId === m.id}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}

        {!loading && monsters.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={6}>
              <Text ta="center" c="dimmed">
                No monsters found.
              </Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}

