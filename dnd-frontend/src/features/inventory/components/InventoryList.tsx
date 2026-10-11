import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import type { InventorySort, InventoryViewMode } from "@features/inventory/hooks/useInventoryFilters";
import { Stack, Title } from "@mantine/core";
import InventoryBox from "./InventoryBox";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { wornInventoryId } from "@utils/effects";

interface InventoryListProps {
  inventories: Inventory[];
  details: Map<string, EquipmentUserResponse>;
  searchTerm: string;
  sortBy: InventorySort;
  viewMode: InventoryViewMode;
}

export function InventoryList({ inventories, details, searchTerm, sortBy, viewMode }: InventoryListProps) {
  const choice = useCurrentCharacter()?.equipmentInventoryId;
  const wornId = wornInventoryId(choice, inventories);
  // The worn inventory leads; the rest keep their order (sort is stable).
  const ordered = [...inventories].sort((a, b) => Number(b.id === wornId) - Number(a.id === wornId));

  if (!inventories.length)
    return (
      <Title order={4} c="dimmed" ta="center" mt="xl">
        This character has no inventories yet.
      </Title>
    );

  return (
    <Stack gap="sm">
      {ordered.map((inv) => (
        <InventoryBox
          key={inv.id}
          inventory={inv}
          inventories={inventories}
          details={details}
          searchTerm={searchTerm}
          sortBy={sortBy}
          viewMode={viewMode}
        />
      ))}
    </Stack>
  );
}
