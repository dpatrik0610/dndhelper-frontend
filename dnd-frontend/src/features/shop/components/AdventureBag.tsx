import { useMemo } from "react";
import { Box, Select } from "@mantine/core";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import type { Character } from "@appTypes/Character/Character";
import { formatCostToDisplay } from "@utils/currencyConverter";
import { itemKind } from "@utils/itemKind";
import { CharacterCurrencyArea } from "@features/profile/components/header/CharacterCurrencyArea";
import { ItemShelf, type ShelfEntry } from "@features/shop/components/ItemShelf";
import { ShopItemCard } from "@features/shop/components/ShopItemCard";
import { describeStats } from "@features/shop/itemStats";
import type { OfferPicker } from "@features/shop/offer";
import cardClasses from "@features/shop/styles/ShopItemCard.module.css";

interface AdventureBagProps {
    activeCharacter: Character;
    inventories: Inventory[];
    playerInventory: Inventory | null | undefined;
    selectedInventoryId: string | null;
    setSelectedInventoryId: (id: string | null) => void;
    equipments: Equipment[];
    handleDetailsOpen: (id: string) => void;
    handleSellOpen: (id: string) => void;
    offer?: OfferPicker;
}

interface BagEntry extends ShelfEntry {
    equipmentId: string;
    equipment?: Equipment;
    quantity: number;
}

export function AdventureBag({
    activeCharacter,
    inventories,
    playerInventory,
    selectedInventoryId,
    setSelectedInventoryId,
    equipments,
    handleDetailsOpen,
    handleSellOpen,
    offer,
}: AdventureBagProps) {
    const bagOptions = (activeCharacter.inventoryIds ?? [])
        .map(id => {
            const inv = inventories.find(i => i.id === id);
            return inv ? { value: id, label: inv.name ?? "Bag" } : null;
        })
        .filter((opt): opt is { value: string; label: string } => opt !== null);

    const entries = useMemo<BagEntry[]>(() => {
        const byId = new Map(equipments.map(e => [e.id, e]));
        return (playerInventory?.items ?? [])
            .filter(item => item.equipmentId)
            .map(item => {
                const equipment = byId.get(item.equipmentId!);
                const name = item.equipmentName || equipment?.name || "Unknown item";
                return {
                    key: item.equipmentId!,
                    equipmentId: item.equipmentId!,
                    name,
                    kind: itemKind({ ...equipment, name }),
                    equipment,
                    quantity: item.quantity ?? 1,
                };
            });
    }, [playerInventory?.items, equipments]);

    const sourceId = selectedInventoryId ?? undefined;

    return (
        <ItemShelf
            title="Your Bag"
            entries={entries}
            emptyText="Your satchel is empty."
            headerExtra={
                <Box style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <CharacterCurrencyArea
                        character={activeCharacter}
                        containerStyle={{ background: "transparent", border: "none", boxShadow: "none", padding: 0 }}
                    />
                    {bagOptions.length > 1 && (
                        <Select
                            size="xs"
                            data={bagOptions}
                            value={selectedInventoryId}
                            onChange={setSelectedInventoryId}
                            allowDeselect={false}
                            classNames={{ input: "glass-input" }}
                            w={150}
                            aria-label="Choose bag"
                        />
                    )}
                </Box>
            }
            renderCard={entry => (
                <ShopItemCard
                    name={entry.name}
                    kind={entry.kind}
                    tier={entry.equipment?.tier}
                    quantity={entry.quantity}
                    meta={describeStats(entry.equipment)}
                    price={entry.equipment?.cost?.quantity ? `worth ${formatCostToDisplay(entry.equipment.cost)}` : null}
                    onOpen={() => handleDetailsOpen(entry.equipmentId)}
                    offer={offer && {
                        picked: offer.picked("give", entry.equipmentId, sourceId),
                        max: entry.quantity,
                        onChange: quantity => offer.set({ side: "give", equipmentId: entry.equipmentId, name: entry.name, quantity, max: entry.quantity, sourceInventoryId: sourceId }),
                    }}
                    actions={
                        <button type="button" className={`glass-btn-secondary ${cardClasses.actionBtn}`} onClick={() => handleSellOpen(entry.equipmentId)}>
                            Sell
                        </button>
                    }
                />
            )}
        />
    );
}
