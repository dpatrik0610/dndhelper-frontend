// components/Admin/BaseModal.tsx
import { Modal, Group, Button, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

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
  size = 'lg',
  loading = false,
  onSave,
  showSaveButton = true,
  saveLabel = 'Save',
  showCancelButton = true,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="xl">
          {title}
        </Text>
      }
      size={size}
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      {children}
      
      {(showSaveButton || showCancelButton) && (
        <Group justify="flex-end" mt="xl">
          {showCancelButton && (
            <Button
              variant="outline"
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
            >
              {saveLabel}
            </Button>
          )}
        </Group>
      )}
    </Modal>
  );
};