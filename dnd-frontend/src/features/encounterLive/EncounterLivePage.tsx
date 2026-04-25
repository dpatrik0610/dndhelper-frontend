import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Center, Group, Loader, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconSwords, IconUsersGroup } from "@tabler/icons-react";
import type { EncounterEntity } from "@appTypes/Encounter";
import { getCampaignOverviewByCharacter } from "@services/campaignService";
import { useCharacterStore } from "@store/useCharacterStore";
import { useEncounterStore } from "@store/useEncounterStore";
import { useAuthStore } from "@store/useAuthStore";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { BattleMapStage } from "./components/BattleMapStage";
import { InitiativeSidebar } from "./components/InitiativeSidebar";
import { MapToolbar } from "./components/MapToolbar";
import { buildEntityKey, nextTurnState, sortByInitiative } from "./initiativeUtils";
import classes from "./EncounterLivePage.module.css";

export default function EncounterLivePage() {
  const token = useAuthStore((state) => state.token);
  const roles = useAuthStore((state) => state.roles);
  const character = useCharacterStore((state) => state.character);
  const selectedAdminCampaignId = useAdminCampaignStore((state) => state.selectedId);
  const isAdmin = roles.includes("Admin");

  const { campaign, encounters, loading, saving, error, loadCampaignContext, updateEncounter, clear } = useEncounterStore();

  const [resolvedCampaignId, setResolvedCampaignId] = useState<string | null>(null);
  const [resolvingCampaign, setResolvingCampaign] = useState(false);
  const [cycleCount, setCycleCount] = useState(1);
  const [activeEntityKey, setActiveEntityKey] = useState<string | null>(null);

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
        const overview = await getCampaignOverviewByCharacter(character.id, token);
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
  }, [clear, loadCampaignContext, resolvedCampaignId]);

  const activeEncounter = useMemo(
    () => encounters.find((encounter) => encounter.id === campaign?.activeEncounterId) ?? null,
    [campaign?.activeEncounterId, encounters],
  );

  const sortedEntities = useMemo(() => sortByInitiative(activeEncounter?.entities ?? []), [activeEncounter?.entities]);

  /** Keeps the active initiative pointer in sync with the current sorted entity list. */
  useEffect(() => {
    if (sortedEntities.length === 0) {
      setActiveEntityKey(null);
      setCycleCount(1);
      return;
    }

    if (!activeEntityKey) {
      setActiveEntityKey(buildEntityKey(sortedEntities[0], 0));
    }
  }, [activeEntityKey, sortedEntities]);

  /** Persists admin-side initiative/status edits back to the active encounter record. */
  const handleUpdateEntity = async (index: number, update: Partial<EncounterEntity>) => {
    if (!isAdmin || !activeEncounter) {
      return;
    }

    const nextEntities = activeEncounter.entities.map((entity, entityIndex) =>
      entityIndex === index ? { ...entity, ...update } : entity,
    );

    await updateEncounter({
      ...activeEncounter,
      entities: nextEntities,
    });
  };

  /** Advances initiative to the next entity and increments cycle on wrap-around. */
  const handleNextTurn = () => {
    const next = nextTurnState(sortedEntities, activeEntityKey, cycleCount);
    setActiveEntityKey(next.activeEntityKey);
    setCycleCount(next.cycleCount);
  };

  if (!token) {
    return (
      <Stack className={classes.page} p={0} m={0} gap="md">
        <Center h={300}>
          <Text c="dimmed">Login required.</Text>
        </Center>
      </Stack>
    );
  }

  if (resolvingCampaign || loading) {
    return (
      <Stack className={classes.page} p={0} m={0} gap="md">
        <Center h={300}>
          <Loader />
        </Center>
      </Stack>
    );
  }

  if (!resolvedCampaignId || !campaign || !activeEncounter) {
    return (
      <Stack className={classes.page} p={0} m={0} gap="md">
        <Center h={300}>
          <Text c="dimmed">No active encounter.</Text>
        </Center>
      </Stack>
    );
  }

  return (
    <Stack className={classes.page} gap="md">
      <Paper p="xs" radius="md" className={classes.liveHeader} withBorder>
        <Group justify="space-between" wrap="wrap" gap="xs">
          <Group gap="sm">
            <ThemeIcon radius="md" size={34} variant="gradient" gradient={{ from: "grape", to: "violet" }}>
              <IconSwords size={18} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text fw={700}>{activeEncounter.name || "Live Encounter"}</Text>
              <Text size="xs" c="dimmed">
                {campaign.name}
              </Text>
            </Stack>
          </Group>

          <Group gap="xs">
            <Badge variant="light" color="violet">
              Live
            </Badge>
            <Badge variant="light" color="indigo" leftSection={<IconUsersGroup size={12} />}>
              {sortedEntities.length} entities
            </Badge>
            {isAdmin ? <Badge color="grape">Admin</Badge> : <Badge color="blue">Player</Badge>}
          </Group>
        </Group>
      </Paper>

      {error ? (
        <Group>
          <Text c="red.4" size="sm">
            {error}
          </Text>
        </Group>
      ) : null}

      <Box className={classes.layout}>
        <Box className={classes.toolbar}>
          <MapToolbar />
        </Box>
        <Box className={classes.map}>
          <BattleMapStage mapUrl={activeEncounter.mapUrl} encounterName={activeEncounter.name} className={classes.mapStage} />
        </Box>
        <Box className={classes.initiative}>
          <InitiativeSidebar
            entities={sortedEntities}
            isAdmin={isAdmin}
            cycleCount={cycleCount}
            activeEntityKey={activeEntityKey}
            saving={saving}
            onCycleChange={setCycleCount}
            onNextTurn={handleNextTurn}
            onResetTurn={() => {
              setActiveEntityKey(sortedEntities[0] ? buildEntityKey(sortedEntities[0], 0) : null);
              setCycleCount(1);
            }}
            onUpdateEntity={(index, update) => void handleUpdateEntity(index, update)}
            scrollClassName={classes.initiativeScroll}
          />
        </Box>
      </Box>
    </Stack>
  );
}
