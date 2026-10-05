import { getAuthTokenSafe } from "@store/auth/authUtils";
import { useState } from "react";
import { Loader } from "@mantine/core";
import { IconCoins } from "@tabler/icons-react";
import { claimFromInventory } from "@services/currencyService";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { useInventoryStore } from "@store/inventory/inventoryStore";
import { loadInventories } from "@utils/loadinventory";
import { loadCharacters } from "@utils/loadCharacter";
import { showNotification } from "@components/Notification/Notification";
import classes from "./InventoryCurrencyClaim.module.css";

interface InventoryCurrencyClaimProps {
  inventoryId: string;
}

export function InventoryCurrencyClaim({ inventoryId }: InventoryCurrencyClaimProps) {
  const [loading, setLoading] = useState(false);

  const token = getAuthTokenSafe()!;
  const character = useCurrentCharacter();

  const inventory = useInventoryStore((state) =>
    state.inventories.find((x) => x.id === inventoryId)
  );

  const claimCurrencies = useInventoryStore((s) => s.claimCurrencies);

  const handleClaim = async () => {
    if (!token || !inventory || !inventory.currencies?.length) return;

    setLoading(true);

    try {
      if (!character) throw new Error("No character selected");
      // 1) Backend: claim currencies
      await claimFromInventory(character.id!, inventory.id!, inventory.currencies);

      // 2) Store: remove currencies locally
      claimCurrencies(inventory.id!, inventory.currencies);

      // 3) Reload global state from backend
      await loadInventories();
      await loadCharacters();

      showNotification({
        title: "Success",
        message: "Money money money!",
        color: "green",
      });
    } catch (error: unknown) {
      showNotification({
        title: "Error",
        message: "Failed to claim currencies: " + (error as Error).message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hidden once claimed: the store empties the inventory's currencies.
  if (!inventory?.currencies?.length) return null;

  const coins = inventory.currencies.map((c) => `${c.amount} ${c.currencyCode}`).join(", ");

  return (
    <div className={classes.claim}>
      <span className={classes.icon}>
        <IconCoins size={18} stroke={1.75} />
      </span>
      <span className={classes.text}>
        <span className={classes.amount}>{coins}</span> waiting to be claimed
      </span>
      <button type="button" className={classes.button} onClick={handleClaim} disabled={loading}>
        {loading && <Loader size={12} color="yellow" />}
        Claim
      </button>
    </div>
  );
}

