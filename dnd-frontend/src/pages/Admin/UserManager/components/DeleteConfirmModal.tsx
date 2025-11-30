import { Button, Group, Modal, Stack, Text } from "@mantine/core";

interface DeleteConfirmModalProps {
  opened: boolean;
  username: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  opened,
  username,
  loading,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm deletion"
      centered
      overlayProps={{ blur: 6, color: "rgba(0,0,0,0.35)" }}
      styles={{
        content: {
          background: "rgba(30, 0, 0, 0.55)",
          border: "1px solid rgba(255, 100, 100, 0.4)",
          backdropFilter: "blur(10px)",
        },
        header: {
          background: "transparent",
          borderBottom: "none",
        },
      }}
    >
      <Stack gap="md">
        <Text>
          Are you sure you want to delete{" "}
          <Text span fw={600}>
            {username}
          </Text>
          ? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
