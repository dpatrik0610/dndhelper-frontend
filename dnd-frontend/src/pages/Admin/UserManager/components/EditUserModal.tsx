import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  ActionIcon,
  Tooltip,
  Text,
  Box,
} from "@mantine/core";
import { IconEye, IconEyeOff, IconLockCheck } from "@tabler/icons-react";
import { UserRole, UserStatus } from "../../../../types/User";
import { useState } from "react";

interface EditUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  resetting: boolean;
  onResetPassword: (newPassword: string) => void;
  editName: string;
  setEditName: (value: string) => void;
  editEmail: string;
  setEditEmail: (value: string) => void;
  editRoles: UserRole[];
  setEditRoles: (roles: UserRole[]) => void;
  editStatus: UserStatus;
  setEditStatus: (status: UserStatus) => void;
}

export function EditUserModal({
  opened,
  onClose,
  onSave,
  saving,
  resetting,
  onResetPassword,
  editName,
  setEditName,
  editEmail,
  setEditEmail,
  editRoles,
  setEditRoles,
  editStatus,
  setEditStatus,
}: EditUserModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit user"
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
      <Stack gap="sm">
        <TextInput
          label="Username"
          value={editName}
          onChange={(e) => setEditName(e.currentTarget.value)}
          classNames={{ input: "glassy-input" }}
        />
        <TextInput
          label="Email"
          value={editEmail}
          onChange={(e) => setEditEmail(e.currentTarget.value)}
          classNames={{ input: "glassy-input" }}
        />
        <MultiSelect
          label="Roles"
          data={Object.values(UserRole).map((r) => ({ value: r, label: r }))}
          value={editRoles}
          onChange={(values) => setEditRoles(values as UserRole[])}
          classNames={{ input: "glassy-input" }}
        />
        <Select
          label="Status"
          data={Object.values(UserStatus).map((s) => ({ value: s, label: s }))}
          value={editStatus}
          onChange={(value) => setEditStatus((value as UserStatus) ?? UserStatus.Active)}
          classNames={{ input: "glassy-input" }}
        />

        <Box
          p="sm"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
          }}
        >
          <Group justify="space-between" align="flex-end" gap="sm">
            <Stack flex={1} gap={4}>
              <Text size="sm" c="dimmed">
                Set a new password
              </Text>
              <TextInput
                placeholder="Temporary password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                classNames={{ input: "glassy-input" }}
                rightSection={
                  <Tooltip label={showPassword ? "Hide password" : "Show password"}>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                    </ActionIcon>
                  </Tooltip>
                }
              />
            </Stack>
            <Button
              color="red"
              variant="light"
              leftSection={<IconLockCheck size={16} />}
              loading={resetting}
              onClick={() => {
                if (!newPassword.trim()) return;
                onResetPassword(newPassword);
                setNewPassword("");
              }}
            >
              Reset
            </Button>
          </Group>
        </Box>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={onSave}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
