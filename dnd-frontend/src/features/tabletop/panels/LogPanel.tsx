import { useEffect, useRef } from "react";
import { Badge, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableLogEntry } from "@appTypes/Tabletop";

/** Shared roll log, newest at the bottom. */
export function LogPanel() {
  const log = useTabletopStore((s) => s.log);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, [log.length]);

  return (
    <ScrollArea viewportRef={viewport} className="tt-scroll" type="auto">
      <Stack gap={8} p="sm">
        {log.length === 0 && (
          <Text size="xs" c="dimmed" ta="center" py="lg">
            Rolls show up here for everyone at the table.
          </Text>
        )}
        {log.map((entry) => (
          <LogItem key={entry.id} entry={entry} />
        ))}
      </Stack>
    </ScrollArea>
  );
}

function LogItem({ entry }: { entry: TableLogEntry }) {
  const time = new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`tt-log-entry${entry.private ? " private" : ""}`}>
      <Group justify="space-between" gap={4} wrap="nowrap">
        <Text size="sm" fw={700} truncate>
          {entry.name}
          {entry.name !== entry.userName && (
            <Text span size="xs" c="dimmed" fw={400}>
              {" "}
              · {entry.userName}
            </Text>
          )}
        </Text>
        <Group gap={4} wrap="nowrap">
          {entry.private && <IconLock size={12} />}
          <Text size="xs" c="dimmed">
            {time}
          </Text>
        </Group>
      </Group>
      {entry.label && (
        <Text size="xs" c="dimmed" mb={4}>
          {entry.label}
        </Text>
      )}
      <Stack gap={4}>
        {entry.rolls.map((roll, i) => {
          const natural = roll.numberOfDice === 1 && roll.sides === 20 ? roll.rolls[0] : null;
          return (
            <Group key={i} justify="space-between" wrap="nowrap" gap={6}>
              <Text size="xs" c="dimmed" truncate>
                {roll.expression} · [{roll.rolls.join(", ")}]
              </Text>
              <Group gap={6} wrap="nowrap">
                {natural === 20 && (
                  <Badge size="xs" color="green">
                    Nat 20
                  </Badge>
                )}
                {natural === 1 && (
                  <Badge size="xs" color="red">
                    Nat 1
                  </Badge>
                )}
                <Text fw={800} size="lg" className="tt-log-total">
                  {roll.total}
                </Text>
              </Group>
            </Group>
          );
        })}
      </Stack>
    </div>
  );
}
