import { Card, Stack } from "@mantine/core";
import dayjs from "dayjs";
import type { Session } from "@appTypes/Session";
import { SessionHeader } from "./ActiveSessionCard/SessionHeader";
import { SessionContent } from "./ActiveSessionCard/SessionContent";
import { SessionFooter } from "./ActiveSessionCard/SessionFooter";
import { useSessionNotes } from "./ActiveSessionCard/useSessionNotes";

interface Props {
  session: Session;
  palette: { cardBg: string; border: string; textMain: string; textDim: string };
}

const formatDate = (value?: string | null) => (value ? dayjs(value).format("YYYY-MM-DD") : "Not set");

export function ActiveSessionCard({ session, palette }: Props) {
  const { notes, loading, error } = useSessionNotes(session.noteIds ?? []);
  const scheduled = formatDate(session.scheduledFor);
  const theme = {
    cardBg: palette.cardBg || "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), rgba(0,0,0,0.5))",
    panelBg: "linear-gradient(180deg, rgba(12,18,36,0.9), rgba(8,10,20,0.92))",
  };

  return (
    <Card
      shadow="xl"
      radius="lg"
      withBorder
      p="lg"
      style={{ background: theme.cardBg, borderColor: palette.border, color: palette.textMain }}
    >
      <Stack gap="md">
        <SessionHeader
          session={session}
          palette={palette}
          formattedDate={scheduled}
          description={session.description}
          panelBg={theme.panelBg}
        />
        <SessionContent notes={notes} loading={loading} error={error} palette={palette} panelBg={theme.panelBg} />
        <SessionFooter scheduled={scheduled} location={session.location} palette={palette} panelBg={theme.panelBg} />
      </Stack>
    </Card>
  );
}
