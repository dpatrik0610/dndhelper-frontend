import { TextInput, type TextInputProps } from "@mantine/core";

export function GlassyTextInput(props: TextInputProps) {
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
