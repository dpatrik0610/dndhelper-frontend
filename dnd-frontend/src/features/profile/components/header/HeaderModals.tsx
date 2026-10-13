import { AddConditionModal } from "@features/profile/components/modals/AddConditionModal";
import { HpModal } from "@features/profile/components/modals/HpModal";
import { MoneyModal } from "@features/profile/components/modals/MoneyModal";
import { RollModal } from "@features/profile/components/modals/RollModal";
import { ShortRestModal } from "@features/profile/components/modals/ShortRestModal";
import { LongRestModal } from "@features/profile/components/modals/LongRestModal";
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
  shortRestOpened: boolean;
  onCloseShortRest: () => void;
  longRestOpened: boolean;
  onCloseLongRest: () => void;
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
  shortRestOpened,
  onCloseShortRest,
  longRestOpened,
  onCloseLongRest,
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
      <ShortRestModal opened={shortRestOpened} onClose={onCloseShortRest} />
      <LongRestModal opened={longRestOpened} onClose={onCloseLongRest} />

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
