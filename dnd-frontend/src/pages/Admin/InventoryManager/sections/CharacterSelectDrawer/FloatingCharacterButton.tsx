import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";

interface FloatingCharacterButtonProps {
  opened: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

export function FloatingCharacterButton({ onClick, isMobile }: FloatingCharacterButtonProps) {
  return (
    <Tooltip label="Characters" position="bottom" withArrow>
      <ActionIcon
        variant="gradient"
        gradient={{ from: "orange", to: "grape" }}
        radius="md"
        size={isMobile ? "md" : "lg"}
        onClick={onClick}
        style={{
          position: "fixed",
          top: rem(2),
          right: rem(2),
          zIndex: 3000,
          boxShadow: "0 0 10px rgba(150, 50, 255, 0.4)",
        }}
      >
        <IconUsers size={20} />
      </ActionIcon>
    </Tooltip>
  );
}
