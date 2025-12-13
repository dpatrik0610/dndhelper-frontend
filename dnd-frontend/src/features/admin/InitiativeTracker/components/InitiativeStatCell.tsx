import { NumberInput } from "@mantine/core";

interface InitiativeStatCellProps {
  value: number | null | undefined;
  onChange: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function InitiativeStatCell({ value, onChange, disabled, readOnly }: InitiativeStatCellProps) {
  return (
    <NumberInput
      size="xs"
      value={value ?? 0}
      onChange={(val) => onChange(Number(val ?? 0))}
      classNames={{ input: "glassy-input", label: "glassy-label" }}
      disabled={disabled || readOnly}
      readOnly={readOnly}
    />
  );
}
