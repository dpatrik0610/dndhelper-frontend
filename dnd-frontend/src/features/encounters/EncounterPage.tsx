import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ActionIcon, Badge, Box, Button, Divider, Group, Paper, ScrollArea, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconEye, IconLink, IconPlus, IconRefresh } from "@tabler/icons-react";
import type { Encounter } from "@appTypes/Encounter";
import type { Character } from "@appTypes/Character/Character";
import { createEncounterTemplate } from "@appTypes/Encounter";
import type { Session } from "@appTypes/Session";
import { getCampaignOverviewByCharacter } from "@services/campaignService";
import { getCharacters } from "@services/characterService";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { useToken, useIsAdmin } from "@store/auth/authSelectors";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import {
  useCampaign,
  useEncounterList,
  useSessionList,
  useSelectedEncounterId,
  useEncounterLoading,
  useEncounterSaving,
  useEncounterError,
  useEncounterActions,
} from "@store/encounter/encounterSelectors";
import { AdminEncounterEditor } from "./components/AdminEncounterEditor";
import { CreateEncounterModal } from "./components/CreateEncounterModal";
import { ReadOnlyEncounterState } from "./components/ReadOnlyEncounterState";
import { cloneEncounter, normalizeEncounterDraft } from "./encounterUtils";
import classes from "./EncounterPage.module.css";

const panelStyle = {
  height: "100%",
  overflow: "hidden",
  background: "linear-gradient(145deg, rgba(24, 18, 40, 0.92), rgba(12, 10, 24, 0.9))",
  border: "1px solid rgba(172, 148, 255, 0.22)",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.28)",
  backdropFilter: "blur(12px)",
} as const;

const buildEncounterCreatePrefill = (
  campaign: NonNullable<ReturnType<typeof useCampaign>>,
  sessions: Session[],
  encounterCount: number,
): Encounter => {
  const currentSession = sessions.find((session) => session.id === campaign.currentSessionId) ?? null;
  const suggestedIndex = encounterCount + 1;

  return {
    ...createEncounterTemplate(campaign.id, campaign.ownerIds ?? []),
    sessionId: currentSession?.id ?? null,
    name: currentSession ? `${currentSession.name} Encounter` : `Encounter ${suggestedIndex}`,
    location: currentSession?.location ?? null,
    status: currentSession?.isLive ? "Active" : "Planned",
    startedAt: currentSession?.isLive ? new Date().toISOString() : null,
  };
};

