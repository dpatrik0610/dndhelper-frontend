import { ColorInput } from "@mantine/core";

interface InitiativeColorCellProps {
  value?: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  presets: string[];
}

export function InitiativeColorCell({ value, onChange, disabled, presets }: InitiativeColorCellProps) {
  return (
    <ColorInput
      size="xs"
      value={value}
      onChange={onChange}
      withPicker={false}
      swatches={presets}
      swatchesPerRow={5}
      classNames={{ input: "glassy-input", label: "glassy-label" }}
      disabled={disabled}
    />
  );
}
