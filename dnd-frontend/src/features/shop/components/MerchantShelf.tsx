import { useMemo } from "react";
import { Menu } from "@mantine/core";
import { IconCoins, IconDotsVertical, IconHandGrab, IconSearch } from "@tabler/icons-react";
import type { Shop } from "@appTypes/Shop/Shop";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { formatCostToDisplay } from "@utils/currencyConverter";
import { itemKind } from "@utils/itemKind";
import { ItemShelf, type ShelfEntry } from "@features/shop/components/ItemShelf";
import { ShopItemCard } from "@features/shop/components/ShopItemCard";
import { describeStats } from "@features/shop/itemStats";
import type { OfferPicker } from "@features/shop/offer";
import cardClasses from "@features/shop/styles/ShopItemCard.module.css";

interface MerchantShelfProps {
    shopInventory: Inventory | null | undefined;
    equipments: Equipment[];
    activeShop: Shop;
    handleDetailsOpen: (id: string) => void;
    handleStealOpen: (id: string) => void;
    handleBuyOpen: (id: string) => void;
    handleHaggleOpen: (id: string) => void;
    offer?: OfferPicker;
}

interface MerchantEntry extends ShelfEntry {
    equipmentId: string;
    equipment?: Equipment;
    quantity: number | null;
}

export function MerchantShelf({
    shopInventory,
    equipments,
    activeShop,
    handleDetailsOpen,
    handleStealOpen,
    handleBuyOpen,
    handleHaggleOpen,
    offer,
}: MerchantShelfProps) {
    const entries = useMemo<MerchantEntry[]>(() => {
        const byId = new Map(equipments.map(e => [e.id, e]));
        return (shopInventory?.items ?? [])
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
                    quantity: item.quantity ?? null,
                };
            });
    }, [shopInventory?.items, equipments]);

    return (
        <ItemShelf
            title="Merchant"
            entries={entries}
            emptyText="The merchant's shelves are bare."
            renderCard={entry => (
                <ShopItemCard
                    name={entry.name}
                    kind={entry.kind}
                    tier={entry.equipment?.tier}
                    quantity={entry.quantity}
                    quantityLabel={entry.quantity != null ? `${entry.quantity} left` : undefined}
                    meta={describeStats(entry.equipment)}
                    price={entry.equipment ? formatCostToDisplay(entry.equipment.cost, activeShop.priceMultiplier) : null}
                    onOpen={() => handleDetailsOpen(entry.equipmentId)}
                    offer={offer && {
                        picked: offer.picked("want", entry.equipmentId),
                        max: entry.quantity,
                        onChange: quantity => offer.set({ side: "want", equipmentId: entry.equipmentId, name: entry.name, quantity, max: entry.quantity }),
                    }}
                    actions={
                        <>
                            <button type="button" className={`glass-btn-primary ${cardClasses.actionBtn}`} onClick={() => handleBuyOpen(entry.equipmentId)}>
                                Buy
                            </button>
                            <Menu position="bottom-end" withinPortal shadow="md" width={160}>
                                <Menu.Target>
                                    <button type="button" className={cardClasses.iconBtn} aria-label={`More actions for ${entry.name}`}>
                                        <IconDotsVertical size={15} />
                                    </button>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    <Menu.Item leftSection={<IconSearch size={14} />} onClick={() => handleDetailsOpen(entry.equipmentId)}>Inspect</Menu.Item>
                                    <Menu.Item leftSection={<IconCoins size={14} />} onClick={() => handleHaggleOpen(entry.equipmentId)}>Haggle</Menu.Item>
                                    <Menu.Item leftSection={<IconHandGrab size={14} />} color="red" onClick={() => handleStealOpen(entry.equipmentId)}>Steal</Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        </>
                    }
                />
            )}
        />
    );
}