export default function EncounterPage({ embedded = false }: { embedded?: boolean }) {
  const token = useToken();
  const character = useCurrentCharacter();
  const selectedAdminCampaignId = useAdminCampaignStore((state) => state.selectedId);
  const isAdmin = useIsAdmin();

  const campaign = useCampaign();
  const encounters = useEncounterList();
  const sessions = useSessionList();
  const selectedEncounterId = useSelectedEncounterId();
  const loading = useEncounterLoading();
  const saving = useEncounterSaving();
  const error = useEncounterError();
  const {
    loadCampaignContext,
    selectEncounter,
    createEncounter: createEncounterRecord,
    updateEncounter: updateEncounterRecord,
    removeEncounter,
    setActiveEncounter,
    clearActiveEncounter,
    clear,
  } = useEncounterActions();

  const [resolvedCampaignId, setResolvedCampaignId] = useState<string | null>(selectedAdminCampaignId ?? null);
  const [resolvingCampaign, setResolvingCampaign] = useState(false);
  const [draft, setDraft] = useState<Encounter | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [createDraft, setCreateDraft] = useState<Encounter | null>(null);
  const [campaignCharacters, setCampaignCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const resolveCampaign = async () => {
      if (!token) {
        setResolvedCampaignId(null);
        return;
      }

      if (isAdmin && selectedAdminCampaignId) {
        setResolvedCampaignId(selectedAdminCampaignId);
        return;
      }

      if (!character?.id) {
        setResolvedCampaignId(null);
        return;
      }

      setResolvingCampaign(true);
      try {
        const overview = await getCampaignOverviewByCharacter(character.id);
        setResolvedCampaignId(overview?.id ?? null);
      } finally {
        setResolvingCampaign(false);
      }
    };

    void resolveCampaign();
  }, [character?.id, isAdmin, selectedAdminCampaignId, token]);

  useEffect(() => {
    if (!resolvedCampaignId) {
      clear();
      return;
    }

    void loadCampaignContext(resolvedCampaignId);
  }, [loadCampaignContext, resolvedCampaignId]);

  useEffect(() => {
    if (!selectedEncounterId) {
      setDraft(null);
      return;
    }

    const selectedEncounter = encounters.find((encounter) => encounter.id === selectedEncounterId) ?? null;
    setDraft(selectedEncounter ? cloneEncounter(selectedEncounter) : null);
  }, [encounters, selectedEncounterId]);

  useEffect(() => {
    if (!token || !isAdmin || !campaign?.id) {
      setCampaignCharacters([]);
      return;
    }

    const loadSuggestions = async () => {
      try {
        const allCharacters = await getCharacters();
        const campaignCharacterIds = new Set(campaign.characterIds);
        const campaignOnlyCharacters = allCharacters.filter(
          (character) =>
            !!character.id &&
            (campaignCharacterIds.has(character.id) || character.campaignId === campaign.id),
        );

        setCampaignCharacters(campaignOnlyCharacters);
      } catch {
        setCampaignCharacters([]);
      }
    };

    void loadSuggestions();
  }, [campaign?.characterIds, campaign?.id, isAdmin, token]);

  const selectedEncounter = useMemo(
    () => encounters.find((encounter) => encounter.id === selectedEncounterId) ?? null,
    [encounters, selectedEncounterId],
  );

  const activeEncounter = useMemo(
    () => encounters.find((encounter) => encounter.id === campaign?.activeEncounterId) ?? null,
    [campaign?.activeEncounterId, encounters],
  );

  const visibleEncounter = isAdmin ? selectedEncounter : activeEncounter;
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === (visibleEncounter?.sessionId ?? null)) ?? null,
    [sessions, visibleEncounter?.sessionId],
  );

  const handleRefresh = () => {
    if (resolvedCampaignId) {
      void loadCampaignContext(resolvedCampaignId);
    }
  };

  const handleOpenCreateModal = () => {
    if (!campaign) {
      return;
    }

    setCreateDraft(buildEncounterCreatePrefill(campaign, sessions, encounters.length));
    setCreateModalOpened(true);
  };

  const handleCreateEncounter = async () => {
    if (!createDraft) {
      return;
    }

    const created = await createEncounterRecord(normalizeEncounterDraft(createDraft));
    if (created) {
      setCreateModalOpened(false);
      setCreateDraft(null);
      setDraft(cloneEncounter(created));
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) {
      return;
    }

    const normalizedDraft = normalizeEncounterDraft(draft);
    const saved = normalizedDraft.id
      ? await updateEncounterRecord(normalizedDraft)
      : await createEncounterRecord(normalizedDraft);

    if (saved) {
      setDraft(cloneEncounter(saved));
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedEncounter?.id) {
      return;
    }

    if (!window.confirm(`Delete encounter "${selectedEncounter.name || "Untitled Encounter"}"?`)) {
      return;
    }

    await removeEncounter(selectedEncounter.id);
  };

  const renderPageContent = () => {
    if (!token) {
      return <Text c="dimmed">You need to be logged in to view encounters.</Text>;
    }

    if (resolvingCampaign || loading) {
      return <Text c="dimmed">Loading encounter context...</Text>;
    }

    if (!resolvedCampaignId || !campaign) {
      return (
        <Paper p="xl" radius="md" withBorder bg="rgba(255,255,255,0.02)">
          <Stack gap="sm">
            <Title order={3}>No campaign context</Title>
            <Text c="dimmed">
              {isAdmin
                ? "Select a campaign in the admin dashboard, then open encounters."
                : "Choose a character that belongs to a campaign to see the active encounter."}
            </Text>
          </Stack>
        </Paper>
      );
    }

    return (
      <div className={`${classes.shell} ${embedded ? classes.shellEmbedded : ""}`}>
        {isAdmin ? (
          <Paper radius="lg" p="md" style={panelStyle}>
            <Stack gap="md" h="100%">
              <Group justify="space-between">
                <Box>
                  <Text fw={700}>Encounter List</Text>
                  <Text size="sm" c="dimmed">
                    Active encounter is shared to the campaign.
                  </Text>
                </Box>
                <ActionIcon variant="subtle" onClick={handleRefresh}>
                  <IconRefresh size={18} />
                </ActionIcon>
              </Group>

              <Button leftSection={<IconPlus size={16} />} onClick={handleOpenCreateModal}>
                New Encounter
              </Button>

              <Divider />

              <ScrollArea className={classes.scrollArea} offsetScrollbars>
                <Stack gap="sm" pr="xs">
                  {encounters.length > 0 ? (
                    encounters.map((encounter) => {
                      const isSelected = encounter.id === selectedEncounterId;
                      const isActiveEncounter = encounter.id === campaign.activeEncounterId;

                      return (
                        <Button
                          key={encounter.id}
                          variant="subtle"
                          color="gray"
                          className={isSelected ? classes.encounterButtonActive : classes.encounterButton}
                          onClick={() => selectEncounter(encounter.id)}
                          h="auto"
                          p="md"
                        >
                          <Stack gap={6} align="stretch">
                            <Group justify="space-between" wrap="nowrap">
                              <Text fw={600} c="gray.0" truncate>
                                {encounter.name || "Untitled Encounter"}
                              </Text>
                              {isActiveEncounter ? <Badge color="green">Live</Badge> : null}
                            </Group>
                            <Group gap="xs">
                              <Badge variant="light" color="grape">
                                {encounter.status}
                              </Badge>
                              {encounter.sessionId ? <Badge variant="light">Session</Badge> : null}
                            </Group>
                            <Text size="sm" c="dimmed" truncate>
                              {encounter.location || "No location set"}
                            </Text>
                          </Stack>
                        </Button>
                      );
                    })
                  ) : (
                    <Text c="dimmed" size="sm">
                      No encounters exist for this campaign yet.
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            </Stack>
          </Paper>
        ) : null}

        <Paper radius="lg" p="lg" style={panelStyle}>
          <ScrollArea className={classes.scrollArea} offsetScrollbars>
            <Stack gap="lg" pr="xs">
              {!visibleEncounter ? (
                <Paper p="xl" radius="md" withBorder bg="rgba(255,255,255,0.02)">
                  <Stack gap="sm">
                    <Title order={3}>No encounter selected</Title>
                    <Text c="dimmed">
                      {isAdmin
                        ? "Create an encounter or select one from the list."
                        : "There is no active encounter for this campaign right now."}
                    </Text>
                  </Stack>
                </Paper>
              ) : isAdmin && draft ? (
                <AdminEncounterEditor
                  draft={draft}
                  sessions={sessions}
                  campaignCharacters={campaignCharacters}
                  isActiveEncounter={draft.id === campaign.activeEncounterId}
                  saving={saving}
                  onChange={setDraft}
                  onSave={() => void handleSaveDraft()}
                  onDelete={() => void handleDeleteSelected()}
                  onActivate={() => (draft.id ? void setActiveEncounter(draft.id) : void handleSaveDraft())}
                  onClearActive={() => void clearActiveEncounter()}
                  onReset={() => setDraft(selectedEncounter ? cloneEncounter(selectedEncounter) : null)}
                />
              ) : (
                <ReadOnlyEncounterState
                  encounter={visibleEncounter}
                  activeSession={activeSession}
                  isActiveEncounter={visibleEncounter.id === campaign.activeEncounterId}
                />
              )}
            </Stack>
          </ScrollArea>
        </Paper>
      </div>
    );
  };

  return (
    <Box className={embedded ? classes.pageEmbedded : classes.page}>
      <Stack gap="md">
        <Paper p="lg" radius="lg" withBorder bg="rgba(18,16,30,0.84)">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Group align="flex-start">
              <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: "grape", to: "violet" }}>
                <IconEye size={24} />
              </ThemeIcon>
              <Box>
                <Group gap="sm" wrap="wrap">
                  <Title order={1} c="grape.0">
                    Encounter Board
                  </Title>
                  {campaign?.activeEncounterId ? <Badge color="green">Shared Active Encounter</Badge> : <Badge color="gray">No Active Encounter</Badge>}
                  {isAdmin ? <Badge color="violet">Admin Controls Enabled</Badge> : <Badge color="blue">Player View</Badge>}
                </Group>
                <Text c="dimmed" mt={4}>
                  {campaign ? `${campaign.name} campaign` : "Campaign context pending"}
                </Text>
                {error ? (
                  <Text c="red.3" size="sm" mt={4}>
                    {error}
                  </Text>
                ) : null}
              </Box>
            </Group>

            <Group>
              {!embedded ? (
                <Button component={Link} to="/home" variant="default" leftSection={<IconArrowLeft size={16} />}>
                  Back
                </Button>
              ) : null}
              <Button variant="outline" leftSection={<IconRefresh size={16} />} onClick={handleRefresh}>
                Refresh
              </Button>
              {campaign?.activeEncounterId && activeEncounter?.mapUrl ? (
                <Button component="a" href={activeEncounter.mapUrl} target="_blank" rel="noreferrer" variant="light" leftSection={<IconLink size={16} />}>
                  Open Map
                </Button>
              ) : null}
              {!isAdmin && activeEncounter ? (
                <Button variant="light" leftSection={<IconCheck size={16} />} disabled>
                  Viewing Encounter
                </Button>
              ) : null}
            </Group>
          </Group>
        </Paper>

        {renderPageContent()}
      </Stack>

      <CreateEncounterModal
        opened={createModalOpened}
        draft={createDraft}
        sessions={sessions}
        saving={saving}
        onClose={() => {
          setCreateModalOpened(false);
          setCreateDraft(null);
        }}
        onChange={setCreateDraft}
        onCreate={() => void handleCreateEncounter()}
      />
    </Box>
  );
}
