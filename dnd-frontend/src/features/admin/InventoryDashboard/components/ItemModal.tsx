import { Loader, Center } from "@mantine/core";
import { useEffect, useState, lazy, Suspense } from "react";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { defaultEquipment } from "@features/admin/ItemManager/defaultEquipment";
import { getEquipmentById } from "@services/equipmentService";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useToken } from "@store/auth/authSelectors";

const EquipmentFormModal = lazy(() => import("@components/EquipmentFormModal/EquipmentFormModal").then(m => ({ default: m.EquipmentFormModal })));
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
  const token = useToken();
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
          const data = await getEquipmentById(equipmentId);
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
        <AdminGlassModal opened={opened} onClose={onClose} withCloseButton={false} size="sm">
          <Center h={200}>
            <Loader color="grape" />
          </Center>
        </AdminGlassModal>
      )}

      {equipment && (
        <Suspense fallback={<Center h={200}><Loader color="grape" /></Center>}>
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
        </Suspense>
      )}
    </>
  );
}
