import { ActionIcon, Avatar, Badge, Group, Text, Tooltip } from "@mantine/core";
import { IconEye, IconPencil, IconSkull, IconTrash } from "@tabler/icons-react";
import type { Monster } from "@appTypes/Monster";
import { useCanEditContent } from "@store/campaign/campaignSelectors";
import { CoreBadge, PromoteToCoreButton } from "@components/common/CoreContentBadge";
import { crLabel } from "@utils/monster";
import styles from "@styles/AdminCatalog.module.css";

interface MonsterTableProps {
  monsters: Monster[];
  loading: boolean;
  onView: (monster: Monster) => void;
  onEdit: (monster: Monster) => void;
  onDelete: (monster: Monster) => void;
  /** Called after a monster was promoted to core, to refresh the list. */
  onChanged?: () => void;
}

export function MonsterTable({ monsters, loading, onView, onEdit, onDelete, onChanged }: MonsterTableProps) {
  // Core rows are read-only for DMs; the superadmin edits and promotes.
  const canEdit = useCanEditContent();
  return (
    <div className={styles.tableContainer}>
      <table className={styles.glassTable}>
        <thead>
          <tr>
            <th style={{ width: "38%" }}>Monster</th>
            <th style={{ width: "22%" }}>Type</th>
            <th style={{ width: "10%" }}>CR</th>
            <th style={{ width: "10%" }}>AC / HP</th>
            <th style={{ width: "8%" }}>Source</th>
            <th style={{ width: "12%", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {monsters.map((m) => (
            <tr key={m.id} className={styles.glassRow}>
              <td>
                <Group gap="sm" wrap="nowrap">
                  <Avatar src={m.imageUrl} size={36} radius="md" color="red">
                    <IconSkull size={18} />
                  </Avatar>
                  <div>
                    <Text size="sm" fw={700} c="white" style={{ cursor: "pointer" }} onClick={() => onView(m)}>
                      {m.name || "Unnamed"}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {[m.size, m.alignment].filter(Boolean).join(" · ")}
                    </Text>
                  </div>
                  {m.isNpc && <Badge size="xs" color="pink" variant="light">NPC</Badge>}
                </Group>
              </td>
              <td>
                <Text size="sm" c="rose.1" tt="capitalize">
                  {m.type || "—"}
                  {m.tags.length > 0 && <Text span size="xs" c="dimmed"> ({m.tags.join(", ")})</Text>}
                </Text>
              </td>
              <td>
                <span className={`${styles.monsterBadge} ${m.challengeRating >= 10 ? styles.badgeBoss : styles.badgeCreature}`}>
                  {crLabel(m.challengeRating)}
                </span>
              </td>
              <td>
                <Text size="sm" c="gray.3">{m.armorClass} / {m.hitPoints}</Text>
              </td>
              <td>
                <Text size="xs" c="dimmed">{m.source || "Homebrew"}</Text>
              </td>
              <td>
                <Group justify="flex-end" gap={4} wrap="nowrap">
                  <Tooltip label="Stat block" withArrow>
                    <ActionIcon variant="subtle" color="electric" onClick={() => onView(m)} aria-label="View stat block">
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                  {/* 5etools monsters are private book content: they never leave their campaign (the server refuses too). */}
                  {!m.sourceKey?.startsWith("5etools/") && (
                    <PromoteToCoreButton type="Monsters" id={m.id} campaignId={m.campaignId} onPromoted={onChanged} />
                  )}
                  {canEdit(m.campaignId) ? (
                    <>
                      <Tooltip label="Edit" withArrow>
                        <ActionIcon variant="subtle" color="magenta" onClick={() => onEdit(m)} aria-label="Edit monster">
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete" withArrow>
                        <ActionIcon variant="subtle" color="red.5" onClick={() => onDelete(m)} aria-label="Delete monster">
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  ) : (
                    <CoreBadge campaignId={m.campaignId} />
                  )}
                </Group>
              </td>
            </tr>
          ))}

          {!loading && monsters.length === 0 && (
            <tr>
              <td colSpan={6}>
                <Text ta="center" c="dimmed" p="xl">No monsters match.</Text>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
