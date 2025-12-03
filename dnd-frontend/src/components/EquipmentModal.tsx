import {
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Paper,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
  Badge,
} from "@mantine/core";
import {
  IconSwords,
  IconCoins,
  IconRulerMeasure,
  IconWeight,
  IconTags,
  IconCategory,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getEquipmentById } from "../services/equipmentService";
import type { Equipment } from "../types/Equipment/Equipment";
import { useAuthStore } from "../store/useAuthStore";
import CustomBadge from "./common/CustomBadge";
import DisplayText from "./common/DisplayText";
import { ExpandableSection } from "./ExpendableSection";
import { SectionColor } from "../types/SectionColor";
import { MarkdownRenderer } from "./MarkdownRender";

interface EquipmentModalProps {
  opened: boolean;
  onClose: () => void;
  equipmentId: string | null;
}

export function EquipmentModal({ opened, onClose, equipmentId }: EquipmentModalProps) {
  const theme = useMantineTheme();
  const token = useAuthStore.getState().token;
  const roles = useAuthStore.getState().roles;
  const isAdmin = roles.includes("Admin");

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!opened || !equipmentId) return;

    setLoading(true);
    getEquipmentById(equipmentId, token!)
      .then((data: Equipment) => setEquipment(data))
      .catch((err: any) => console.error("Failed to load equipment", err))
      .finally(() => setLoading(false));
  }, [opened, equipmentId, token]);

  const descriptionContent = equipment?.description?.join("\n\n") ?? "";
  const dmDescriptionContent = equipment?.dmDescription?.join("\n\n") ?? "";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      title={
        equipment && (
          <Group justify="center" align="center" gap="sm">
            <Text fw={700} fz={24} tt="uppercase" style={{ letterSpacing: 1 }}>
              {equipment.name}
            </Text>
            <CustomBadge
              label={equipment.isCustom ? "Custom" : "Official"}
              color={equipment.isCustom ? SectionColor.Orange : SectionColor.Blue}
              variant="light"
              size="lg"
            />
          </Group>
        )
      }
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{
        content: {
          background: "linear-gradient(175deg, #0a0a2f 0%, #180016 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 25px rgba(153, 0, 255, 0.15)",
          borderRadius: theme.radius.md,
        },
        header: {
          background: "transparent",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: 25,
        },
      }}
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
        <Stack gap="md">

          {/* ======== BASIC STATS ======== */}
          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "0.3s ease",
            }}
          >
            <Stack gap="xs">

              {/* Weight */}
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="violet">
                  <IconWeight size={16} />
                </ThemeIcon>
                <DisplayText
                  displayLabel="Weight"
                  displayData={equipment.weight ? `${equipment.weight} lb` : "-"}
                />
              </Group>

              {/* Cost (Admin only) */}
              {equipment.cost && isAdmin && (
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="yellow">
                    <IconCoins size={16} />
                  </ThemeIcon>
                  <DisplayText
                    displayLabel="Cost"
                    displayData={`${equipment.cost.quantity} ${equipment.cost.unit}`}
                  />
                </Group>
              )}

              {/* Damage */}
              {equipment.damage && (
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="red">
                    <IconSwords size={16} />
                  </ThemeIcon>
                  <DisplayText
                    displayLabel="Damage"
                    displayData={`${equipment.damage.damageDice} (${equipment.damage.damageType.name})`}
                  />
                </Group>
              )}

              {/* Range */}
              {equipment.range && (
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="cyan">
                    <IconRulerMeasure size={16} />
                  </ThemeIcon>
                  <DisplayText
                    displayLabel="Range"
                    displayData={`Normal: ${equipment.range.normal} ft, Long: ${equipment.range.long} ft`}
                  />
                </Group>
              )}

              {/* Tier */}
              {equipment.tier && (
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="grape">
                    <IconCategory size={16} />
                  </ThemeIcon>
                  <DisplayText displayLabel="Tier" displayData={equipment.tier} />
                </Group>
              )}

              {/* Tags */}
              {equipment.tags && equipment.tags.length > 0 && (
                <Group gap="xs" align="flex-start">
                  <ThemeIcon size="sm" variant="light" color="lime">
                    <IconTags size={16} />
                  </ThemeIcon>
                  <Stack gap={4}>
                    <Group gap={6}>
                    <Text fw={500} size="sm">
                      Tags:
                    </Text>
                      {equipment.tags.map((t) => (
                        <Badge key={t} color="lime" variant="light">
                          {t}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Group>
              )}
            </Stack>
          </Paper>

          {/* ======== DESCRIPTION ======== */}
          <ExpandableSection title="Description" color={SectionColor.Violet} defaultOpen>
            {descriptionContent ? (
              <MarkdownRenderer content={descriptionContent} />
            ) : (
              <Text size="sm" c="dimmed">
                No description provided.
              </Text>
            )}
          </ExpandableSection>

          {/* ======== DM DESCRIPTION (Admin only) ======== */}
          {isAdmin && (
            <ExpandableSection title="DM Notes" color={SectionColor.Red}>
              {dmDescriptionContent ? (
                <MarkdownRenderer
                  content={dmDescriptionContent}
                  textColor="red.1"
                />
              ) : (
                <Text size="sm" c="dimmed">
                  No DM notes provided.
                </Text>
              )}
            </ExpandableSection>
          )}

          {/* ======== META ======== */}
          <Divider variant="dashed" my="xs" />
          <Group justify="space-between" c="dimmed" fz="xs">
            <Tooltip label="MongoDB document ID">
              <Text>Id: {equipment.id}</Text>
            </Tooltip>
            <Text>
              Updated:{" "}
              {equipment.updatedAt
                ? new Date(equipment.updatedAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
