import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Pagination,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";
import { useToken, useRoles } from "@store/auth/authSelectors";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { getRollHistory } from "@services/rollService";
import type { RollHistoryEntry } from "@appTypes/Roll";
import { formatRollExpression } from "@utils/rollFormat";
import { SectionColor } from "@appTypes/SectionColor";

const pageSize = 10;

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  if ("status" in error && typeof (error as { status?: number }).status === "number") {
    return (error as { status?: number }).status ?? null;
  }
  return null;
}

function getRollTimestamp(entry: RollHistoryEntry) {
  const raw = entry.createdAt ?? entry.updatedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSubtleRoll(entry: RollHistoryEntry) {
  return entry.type === 1;
}

export default function RollHistoryPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const token = useToken();
  const roles = useRoles();
  const character = useCurrentCharacter();

  const isAdmin = roles.includes("Admin");
  const campaignId = character?.campaignId ?? null;

  const [entries, setEntries] = useState<RollHistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<RollHistoryEntry | null>(null);

  useEffect(() => {
    if (!character) {
      showNotification({
        id: "no-character-selected",
        title: "No Character Selected",
        message: "Please select a character to view roll history.",
        color: SectionColor.Red,
        withBorder: true,
      });
      navigate("/home", { replace: true });
    }
  }, [character, navigate]);

  const loadPage = async (pageToLoad: number) => {
    if (!token) return;

    setLoading(true);
    try {
      if (isAdmin && !campaignId) {
        showNotification({
          title: "Missing campaign",
          message: "Select a character with a campaign to view DM roll history.",
          color: "red",
        });
        setLoading(false);
        return;
      }

      const items = await getRollHistory(
        {
          page: pageToLoad,
          pageSize,
          campaignId: isAdmin ? campaignId ?? undefined : undefined,
        },
        token
      );

      setEntries(items ?? []);
      setPage(pageToLoad);
      setTotalPages(items.length === pageSize ? pageToLoad + 1 : pageToLoad);
    } catch (error) {
      const status = getErrorStatus(error);
      if (status === 401 || status === 403) {
        showNotification({
          title: "Access denied",
          message: "You are not allowed to view roll history.",
          color: "red",
        });
      } else {
        showNotification({
          title: "Load failed",
          message: "Could not load roll history.",
          color: "red",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !character) return;
    setEntries([]);
    setTotalPages(1);
    void loadPage(1);
  }, [token, character?.id, isAdmin, campaignId]);

  const modalData = useMemo(() => {
    if (!selected) return null;
    return {
      ...selected,
      timestamp: getRollTimestamp(selected),
      expression: selected.expression || formatRollExpression(selected),
      subtle: isSubtleRoll(selected),
    };
  }, [selected]);

  if (!character) return null;

  return (
    <Box
      p={isMobile ? 0 : "md"}
      m={isMobile ? 0 : "0 auto"}
      maw={isMobile ? "100%" : 1200}
      w="100%"
      mih={isMobile ? "100%" : "100vh"}
      h={isMobile ? "100%" : "auto"}
    >
      <Modal
        opened={!!selected}
        onClose={() => setSelected(null)}
        withCloseButton={false}
        centered
        styles={{
          header: { display: "none" },
          content: {
            background: "rgba(20,0,0,0.45)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,100,100,0.2)",
            boxShadow: "0 0 12px rgba(255,60,60,0.25)",
          },
        }}
      >
        {modalData && (
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text fw={600} size="lg">
                Roll Details
              </Text>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => setSelected(null)}
                aria-label="Close roll details"
              >
                <IconX size={18} />
              </ActionIcon>
            </Group>

            <Paper
              p="sm"
              radius="md"
              withBorder
              style={{
                background: "rgba(0,0,0,0.22)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text fw={600}>{modalData.username ?? modalData.characterId ?? "Unknown"}</Text>
                  <Group gap="xs">
                    {modalData.subtle && (
                      <Badge color="grape" variant="light">
                        Subtle
                      </Badge>
                    )}
                    {modalData.timestamp && (
                      <Badge color="violet" variant="light">
                        {modalData.timestamp.toLocaleString()}
                      </Badge>
                    )}
                  </Group>
                </Group>
                {modalData.note && (
                  <Text size="sm" c="dimmed">
                    Note: {modalData.note}
                  </Text>
                )}
              </Stack>
            </Paper>

            <Paper
              p="sm"
              radius="md"
              withBorder
              style={{
                background: "rgba(0,0,0,0.25)",
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text fw={600}>Result</Text>
                  <Badge
                    color="violet"
                    variant="filled"
                    size="lg"
                    style={{
                      boxShadow: "0 0 12px rgba(128, 90, 255, 0.65)",
                      border: "1px solid rgba(150,120,255,0.6)",
                    }}
                  >
                    Total {modalData.total}
                  </Badge>
                </Group>
                <Text size="sm">Expression: {modalData.expression}</Text>
                <Stack gap={4}>
                  <Text size="sm">Rolls:</Text>
                  <Group gap="xs" wrap="wrap">
                    {modalData.rolls.map((roll, idx) => (
                      <Badge
                        key={`${modalData.id ?? "roll"}-${idx}`}
                        color="gray"
                        variant="light"
                        size="lg"
                        radius="sm"
                        style={{ fontSize: 16, fontWeight: 500, border: "none" }}
                      >
                        {roll}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
                <Group gap="xs" wrap="wrap">
                  <Badge color="gray" variant="light">
                    Min {modalData.min}
                  </Badge>
                  <Badge color="gray" variant="light">
                    Max {modalData.max}
                  </Badge>
                  <Badge color="gray" variant="light">
                    Avg {modalData.average.toFixed(2)}
                  </Badge>
                </Group>
              </Stack>
            </Paper>

            {modalData.username && (
              <Text size="xs" c="dimmed">
                Rolled by {modalData.username}
              </Text>
            )}
          </Stack>
        )}
      </Modal>

      <Paper
        p={isMobile ? "sm" : "md"}
        withBorder
        style={{
          background: "linear-gradient(175deg, #0009336b 0%, rgba(48,0,0,0.37) 100%)",
          height: isMobile ? "100%" : "auto",
        }}
      >
        <Group justify="space-between" align="center" mb="md">
          <Stack gap={0}>
            <Text fw={700} size="lg">
              Roll History
            </Text>
            <Text size="sm" c="dimmed">
              {isAdmin ? "Campaign rolls (public + subtle)" : "Your public rolls"}
            </Text>
          </Stack>
          <Button
            variant="light"
            onClick={() => void loadPage(1)}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        {loading && entries.length === 0 ? (
          <Loader />
        ) : entries.length === 0 ? (
          <Text c="dimmed">No rolls found.</Text>
        ) : (
          <ScrollArea
            h={isMobile ? "calc(100vh - 220px)" : 650}
            type="hover"
            offsetScrollbars
          >
            <Stack gap="xs">
              {entries.map((entry, index) => {
                const expression = entry.expression || formatRollExpression(entry);
                const timestamp = getRollTimestamp(entry);
                const subtle = isSubtleRoll(entry);

                return (
                  <Paper
                    key={entry.id ?? `${entry.characterId ?? "roll"}-${index}`}
                    p="sm"
                    radius="md"
                    withBorder
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      borderColor: "rgba(255,255,255,0.08)",
                      transition: "background-color 0.15s ease, transform 0.15s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(ev) => {
                      ev.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(ev) => {
                      ev.currentTarget.style.backgroundColor = "rgba(0,0,0,0.25)";
                    }}
                    onClick={() => setSelected(entry)}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Stack gap={4}>
                        <Group gap="xs">
                          <Text fw={600} size="sm">
                            {entry.username ?? entry.characterId ?? "Unknown"}
                          </Text>
                          {subtle && (
                            <Badge color="grape" variant="light" size="xs">
                              Subtle
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {expression}
                        </Text>
                        <Group gap="xs" wrap="wrap">
                          <Text size="xs" c="dimmed">
                            Rolls:
                          </Text>
                          {entry.rolls.map((roll, idx) => (
                            <Badge
                              key={`${entry.id ?? "roll"}-${idx}`}
                              color="gray"
                              variant="light"
                              size="sm"
                              radius="sm"
                              style={{ fontSize: 14, fontWeight: 500, border: "none" }}
                            >
                              {roll}
                            </Badge>
                          ))}
                        </Group>
                        {entry.note && (
                          <Text size="xs" c="dimmed" lineClamp={1}>
                            Note: {entry.note}
                          </Text>
                        )}
                      </Stack>
                      <Stack gap={4} align="flex-end">
                        <Badge
                          color="violet"
                          variant="filled"
                          size="sm"
                          style={{
                            boxShadow: "0 0 10px rgba(128, 90, 255, 0.55)",
                            border: "1px solid rgba(150,120,255,0.5)",
                          }}
                        >
                          Total {entry.total}
                        </Badge>
                        {timestamp && (
                          <Text size="xs" c="dimmed">
                            {timestamp.toLocaleString()}
                          </Text>
                        )}
                      </Stack>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </ScrollArea>
        )}

        <Group justify="center" mt="md">
          <Pagination
            value={page}
            onChange={(next) => void loadPage(next)}
            total={totalPages}
          />
        </Group>
      </Paper>
    </Box>
  );
}
