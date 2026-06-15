import { getAuthTokenSafe } from "@store/auth/authUtils";
import { useState, useEffect } from "react";
import { Stack, Select, NumberInput, SegmentedControl } from "@mantine/core";
import { BaseModal } from "@components/BaseModal";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import { getCampaignOverviewByCharacter } from "@services/campaignService";

import { showNotification } from "@components/Notification/Notification";
import type { CampaignCharacterDto } from "@appTypes/CampaignOverview";

interface MoveItemModalProps {
  opened: boolean;
  onClose: () => void;
  inventories: Inventory[];
  currentInventoryId: string;
  currentCharacterId?: string | null;
  itemId: string | null;
  onConfirm: (payload: { targetInventoryId?: string; targetCharacterId?: string; amount: number }) => void;
}

export function MoveItemModal({
  opened,
  onClose,
  inventories,
  currentInventoryId,
  currentCharacterId,
  itemId,
  onConfirm,
}: MoveItemModalProps) {
  const [targetType, setTargetType] = useState<"inventory" | "character">("inventory");
  const [targetInventory, setTargetInventory] = useState<string | null>(null);
  const [targetCharacter, setTargetCharacter] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [maxAmount, setMaxAmount] = useState<number>(1);
  const [availableCharacters, setAvailableCharacters] = useState<CampaignCharacterDto[]>([]);

  useEffect(() => {
    if (!itemId) return;
    const currentInventory = inventories.find((i) => i.id === currentInventoryId);
    const item = currentInventory?.items?.find((i) => i.equipmentId === itemId);
    setMaxAmount(item?.quantity ?? 1);
    setAmount(item?.quantity ?? 1);
  }, [itemId, currentInventoryId, inventories]);

  useEffect(() => {
    if (!opened) return;
    setTargetType("inventory");
    setTargetInventory(null);
    setTargetCharacter(null);
    setAvailableCharacters([]);
  }, [opened]);

  const otherInventories = inventories
    .filter((i) => i.id && i.id !== currentInventoryId)
    .map((i) => ({ value: i.id!, label: i.name || "Unnamed Inventory" }));

  useEffect(() => {
    const loadCharacters = async () => {
      if (!opened || targetType !== "character") return;
      if (!currentCharacterId) return;
      const token = getAuthTokenSafe();
      if (!token) return;

      try {
        const overview = await getCampaignOverviewByCharacter(currentCharacterId, token);
        if (!overview) {
          setAvailableCharacters([]);
          showNotification({
            title: "No Campaign Found",
            message: "No campaign found for this character.",
            color: "yellow",
          });
          return;
        }
        const others = overview.characters
          .filter((c) => c.id && c.id !== currentCharacterId);
        setAvailableCharacters(others);
      } catch (error) {
        console.warn("[MoveItemModal] Failed to load campaign overview", { currentCharacterId, error });
        setAvailableCharacters([]);
      }
    };
    void loadCharacters();
  }, [opened, targetType, currentCharacterId]);

  const otherCharacters = availableCharacters
    .filter((c) => c.id)
    .map((c) => ({ value: c.id!, label: c.name || "Unnamed Character" }));

  const handleConfirm = () => {
    if (targetType === "inventory") {
      if (!targetInventory) return;
      onConfirm({ targetInventoryId: targetInventory, amount });
      return;
    }

    if (!targetCharacter) return;
    onConfirm({ targetCharacterId: targetCharacter, amount });
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Move Item"
      onSave={handleConfirm}
      saveLabel="Move"
      showSaveButton
      showCancelButton
    >
      <Stack>
        <SegmentedControl
          value={targetType}
          onChange={(value) => setTargetType(value as "inventory" | "character")}
          data={[
            { label: "Inventory", value: "inventory" },
            { label: "Character", value: "character" },
          ]}
          size="sm"
          radius="md"
          classNames={{
            root: "glassy-segmented",
            control: "glassy-segmented__control",
            label: "glassy-segmented__label",
          }}
        />
        {targetType === "inventory" && (
          <Select
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Target Inventory"
            placeholder="Select inventory"
            data={otherInventories}
            value={targetInventory}
            onChange={setTargetInventory}
            key={otherInventories.map((inv) => inv.value).join("-")}
          />
        )}
        {targetType === "character" && (
          <Select
            classNames={{input: "glassy-input", label: "glassy-label"}}
            label="Target Character"
            placeholder="Select character"
            data={otherCharacters}
            value={targetCharacter}
            onChange={setTargetCharacter}
            key={otherCharacters.map((c) => c.value).join("-")}
          />
        )}
        <NumberInput
          classNames={{input: "glassy-input", label: "glassy-label"}}
          label="Amount to move"
          min={1}
          max={maxAmount}
          value={amount}
          onChange={(val) => setAmount(Number(val ?? 1))}
        />
      </Stack>
    </BaseModal>
  );
}


