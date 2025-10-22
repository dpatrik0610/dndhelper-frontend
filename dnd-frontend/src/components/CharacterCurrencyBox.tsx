import { Group, Text } from "@mantine/core";
import CustomBadge from "./common/CustomBadge";
import { SectionColor } from "../types/SectionColor";
import { randomId } from "@mantine/hooks";
import { useCharacterStore } from "../store/useCharacterStore";
import { IconCoin } from "@tabler/icons-react";

export function CharacterCurrencyBox() {
    const currencies = useCharacterStore((state) => state.character?.currencies)!;

    const hasAnyCurrencies = currencies.length > 0;
    function currencyColor (currencyCode: string) {
        switch (currencyCode) {
            case "gp": return SectionColor.Yellow;
            case "sp": return SectionColor.Gray;
            default: return SectionColor.Cyan;
        }
    }

    return (
        <Group m={5} p={5} w="100%" align="center" justify="center" wrap="wrap">
            {hasAnyCurrencies ? currencies.map((currency) => (
                <CustomBadge
                key={randomId()}
                label={`${currency.amount} ${currency.currencyCode}`}
                color={currencyColor(currency.currencyCode)}
                variant = "light"
                size="lg"
                icon={<IconCoin size={16} />}
                />
            )) 
        : 
        <Text>You don't have any currencies.</Text>}
        </Group>
    )
}