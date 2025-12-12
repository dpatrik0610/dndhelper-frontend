import { ActionIcon, Box, Modal, Stack } from "@mantine/core";
import type { ModalProps } from "@mantine/core";
import type { ReactNode } from "react";
import { IconX } from "@tabler/icons-react";
import { magicGlowTheme } from "@styles/magic/glowTheme";

interface NoteModalShellProps {
  opened: boolean;
  onClose: () => void;
  isMobile: boolean;
  saving?: boolean;
  children: ReactNode;
  size?: ModalProps["size"];
  padding?: ModalProps["padding"];
}

export function NoteModalShell({
  opened,
  onClose,
  isMobile,
  saving = false,
  children,
  size = "lg",
  padding,
}: NoteModalShellProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen={isMobile}
      size={isMobile ? "100%" : size}
      padding={padding ?? (isMobile ? "0" : "md")}
      withCloseButton={false}
      closeOnEscape={!saving}
      closeOnClickOutside={!saving}
      centered
      overlayProps={{ backgroundOpacity: 0.35, blur: 6 }}
      transitionProps={{ transition: "fade", duration: 180 }}
      styles={{
        content: {
          ...magicGlowTheme.card,
          background:
            "linear-gradient(145deg, rgba(18,16,32,0.95), rgba(30,26,60,0.9))",
          borderRadius: isMobile ? 0 : 18,
          borderColor: magicGlowTheme.palette.border,
          boxShadow: "0 12px 34px rgba(0,0,0,0.45)",
          color: magicGlowTheme.text.color,
          padding: isMobile ? "14px" : "24px",
        },
        header: { display: "none" },
        title: { width: "100%" },
        body: { paddingTop: 4 },
        close: { color: "#f1f0ff" },
      }}
    >
      <Box style={{ position: "relative" }}>
        <ActionIcon
          variant="light"
          color="gray"
          radius="xl"
          size={isMobile ? "md" : "lg"}
          onClick={onClose}
          disabled={saving}
          style={{
            position: "absolute",
            top: isMobile ? 20 : 14,
            right: isMobile ? 10 : 14,
            zIndex: 8,
            background: "rgba(20,18,40,0.7)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
            backdropFilter: "blur(4px)",
          }}
        >
          <IconX size={16} />
        </ActionIcon>

        <Stack gap="md" pt={isMobile ? "sm" : 0}>
          {children}
        </Stack>
      </Box>
    </Modal>
  );
}
