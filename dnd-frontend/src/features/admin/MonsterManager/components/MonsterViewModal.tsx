import type { Monster } from "@appTypes/Monster";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { MonsterStatBlock } from "./MonsterStatBlock";

export function MonsterViewModal({ monster, onClose }: { monster: Monster | null; onClose: () => void }) {
  return (
    <AdminGlassModal opened={!!monster} onClose={onClose} size="lg">
      {monster && <MonsterStatBlock monster={monster} />}
    </AdminGlassModal>
  );
}
