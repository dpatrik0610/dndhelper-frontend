import { Button, Group, List, Stack, Text, TextInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import type { AdminUser } from "@appTypes/User";
import { useAdminUserStore } from "@store/admin/adminUserStore";

/** Permanent delete of one or more accounts; typing DELETE confirms. */
export function DeleteUsersModal({
  users,
  onClose,
  onDeleted,
}: {
  users: AdminUser[];
  onClose: () => void;
  onDeleted: () => void;
}) {
  const removeUsers = useAdminUserStore((s) => s.removeUsers);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setConfirmText("");
    onClose();
  };

  const remove = async () => {
    setBusy(true);
    await removeUsers(users.map((u) => u.id));
    setBusy(false);
    setConfirmText("");
    onDeleted();
  };

  const characterCount = users.reduce((n, u) => n + u.characters.length, 0);

  return (
    <AdminGlassModal
      opened={users.length > 0}
      onClose={close}
      title={users.length === 1 ? `Delete ${users[0].username}?` : `Delete ${users.length} users?`}
      variant="danger"
      size="md"
    >
      <Stack gap="sm">
        <Text size="sm">The account{users.length > 1 && "s"} can't be restored:</Text>
        <List size="sm" spacing={2}>
          {users.slice(0, 8).map((u) => (
            <List.Item key={u.id}>
              <b>{u.username}</b>
              {u.characters.length > 0 && (
                <Text span c="dimmed" size="xs">
                  {" "}
                  · {u.characters.length} character{u.characters.length > 1 && "s"}
                </Text>
              )}
            </List.Item>
          ))}
          {users.length > 8 && <List.Item>…and {users.length - 8} more</List.Item>}
        </List>
        {characterCount > 0 && (
          <Text size="xs" c="red.3">
            Their characters stay in the database without an owner. Deactivating keeps everything and only blocks
            sign-in.
          </Text>
        )}
        <TextInput
          label='Type "DELETE" to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.currentTarget.value)}
        />
        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={close}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={14} />}
            loading={busy}
            disabled={confirmText !== "DELETE"}
            onClick={() => void remove()}
          >
            Delete permanently
          </Button>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
}
