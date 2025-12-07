import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { magicGlowTheme } from "@styles/magic/glowTheme";

interface NotesSearchProps {
  value: string;
  onChange: (value: string) => void;
  isMobile?: boolean;
}

export function NotesSearch({ value, onChange, isMobile }: NotesSearchProps) {
  return (
    <TextInput
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="Search notes..."
      radius="lg"
      variant="filled"
      size={isMobile ? "md" : "sm"}
      leftSection={<IconSearch size={16} />}
      styles={{
        input: {
          ...magicGlowTheme.card,
          background: "rgba(30, 26, 60, 0.75)",
          borderColor: magicGlowTheme.palette.border,
          color: magicGlowTheme.text.color,
          paddingBlock: isMobile ? 12 : 10,
        },
      }}
    />
  );
}
