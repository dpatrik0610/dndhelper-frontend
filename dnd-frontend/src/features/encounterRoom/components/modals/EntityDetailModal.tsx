import { Modal } from "@mantine/core";
import type { EncounterRoom } from "@appTypes/EncounterRoom";
import { EntityPanel } from "../panels/EntityPanel";

interface EntityDetailModalProps {
  opened: boolean;
  room: EncounterRoom;
  entityId: string | null;
  onClose: () => void;
  onUpdateEntity: (entityId: string, updates: Record<string, unknown>) => void;
  onAddToken: (entityId: string) => void;
}

export function EntityDetailModal({ opened, room, entityId, onClose, onUpdateEntity, onAddToken }: EntityDetailModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Entity details" centered>
      <EntityPanel room={room} selectedEntityId={entityId} onUpdateEntity={onUpdateEntity} onAddToken={onAddToken} />
    </Modal>
  );
}
