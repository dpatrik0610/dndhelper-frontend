import { useState, useEffect } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Badge,
  Accordion,
  Loader,
  Modal,
  Tooltip,
} from "@mantine/core";
import { IconTrash, IconDatabaseSearch, IconReload } from "@tabler/icons-react";
import { useAuthStore } from "@store/useAuthStore";
import { showNotification } from "../../../components/Notification/Notification";
import { SectionColor } from "../../../types/SectionColor";
import type { CacheInfoResponse } from "../../../types/Cache";
import { clearCache, getCacheInfo } from "@services/Admin/cacheService";

export function CacheManager() {
  const token = useAuthStore((s) => s.token)!;

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<CacheInfoResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function loadCache() {
    setLoading(true);
    try {
      const data = await getCacheInfo(token);
      setInfo(data);
    } catch (err) {
      showNotification({
        title: "Error loading cache info",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setLoading(false);
    }
  }

  async function purgeCache() {
    setClearing(true);
    try {
      const result = await clearCache(token);
      showNotification({
        title: "Cache Cleared",
        message: `Removed ${result.count} entries.`,
        color: SectionColor.Green,
      });
      setConfirmOpen(false);
      loadCache();
    } catch (err) {
      showNotification({
        title: "Error clearing cache",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setClearing(false);
    }
  }

  useEffect(() => {
    loadCache();
  }, []);

  return (
    <>
      {/* === Confirm Modal === */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Clear All Cache?"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            This will remove <b>all cached collections & entries</b> from the server.
            Only admins are allowed to use this feature.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={clearing}
              onClick={purgeCache}
            >
              Clear Cache
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* === Main UI === */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background:
            "linear-gradient(135deg, rgba(40,0,60,0.55), rgba(10,0,20,0.35))",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(14px)",
        }}
      >
        <Group justify="space-between" mb="md">
          <Group>
            <IconDatabaseSearch size={26} color="#ccaaff" />
            <Text fw={700} size="xl">
              Cache Manager
            </Text>
          </Group>

          <Group gap="xs">
            <Tooltip label="Reload">
              <Button
                variant="subtle"
                onClick={loadCache}
                leftSection={<IconReload size={16} />}
              >
                Refresh
              </Button>
            </Tooltip>

            <Tooltip label="Clear all cache">
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => setConfirmOpen(true)}
              >
                Clear All
              </Button>
            </Tooltip>
          </Group>
        </Group>

        {/* === Cache Stats === */}
        <Paper
          p="md"
          radius="md"
          withBorder
          mb="lg"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {loading || !info ? (
            <Group justify="center">
              <Loader color="violet" />
            </Group>
          ) : (
            <Group justify="space-between">
              <Text fw={500}>Total Cached Entries:</Text>
              <Badge
                variant="gradient"
                gradient={{ from: "violet", to: "grape" }}
                size="lg"
              >
                {info.total}
              </Badge>
            </Group>
          )}
        </Paper>

        {/* === Cache Collections === */}
        {!info ? (
          <Group justify="center">
            <Loader color="violet" />
          </Group>
        ) : (
          <Accordion
            multiple
            variant="separated"
            radius="md"
            styles={{
              control: { color: "white" },
              item: {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(6px)",
              },
            }}
          >
            {Object.entries(info.collections).map(([group, keys]) => (
              <Accordion.Item key={group} value={group}>
                <Accordion.Control>
                  <Group>
                    <Text fw={600}>{group}</Text>
                    <Badge color="violet">{keys.length}</Badge>
                  </Group>
                </Accordion.Control>

                <Accordion.Panel>
                  <Stack gap="xs">
                    {keys.length === 0 ? (
                      <Text size="sm" c="dimmed">
                        No cached entries.
                      </Text>
                    ) : (
                      keys.map((k) => (
                        <Paper
                          key={k}
                          p="sm"
                          radius="sm"
                          withBorder
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <Text size="sm">{k}</Text>
                        </Paper>
                      ))
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Paper>
    </>
  );
}
