import { useState } from "react";
import {
  ActionIcon,
  Group,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconCoin,
  IconLink,
  IconReload,
  IconUserCog,
} from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { ensureInventoryLinkedToCharacter } from "@utils/inventorySync";
import { SelectInventoryOwnersModal } from "./SelectInventoryOwnersModal";
import { CurrencyModal } from "./CurrencyModal";
import styles from "@styles/InventoryDashboard.module.css";

export function MetaPanel() {
  const { selected, refreshSelected } = useAdminInventoryStore();
  const { characters } = useAdminCharacterStore();
  const { selectedInventory } = useAdminCurrencyStore();


  const [ownerModal, setOwnerModal] = useState(false);
  const [currencyModal, setCurrencyModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const ownerCharacters = characters.filter((c) => selected?.characterIds?.includes(c.id!));
  const currencies = selectedInventory?.currencies ?? selected?.currencies ?? [];

  const ownerSummary =
    ownerCharacters.length === 0
      ? "No owners"
      : ownerCharacters.length <= 2
        ? ownerCharacters.map((c) => c.name).join(", ")
        : `${ownerCharacters[0].name} +${ownerCharacters.length - 1} more`;

  const currencySummary =
    currencies.length === 0
      ? "No currency"
      : currencies
          .slice(0, 3)
          .map((c) => `${c.amount} ${c.currencyCode}`)
          .join(" ");

  const handleSyncLinks = async () => {
    if (!selected?.id) return;
    const invId = selected.id;
    const ownerIds = selected.characterIds ?? [];
    if (ownerIds.length === 0) {
      showNotification({
        title: "No owners to sync",
        message: "This inventory has no character owners to sync.",
        color: SectionColor.Yellow,
      });
      return;
    }

    const owners = characters.filter((c) => ownerIds.includes(c.id!));
    const targets = owners.filter((c) => !(c.inventoryIds ?? []).includes(invId));
    if (targets.length === 0) {
      showNotification({
        title: "Already in sync",
        message: "All owner characters already reference this inventory.",
        color: SectionColor.Green,
      });
      return;
    }

    setSyncing(true);
    try {
      await Promise.all(
        targets.map(async (c) => {
          await ensureInventoryLinkedToCharacter(c.id!, invId);
        })
      );
      showNotification({
        title: "Synced",
        message: `Added inventory to ${targets.length} character(s).`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Sync failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!selected) return null;

  return (
    <>
      <div className={styles.metaBar}>
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Text fw={700} size="sm" c="white" className={styles.metaBarTitle}>
            {selected.name || "Unnamed"}
          </Text>
          <IconUserCog size={14} color="rgba(255,255,255,0.75)" />
          <Text size="xs" c="dimmed" className={styles.metaBarSegment} title={ownerCharacters.map((c) => c.name).join(", ")}>
            {ownerSummary}
          </Text>
          <Text size="xs" c="dimmed" className={styles.metaBarDivider}>
            <IconCoin size={14} color={SectionColor.Orange} />
          </Text>
          <Text size="xs" c="dimmed" className={styles.metaBarSegment}>
            {currencySummary}
          </Text>
        </Group>

        <Group gap={4} wrap="nowrap" className={styles.metaBarActions}>
          <Tooltip label="Manage currency" withArrow>
            <ActionIcon size="sm" variant="subtle" color="yellow" onClick={() => setCurrencyModal(true)}>
              <IconCoin size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Manage owners" withArrow>
            <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setOwnerModal(true)}>
              <IconUserCog size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Sync character links" withArrow>
            <ActionIcon size="sm" variant="subtle" color="indigo" onClick={handleSyncLinks} loading={syncing}>
              <IconLink size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Reload inventory" withArrow>
            <ActionIcon size="sm" variant="subtle" color="gray" onClick={refreshSelected}>
              <IconReload size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      <SelectInventoryOwnersModal opened={ownerModal} onClose={() => setOwnerModal(false)} />
      <CurrencyModal
        opened={currencyModal}
        onClose={() => setCurrencyModal(false)}
        inventoryName={selected.name}
      />
    </>
  );
}
