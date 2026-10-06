import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconCalendarTime, IconPlus, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useSessionStore } from "@store/session/sessionStore";
import { sessionTemplate, type Session } from "@appTypes/Session";
import { useCampaignStore } from "@store/campaign/campaignStore";
import SessionTable from "./components/SessionTable";
import SessionModal from "./components/SessionModal";
import SessionViewModal from "./components/SessionViewModal";
import { AdminPage } from "@features/admin/components/AdminPage";

export function SessionManager() {
  const { sessions, selected, loading, loadAll, select, create, update, setLive, loadByCampaign } =
    useSessionStore();
  const { selectedId: selectedCampaignId, campaigns } = useCampaignStore();

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
    <AdminPage
      icon={IconCalendarTime}
      title="Sessions"
      subtitle={campaigns.find((c) => c.id === selectedCampaignId)?.name}
      actions={
        <>
          <Tooltip label="Reload" withArrow>
            <ActionIcon variant="default" size="lg" onClick={handleRefresh} loading={loading} aria-label="Reload sessions">
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Button color="neon" leftSection={<IconPlus size={16} />} onClick={() => openEdit()}>
            New session
          </Button>
        </>
      }
    >
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
    </AdminPage>
  );
}
