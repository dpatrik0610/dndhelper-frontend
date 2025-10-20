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
} from "@mantine/core";
import { IconSwords, IconCoins, IconRulerMeasure, IconWeight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { getEquipmentById } from "../services/equipmentService";
import type { Equipment } from "../types/Equipment/Equipment";
import { useAuthStore } from "../store/useAuthStore";
import CustomBadge from "./common/CustomBadge";
import DisplayText from "./common/DisplayText";
import { ExpandableSection } from "./ExpendableSection";
import { SectionColor } from "../types/SectionColor";

interface EquipmentModalProps {
  opened: boolean;
  onClose: () => void;
  equipmentId: string | null;
}

export function EquipmentModal({ opened, onClose, equipmentId }: EquipmentModalProps) {
  const theme = useMantineTheme();
  const token = useAuthStore.getState().token;
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = useAuthStore.getState().roles.includes("Admin");

  useEffect(() => {
    if (opened && equipmentId) {
      setLoading(true);
      getEquipmentById(equipmentId, token!)
        .then((data: Equipment) => setEquipment(data))
        .catch((err: any) => console.error("Failed to load equipment", err))
        .finally(() => setLoading(false));
    }
  }, [opened, equipmentId, token]);

  return (
    <Modal
      title={
        equipment && (
          <Group justify="center" align="center" gap="sm">
            <Text fw={700} fz={24} tt="uppercase" style={{ letterSpacing: 1 }}>
              {equipment.name ?? "Unknown Item"}
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
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          background: "linear-gradient(175deg, #0a0a2f 0%, #180016 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 25px rgba(153, 0, 255, 0.15)",
          borderRadius: theme.radius.md,
          transition: "all 0.25s ease",
        },
        header: {
          background: "transparent",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: 25
        },
      }}
    >
      {loading ? (
        <Center py="xl">
          <Loader color="violet" />
        </Center>
      ) : equipment ? (
        <Stack gap="md">
          <Paper
            p="md"
            radius="md"
            withBorder
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "0.3s ease",
            }}
            className="equipment-info"
          >
            <Stack gap="xs">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="violet">
                  <IconWeight size={16} />
                </ThemeIcon>
                <DisplayText
                  displayLabel="Weight"
                  displayData={equipment.weight ? `${equipment.weight} lb` : "-"}
                />
              </Group>

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
            </Stack>
          </Paper>

          {/* Description */}
          <ExpandableSection title="Description" color={SectionColor.Violet} defaultOpen>
            {equipment.description && equipment.description.length > 0 ? (
              <Stack gap={6}>
                {equipment.description.map((line, index) => (
                  <Text
                    key={index}
                    size="sm"
                    lh={1.5}
                    c="gray.1"
                    style={{
                      textShadow: "0 0 6px rgba(173, 83, 255, 0.3)",
                    }}
                  >
                    {line}
                  </Text>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">
                No description available.
              </Text>
            )}
          </ExpandableSection>

          {/* Metadata */}
          <Divider variant="dashed" my="xs" />
          <Group justify="space-between" c="dimmed" fz="xs">
            <Tooltip label="MongoDB document ID">
              <Text>Id: {equipment.id ?? "N/A"}</Text>
            </Tooltip>
            <Text>
              Updated:{" "}
              {equipment.updatedAt
                ? new Date(equipment.updatedAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </Group>
        </Stack>
      ) : (
        <Text c="dimmed" ta="center">
          No equipment data available.
        </Text>
      )}
    </Modal>
  );
}
