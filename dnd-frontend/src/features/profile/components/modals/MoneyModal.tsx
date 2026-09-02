import { useState, useEffect } from "react";
import { Button, Stack, Text, Select, SegmentedControl, Group } from "@mantine/core";
import { useCurrentCharacter, useCharacterCurrencyActions } from "@store/character/characterSelectors";
import { useToken } from "@store/auth/authSelectors";
import { useCharacterStore } from "@store/character/characterStore";
import { updateCharacter } from "@services/characterService";
import { getCampaignCharacters } from "@services/campaignService";
import { transferBetweenCharacters } from "@services/currencyService";
import { showNotification } from "@components/Notification/Notification";
import { loadCharacters } from "@utils/loadCharacter";
import { FormNumberInput } from "@components/common/FormNumberInput";
import type { Character } from "@appTypes/Character/Character";
import { BaseModal } from "@components/BaseModal";
import { IconCoins } from "@tabler/icons-react";

interface MoneyModalProps {
  opened: boolean;
  onClose: () => void;
}

type MoneyActionType = "send" | "delete";

export function MoneyModal({ opened, onClose }: MoneyModalProps) {
  const token = useToken();
  const character = useCurrentCharacter()!;
  const { removeCurrency: removeCurrencyLocal } = useCharacterCurrencyActions();

  const [actionType, setActionType] = useState<MoneyActionType>("send");
  const [loading, setLoading] = useState(false);

  // Common/Delete state
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);

  // Send state
  const [characters, setCharacters] = useState<Character[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      setActionType("send");
      setSelectedCurrency(null);
      setAmount(0);
      setTargetId(null);
    }
  }, [opened]);

  // Load campaign characters for transfer
  useEffect(() => {
    async function load() {
      if (!character?.campaignId || !token) return;
      try {
        const data = await getCampaignCharacters(character.campaignId);
        setCharacters(data.filter((c) => c.id !== character.id));
      } catch (err) {
        console.error("Failed to load campaign characters:", err);
      }
    }
    if (opened && actionType === "send") {
      load();
    }
  }, [opened, actionType, character, token]);

  if (!character) return null;

  const currencies = character.currencies ?? [];
  const activeCurrencyObj = currencies.find((c) => c.type === selectedCurrency);
  const maxAmount = activeCurrencyObj?.amount ?? 0;

  const getCurrencyName = (t: string) =>
    ({ gp: "Gold", sp: "Silver", cp: "Copper", pp: "Platinum", ep: "Electrum" }[t] ?? "Unknown");

  const handleAction = async () => {
    if (!selectedCurrency || !amount || amount <= 0) return;

    setLoading(true);
    try {
      if (actionType === "delete") {
        // Delete Money
        removeCurrencyLocal(selectedCurrency, amount);
        await updateCharacter(useCharacterStore.getState().character!);
        showNotification({
          title: "Currency Removed",
          message: `Successfully removed ${amount} ${getCurrencyName(selectedCurrency)} (${selectedCurrency}).`,
          color: "green",
        });
        onClose();
      } else {
        // Send Money (Transfer)
        if (!targetId) {
          showNotification({
            title: "Error",
            message: "Please select a target character.",
            color: "red",
          });
          setLoading(false);
          return;
        }

        const sourceCurrency = currencies.find((c) => c.type === selectedCurrency);
        if (!sourceCurrency) {
          showNotification({
            title: "Error",
            message: "You do not have this currency.",
            color: "red",
          });
          setLoading(false);
          return;
        }

        await transferBetweenCharacters(character.id!, targetId, [
          {
            type: sourceCurrency.type,
            currencyCode: sourceCurrency.currencyCode,
            amount,
          },
        ]);

        showNotification({
          title: "Success",
          message: `Transferred ${amount} ${sourceCurrency.currencyCode} successfully.`,
          color: "green",
        });

        onClose();
        await loadCharacters();
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      showNotification({
        title: "Error",
        message: errMsg || "Transaction failed.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={actionType === "send" ? "Send Currency" : "Remove Currency"}
      size="md"
      showSaveButton={false}
      showCancelButton={false}
    >
      <Stack gap="md">
        
        {/* PREMIUM THEMED SEGMENTED CONTROL */}
        <SegmentedControl
          value={actionType}
          onChange={(v) => {
            setActionType(v as MoneyActionType);
            setSelectedCurrency(null);
            setAmount(0);
          }}
          data={[
            { label: "Send Currency", value: "send" },
            { label: "Remove Currency", value: "delete" },
          ]}
          fullWidth
          size="xs"
          styles={{
            root: {
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
              borderRadius: "8px",
              padding: "4px",
            },
            indicator: {
              background: "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))",
              boxShadow: "var(--theme-glow-shadow-primary)",
              borderRadius: "6px",
            },
            label: {
              color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 500,
              fontSize: "11px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "color 0.2s ease",
              "&[data-active]": {
                color: "#121214 !important",
                fontWeight: 700,
              }
            }
          }}
        />

        {currencies.length === 0 ? (
          <Text ta="center" c="gray.4" py="sm">
            No currencies available.
          </Text>
        ) : (
          <>
            {actionType === "send" && (
              <Select
                classNames={{
                  input: "glassy-input",
                  label: "glassy-label",
                  dropdown: "glassy-dropdown",
                  option: "glassy-option",
                }}
                label="Recipient Character"
                placeholder="Choose character"
                data={characters.map((c) => ({ value: c.id!, label: c.name }))}
                value={targetId}
                onChange={setTargetId}
                styles={{
                  label: {
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 300,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontSize: "10px",
                    color: "var(--theme-color-text-secondary)",
                    marginBottom: "4px",
                  },
                }}
              />
            )}

            <Select
              classNames={{
                input: "glassy-input",
                label: "glassy-label",
                dropdown: "glassy-dropdown",
                option: "glassy-option",
              }}
              label="Select Currency type"
              placeholder="Choose a currency"
              value={selectedCurrency}
              onChange={(val) => {
                setSelectedCurrency(val);
                setAmount(0);
              }}
              data={currencies.map((c) => ({
                value: c.type,
                label: `${getCurrencyName(c.type)} (${c.amount} ${c.currencyCode})`,
              }))}
              styles={{
                label: {
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 300,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  color: "var(--theme-color-text-secondary)",
                  marginBottom: "4px",
                },
              }}
            />

            {selectedCurrency && (
              <FormNumberInput
                label={`Amount to ${actionType === "send" ? "send" : "delete"}`}
                min={1}
                max={maxAmount}
                value={amount}
                onChange={(v) => setAmount(v)}
                hideControls
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                styles={{
                  label: {
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 300,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    fontSize: "10px",
                    color: "var(--theme-color-text-secondary)",
                    marginBottom: "4px",
                  },
                }}
              />
            )}

            <Group justify="flex-end" mt="xl" gap="sm">
              <Button
                onClick={onClose}
                className="glass-btn-secondary"
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 300,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontSize: "11px",
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={handleAction}
                disabled={!selectedCurrency || !amount || (actionType === "send" && !targetId)}
                loading={loading}
                className="glass-btn-primary"
                leftSection={<IconCoins size={14} />}
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 300,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontSize: "11px",
                }}
              >
                {actionType === "send" ? "Send" : "Remove"}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </BaseModal>
  );
}
