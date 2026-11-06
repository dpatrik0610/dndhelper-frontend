import type { Ref } from "react";
import { TextInput, type TextInputProps } from "@mantine/core";

export function GlassyTextInput(props: TextInputProps & { ref?: Ref<HTMLInputElement> }) {
  return (
    <TextInput
      {...props}
      classNames={{
        input: "glassy-input",
        label: "glassy-label",
        ...props.classNames,
      }}
    />
  );
}
