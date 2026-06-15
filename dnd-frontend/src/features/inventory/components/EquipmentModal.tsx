import { Suspense, lazy, useEffect, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCategory,
  IconCoins,
  IconEdit,
  IconRulerMeasure,
  IconSwords,
  IconTags,
  IconWeight,
} from "@tabler/icons-react";
import { getEquipmentById, getEquipmentByIdsForUser } from "@services/equipmentService";
import type { Equipment, EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import { useAuthStore } from "@store/auth/authStore";
import { useAdminEquipmentStore } from "@store/admin/adminEquipmentStore";
import CustomBadge from "@components/common/CustomBadge";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { equipmentTierTheme } from "./styles/equipmentTheme";
import classes from "./EquipmentModal.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then(m => ({ default: m.MarkdownRenderer })));
const EquipmentFormModal = lazy(() => import("@components/EquipmentFormModal/EquipmentFormModal").then(m => ({ default: m.EquipmentFormModal })));

interface EquipmentModalProps {
  opened: boolean;
  onClose: () => void;
  equipmentId: string | null;
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <Group wrap="nowrap" align="center" gap="xs">
      <ThemeIcon size="md" variant="light" color={color} radius="md">
        {icon}
      </ThemeIcon>
      <div>
        <Text size="xs" tt="uppercase" c="dimmed" fw={700} style={{ letterSpacing: 0.5, lineHeight: 1 }}>       
          {label}
        </Text>
        <Text size="sm" fw={500} style={{ wordBreak: "break-word", lineHeight: 1.2 }}>
          {value}
        </Text>
      </div>
    </Group>
  );
}

