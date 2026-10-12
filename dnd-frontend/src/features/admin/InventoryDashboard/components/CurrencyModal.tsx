import { useEffect, useState } from "react";
import { Button, Group, NumberInput, SegmentedControl, Stack, Text, UnstyledButton } from "@mantine/core";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { CurrencyTypeInput } from "@components/common/CurrencyTypeInput";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import type { Currency } from "@appTypes/Currency";
import { coinInfo, currencySuggestions, sameCurrency, sortCurrencies } from "@utils/currency";
import styles from "@styles/InventoryDashboard.module.css";

interface CurrencyModalProps {
  opened: boolean;
  onClose: () => void;
  inventoryId: string;
  inventoryName?: string;
  currencies: Currency[];
}

type Mode = "add" | "remove";

const inputStyles = { input: { background: "rgba(255,255,255,0.05)", border: "none" } };

export function CurrencyModal({ opened, onClose, inventoryId, inventoryName, currencies }: CurrencyModalProps) {
  const { addToInventory, removeFromInventory } = useAdminCurrencyStore();

  const [mode, setMode] = useState<Mode>("add");
  const [type, setType] = useState("gp");
  const [amount, setAmount] = useState(1);
  const [busy, setBusy] = useState(false);

  const coins = sortCurrencies(currencies.filter((c) => c.amount > 0));
  const held = coins.find((c) => sameCurrency(c.type, type))?.amount ?? 0;
  const canConfirm = type.trim() !== "" && amount > 0 && (mode === "add" || amount <= held);

  const switchMode = (next: Mode) => {
    setMode(next);
    setType(next === "remove" ? (coins[0]?.type ?? "") : "gp");
    setAmount(1);
  };

  useEffect(() => {
    if (opened) switchMode("add");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal opens
  }, [opened]);

  const confirm = async () => {
    if (!canConfirm) return;
    const change = [{ type: type.trim(), amount }];
    setBusy(true);
    try {
      await (mode === "add" ? addToInventory(change, inventoryId) : removeFromInventory(change, inventoryId));
      setAmount(1);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminGlassModal opened={opened} onClose={onClose} title={inventoryName ? `Purse — ${inventoryName}` : "Purse"} size="sm">
      <Stack gap="md">
        <div className={styles.purseList}>
          {coins.length === 0 ? (
            <Text c="dimmed" fz="sm" ta="center" py="md">The purse is empty.</Text>
          ) : (
            coins.map((c) => {
              const info = coinInfo(c.type);
              return (
                <UnstyledButton
                  key={c.type}
                  className={styles.purseRow}
                  data-active={sameCurrency(c.type, type) || undefined}
                  onClick={() => setType(c.type)}
                  title={`Select ${info.name}`}
                >
                  <span className={styles.metaCoinDot} style={{ background: info.gradient }} />
                  <span className={styles.purseCoinLabel}>{info.label}</span>
                  {info.standard && <span className={styles.purseCoinName}>{info.name}</span>}
                  <span className={styles.purseAmount}>{c.amount.toLocaleString()}</span>
                </UnstyledButton>
              );
            })
          )}
        </div>

        <SegmentedControl
          fullWidth
          size="xs"
          value={mode}
          onChange={(v) => switchMode(v as Mode)}
          data={[
            { value: "add", label: "Add" },
            { value: "remove", label: "Remove", disabled: coins.length === 0 },
          ]}
        />

        <Group grow align="flex-start" gap="sm">
          <CurrencyTypeInput
            value={type}
            onChange={setType}
            suggestions={mode === "remove" ? coins.map((c) => c.type) : currencySuggestions(coins)}
            styles={inputStyles}
          />
          <NumberInput
            label="Amount"
            description={mode === "remove" ? `Holding ${held}` : undefined}
            min={1}
            max={mode === "remove" ? held : undefined}
            allowDecimal={false}
            allowNegative={false}
            value={amount}
            onChange={(v) => setAmount(Number(v) || 0)}
            onKeyDown={(e) => e.key === "Enter" && void confirm()}
            styles={inputStyles}
          />
        </Group>

        <Button
          fullWidth
          variant="light"
          color={mode === "add" ? "green" : "red"}
          disabled={!canConfirm}
          loading={busy}
          onClick={confirm}
        >
          {mode === "add" ? "Add" : "Remove"} {amount > 0 ? amount : ""} {type.trim() ? coinInfo(type).label : ""}
        </Button>
      </Stack>
    </AdminGlassModal>
  );
}
