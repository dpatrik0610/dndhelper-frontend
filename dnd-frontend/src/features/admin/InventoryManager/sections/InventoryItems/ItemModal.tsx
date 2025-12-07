import { Modal, Loader, Center } from "@mantine/core";
import { useEffect, useState } from "react";
import { EquipmentFormModal } from "../../../../../components/admin/EquipmentFormModal";
import { showNotification } from "../../../../../components/Notification/Notification";
import { SectionColor } from "../../../../../types/SectionColor";
import type { Equipment } from "../../../../../types/Equipment/Equipment";
import { defaultEquipment } from "@features/admin/ItemManager/defaultEquipment";
import { getEquipmentById } from "@services/equipmentService";
import { useAuthStore } from "@store/useAuthStore";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";

interface ItemModalProps {
  opened: boolean;
  onClose: () => void;
  equipmentId?: string | null;
  editMode: boolean;
}

export function ItemModal({
  opened,
  onClose,
  equipmentId = null,
  editMode = false,
}: ItemModalProps) {
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore.getState().token;
  const { updateEquipment, addItem } = useAdminInventoryStore();

  // Load or initialize equipment
  useEffect(() => {
    const load = async () => {
      if (!opened) return;

      // 🆕 Create mode
      if (!equipmentId && !editMode) {
        setEquipment(defaultEquipment);
        return;
      }

      // 🧩 Edit mode
      if (equipmentId) {
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
      }
    };

    load();
  }, [equipmentId, opened, token, editMode]);

  const handleChange = <K extends keyof Equipment>(
    key: K,
    value: Equipment[K]
  ) => setEquipment((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSave = async (payload?: Equipment) => {
    const eq = payload ?? equipment;
    if (!eq) return;
    try {
      if (editMode && equipmentId) {
        await updateEquipment(eq);
        showNotification({
          title: "Equipment updated",
          message: `${eq.name} saved successfully.`,
          color: SectionColor.Green,
        });
      } else {
        await addItem(eq);
        showNotification({
          title: "Equipment created",
          message: `${eq.name} added successfully.`,
          color: SectionColor.Green,
        });
      }
      onClose();
    } catch (err) {
      showNotification({
        title: "Error saving equipment",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  return (
    <>
      {loading && !equipment && (
        <Modal opened={opened} onClose={onClose} withCloseButton={false} centered>
          <Center h={200}>
            <Loader color="grape" />
          </Center>
        </Modal>
      )}

      {equipment && (
        <EquipmentFormModal
          opened={opened}
          initial={equipment}
          saving={loading}
          onClose={onClose}
          onSubmit={async (item) => {
            setEquipment(item);
            await handleSave(item);
          }}
          title={editMode && equipmentId ? `Edit Equipment: ${equipment.name}` : "Create New Equipment"}
          submitLabel={editMode && equipmentId ? "Save changes" : "Add Item"}
        />
      )}
    </>
  );
}
