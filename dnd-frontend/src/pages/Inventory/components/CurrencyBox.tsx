import { Group } from "@mantine/core";
import type { Currency } from "../../../types/Currency";
import CustomBadge from "../../../components/common/CustomBadge";
import { SectionColor } from "../../../types/SectionColor";
import { randomId } from "@mantine/hooks";
interface CurrencyBoxProps {
    currencies: Currency[];
}

export function CurrencyBox({ currencies }: CurrencyBoxProps) {

    function currencyColor (currencyCode: string) {
        switch (currencyCode) {
            case "gp": return SectionColor.Yellow;
            case "sp": return SectionColor.Gray;
            default: return SectionColor.Cyan;
        }
    }

    return (
        <Group>
            {currencies.map((currency) => (
                <CustomBadge
                key={randomId()}
                label={`${currency.amount} ${currency.currencyCode}`}
                color={currencyColor(currency.currencyCode)}
                variant = "light"
                size="lg"
                />
            ))}
        </Group>
    )
}