import { useEffect, useState } from "react";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { Badge, Box, Group, Paper, Stack, Text, Title, Tooltip } from "@mantine/core";
import { ListSkeleton } from "@components/common/Skeletons";
import { CritterIcon } from "@components/layout/ThemeCritter";
import { ALL_CRITTERS } from "@components/layout/critters";
import { getCritterScoreboard, type CritterScore } from "@services/userService";
import { useUsername } from "@store/auth/authSelectors";
import { useIsMobile } from "@hooks/useIsMobile";
import { themeOptions } from "@appTypes/ThemeTypes";

const MEDALS = ["🥇", "🥈", "🥉"];

const byScore = (a: CritterScore, b: CritterScore) =>
  b.total - a.total || a.username.localeCompare(b.username, undefined, { sensitivity: "base" });
const ACCENT = "var(--theme-color-accent-primary)";

/** Hidden page (no nav link, reached at /scoreboard): who has caught the most theme critters. */
export default function ScoreboardPage() {
  const isMobile = useIsMobile();
  const me = useUsername();
  const [scores, setScores] = useState<CritterScore[] | null>(null);
  const [failed, setFailed] = useState(false);
  const { connection } = useSignalRConnection();

  useEffect(() => {
    getCritterScoreboard()
      .then(setScores)
      .catch(() => setFailed(true));
  }, []);

  // Live: every catch (anyone's, on any device) is broadcast with that player's new row.
  useEffect(() => {
    if (!connection) return;
    const onScore = (score: CritterScore) =>
      setScores((list) => list && [...list.filter((s) => s.username !== score.username), score].sort(byScore));
    connection.on("CritterScoreChanged", onScore);
    return () => connection.off("CritterScoreChanged", onScore);
  }, [connection]);

  const mine = scores?.find((s) => s.username === me)?.caught ?? {};

  return (
    <Box p={isMobile ? "xs" : "md"} m="0 auto" maw={900} w="100%">
      <Stack gap="md">
        {/* Your collection: every critter, the ones you haven't caught yet greyed out */}
        <Paper p="md" radius="md" withBorder>
          <Title order={2} className="narrative-title">
            Critter Scoreboard
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Every theme has a critter that wanders by now and then. Click it to catch it.
          </Text>
          <Group gap="sm" mt="md">
            {ALL_CRITTERS.map(({ theme, name }) => {
              const n = mine[name] ?? 0;
              const themeName = themeOptions.find((t) => t.key === theme)?.name;
              return (
                <Tooltip key={name} label={`${name} (${themeName}): ${n ? `caught ×${n}` : "not caught yet"}`} withArrow>
                  <Box c={ACCENT} style={n ? undefined : { opacity: 0.25, filter: "grayscale(1)" }}>
                    <CritterIcon name={name} size={30} />
                  </Box>
                </Tooltip>
              );
            })}
          </Group>
        </Paper>

        {failed ? (
          <Text c="red">Couldn't load the scoreboard.</Text>
        ) : !scores ? (
          <ListSkeleton rows={4} />
        ) : scores.length === 0 ? (
          <Text c="dimmed">Nobody has caught a critter yet.</Text>
        ) : (
          <Stack gap="xs">
            {scores.map((s, i) => (
              <Paper
                key={s.username}
                p="sm"
                radius="md"
                withBorder
                style={s.username === me ? { borderColor: "var(--theme-border-glow)" } : undefined}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <Text fw={700} w={36} ta="center" size={i < MEDALS.length ? "xl" : "md"}>
                      {MEDALS[i] ?? `#${i + 1}`}
                    </Text>
                    <Stack gap={4}>
                      <Text fw={600}>
                        {s.username}
                        {s.username === me && (
                          <Text span c="dimmed" size="sm">
                            {" "}
                            (you)
                          </Text>
                        )}
                      </Text>
                      <Group gap={10}>
                        {ALL_CRITTERS.filter((c) => s.caught[c.name]).map((c) => (
                          <Tooltip key={c.name} label={c.name} withArrow>
                            <Group gap={2} wrap="nowrap" c={ACCENT}>
                              <CritterIcon name={c.name} size={20} />
                              <Text size="xs" c="var(--theme-color-text-secondary)">
                                ×{s.caught[c.name]}
                              </Text>
                            </Group>
                          </Tooltip>
                        ))}
                      </Group>
                    </Stack>
                  </Group>
                  <Badge size="lg" variant="light">
                    {s.total}
                  </Badge>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
