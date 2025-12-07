import { Button, Group, Popover, Stack, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";

type CustomDateInputProps = {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
};

const formatDisplay = (value: string | null) => {
  if (!value) return "Not scheduled";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "Not scheduled";
};

/**
 * Glassy date picker that opens from a button and shows the selected date in the label.
 */
export function CustomDateInput({ label = "Scheduled For", value, onChange, disabled = false }: CustomDateInputProps) {
  const [opened, setOpened] = useState(false);
  const parsed = value ? dayjs(value) : null;
  const safeDate = parsed?.isValid() ? parsed.toDate() : null;

  return (
    <Stack gap={4}>
      <Group gap="xs" wrap="nowrap" align="center">
        <Text className="glassy-label">{label}:</Text>
        <Text fw={600} c="cyan.1">
          {formatDisplay(value)}
        </Text>
        <Popover opened={opened} onChange={setOpened} position="bottom-start" shadow="xl" withArrow>
          <Popover.Target>
            <Button
              size="xs"
              variant="light"
              color="cyan"
              leftSection={<IconCalendar size={14} />}
              onClick={() => !disabled && setOpened((o) => !o)}
              disabled={disabled}
            >
              Pick
            </Button>
          </Popover.Target>
          <Popover.Dropdown className="glassy-date-dropdown">
            <DatePicker
              size="sm"
              value={safeDate}
              onChange={(next) => {
                const parsed = next ? dayjs(next) : null;
                if (parsed?.isValid()) {
                  const iso = parsed.toDate().toISOString();
                  console.log("[CustomDateInput] selected", iso);
                  onChange(iso);
                } else {
                  console.log("[CustomDateInput] cleared");
                  onChange(null);
                }
                setOpened(false);
              }}
              disabled={disabled}
              classNames={{
                day: "glassy-date-day",
                month: "glassy-date-month",
                weekday: "glassy-date-weekday",
                calendarHeaderControl: "glassy-date-header",
                calendarHeaderLevel: "glassy-date-header",
              }}
              firstDayOfWeek={1}
            />
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Stack>
  );
}
