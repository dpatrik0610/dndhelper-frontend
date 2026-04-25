import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Image,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowsMove,
  IconBook2,
  IconEye,
  IconLayersIntersect,
  IconMap2,
  IconPhoto,
  IconPlus,
  IconRulerMeasure,
  IconSwords,
  IconTargetArrow,
  IconUserScan,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { BaseModal } from "@components/BaseModal";
import { ConnectionStatus } from "@components/ConnectionStatus";
import type { Character } from "@appTypes/Character/Character";
import type { EncounterEntity } from "@appTypes/Encounter";
import type { Monster } from "@appTypes/Monster";
import { getCampaignOverviewByCharacter } from "@services/campaignService";
import { getCharacterById } from "@services/characterService";
import { monsterService } from "@services/Admin/monsterService";
import { useCharacterStore } from "@store/useCharacterStore";
import { useEncounterStore } from "@store/useEncounterStore";
import { useAuthStore } from "@store/useAuthStore";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import classes from "./EncounterLivePage.module.css";

const mapToolButtons = [
  { label: "Pan", icon: IconArrowsMove },
  { label: "Zoom in", icon: IconZoomIn },
  { label: "Zoom out", icon: IconZoomOut },
  { label: "Focus", icon: IconTargetArrow },
  { label: "Measure", icon: IconRulerMeasure },
  { label: "Layers", icon: IconLayersIntersect },
  { label: "Media", icon: IconPhoto },
  { label: "Notes", icon: IconBook2 },
] as const;

const initiativeSort = (left: EncounterEntity, right: EncounterEntity) => {
  const leftInitiative = left.initiative ?? Number.NEGATIVE_INFINITY;
  const rightInitiative = right.initiative ?? Number.NEGATIVE_INFINITY;
  
  if (leftInitiative !== rightInitiative) {
    return rightInitiative - leftInitiative;
  }

  return left.name.localeCompare(right.name);
};

const getStatusColor = (status: EncounterEntity["status"]) => {
  switch (status) {
    case "Alive":
      return "green";
    case "Unconscious":
      return "yellow";
    case "Dead":
      return "red";
    case "Fled":
      return "blue";
    case "Removed":
      return "gray";
    default:
      return "grape";
  }
};

