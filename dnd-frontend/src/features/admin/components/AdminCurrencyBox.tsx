import {
  ActionIcon,
  Group,
  Text,
  Tooltip,
  NumberInput,
  Stack,
  Button,
  Divider,
} from "@mantine/core";
import { useState } from "react";
import {
  IconCoin,
  IconRefresh,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { SectionColor } from "@appTypes/SectionColor";
import CustomBadge from "@components/common/CustomBadge";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { CurrencyTypeInput } from "@components/common/CurrencyTypeInput";
import { showNotification } from "@components/Notification/Notification";
import { coinInfo, currencySuggestions, sameCurrency, sortCurrencies } from "@utils/currency";

export function AdminCurrencyBox() {
  const {
    selectedCharacter,
    selectedInventory,
    currencies: characterCurrencies,
    refresh,
    addToCharacter,
    removeFromCharacter,
    addToInventory,
    removeFromInventory,
  } = useAdminCurrencyStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "remove" | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [type, setType] = useState<string>("gp");

  const isCharacter = !!selectedCharacter;
  const currentCurrencies = sortCurrencies(isCharacter
    ? characterCurrencies
    : selectedInventory?.currencies || []);

  const hasTarget = !!(selectedCharacter || selectedInventory);
  const targetName =
    selectedCharacter?.name || selectedInventory?.name || "No target";

  // Removing is capped at what the target holds; adding can create any currency.
  const held = currentCurrencies.find((c) => sameCurrency(c.type, type))?.amount ?? 0;
  const maxAmount = mode === "remove" ? held : undefined;
  const canConfirm = type.trim() !== "" && amount > 0 && (maxAmount === undefined || amount <= maxAmount);

  const openModal = (next: "add" | "remove") => {
    setMode(next);
    setType(next === "remove" ? (currentCurrencies[0]?.type ?? "") : "gp");
    setAmount(1);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    const change = [{ type: type.trim(), amount }];

    try {
      if (isCharacter) {
        await (mode === "add" ? addToCharacter(change) : removeFromCharacter(change));
      } else if (selectedInventory) {
        await (mode === "add" ? addToInventory(change) : removeFromInventory(change));
      }
      setModalOpen(false);
    } catch (err) {
      showNotification({
        title: "Currency update failed",
        message: err instanceof Error ? err.message : String(err),
        color: SectionColor.Red,
      });
    }
  };

  return (
    <Stack p="sm" mb={15} gap="xs" style={{
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      background: "rgba(255,255,255,0.03)",
    }}>
      <Group justify="space-between" align="center">
        <Text fw={600}>💰 {targetName}</Text>
        <Group gap="xs">
          <Tooltip label="Refresh">
            <ActionIcon variant="light" color="electric" onClick={refresh}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add currency">
            <ActionIcon
              variant="light"
              color="green"
              onClick={() => openModal("add")}
              disabled={!hasTarget}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove currency">
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => openModal("remove")}
              disabled={!hasTarget || currentCurrencies.length === 0}
            >
              <IconMinus size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Divider color="rgba(255,255,255,0.1)" />

      <Group m={5} p={5} w="100%" align="center" justify="center" wrap="wrap">
        {currentCurrencies.length > 0 ? (
          currentCurrencies.map((currency) => (
            <CustomBadge
              key={currency.type}
              label={`${currency.amount} ${coinInfo(currency.type).label}`}
              color={coinInfo(currency.type).color}
              variant="light"
              size="lg"
              icon={<IconCoin size={16} />}
            />
          ))
        ) : (
          <Text c="dimmed" fz="sm">No currencies found.</Text>
        )}
      </Group>

      <AdminGlassModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "add" ? "Add Currency" : "Remove Currency"}
        size="sm"
      >
        <Stack gap="md">
          <Text fz="sm" c="dimmed" ta="center">
            Target: <Text span fw={600}>{targetName}</Text>
          </Text>
          <CurrencyTypeInput
            value={type}
            onChange={setType}
            suggestions={mode === "remove"
              ? currentCurrencies.map((c) => c.type)
              : currencySuggestions(currentCurrencies)}
            radius="md"
            styles={{
              input: { background: "rgba(255,255,255,0.05)", border: "none" },
            }}
            data-autofocus
          />

          <NumberInput
            label="Amount"
            description={mode === "remove" ? `Holding ${held} ${coinInfo(type || "?").label}` : undefined}
            min={1}
            max={maxAmount}
            allowDecimal={false}
            allowNegative={false}
            value={amount}
            onChange={(val) => setAmount(Number(val) || 0)}
            radius="md"
            styles={{
              input: { background: "rgba(255,255,255,0.05)", border: "none" },
            }}
          />
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            color={mode === "add" ? "green" : "red"}
            fullWidth
            radius="md"
            size="md"
            variant="gradient"
            gradient={mode === "add"
              ? { from: "neon", to: "green" }
              : { from: "red", to: "magenta" }}
          >
            {mode === "add" ? "Add Currency" : "Remove Currency"}
          </Button>
        </Stack>
      </AdminGlassModal>
    </Stack>
  );
}


