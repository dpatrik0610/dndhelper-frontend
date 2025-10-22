import { useState } from "react";
import { Button, Group, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuthStore } from "../../../store/useAuthStore";
import { CustomFieldset } from "../../../components/CustomFieldset";
import { transferCurrenciesToCharacter } from "../../../services/currencyService";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useInventoryStore } from "../../../store/useInventorystore";
import { updateInventory } from "../../../services/inventoryService";
import { InventoryCurrencyBox } from "./InventoryCurrencyBox";
import { loadCharacters } from "../../../utils/loadCharacter";

interface InventoryCurrencyClaimProps {
  inventoryId: string;
}

export function InventoryCurrencyClaim({
  inventoryId,
}: InventoryCurrencyClaimProps) {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = useAuthStore.getState().token;

  const characterId = useCharacterStore((state) => state.character!.id);
  const inventory = useInventoryStore((state) => state.inventories.find(x => x.id == inventoryId));

  const { updateInventoryCurrencies } = useInventoryStore.getState();

  const handleClaim = async () => {
    if (!token || !inventory) return;
    setLoading(true);

    try {
      await transferCurrenciesToCharacter(characterId!, inventory?.currencies!, token);

      // Remove currencies from inventory in store
      updateInventoryCurrencies(inventoryId, []);
      var updated = useInventoryStore.getState().inventories.find(x => x.id == inventory.id);

      // Reload character.
      loadCharacters(token);
      
      updateInventory(inventory.id!, updated!, token);
      notifications.show({
        title: "Success",
        message: "Successfully claimed!",
        color: "green",
      });

      console.log("Currencies in inventory after claiming: " + inventory?.currencies);
      setClaimed(true);

    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to claim currencies." + error,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (claimed || !inventory || !inventory.currencies || inventory.currencies.length === 0) return null;
  return (
    <CustomFieldset label="Available Currency">
      <Group justify="space-between" align="center" mt="xs">
        <InventoryCurrencyBox inventoryId={inventory.id!} />

        <Button
          variant="gradient"
          gradient={{ from: "violet", to: "cyan", deg: 45 }}
          size="sm"
          radius="md"
          onClick={handleClaim}
          disabled={loading}
        >
          {loading ? <Loader size="xs" color="white" /> : "Claim"}
        </Button>
      </Group>
    </CustomFieldset>
  );
}
