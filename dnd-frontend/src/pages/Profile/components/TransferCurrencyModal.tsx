import { Select, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { getCampaignCharacters } from "../../../services/campaignService";
import { transferBetweenCharacters } from "../../../services/currencyService";
import { useAuthStore } from "../../../store/useAuthStore";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { showNotification } from "../../../components/Notification/Notification";
import type { Character } from "../../../types/Character/Character";
import { loadCharacters } from "../../../utils/loadCharacter";
import { BaseModal } from "../../../components/BaseModal";
import { FormNumberInput } from "../../../components/common/FormNumberInput";
import "../../../styles/glassyInput.css";

interface Props {
  opened: boolean;
  onClose: () => void;
}

export function TransferCurrencyModal({ opened, onClose }: Props) {
  const token = useAuthStore.getState().token!;
  const character = useCharacterStore((s) => s.character)!;

  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const [currencyType, setCurrencyType] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    async function load() {
      if (!character?.campaignId) return;
      const data = await getCampaignCharacters(character.campaignId, token);
      setCharacters(data.filter((c) => c.id !== character.id));
    }
    if (opened) load();
  }, [opened, character, token]);

  async function handleTransfer() {
    if (!targetId || !currencyType || amount <= 0) return;

    setLoading(true);

    try {
      const sourceCurrency = character.currencies?.find(
        (c) => c.currencyCode === currencyType
      );

      if (!sourceCurrency) {
        showNotification({
          title: "Error",
          message: "You do not have this currency.",
          color: "red",
        });
        setLoading(false);
        return;
      }

      await transferBetweenCharacters(
        character.id!,
        targetId,
        [
          {
            type: sourceCurrency.type,
            currencyCode: sourceCurrency.currencyCode,
            amount,
          },
        ],
        token
      );

      showNotification({ title: "Success", message: "Currency transferred." });

      onClose();
      setAmount(0);
      setCurrencyType(null);
      setTargetId(null);
      loadCharacters(token);
    } catch (err: any) {
      showNotification({
        title: "Error",
        message: err?.message ?? "Transfer failed.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Transfer Currency"
      onSave={handleTransfer}
      loading={loading}
      saveLabel="Transfer"
    >
      <Stack>

        <Select
          classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown", option: "glassy-option" }}
          label="Send To"
          placeholder="Choose character"
          data={characters.map((c) => ({ value: c.id!, label: c.name }))}
          value={targetId}
          onChange={setTargetId}
        />

        <Select
          classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown", option: "glassy-option" }}
          label="Currency"
          placeholder="Choose currency"
          data={[
            { value: "gp", label: "Gold (gp)" },
            { value: "sp", label: "Silver (sp)" },
          ]}
          value={currencyType}
          onChange={setCurrencyType}
        />

        <FormNumberInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          label="Amount"
          value={amount}
          min={0}
          onChange={setAmount}
          hideControls
        />

      </Stack>
    </BaseModal>
  );
}
