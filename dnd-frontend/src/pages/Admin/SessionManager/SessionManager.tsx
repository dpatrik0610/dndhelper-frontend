import { Button, Group, Paper, Stack, Table, Text, TextInput, Title, Textarea, ActionIcon, Badge, Switch, Box } from "@mantine/core";
import { IconPlus, IconRefresh, IconTrash, IconEye, IconCheck, IconLock } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "../../../store/session/useSessionStore";
import { sessionTemplate, type Session } from "../../../types/Session";
import ReactMarkdown from "react-markdown";
import { useAdminCampaignStore } from "../../../store/admin/useAdminCampaignStore";
import "../../../styles/glassyInput.css";
import { BaseModal } from "../../../components/BaseModal";
import { CustomDateInput } from "../../../components/common/CustomDateInput";
import dayjs from "dayjs";

export function SessionManager() {
  const { sessions, selected, loading, loadAll, select, create, update, remove, setLive, loadByCampaign } = useSessionStore();
  const { selectedId: selectedCampaignId, campaigns } = useAdminCampaignStore();
  const [modalMode, setModalMode] = useState<"create" | "view" | null>(null);
  const [draft, setDraft] = useState(sessionTemplate);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = a.scheduledFor ? dayjs(a.scheduledFor).valueOf() : 0;
      const bTime = b.scheduledFor ? dayjs(b.scheduledFor).valueOf() : 0;
      return bTime - aTime;
    });
  }, [sessions]);

  const strippedDescriptions = useMemo(
    () =>
      Object.fromEntries(
        sortedSessions.map((s) => [
          s.id ?? "",
          (s.description ?? "")
            .replace(/[#*_`>~-]/g, "")
            .replace(/\[(.*?)\]\(.*?\)/g, "$1")
            .trim(),
        ])
      ),
    [sortedSessions]
  );

  useEffect(() => {
    if (selectedCampaignId) void loadByCampaign(selectedCampaignId);
  }, [loadByCampaign, selectedCampaignId]);

  const openModal = (mode: "create" | "view", session?: Session) => {
    setModalMode(mode);
    if (session) {
      setDraft(session);
      select(session.id ?? null);
    } else {
      setDraft({ ...sessionTemplate, campaignId: selectedCampaignId ?? "" });
      select(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    if (modalMode === "view" && draft.id) {
      await update(draft);
    } else if (modalMode === "create") {
      await create({ ...draft, campaignId: selectedCampaignId ?? "" });
    }
    setSaving(false);
    setModalMode(null);
    setConfirmDelete(false);
  };

  const handleDelete = async () => {
    if (!draft.id) return;
    setSaving(true);
    await remove(draft.id);
    setSaving(false);
    setModalMode(null);
    setConfirmDelete(false);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2} c="grape.0">
            Session Manager {selectedCampaignId ? `- ${campaigns.find((c) => c.id === selectedCampaignId)?.name ?? ""}` : ""}
          </Title>
        </div>
        <Group gap="xs">
          <Button variant="outline" leftSection={<IconRefresh size={14} />} onClick={() => void loadAll()} loading={loading}>
            Refresh
          </Button>
          <Button leftSection={<IconPlus size={14} />} onClick={() => openModal("create")}>
            New
          </Button>
        </Group>
      </Group>

      <Paper withBorder p="md" style={{ background: "rgba(15,0,30,0.4)", overflowX: "auto" }}>
        <Table
          highlightOnHover
          verticalSpacing="xs"
          horizontalSpacing="md"
          style={{ tableLayout: "fixed", minWidth: 720 }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 160 }}>Name</Table.Th>
              <Table.Th style={{ width: 220 }}>Description</Table.Th>
              <Table.Th style={{ width: 130 }}>Scheduled</Table.Th>
              <Table.Th style={{ width: 110 }}>Status</Table.Th>
              <Table.Th style={{ width: 140 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedSessions.map((s) => (
              <Table.Tr key={s.id} data-selected={selected?.id === s.id}>
                <Table.Td>{s.name}</Table.Td>
                <Table.Td>
                  <Text
                    size="sm"
                    c="dimmed"
                    lineClamp={2}
                    style={{ maxWidth: 220, wordBreak: "break-word" }}
                  >
                    {strippedDescriptions[s.id ?? ""] ?? ""}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text
                    size="sm"
                    c={s.scheduledFor && dayjs(s.scheduledFor).isBefore(dayjs()) ? "red.4" : "cyan.2"}
                    truncate
                  >
                    {s.scheduledFor ? dayjs(s.scheduledFor).format("YYYY-MM-DD") : "Not set"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" color={s.isLive ? "teal" : "gray"} leftSection={<IconCheck size={12} />}>
                    {s.isLive ? "Live" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue" onClick={() => openModal("view", s)} aria-label="View session">
                      <IconEye size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="teal"
                      disabled={s.isLive}
                      onClick={() => void setLive(s.id)}
                      aria-label="Make live"
                    >
                      <IconCheck size={14} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        select(s.id ?? null);
                        setModalMode("view");
                        setDraft(s);
                        setConfirmDelete(true);
                      }}
                      aria-label="Delete session"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <BaseModal
        opened={!!modalMode}
        onClose={() => {
          setModalMode(null);
          setConfirmDelete(false);
        }}
        title={modalMode === "view" ? "Session Details" : "Create Session"}
        showSaveButton={false}
        showCancelButton={false}
        hideHeader
        withCloseButton
        size="lg"
      >
        <Stack gap="sm">
          <TextInput
            label="Name"
            value={draft.name}
            onChange={(e) => {
              const value = e.currentTarget?.value ?? "";
              setDraft((prev) => ({ ...prev, name: value }));
            }}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />
          <TextInput
            label="Campaign"
            value={campaigns.find((c) => c.id === draft.campaignId)?.name ?? "Unassigned"}
            readOnly
            rightSection={<IconLock size={14} />}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />
          <Textarea
            label="Description (Markdown)"
            value={draft.description ?? ""}
            autosize
            minRows={5}
            onChange={(e) => {
              const value = e.currentTarget?.value ?? "";
              setDraft((prev) => ({ ...prev, description: value }));
            }}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />
          <TextInput
            label="Location"
            value={draft.location ?? ""}
            onChange={(e) => {
              const value = e.currentTarget?.value ?? "";
              setDraft((prev) => ({ ...prev, location: value }));
            }}
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />
          <CustomDateInput
            label="Scheduled For"
            value={draft.scheduledFor}
            onChange={(value) => setDraft((prev) => ({ ...prev, scheduledFor: value }))}
          />
          <Switch
            label="Is Live"
            checked={draft.isLive}
            onChange={(e) => {
              const checked = e.currentTarget?.checked ?? false;
              setDraft((prev) => ({ ...prev, isLive: checked }));
            }}
          />

          <Group justify="space-between" mt="md">
            <Group>
              {modalMode === "view" && draft.id && (
                <Button color="red" variant="outline" leftSection={<IconTrash size={14} />} onClick={() => setConfirmDelete(true)}>
                  Delete
                </Button>
              )}
            </Group>
            <Group>
              <Button variant="subtle" onClick={() => { setModalMode(null); setConfirmDelete(false); }}>
                Close
              </Button>
              <Button leftSection={<IconPlus size={14} />} loading={saving} onClick={() => void handleSave()}>
                {draft.id ? "Save" : "Create"}
              </Button>
            </Group>
          </Group>

          {confirmDelete && (
            <Group justify="space-between" mt="xs">
              <Text size="sm" c="red.4">
                Delete this session permanently?
              </Text>
              <Group>
                <Button variant="subtle" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button color="red" leftSection={<IconTrash size={14} />} loading={saving} onClick={() => void handleDelete()}>
                  Confirm delete
                </Button>
              </Group>
            </Group>
          )}
        </Stack>
      </BaseModal>
    </Stack>
  );
}
