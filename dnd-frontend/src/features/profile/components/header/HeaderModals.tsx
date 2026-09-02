import { AddConditionModal } from "@features/profile/components/modals/AddConditionModal";
import { HpModal } from "@features/profile/components/modals/HpModal";
import { MoneyModal } from "@features/profile/components/modals/MoneyModal";
import { RollModal } from "@features/profile/components/modals/RollModal";
import { ConditionDetailsModal } from "@features/profile/components/modals/ConditionDetailsModal";

interface HeaderModalsProps {
  addConditionOpened: boolean;
  onCloseAddCondition: () => void;
  hpOpened: boolean;
  onCloseHp: () => void;
  moneyOpened: boolean;
  onCloseMoney: () => void;
  rollOpened: boolean;
  onCloseRoll: () => void;
  detailsOpened: boolean;
  onCloseDetails: () => void;
  selectedCondition: string | null;
  loadingDetails: boolean;
  conditionDesc: string[];
  detailsError: string | null;
  onRemoveFromModal: () => void;
  removingDetails: boolean;
}

export function HeaderModals({
  addConditionOpened,
  onCloseAddCondition,
  hpOpened,
  onCloseHp,
  moneyOpened,
  onCloseMoney,
  rollOpened,
  onCloseRoll,
  detailsOpened,
  onCloseDetails,
  selectedCondition,
  loadingDetails,
  conditionDesc,
  detailsError,
  onRemoveFromModal,
  removingDetails,
}: HeaderModalsProps) {
  return (
    <>
      <AddConditionModal opened={addConditionOpened} onClose={onCloseAddCondition} />
      <HpModal opened={hpOpened} onClose={onCloseHp} />
      <MoneyModal opened={moneyOpened} onClose={onCloseMoney} />
      <RollModal opened={rollOpened} onClose={onCloseRoll} />

      <ConditionDetailsModal
        opened={detailsOpened}
        onClose={onCloseDetails}
        title={selectedCondition ? selectedCondition.toUpperCase() : "Condition"}
        loading={loadingDetails}
        desc={conditionDesc}
        error={detailsError}
        onRemove={onRemoveFromModal}
        saving={removingDetails}
      />
    </>
  );
}
