import {
  ActionIcon,
  Group,
  Text,
  Tooltip,
  Modal,
  NumberInput,
  Stack,
  Button,
  Select,
  Divider,
} from "@mantine/core";
import { useState } from "react";
import { randomId } from "@mantine/hooks";
import {
  IconCoin,
  IconRefresh,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react";
import { useAdminCurrencyStore } from "@store/admin/useAdminCurrencyStore";
import { SectionColor } from "../../../types/SectionColor";
import type { Currency } from "../../../types/Currency";
import CustomBadge from "../../../components/common/CustomBadge";

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
  const [amount, setAmount] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>("gp");

  const isCharacter = !!selectedCharacter;
  const currentCurrencies = isCharacter
    ? characterCurrencies
    : selectedInventory?.currencies || [];

  const hasTarget = !!(selectedCharacter || selectedInventory);
  const targetName =
    selectedCharacter?.name || selectedInventory?.name || "No target";

  function currencyColor(code: string) {
    switch (code) {
      case "gp": return SectionColor.Yellow;
      case "sp": return SectionColor.Gray;
      case "ep": return SectionColor.Cyan;
      case "pp": return SectionColor.Blue;
      default: return SectionColor.Orange;
    }
  }

const handleConfirm = async () => {
  const change: Currency[] = [{ type: currencyCode, amount, currencyCode }];

  if (isCharacter) {
    if (mode === "add") {
      await addToCharacter(change);
    } else {
      await removeFromCharacter(change);
    }
  } else if (selectedInventory) {
    if (mode === "add") {
      await addToInventory(change);
    } else {
      await removeFromInventory(change);
    }
  }

  setModalOpen(false);
  setAmount(0);
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
            <ActionIcon variant="light" color="blue" onClick={refresh}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Add currency">
            <ActionIcon
              variant="light"
              color="green"
              onClick={() => { setMode("add"); setModalOpen(true); }}
              disabled={!hasTarget}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove currency">
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => { setMode("remove"); setModalOpen(true); }}
              disabled={!hasTarget}
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
              key={randomId()}
              label={`${currency.amount} ${currency.currencyCode}`}
              color={currencyColor(currency.currencyCode)}
              variant="light"
              size="lg"
              icon={<IconCoin size={16} />}
            />
          ))
        ) : (
          <Text c="dimmed" fz="sm">No currencies found.</Text>
        )}
      </Group>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "add" ? "Add Currency" : "Remove Currency"}
        centered
        radius="md"
        styles={{
          content: {
            background: mode === "add"
              ? "linear-gradient(135deg, rgba(0,80,40,0.25), rgba(0,40,20,0.35))"
              : "linear-gradient(135deg, rgba(80,0,0,0.25), rgba(40,0,20,0.35))",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          },
          header: { borderBottom: "none" },
          title: {
            color: mode === "add" ? "#7CFFB2" : "#FF7C7C",
            fontWeight: 600,
          },
        }}
      >
        <Stack gap="md" p="sm">
          <Text fz="sm" c="dimmed" ta="center">
            Target: <Text span fw={600}>{targetName}</Text>
          </Text>
          <Select
            label="Currency Type"
            data={[
              { value: "gp", label: "🪙 Gold Pieces" },
              { value: "sp", label: "🥈 Silver Pieces" },
              { value: "ep", label: "⚡ Electrum Pieces" },
              { value: "pp", label: "💎 Platinum Pieces" },
            ]}
            value={currencyCode}
            onChange={(val) => setCurrencyCode(val!)}
            radius="md"
            styles={{
              input: { background: "rgba(255,255,255,0.05)", border: "none" },
            }}
          />
          <NumberInput
            label="Amount"
            min={0}
            value={amount}
            onChange={(val) => setAmount(Number(val) || 0)}
            radius="md"
            styles={{
              input: { background: "rgba(255,255,255,0.05)", border: "none" },
            }}
          />
          <Button
            onClick={handleConfirm}
            color={mode === "add" ? "green" : "red"}
            fullWidth
            radius="md"
            size="md"
            variant="gradient"
            gradient={mode === "add"
              ? { from: "teal", to: "green" }
              : { from: "red", to: "grape" }}
          >
            {mode === "add" ? "Add Currency" : "Remove Currency"}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
