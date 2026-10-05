import { Group, Text } from "@mantine/core";
import CustomBadge from "@components/common/CustomBadge";
import { SectionColor } from "@appTypes/SectionColor";
import { useInventoryStore } from "@store/inventory/inventoryStore";

export interface InventoryCurrencyBoxProps{
    inventoryId: string;
}

export function InventoryCurrencyBox({inventoryId} : InventoryCurrencyBoxProps) {
    const currencies = useInventoryStore((state) => state.inventories.find(x => x.id == inventoryId)?.currencies)!

    const hasAnyCurrencies = currencies.length > 0;
    function currencyColor (currencyCode: string) {
        switch (currencyCode) {
            case "gp": return SectionColor.Yellow;
            case "sp": return SectionColor.Gray;
            default: return SectionColor.Cyan;
        }
    }

    return (
        <Group>
            {hasAnyCurrencies ? currencies.map((currency) => (
                <CustomBadge
                key={currency.currencyCode}
                label={`${currency.amount} ${currency.currencyCode}`}
                color={currencyColor(currency.currencyCode)}
                variant = "light"
                size="lg"
                />
            )) 
        : 
        <Text>You don't have any currencies.</Text>}
        </Group>
    )
}

