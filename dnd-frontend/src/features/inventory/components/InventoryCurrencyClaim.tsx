import { useState } from "react";
import { Button, Group, Loader, Box, Text } from "@mantine/core";
import { useAuthStore } from "@store/useAuthStore";
import { claimFromInventory } from "@services/currencyService";
import { useCharacterStore } from "@store/useCharacterStore";
import { useInventoryStore } from "@store/useInventorystore";
import { loadInventories } from "@utils/loadinventory";
import { loadCharacters } from "@utils/loadCharacter";
import { InventoryCurrencyBox } from "./InventoryCurrencyBox";
import { showNotification } from "@components/Notification/Notification";

interface InventoryCurrencyClaimProps {
  inventoryId: string;
}

export function InventoryCurrencyClaim({ inventoryId }: InventoryCurrencyClaimProps) {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = useAuthStore.getState().token!;
  const character = useCharacterStore((s) => s.character)!;

  const inventory = useInventoryStore((state) =>
    state.inventories.find((x) => x.id === inventoryId)
  );

  const claimCurrencies = useInventoryStore((s) => s.claimCurrencies);

  const handleClaim = async () => {
    if (!token || !inventory || !inventory.currencies?.length) return;

    setLoading(true);

    try {
      // 1) Backend: claim currencies
      await claimFromInventory(character.id!, inventory.id!, inventory.currencies, token);

      // 2) Store: remove currencies locally
      claimCurrencies(inventory.id!, inventory.currencies);

      // 3) Reload global state from backend
      await loadInventories(token);
      await loadCharacters(token);

      showNotification({
        title: "Success",
        message: "Money money money!",
        color: "green",
      });

      setClaimed(true);
    } catch (error: any) {
      showNotification({
        title: "Error",
        message: "Failed to claim currencies: " + error?.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // No display if nothing to claim
  if (claimed || !inventory?.currencies?.length) return null;

  return (
    <Box
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: 12,
        background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
        boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
      }}
    >
      <Text size="sm" fw={700} c="white" mb={6}>
        Available Currency
      </Text>
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
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
    </Box>
  );
}