export function EquipmentModal({ opened, onClose, equipmentId }: EquipmentModalProps) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const token = useAuthStore.getState().token;
  const roles = useAuthStore.getState().roles;
  const isAdmin = roles.includes("Admin");
  const { update } = useAdminEquipmentStore();

  const [equipment, setEquipment] = useState<Equipment | EquipmentUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!opened || !equipmentId) return;

    setLoading(true);
    if (isAdmin) {
      getEquipmentById(equipmentId, token!)
        .then((data: Equipment) => setEquipment(data))
        .catch((err: unknown) => console.error("Failed to load equipment", err))
        .finally(() => setLoading(false));
    } else {
        getEquipmentByIdsForUser([equipmentId], token!)
        .then((data: EquipmentUserResponse[]) => setEquipment(data[0]))
        .catch((err: unknown) => console.error("Failed to load equipment", err))
        .finally(() => setLoading(false));
    }
  }, [opened, equipmentId, token, isAdmin]);

  const handleEditSubmit = async (updatedItem: Equipment) => {
    await update(updatedItem);
    setEquipment(updatedItem);
    setEditModalOpen(false);
  };

  const descriptionContent = equipment?.description?.join("\n\n") ?? "";
  const dmDescriptionContent = equipment && 'dmDescription' in equipment ? equipment.dmDescription?.join("\n\n") ?? "" : "";

  const tierTheme =
    equipment?.tier && equipmentTierTheme[equipment.tier as keyof typeof equipmentTierTheme]
      ? equipmentTierTheme[equipment.tier as keyof typeof equipmentTierTheme]
      : equipmentTierTheme.default;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        centered
        size="xl"
        fullScreen={isMobile}
        title={
          equipment && (
            <Group align="center" gap="sm">
              <Text fw={700} fz={isMobile ? 20 : 26} tt="uppercase" style={{ letterSpacing: 1 }}>
                {equipment.name}
              </Text>
              <CustomBadge
                label={equipment && 'isCustom' in equipment && equipment.isCustom ? "Custom" : "Official"}
                color={equipment && 'isCustom' in equipment && equipment.isCustom ? SectionColor.Orange : SectionColor.Blue}
                variant="light"
                size={isMobile ? "md" : "lg"}
              />
              {isAdmin && (
                <Tooltip label="Edit Equipment" position="bottom" withArrow>
                  <ActionIcon
                    variant="transparent"
                    size="lg"
                    radius="xl"
                    className={classes.editButton}
                    onClick={() => setEditModalOpen(true)}
                    style={{ marginLeft: 8 }}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          )
        }
        overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}
        classNames={{
          content: classes.modalContent,
          header: classes.modalHeader,
          body: classes.modalBody,
        }}
        style={{
          "--tier-glow": tierTheme.glow,
          "--tier-gradient": tierTheme.gradient,
          "--tier-accent": `var(--mantine-color-${tierTheme.accent}-9)`,
          "--tier-accent-bg": `var(--mantine-color-${tierTheme.accent}-filled)`,
        } as React.CSSProperties}
      >
        {loading ? (
          <Center py="xl">
            <Loader color="violet" />
          </Center>
        ) : !equipment ? (
          <Text c="dimmed" ta="center">
            No equipment data available.
          </Text>
        ) : (
          <Stack gap="xl" pt="md">
            {(equipment.weight != null || (isAdmin && 'cost' in equipment && equipment.cost) || equipment.damage || equipment.range || equipment.tier) && (
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
                {equipment.weight != null && (
                  <StatItem icon={<IconWeight size={20} />} color={tierTheme.accent} label="Weight" value={`${equipment.weight} lb`} />
                )}
                {isAdmin && 'cost' in equipment && equipment.cost && (
                  <StatItem icon={<IconCoins size={20} />} color={tierTheme.accent} label="Cost" value={`${equipment.cost.quantity} ${equipment.cost.unit}`} />
                )}
                {equipment.damage && (
                  <StatItem icon={<IconSwords size={20} />} color={tierTheme.accent} label="Damage" value={`${equipment.damage.damageDice} (${equipment.damage.damageType.name})`} />
                )}
                {equipment.range && (
                  <StatItem icon={<IconRulerMeasure size={20} />} color={tierTheme.accent} label="Range" value={`Norm: ${equipment.range.normal} ft` + (equipment.range.long ? ` / Long: ${equipment.range.long} ft` : "")} />
                )}
                {equipment.tier && (
                  <StatItem icon={<IconCategory size={20} />} color={tierTheme.accent} label="Tier" value={equipment.tier} />
                )}
              </SimpleGrid>
            )}
            <Divider variant="solid" opacity={0.5} />
            <Box className={classes.descriptionWrapper}>
              <Text size="md" c="dimmed" fw={600} tt="uppercase" mb="xs" style={{ letterSpacing: 0.5 }}>
                Description
              </Text>
              {descriptionContent ? (
                <Suspense fallback={<Loader size="sm" color="violet" />}>
                  <MarkdownRenderer content={descriptionContent} />
                </Suspense>
              ) : (
                <Text size="xl" c="dimmed" fs="italic">
                  No description provided.
                </Text>
              )}
            </Box>

            {equipment.tags && equipment.tags.length > 0 && (
              <Box>
                <Group gap="xs" align="center" mb="xs">
                  <IconTags size={16} style={{ color: "var(--mantine-color-dimmed)" }} />
                  <Text size="sm" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: 0.5 }}>
                    Tags
                  </Text>
                </Group>
                <Group gap="xs">
                  {equipment.tags.map((t) => (
                    <Badge key={t} color="lime" variant="light" size="md" radius="sm">
                      {t}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            {isAdmin && (
              <ExpandableSection title="DM Notes" color={SectionColor.Red} defaultOpen>
                {dmDescriptionContent ? (
                  <Suspense fallback={<Loader size="sm" color="red" />}>
                    <MarkdownRenderer content={dmDescriptionContent} textColor="red.1" />
                  </Suspense>
                ) : (
                  <Text size="xl" c="dimmed" fs="italic">
                    No DM notes provided.
                  </Text>
                )}
              </ExpandableSection>
            )}

            <Divider variant="dashed" opacity={0.3} />
            <Group justify="space-between" c="dimmed" fz="xs">
              <Tooltip label="MongoDB document ID">
                <Text>Id: {equipment.id}</Text>
              </Tooltip>
              <Text>
                Updated: {'updatedAt' in equipment && equipment.updatedAt ? new Date(equipment.updatedAt).toLocaleDateString() : "Unknown"}
              </Text>
            </Group>
          </Stack>
        )}
      </Modal>

      <Suspense fallback={null}>
        <EquipmentFormModal
          opened={editModalOpen}
          initial={equipment && 'index' in equipment ? equipment as Equipment : null}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      </Suspense>
    </>
  );
}
