import { NumberInput } from "@mantine/core";
import type { NumberInputProps } from "@mantine/core";
import { useState, useEffect } from "react";

type StyledNumberInputProps =
  Pick<NumberInputProps, "min" | "max" | "label" | "classNames" | "styles" | "style" | "disabled" | "hideControls"
  > & {
    value: number;
    onChange: (v: number) => void;
  };

export function FormNumberInput({
  value,
  onChange,
  min,
  max,
  label,
  classNames,
  styles,
  style,
  hideControls = false,
  disabled = false,
}: StyledNumberInputProps) {
  const [editing, setEditing] = useState<string | number>(value);

  useEffect(() => {
    setEditing(value);
  }, [value]);

  return (
    <NumberInput
      value={editing}
      disabled={disabled}
      hideControls={hideControls}
      label={label}
      min={min}
      max={max}
      classNames={classNames}
      styles={styles}
      style={style}
      onChange={(v) => {
        setEditing(v);
        if (v !== null && typeof v === "number") {
          onChange(v);
        }
      }}
      onBlur={() => {
        if (typeof editing === "string" && editing.trim() === "") {
          const fallback = min ?? 0;
          setEditing(fallback);
          onChange(fallback);
        }
      }}
    />
  );
}
