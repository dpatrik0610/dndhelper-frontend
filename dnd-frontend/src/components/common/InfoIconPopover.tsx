import { ActionIcon, Popover, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";

interface InfoIconPopoverProps {
  title?: string;
  children: React.ReactNode;
}

export function InfoIconPopover({ title, children }: InfoIconPopoverProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      withArrow
      shadow="md"
      width={260}
      position="bottom"
    >
      <Popover.Target>
        <ActionIcon
          size="sm"
          variant="subtle"
          onClick={() => setOpened(o => !o)}
        >
          <IconInfoCircle size={18} />
        </ActionIcon>
      </Popover.Target>

      <Popover.Dropdown>
        {title && <Text fw={600} mb={4}>{title}</Text>}
        <Text size="sm">{children}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}
