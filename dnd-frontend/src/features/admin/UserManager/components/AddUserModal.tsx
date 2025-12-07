import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { UserRole, UserStatus } from "@appTypes/User";
import { useState } from "react";

interface AddUserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  creating: boolean;
  newName: string;
  setNewName: (value: string) => void;
  newEmail: string;
  setNewEmail: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  newRoles: UserRole[];
  setNewRoles: (roles: UserRole[]) => void;
  newStatus: UserStatus;
  setNewStatus: (status: UserStatus) => void;
}

export function AddUserModal({
  opened,
  onClose,
  onSubmit,
  creating,
  newName,
  setNewName,
  newEmail,
  setNewEmail,
  newPassword,
  setNewPassword,
  newRoles,
  setNewRoles,
  newStatus,
  setNewStatus,
}: AddUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add new user"
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
        <Text c="dimmed" size="sm">
          Create a new account. Username and password are required; roles and status are optional.
        </Text>

        <TextInput
          label="Username"
          placeholder="Enter username"
          value={newName}
          onChange={(e) => setNewName(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input" }}
        />
        <TextInput
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Temporary password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          required
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
        <TextInput
          label="Email"
          placeholder="optional@email.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.currentTarget.value)}
          classNames={{ input: "glassy-input" }}
        />
        <MultiSelect
          label="Roles"
          data={Object.values(UserRole).map((r) => ({ value: r, label: r }))}
          value={newRoles}
          onChange={(values) => setNewRoles(values as UserRole[])}
          classNames={{ input: "glassy-input" }}
        />
        <Select
          label="Status"
          data={Object.values(UserStatus).map((s) => ({ value: s, label: s }))}
          value={newStatus}
          onChange={(value) => setNewStatus((value as UserStatus) ?? UserStatus.Active)}
          classNames={{ input: "glassy-input" }}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={creating} onClick={onSubmit}>
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

