import { Group, ActionIcon, Text, Badge, Tooltip } from "@mantine/core";
import { IconPencil, IconTrash, IconEye, IconUsers, IconActivity } from "@tabler/icons-react";
import type { Monster } from "@appTypes/Monster";
import styles from "../MonsterManager.module.css";

interface MonsterTableProps {
  monsters: Monster[];
  loading: boolean;
  saving: boolean;
  deleteId: string | null;
  onView: (monster: Monster) => void;
  onEdit: (monster: Monster) => void;
  onDelete: (monster: Monster) => void;
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
    <div className={styles.tableContainer}>
      <table className={styles.glassTable}>
        <thead>
          <tr>
            <th style={{ width: "35%" }}>Monster Name</th>
            <th style={{ width: "20%" }}>Type</th>
            <th style={{ width: "12%" }}>Challenge Rating</th>
            <th style={{ width: "15%" }}>Classification</th>
            <th style={{ width: "10%" }}>Owners</th>
            <th style={{ width: "8%", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {monsters.map((m) => {
            const isBoss = m.cr !== undefined && m.cr >= 10;
            return (
              <tr key={m.id} className={styles.glassRow}>
                {/* Monster Name */}
                <td>
                  <Group gap="xs" wrap="nowrap">
                    <Text
                      size="sm"
                      fw={700}
                      style={{ color: "white", cursor: "pointer" }}
                      onClick={() => onView(m)}
                    >
                      {m.name ?? "Unnamed"}
                    </Text>
                    {m.isDeleted && (
                      <Badge color="red" size="xs" radius="sm">
                        Deleted
                      </Badge>
                    )}
                  </Group>
                </td>

                {/* Type */}
                <td>
                  {m.type?.type ? (
                    <Group gap="xs" wrap="nowrap">
                      <IconActivity size={16} color="#fb7185" />
                      <Text size="sm" fw={600} c="rose.1">
                        {m.type.type}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </td>

                {/* Challenge Rating */}
                <td>
                  {m.cr !== undefined ? (
                    <span className={`${styles.monsterBadge} ${isBoss ? styles.badgeBoss : styles.badgeCreature}`}>
                      CR {m.cr}
                    </span>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </td>

                {/* Classification */}
                <td>
                  <span className={`${styles.monsterBadge} ${m.isNpc ? styles.badgeNpc : styles.badgeCreature}`}>
                    {m.isNpc ? "NPC" : "Creature"}
                  </span>
                </td>

                {/* Owners */}
                <td>
                  <Group gap="xs" wrap="nowrap">
                    <IconUsers size={16} color="#94a3b8" />
                    <Text size="sm" fw={600} c="gray.3">
                      {m.ownerIds?.length ?? 0}
                    </Text>
                  </Group>
                </td>

                {/* Actions */}
                <td>
                  <Group justify="flex-end" gap="xs" wrap="nowrap">
                    <Tooltip label="View stats" withArrow position="top">
                      <ActionIcon
                        size="md"
                        variant="subtle"
                        color="cyan.4"
                        onClick={() => onView(m)}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Edit monster" withArrow position="top">
                      <ActionIcon
                        size="md"
                        variant="subtle"
                        color="grape.4"
                        onClick={() => onEdit(m)}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Delete monster" withArrow position="top">
                      <ActionIcon
                        size="md"
                        variant="subtle"
                        color="red.5"
                        onClick={() => onDelete(m)}
                        loading={saving && deleteId === m.id}
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            );
          })}

          {!loading && monsters.length === 0 && (
            <tr>
              <td colSpan={6}>
                <Text ta="center" c="dimmed" p="xl">
                  No monsters found in this scroll.
                </Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
