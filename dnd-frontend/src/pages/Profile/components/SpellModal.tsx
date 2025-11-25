import { Modal, ActionIcon, Box } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { SpellCard } from "../../Spells/components/SpellCard";

interface SpellModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SpellModal({ opened, onClose }: SpellModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      fullScreen={isMobile}
      withCloseButton={false}
      padding={0}
      size={isMobile? "100%" : "auto"}
      styles={{
        content: {
          background:
            "linear-gradient(160deg, rgba(70,0,120,0.35) 0%, rgba(20,0,40,0.55) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(190,120,255,0.25)",
          boxShadow: "0 0 14px rgba(150, 0, 255, 0.35)",
          padding: 0,
          position: "relative",
          width: isMobile ? "100%" : "min(900px, 90vw)",
          maxHeight: isMobile ? "100%" : "80vh",
        },
      }}
    >
      <Box
        style={{
          paddingTop: 64,
          paddingInline: 16,
          paddingBottom: 16,
          overflowY: "auto",
        }}
      >
        <ActionIcon
          onClick={onClose}
          size="lg"
          radius="xl"
          variant="filled"
          style={{
            position: isMobile ? "fixed" : "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            background: "rgba(80,40,120,0.45)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(200,150,255,0.35)",
          }}
        >
          <IconX size={22} stroke={2.3} />
        </ActionIcon>

        <SpellCard />
      </Box>
    </Modal>
  );
}
