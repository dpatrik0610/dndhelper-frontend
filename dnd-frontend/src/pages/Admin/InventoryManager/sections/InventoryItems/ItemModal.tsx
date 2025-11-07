import {
  Stack,
  NumberInput,
  TextInput,
  Group,
  Textarea,
  Divider,
  Loader,
  Center,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { BaseModal } from "../../../../../components/BaseModal";
import { showNotification } from "../../../../../components/Notification/Notification";
import { SectionColor } from "../../../../../types/SectionColor";
import type { Equipment } from "../../../../../types/Equipment/Equipment";
import { getEquipmentById } from "../../../../../services/equipmentService";
import { useAuthStore } from "../../../../../store/useAuthStore";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import "../../../../../styles/glassyInput.css"

interface ItemModalProps {
  opened: boolean;
  onClose: () => void;
  equipmentId: string | null;
}

export function ItemModal({ opened, onClose, equipmentId }: ItemModalProps) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore.getState().token;
  const {updateEquipment} = useAdminInventoryStore();

  useEffect(() => {
    const load = async () => {
      if (!equipmentId || !opened) {
        console.log("Equipment id: ", equipmentId)
        return;
      }
      
      setLoading(true);
      try {
        const data = await getEquipmentById(equipmentId, token!);
        setEquipment(data);
      } catch (err) {
        showNotification({
          title: "Error loading equipment",
          message: String(err),
          color: SectionColor.Red,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [equipmentId, opened, token]);

  const handleChange = <K extends keyof Equipment>(key: K, value: Equipment[K]) =>
    setEquipment((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async () => {
    if (!equipment) return;
    try {
      await updateEquipment(equipment);
      showNotification({
        title: "Equipment updated",
        message: `${equipment.name} saved successfully.`,
        color: SectionColor.Green,
      });
      onClose();
    } catch (err) {
      showNotification({
        title: "Error updating equipment",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  if (loading || !equipment)
    return (
      <BaseModal opened={opened} onClose={onClose} title="Loading Equipment...">
        <Center h={200}>
          <Loader color="grape" />
        </Center>
      </BaseModal>
    );

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={`Edit Equipment: ${equipment.name}`}
      onSave={handleSave}
      saveLabel="Save Changes"
    >
      <Stack gap="xs">
        <TextInput
          classNames={{input: "glassy-input", label: "glassy-label"}}
          label="Name"
          value={equipment.name}
          onChange={(e) => handleChange("name", e.currentTarget.value)}
        />

        <TextInput
          classNames={{input: "glassy-input", label: "glassy-label"}}
          label="Index"
          value={equipment.index}
          onChange={(e) => handleChange("index", e.currentTarget.value)}
        />

        <Textarea
          classNames={{input: "glassy-input", label: "glassy-label"}}
          label="Description"
          autosize
          minRows={2}
          value={equipment.description?.join("\n") ?? ""}
          onChange={(e) =>
            handleChange("description", e.currentTarget.value.split("\n"))
          }
        />

        <Divider label="Cost & Weight" labelPosition="center" my="sm" />

        <Group grow>
          <NumberInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Cost"
            min={0}
            value={equipment.cost?.quantity ?? 0}
            onChange={(v) =>
              handleChange("cost", {
                quantity: Number(v ?? 0),
                unit: equipment.cost?.unit ?? "gp",
              })
            }
          />
          <TextInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Unit"
            value={equipment.cost?.unit ?? "gp"}
            onChange={(e) =>
              handleChange("cost", {
                quantity: equipment.cost?.quantity ?? 0,
                unit: e.currentTarget.value,
              })
            }
          />
          <NumberInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Weight (lb)"
            min={0}
            value={equipment.weight ?? 0}
            onChange={(v) => handleChange("weight", Number(v ?? 0))}
          />
        </Group>

        <Divider label="Combat" labelPosition="center" my="sm" />

        <Group grow>
          <TextInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Damage Dice"
            placeholder="e.g. 1d8"
            value={equipment.damage?.damageDice ?? ""}
            onChange={(e) =>
              handleChange(
                "damage",
                e.currentTarget.value
                  ? {
                      damageDice: e.currentTarget.value,
                      damageType: {
                        name: equipment.damage?.damageType?.name ?? "Physical",
                      },
                    }
                  : undefined
              )
            }
          />
          <TextInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Damage Type"
            placeholder="e.g. Slashing"
            value={equipment.damage?.damageType?.name ?? ""}
            onChange={(e) =>
              handleChange("damage", {
                damageDice: equipment.damage?.damageDice || "",
                damageType: { name: e.currentTarget.value },
              })
            }
          />
        </Group>

        <Group grow>
          <NumberInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Range (normal)"
            min={0}
            value={equipment.range?.normal ?? 0}
            onChange={(v) =>
              handleChange("range", {
                normal: Number(v ?? 0),
                long: equipment.range?.long ?? 0,
              })
            }
          />
          <NumberInput
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Range (long)"
            min={0}
            value={equipment.range?.long ?? 0}
            onChange={(v) =>
              handleChange("range", {
                normal: equipment.range?.normal ?? 0,
                long: Number(v ?? 0),
              })
            }
          />
        </Group>
      </Stack>
    </BaseModal>
  );
}
