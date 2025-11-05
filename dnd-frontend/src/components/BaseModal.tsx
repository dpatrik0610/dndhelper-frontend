// components/Admin/BaseModal.tsx
import { Modal, Group, Button, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

interface BaseModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: string | number;
  loading?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
  saveLabel?: string;
  showCancelButton?: boolean;
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
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="xl" c="red.3" style={{ letterSpacing: 0.5 }}>
          {title}
        </Text>
      }
      size={size}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      overlayProps={{
        backgroundOpacity: 0.25,
        blur: 4,
      }}
      transitionProps={{
        transition: "fade",
        duration: 200,
        timingFunction: "ease",
      }}
      styles={{
        content: {
          backdropFilter: "blur(10px)",
          background: "rgba(25, 0, 0, 0.45)",
          border: "1px solid rgba(255, 80, 80, 0.4)",
          boxShadow:
            "0 0 12px rgba(255, 0, 0, 0.25), inset 0 0 6px rgba(255, 0, 0, 0.15)",
          borderRadius: "10px",
          color: "white",
          transition: "all 0.2s ease-in-out",
        },
        header: {
          borderBottom: "1px solid rgba(255, 100, 100, 0.2)",
          marginBottom: "0.5rem",
          background: "transparent",
        },
        body: {
          paddingTop: "0.75rem",
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
