import { Modal, Group, Button, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface BaseModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: string | number;
  loading?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
  saveLabel?: string;
  showCancelButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  withCloseButton?: boolean;
  fullScreen?: boolean;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  opened,
  onClose,
  title,
  children,
  size = "lg",
  loading = false,
  onSave,
  showSaveButton = true,
  saveLabel = "Save",
  showCancelButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  withCloseButton = true,
  fullScreen = false,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="lg" c="red.3" style={{ letterSpacing: 0.5 }}>
          {title}
        </Text>
      }
      size={fullScreen ? "100%" : size}
      withCloseButton={withCloseButton}
      closeOnClickOutside={closeOnClickOutside && !loading}
      closeOnEscape={closeOnEscape && !loading}
      overlayProps={{
        backgroundOpacity: 0.25,
        blur: 4,
      }}
      transitionProps={{
        transition: "fade",
        duration: 200,
        timingFunction: "ease",
      }}
      fullScreen={fullScreen}
      styles={{
        content: {
          backdropFilter: "blur(10px)",
          background: "rgba(25, 0, 0, 0.45)",
          border: "1px solid rgba(255, 80, 80, 0.4)",
          boxShadow:
            "0 0 12px rgba(255, 0, 0, 0.25), inset 0 0 6px rgba(255, 0, 0, 0.15)",
          borderRadius: fullScreen ? "0" : "10px",
          color: "white",
          transition: "all 0.2s ease-in-out",
          minHeight: fullScreen ? "100vh" : undefined,
          margin: fullScreen ? 0 : undefined,
          padding: fullScreen ? "5px" : undefined,
          paddingTop: 0
        },
        header: {
          borderBottom: "1px solid rgba(255, 100, 100, 0.2)",
          background: "transparent",
          paddingLeft: "1rem",
        },
        body: {
          paddingTop: "1rem",
        },
      }}
    >
      {children}

      {(showSaveButton || showCancelButton) && (
        <Group justify="flex-end" mt="xl">
          {showCancelButton && (
            <Button
              variant="outline"
              color="red"
              onClick={onClose}
              disabled={loading}
              leftSection={<IconX size={16} />}
            >
              Cancel
            </Button>
          )}

          {showSaveButton && onSave && (
            <Button
              onClick={onSave}
              loading={loading}
              disabled={loading}
              variant="gradient"
              gradient={{ from: "red", to: "pink", deg: 45 }}
            >
              {saveLabel}
            </Button>
          )}
        </Group>
      )}
    </Modal>
  );
};
