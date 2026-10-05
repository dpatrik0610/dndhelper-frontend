import { useEffect, useRef } from "react";
import { Avatar, Badge, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableLogEntry, TableToken } from "@appTypes/Tabletop";
import { resolveImageUrl } from "@features/tabletop/useTabletopHub";

/** Shared roll log, newest at the bottom. */
export function LogPanel() {
  const log = useTabletopStore((s) => s.log);
  const tokens = useTabletopStore((s) => s.snapshot?.tokens);
  const me = useCurrentUserId();
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
          <LogItem key={entry.id} entry={entry} mine={entry.userId === me} token={tokenFor(tokens, entry)} />
        ))}
      </Stack>
    </ScrollArea>
  );
}

/**
 * The token a roll was made as. Entries only carry the name, so it's matched on the board, preferring the roller's own.
 * ponytail: name match, so a removed or renamed token falls back to the initial; store a characterId on entries if that matters.
 */
const tokenFor = (tokens: TableToken[] | undefined, entry: TableLogEntry) =>
  tokens?.find((t) => t.name === entry.name && t.ownerIds.includes(entry.userId)) ?? tokens?.find((t) => t.name === entry.name);

function LogItem({ entry, mine, token }: { entry: TableLogEntry; mine: boolean; token?: TableToken }) {
  const time = new Date(entry.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`tt-log-entry${entry.private ? " private" : ""}${mine ? " mine" : ""}`}>
      <Group justify="space-between" gap={4} wrap="nowrap">
        <Group gap={8} wrap="nowrap" miw={0}>
          <Avatar src={resolveImageUrl(token?.imageUrl)} size={24} radius="xl" style={{ background: token?.color }}>
            {[...entry.name.trim()][0]?.toUpperCase() ?? "?"}
          </Avatar>
          <Text size="sm" fw={700} truncate>
            {entry.name}
            {entry.name !== entry.userName && (
              <Text span size="xs" c="dimmed" fw={400}>
                {" "}
                · {entry.userName}
              </Text>
            )}
          </Text>
        </Group>
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
