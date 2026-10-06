import { Table, Text, ActionIcon, Group, Badge } from "@mantine/core";
import { AdminPanel } from "@features/admin/components/AdminPage";
import { IconEye, IconCheck, IconPencil } from "@tabler/icons-react";
import type { Session } from "@appTypes/Session";
import dayjs from "dayjs";

interface Props {
  sessions: Session[];
  selectedId: string | null;
  strippedDescriptions: Record<string, string>;
  onView: (session: Session) => void;
  onEdit: (session: Session) => void;
  onSetLive: (id: string) => void;
}

export default function SessionTable({
  sessions,
  selectedId,
  strippedDescriptions,
  onView,
  onEdit,
  onSetLive,
}: Props) {
  return (
    <AdminPanel flush>
      <Table.ScrollContainer minWidth={720}>
        <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md" style={{ tableLayout: "fixed" }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "22%" }}>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th style={{ width: 130 }}>Scheduled</Table.Th>
              <Table.Th style={{ width: 110 }}>Status</Table.Th>
              <Table.Th style={{ width: 140 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sessions.map((s) => (
              <Table.Tr key={s.id} data-selected={selectedId === s.id}>
                <Table.Td>{s.name}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" lineClamp={2} style={{ wordBreak: "break-word" }}>
                    {strippedDescriptions[s.id ?? ""] ?? ""}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c={s.scheduledFor && dayjs(s.scheduledFor).isBefore(dayjs()) ? "red.4" : "electric"} truncate>
                    {s.scheduledFor ? dayjs(s.scheduledFor).format("YYYY-MM-DD") : "Not set"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" color={s.isLive ? "neon" : "gray"} leftSection={<IconCheck size={12} />}>
                    {s.isLive ? "Live" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="electric" onClick={() => onView(s)} aria-label="View session">
                      <IconEye size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="neon" onClick={() => onEdit(s)} aria-label="Edit session">
                      <IconPencil size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="neon" disabled={s.isLive} onClick={() => onSetLive(s.id)} aria-label="Make live">
                      <IconCheck size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {sessions.length === 0 && (
        <Text c="dimmed" ta="center" py="xl" size="sm">
          No sessions yet.
        </Text>
      )}
    </AdminPanel>
  );
}
