import { useEffect, useMemo, useState } from "react";
import { Stack, Group, Title, Button } from "@mantine/core";
import dayjs from "dayjs";
import { useSessionStore } from "@store/session/useSessionStore";
import { sessionTemplate, type Session } from "@appTypes/Session";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import SessionTable from "./components/SessionTable";
import SessionModal from "./components/SessionModal";
import SessionViewModal from "./components/SessionViewModal";

export function SessionManager() {
  const { sessions, selected, loading, loadAll, select, create, update, setLive, loadByCampaign } =
    useSessionStore();
  const { selectedId: selectedCampaignId, campaigns } = useAdminCampaignStore();

  const [editMode, setEditMode] = useState<"create" | "edit" | null>(null);
  const [draft, setDraft] = useState<Session>(sessionTemplate);
  const [saving, setSaving] = useState(false);
  const [viewSession, setViewSession] = useState<Session | null>(null);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const aTime = a.scheduledFor ? dayjs(a.scheduledFor).valueOf() : 0;
        const bTime = b.scheduledFor ? dayjs(b.scheduledFor).valueOf() : 0;
        return bTime - aTime;
      }),
    [sessions]
  );

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

  const handleRefresh = () => {
    if (selectedCampaignId) {
      void loadByCampaign(selectedCampaignId);
    } else {
      void loadAll();
    }
  };

  const openEdit = (session?: Session) => {
    if (session) {
      setDraft(session);
      select(session.id ?? null);
      setEditMode("edit");
    } else {
      setDraft({ ...sessionTemplate, campaignId: selectedCampaignId ?? "" });
      select(null);
      setEditMode("create");
    }
  };

  const openView = (session: Session) => {
    setViewSession(session);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editMode === "edit" && draft.id) {
      await update(draft);
    } else if (editMode === "create") {
      await create({ ...draft, campaignId: selectedCampaignId ?? "" });
    }
    setSaving(false);
    setEditMode(null);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2} c="grape.0">
          Session Manager {selectedCampaignId ? `- ${campaigns.find((c) => c.id === selectedCampaignId)?.name ?? ""}` : ""}
        </Title>
        <Group gap="xs">
          <Button variant="outline" onClick={handleRefresh} loading={loading}>
            Refresh
          </Button>
          <Button onClick={() => openEdit()}>New</Button>
        </Group>
      </Group>

      <SessionTable
        sessions={sortedSessions}
        selectedId={selected?.id ?? null}
        strippedDescriptions={strippedDescriptions}
        onView={(s) => openView(s)}
        onEdit={(s) => openEdit(s)}
        onSetLive={(id) => void setLive(id)}
      />

      <SessionModal
        opened={!!editMode}
        mode={editMode}
        draft={draft}
        campaigns={campaigns}
        saving={saving}
        onClose={() => {
          setEditMode(null);
        }}
        onChangeDraft={setDraft}
        onSave={() => void handleSave()}
      />

      <SessionViewModal
        opened={!!viewSession}
        session={viewSession}
        campaigns={campaigns}
        onClose={() => setViewSession(null)}
      />
    </Stack>
  );
}
