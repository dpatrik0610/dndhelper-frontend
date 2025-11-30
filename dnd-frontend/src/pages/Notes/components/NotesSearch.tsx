import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface NotesSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function NotesSearch({ value, onChange }: NotesSearchProps) {
  return (
    <TextInput
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="Search notes..."
      radius="md"
      variant="filled"
      leftSection={<IconSearch size={14} />}
      styles={{
        input: {
          background: "rgba(255, 0, 0, 0.12)",
          border: "1px solid rgba(255, 100, 100, 0.35)",
          color: "rgba(255, 230, 230, 0.95)",
        },
      }}
    />
  );
}
