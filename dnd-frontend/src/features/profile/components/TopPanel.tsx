import { Group, Title } from "@mantine/core";
import { SwitchCharacterButton } from "./SwitchCharacterButton";

interface TopPanelProps {
  character: any;
  isMobile: boolean;
}

export function TopPanel({ character, isMobile }: TopPanelProps) {
  return (
    <Group justify="space-between" align="center" style={{ width: "100%" }}>
      <Title
        order={1}
        className="narrative-title"
        style={{
          color: "var(--theme-color-text-primary, #ffffff)",
          fontSize: isMobile ? "22px" : "32px",
          fontWeight: 850,
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          lineHeight: 1.1,
        }}
      >
        {character.name || "Unnamed"}
      </Title>
      <SwitchCharacterButton />
    </Group>
  );
}
