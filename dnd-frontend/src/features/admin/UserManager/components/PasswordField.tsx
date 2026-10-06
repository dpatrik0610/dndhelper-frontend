import { ActionIcon, CopyButton, Group, PasswordInput, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconDice5 } from "@tabler/icons-react";
import { generatePassword } from "@features/admin/UserManager/userUtils";

/** Password input with "generate" and "copy", so a fresh password can be handed to the player. */
export function PasswordField({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <Group gap="xs" align="flex-end" wrap="nowrap">
      <PasswordInput
        style={{ flex: 1 }}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        autoComplete="new-password"
      />
      <Tooltip label="Generate" withArrow>
        <ActionIcon variant="default" size={36} onClick={() => onChange(generatePassword())} aria-label="Generate password">
          <IconDice5 size={16} />
        </ActionIcon>
      </Tooltip>
      <CopyButton value={value}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
            <ActionIcon
              variant="default"
              size={36}
              onClick={copy}
              disabled={!value}
              color={copied ? "neon" : undefined}
              aria-label="Copy password"
            >
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}
