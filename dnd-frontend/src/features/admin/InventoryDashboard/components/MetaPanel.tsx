import { useState } from "react";
import { Text, UnstyledButton } from "@mantine/core";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { SelectInventoryOwnersModal } from "./SelectInventoryOwnersModal";
import { CurrencyModal } from "./CurrencyModal";
import styles from "@styles/InventoryDashboard.module.css";
import { coinInfo, sortCurrencies } from "@utils/currency";

export function MetaPanel() {
  const { selected } = useAdminInventoryStore();
  const { characters } = useAdminCharacterStore();
  const { selectedInventory } = useAdminCurrencyStore();

  const [ownerModal, setOwnerModal] = useState(false);
  const [currencyModal, setCurrencyModal] = useState(false);

  if (!selected) return null;

  const owners = characters.filter((c) => selected.characterIds?.includes(c.id!));
  const ownerNames = owners.map((c) => c.name).join(", ");
  const currencies =
    (selectedInventory?.id === selected.id ? selectedInventory?.currencies : selected.currencies) ?? [];
  const coins = sortCurrencies(currencies).filter((c) => c.amount > 0);

  return (
    <>
      <div className={styles.metaBar}>
        <Text fw={700} size="sm" c="white" className={styles.metaBarTitle}>
          {selected.name || "Unnamed"}
        </Text>

        <span className={styles.metaBarRule} />

        <UnstyledButton className={styles.metaChip} onClick={() => setOwnerModal(true)} title="Manage owners">
          <span className={styles.metaChipLabel}>Owners</span>
          <span className={styles.metaChipValue} title={ownerNames}>
            {owners.length === 0
              ? "Unassigned"
              : owners.length <= 2
                ? ownerNames
                : `${owners[0].name} +${owners.length - 1}`}
          </span>
        </UnstyledButton>

        <UnstyledButton className={styles.metaChip} onClick={() => setCurrencyModal(true)} title="Manage currency">
          <span className={styles.metaChipLabel}>Purse</span>
          <span className={styles.metaChipValue}>
            {coins.length === 0
              ? "Empty"
              : coins.map((c) => {
                  const info = coinInfo(c.type);
                  return (
                    <span key={c.type} className={styles.metaCoin} title={info.name}>
                      <span className={styles.metaCoinDot} style={{ background: info.gradient }} />
                      {c.amount} {info.label}
                    </span>
                  );
                })}
          </span>
        </UnstyledButton>
      </div>

      <SelectInventoryOwnersModal opened={ownerModal} onClose={() => setOwnerModal(false)} />
      <CurrencyModal
        opened={currencyModal}
        onClose={() => setCurrencyModal(false)}
        inventoryId={selected.id!}
        inventoryName={selected.name}
        currencies={currencies}
      />
    </>
  );
}
