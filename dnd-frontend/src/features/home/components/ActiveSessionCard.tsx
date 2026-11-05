import { Suspense, lazy } from "react";
import { Badge, Card, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { Session } from "@appTypes/Session";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

const KICKER = {
  Live: { label: "Live now", color: "red" },
  Completed: { label: "Last session", color: "gray" },
  Planned: { label: "Up next", color: "cyan" },
} as const;

const muted = { color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.75))" };

function Markdown({ content }: { content: string }) {
  return (
    <Suspense fallback={<Loader size="xs" color="var(--theme-color-accent-primary)" />}>
      <MarkdownRenderer content={content} textColor="var(--theme-color-text-secondary)" />
    </Suspense>
  );
}

export function ActiveSessionCard({ session, next }: { session: Session; next: Session | null }) {
  const notes = session.notes.filter((n) => !n.dmOnly);
  const kicker = KICKER[session.status];
  const when = session.status === "Planned" ? session.scheduledFor : session.startedAt ?? session.scheduledFor;

  return (
    <Card
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        color: "var(--theme-color-text-primary, #fff)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Stack gap="md">
        <Stack gap={6}>
          <Group gap="sm">
            <Badge variant="dot" color={kicker.color} size="sm">
              {kicker.label}
            </Badge>
            {when && (
              <Text size="xs" style={muted}>
                {dayjs(when).format("dddd, MMM D · HH:mm")}
              </Text>
            )}
          </Group>
          <Title order={2} className="narrative-title" style={{ fontSize: "1.25rem", color: "var(--theme-color-text-primary, #fff)" }}>
            Session {session.number}: {session.name}
          </Title>
          {session.location && (
            <Group gap={4} style={muted}>
              <IconMapPin size={14} />
              <Text size="sm">{session.location}</Text>
            </Group>
          )}
        </Stack>

        {session.recap?.trim() && <Markdown content={session.recap} />}

        {notes.length > 0 && (
          <Stack gap="sm">
            <Text size="xs" fw={700} tt="uppercase" style={{ ...muted, letterSpacing: "0.08em" }}>
              From the table
            </Text>
            {notes.map((note) => (
              <div key={note.id} style={{ borderLeft: "2px solid var(--theme-color-accent-primary, #f59e0b)", paddingLeft: 12 }}>
                <Markdown content={note.content} />
              </div>
            ))}
          </Stack>
        )}

        {!session.recap?.trim() && notes.length === 0 && (
          <Text size="sm" style={{ ...muted, fontStyle: "italic", opacity: 0.7 }}>
            {session.status === "Planned" ? "The next chapter hasn't been written yet." : "The chronicles of this session are empty."}
          </Text>
        )}

        {next && next.id !== session.id && next.scheduledFor && (
          <Group gap={6} pt="xs" style={{ ...muted, borderTop: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))" }}>
            <IconCalendarEvent size={14} />
            <Text size="sm">
              Next session: {dayjs(next.scheduledFor).format("dddd, MMM D · HH:mm")}
              {next.location && ` · ${next.location}`}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
