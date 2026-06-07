import { ActionIcon, Box, Group, Modal, Text } from "@mantine/core";
import type { ModalProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";

export type AdminGlassModalVariant = "default" | "danger";

interface AdminGlassModalProps {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: ModalProps["size"];
  variant?: AdminGlassModalVariant;
  centered?: boolean;
  fullScreen?: boolean;
  padding?: ModalProps["padding"];
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  loading?: boolean;
  withCloseButton?: boolean;
}

const variantStyles: Record<
  AdminGlassModalVariant,
  { content: React.CSSProperties; titleColor: string }
> = {
  default: {
    content: {
      background: "rgba(22, 24, 32, 0.96)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    },
    titleColor: "white",
  },
  danger: {
    content: {
      background: "rgba(40, 12, 18, 0.96)",
      border: "1px solid rgba(255, 100, 100, 0.2)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    },
    titleColor: "#fca5a5",
  },
};

export function AdminGlassModal({
  opened,
  onClose,
  title,
  children,
  size = "md",
  variant = "default",
  centered = true,
  fullScreen = false,
  padding = "md",
  closeOnClickOutside = true,
  closeOnEscape = true,
  loading = false,
  withCloseButton = true,
}: AdminGlassModalProps) {
  const theme = variantStyles[variant];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered={centered}
      fullScreen={fullScreen}
      size={size}
      padding={padding}
      closeOnClickOutside={closeOnClickOutside && !loading}
      closeOnEscape={closeOnEscape && !loading}
      overlayProps={{ backgroundOpacity: 0.35, blur: 6 }}
      transitionProps={{ transition: "fade", duration: 180 }}
      styles={{
        header: { display: "none" },
        body: { paddingTop: title || withCloseButton ? 0 : undefined },
        content: {
          ...theme.content,
          borderRadius: fullScreen ? 0 : 10,
          color: "white",
        },
      }}
    >
      {(title || withCloseButton) && (
        <Group justify="space-between" align="center" mb="md" px={padding === 0 ? "md" : undefined} wrap="nowrap" mt={padding === 0 ? "md" : 12}>
          {title ? (
            typeof title === "string" ? (
              <Text fw={700} size="lg" c={theme.titleColor}>
                {title}
              </Text>
            ) : (
              <Box style={{ flex: 1, minWidth: 0 }}>{title}</Box>
            )
          ) : (
            <span />
          )}
          {withCloseButton && (
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              size="md"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
            >
              <IconX size={16} />
            </ActionIcon>
          )}
        </Group>
      )}

      {children}
    </Modal>
  );
}
