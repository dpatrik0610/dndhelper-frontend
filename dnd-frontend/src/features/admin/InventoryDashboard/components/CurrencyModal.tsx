import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { AdminCurrencyBox } from "@features/admin/components/AdminCurrencyBox";

interface CurrencyModalProps {
  opened: boolean;
  onClose: () => void;
  inventoryName?: string;
}

export function CurrencyModal({ opened, onClose, inventoryName }: CurrencyModalProps) {
  return (
    <AdminGlassModal
      opened={opened}
      onClose={onClose}
      title={inventoryName ? `Currency — ${inventoryName}` : "Currency"}
      size="md"
    >
      <AdminCurrencyBox />
    </AdminGlassModal>
  );
}