function TopPanel({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper p="md" radius="md" withBorder className={classes.topPanel}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box>
          <Text size="xs" tt="uppercase" c="dimmed">
            {title}
          </Text>
          <Text fw={700} size="lg" c="grape.0" mt={4}>
            {value}
          </Text>
          <Text size="sm" c="dimmed" mt={6}>
            {description}
          </Text>
        </Box>
        <ThemeIcon size={38} radius="md" variant="light" color="grape">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

function EntityDetailsModal({
  opened,
  entity,
  loading,
  character,
  monster,
  error,
  onClose,
}: {
  opened: boolean;
  entity: EncounterEntity | null;
  loading: boolean;
  character: Character | null;
  monster: Monster | null;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Entity Details"
      showSaveButton={false}
      saveLabel=""
      size="xl"
    >
      {!entity ? null : (
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Title order={2} c="grape.0">
                {entity.name}
              </Title>
              <Text c="dimmed" size="sm">
                {entity.type} · Initiative {entity.initiative ?? "-"} · Quantity {entity.quantity}
              </Text>
            </Box>

            <Group gap="xs">
              <Badge color={getStatusColor(entity.status)}>{entity.status}</Badge>
              {entity.referenceId ? <Badge variant="light">Linked</Badge> : <Badge variant="light">Stored Only</Badge>}
            </Group>
          </Group>

          <Paper p="md" radius="md" withBorder bg="rgba(255,255,255,0.03)">
            <Stack gap={6}>
              <Text size="xs" tt="uppercase" c="dimmed">
                Encounter Row
              </Text>
              <Text>Name: {entity.name}</Text>
              <Text>Type: {entity.type}</Text>
              <Text>Initiative: {entity.initiative ?? "-"}</Text>
              <Text>Quantity: {entity.quantity}</Text>
              <Text>Status: {entity.status}</Text>
              <Text>Reference ID: {entity.referenceId ?? "None"}</Text>
              <Text>Note: {entity.note || "None"}</Text>
            </Stack>
          </Paper>

          {loading ? <Text c="dimmed">Loading linked record...</Text> : null}
          {error ? <Text c="red.3">{error}</Text> : null}

          {!loading && character ? (
            <Paper p="md" radius="md" withBorder bg="rgba(255,255,255,0.03)">
              <Stack gap="sm">
                <Text size="xs" tt="uppercase" c="dimmed">
                  Character Record
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Text>Name: {character.name}</Text>
                  <Text>Level: {character.level}</Text>
                  <Text>Class: {character.characterClass}</Text>
                  <Text>Race: {character.race}</Text>
                  <Text>Armor Class: {character.armorClass}</Text>
                  <Text>HP: {character.hitPoints}/{character.maxHitPoints}</Text>
                  <Text>Speed: {character.speed}</Text>
                  <Text>Campaign: {character.campaignId ?? "None"}</Text>
                </SimpleGrid>
              </Stack>
            </Paper>
          ) : null}

          {!loading && monster ? (
            <Paper p="md" radius="md" withBorder bg="rgba(255,255,255,0.03)">
              <Stack gap="sm">
                <Text size="xs" tt="uppercase" c="dimmed">
                  Monster Record
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <Text>Name: {monster.name ?? "-"}</Text>
                  <Text>CR: {monster.cr ?? "-"}</Text>
                  <Text>Type: {monster.type?.type ?? "-"}</Text>
                  <Text>Source: {monster.source ?? "-"}</Text>
                  <Text>Armor Class: {monster.armorClass?.join(", ") ?? "-"}</Text>
                  <Text>HP: {monster.hitPoints?.average ?? "-"}</Text>
                </SimpleGrid>
                <Text c="dimmed">{monster.lore ?? "No lore available."}</Text>
              </Stack>
            </Paper>
          ) : null}

          {!loading && !character && !monster && !error ? (
            <Text c="dimmed">No linked source record could be resolved for this entity.</Text>
          ) : null}
        </Stack>
      )}
    </BaseModal>
  );
}

export default function EncounterLivePage() {
  const token = useAuthStore((state) => state.token);
  const roles = useAuthStore((state) => state.roles);
  const character = useCharacterStore((state) => state.character);
  const selectedAdminCampaignId = useAdminCampaignStore((state) => state.selectedId);
  const isAdmin = roles.includes("Admin");

  const { campaign, encounters, loading, error, loadCampaignContext, clear } = useEncounterStore();

  const [resolvedCampaignId, setResolvedCampaignId] = useState<string | null>(null);
  const [resolvingCampaign, setResolvingCampaign] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EncounterEntity | null>(null);
  const [entityCharacter, setEntityCharacter] = useState<Character | null>(null);
  const [entityMonster, setEntityMonster] = useState<Monster | null>(null);
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState<string | null>(null);

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

  const sortedEntities = useMemo(
    () => [...(activeEncounter?.entities ?? [])].sort(initiativeSort),
    [activeEncounter?.entities],
  );

  useEffect(() => {
    const loadEntitySource = async () => {
      if (!selectedEntity || !selectedEntity.referenceId || !token || !isAdmin) {
        setEntityCharacter(null);
        setEntityMonster(null);
        setEntityError(null);
        setEntityLoading(false);
        return;
      }

      setEntityLoading(true);
      setEntityCharacter(null);
      setEntityMonster(null);
      setEntityError(null);

      try {
        if (selectedEntity.type === "PlayerCharacter") {
          const linkedCharacter = await getCharacterById(selectedEntity.referenceId, token);
          if (linkedCharacter) {
            setEntityCharacter(linkedCharacter);
          } else {
            setEntityError("Character record could not be loaded.");
          }

          return;
        }

        try {
          const linkedMonster = await monsterService.getById(selectedEntity.referenceId, token);
          setEntityMonster(linkedMonster);
          return;
        } catch {
          const linkedCharacter = await getCharacterById(selectedEntity.referenceId, token);
          if (linkedCharacter) {
            setEntityCharacter(linkedCharacter);
            return;
          }

          setEntityError("Linked source record could not be loaded.");
        }
      } finally {
        setEntityLoading(false);
      }
    };

    void loadEntitySource();
  }, [isAdmin, selectedEntity, token]);

  const topPanels = activeEncounter
    ? [
        {
          title: "Encounter",
          value: activeEncounter.name,
          description: activeEncounter.location || "Location not set",
          icon: <IconSwords size={18} />,
        },
        {
          title: "Media",
          value: activeEncounter.mapUrl ? "Map Ready" : "No Map",
          description: `${activeEncounter.imageUrls.length} extra image${activeEncounter.imageUrls.length === 1 ? "" : "s"} attached`,
          icon: <IconPhoto size={18} />,
        },
        {
          title: "Panels",
          value: "Reserved",
          description: "Space kept for images, notes, overlays, and future encounter tools.",
          icon: <IconPlus size={18} />,
        },
      ]
    : [];

  const content = () => {
    if (!token) {
      return <Text c="dimmed">You need to be logged in to view the live encounter.</Text>;
    }

    if (resolvingCampaign || loading) {
      return <Text c="dimmed">Loading live encounter...</Text>;
    }

    if (!resolvedCampaignId || !campaign) {
      return <Text c="dimmed">No campaign context available for the live encounter view.</Text>;
    }

    if (!activeEncounter) {
      return (
        <Paper p="xl" radius="lg" withBorder className={classes.emptyState}>
          <Stack gap="sm" align="center">
            <ThemeIcon size={56} radius="xl" variant="light" color="grape">
              <IconEye size={26} />
            </ThemeIcon>
            <Title order={3}>No Live Encounter</Title>
            <Text c="dimmed" ta="center" maw={480}>
              The route is wired to the campaign active encounter. Once the DM marks one active, this page can render
              the final player-facing design.
            </Text>
          </Stack>
        </Paper>
      );
    }

    return (
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          {topPanels.map((panel) => (
            <TopPanel
              key={panel.title}
              title={panel.title}
              value={panel.value}
              description={panel.description}
              icon={panel.icon}
            />
          ))}
        </SimpleGrid>

        <div className={classes.boardLayout}>
          <Paper p="md" radius="sm" withBorder className={classes.mapPanel}>
            <Stack gap="md" h="100%">
              <Group justify="space-between" align="center" wrap="wrap">
                    <Title order={2} c="grape.0">
                      Battle Map
                    </Title>
                    <ConnectionStatus />
              </Group>
              <div className={classes.mapViewport}>
                {activeEncounter.mapUrl ? (
                  <Image src={activeEncounter.mapUrl} alt={`${activeEncounter.name} map`} fit="contain" className={classes.mapImage} />
                ) : (
                  <Stack align="center" justify="center" className={classes.mapPlaceholder}>
                    <ThemeIcon size={64} radius="xl" variant="light" color="grape">
                      <IconMap2 size={30} />
                    </ThemeIcon>
                    <Text fw={700} c="grape.0">
                      Map Viewer Placeholder
                    </Text>
                    <Text c="dimmed" ta="center" maw={360}>
                      The container is ready for the interactive map experience. Right now it displays the linked map
                      image when available.
                    </Text>
                  </Stack>
                )}
              </div>
            </Stack>
          </Paper>

          <Paper p="xs" radius="lg" withBorder className={classes.toolRail}>
            <Stack gap="xs" align="center">
              {mapToolButtons.map((tool) => (
                <Tooltip key={tool.label} label={tool.label} withArrow position="left">
                  <ActionIcon variant="subtle" color="grape" size={42} radius="md">
                    <tool.icon size={18} />
                  </ActionIcon>
                </Tooltip>
              ))}
            </Stack>
          </Paper>

          <Paper p="md" radius="lg" withBorder className={classes.initiativePanel}>
            <Stack gap="md" h="100%">
              <Group justify="space-between" align="center">
                <Box>
                  <Title order={3} c="grape.0">
                    Initiative
                  </Title>
                  <Text size="sm" c="dimmed">
                    Players, enemies, allies, and others in initiative order.
                  </Text>
                </Box>
                <ThemeIcon size={38} radius="md" variant="light" color="grape">
                  <IconUserScan size={18} />
                </ThemeIcon>
              </Group>

              <Divider />

              <ScrollArea className={classes.initiativeScroll} offsetScrollbars>
                <Stack gap="sm" pr="xs">
                  {sortedEntities.map((entity, index) => {
                    const interactive = isAdmin;
                    const rowContent = (
                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" className={classes.entityMain}>
                          <div className={classes.initiativeBadge}>{entity.initiative ?? "-"}</div>
                          <Box className={classes.entityText}>
                            <Text fw={600} truncate>
                              {entity.name}
                            </Text>
                            <Group gap="xs" wrap="wrap">
                              <Badge variant="light" color="grape">
                                {entity.type}
                              </Badge>
                              {entity.quantity > 1 ? <Badge variant="light">x{entity.quantity}</Badge> : null}
                              <Badge color={getStatusColor(entity.status)}>{entity.status}</Badge>
                            </Group>
                          </Box>
                        </Group>
                      </Group>
                    );

                    return interactive ? (
                      <Button
                        key={`${entity.name}-${index}`}
                        variant="subtle"
                        color="gray"
                        className={`${classes.entityRow} ${classes.entityRowInteractive}`}
                        onClick={() => setSelectedEntity(entity)}
                        p="sm"
                        h="auto"
                      >
                        {rowContent}
                      </Button>
                    ) : (
                      <Paper
                        key={`${entity.name}-${index}`}
                        p="sm"
                        radius="md"
                        withBorder
                        className={classes.entityRow}
                      >
                        {rowContent}
                      </Paper>
                    );
                  })}
                </Stack>
              </ScrollArea>
            </Stack>
          </Paper>
        </div>
      </Stack>
    );
  };

  return (
    <>
      <Stack w="100%" maw={"100%"} mx="auto" p="0" gap="md">
        <Paper p="lg" radius="lg" withBorder className={classes.headerShell}>
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Group align="flex-start">
              <ThemeIcon size={48} radius="md" variant="gradient" gradient={{ from: "grape", to: "violet" }}>
                <IconEye size={24} />
              </ThemeIcon>
              <Box>
                <Group gap="sm" wrap="wrap">
                  <Title order={1} c="grape.0">
                    Live Encounter
                  </Title>
                  <Badge color="blue">Shared View</Badge>
                  {isAdmin ? <Badge color="violet">Admin Access</Badge> : null}
                </Group>
                {error ? (
                  <Text c="red.3" size="sm" mt={4}>
                    {error}
                  </Text>
                ) : null}
              </Box>
            </Group>
          </Group>
        </Paper>

        {content()}
      </Stack>

      <EntityDetailsModal
        opened={!!selectedEntity && isAdmin}
        entity={selectedEntity}
        loading={entityLoading}
        character={entityCharacter}
        monster={entityMonster}
        error={entityError}
        onClose={() => setSelectedEntity(null)}
      />
    </>
  );
}
