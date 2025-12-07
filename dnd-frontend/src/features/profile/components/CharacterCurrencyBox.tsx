import { Group, Text } from "@mantine/core";
import { IconCoin } from "@tabler/icons-react";
import CustomBadge from "@components/common/CustomBadge";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterStore } from "@store/useCharacterStore";

export function CharacterCurrencyBox() {
  const currencies = useCharacterStore((state) => state.character?.currencies ?? []);
  const visibleCurrencies = currencies.filter((c) => (c.amount ?? 0) > 0);

  const hasAnyCurrencies = visibleCurrencies.length > 0;
  function currencyColor(currencyCode: string) {
    switch (currencyCode) {
      case "gp":
        return SectionColor.Yellow;
      case "sp":
        return SectionColor.Gray;
      default:
        return SectionColor.Cyan;
    }
  }

  return (
    <Group m={5} p={5} w="100%" align="center" justify="center" wrap="wrap">
      {hasAnyCurrencies ? (
        visibleCurrencies.map((currency) => (
          <CustomBadge
            key={`${currency.type}-${currency.currencyCode}`}
            label={`${currency.amount} ${currency.currencyCode}`}
            color={currencyColor(currency.currencyCode)}
            variant="light"
            size="lg"
            icon={<IconCoin size={16} />}
          />
        ))
      ) : (
        <Text>You don't have any currencies.</Text>
      )}
    </Group>
  );
}
