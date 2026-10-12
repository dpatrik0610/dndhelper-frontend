import { Autocomplete, Box, Group, Text, type AutocompleteProps } from "@mantine/core";
import { coinInfo, STANDARD_COINS } from "@utils/currency";

type Props = Omit<AutocompleteProps, "data" | "renderOption" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  /** Currency names to offer; defaults to the standard coins. Free text is always allowed. */
  suggestions?: string[];
};

/** Pick a standard coin or type any custom currency name. */
export function CurrencyTypeInput({ suggestions = STANDARD_COINS, ...props }: Props) {
  return (
    <Autocomplete
      label="Currency"
      placeholder="gp, sp, or a custom name"
      maxLength={32}
      data={suggestions}
      // Show every option while the field holds a complete pick, so switching coins needs no clearing.
      filter={({ options, search }) => {
        const s = search.trim().toLowerCase();
        const values = options.filter((o) => "value" in o);
        if (!s || values.some((o) => "value" in o && o.value.toLowerCase() === s)) return options;
        return values.filter((o) => "value" in o && o.value.toLowerCase().includes(s));
      }}
      renderOption={({ option }) => {
        const coin = coinInfo(option.value);
        return (
          <Group gap="xs" wrap="nowrap">
            <Box w={10} h={10} style={{ borderRadius: "50%", background: coin.gradient, flexShrink: 0 }} />
            <Text size="sm" fw={600}>{coin.label}</Text>
            {coin.standard && <Text size="xs" c="dimmed">{coin.name}</Text>}
          </Group>
        );
      }}
      {...props}
    />
  );
}
