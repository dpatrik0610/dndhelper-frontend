import { Textarea, type TextareaProps } from "@mantine/core";

export function GlassyTextarea(props: TextareaProps) {
  return (
    <Textarea
      {...props}
      classNames={{
        input: "glassy-input",
        label: "glassy-label",
        ...props.classNames,
      }}
    />
  );
}
