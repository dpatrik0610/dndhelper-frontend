import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  Group,
  Image,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconEye,
  IconLink,
  IconMap2,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSkull,
  IconSparkles,
  IconTrash,
  IconUsersGroup,
} from "@tabler/icons-react";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { BaseModal } from "@components/BaseModal";
import type {
  Encounter,
  EncounterEntity,
  EncounterLootItem,
} from "@appTypes/Encounter";
import {
  createEncounterTemplate,
  encounterEntityTemplate,
  encounterLootItemTemplate,
  ENCOUNTER_ENTITY_STATUSES,
  ENCOUNTER_ENTITY_TYPES,
  ENCOUNTER_STATUSES,
} from "@appTypes/Encounter";
import { getCampaignOverviewByCharacter } from "@services/campaignService";
import { useCharacterStore } from "@store/useCharacterStore";
import { useEncounterStore } from "@store/useEncounterStore";
import { useAuthStore } from "@store/useAuthStore";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import type { Session } from "@appTypes/Session";
import classes from "./EncounterPage.module.css";

const getDateTimeInputValue = (value: string | null) =>
  value ? dayjs(value).format("YYYY-MM-DDTHH:mm") : "";

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const parseDateInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = dayjs(trimmed);
  return parsed.isValid() ? parsed.toISOString() : null;
};

const cloneEncounter = (encounter: Encounter) => structuredClone(encounter);

const buildEncounterCreatePrefill = (
  campaign: NonNullable<ReturnType<typeof useEncounterStore.getState>["campaign"]>,
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

const normalizeEncounterDraft = (draft: Encounter): Encounter => ({
  ...draft,
  name: draft.name.trim(),
  description: toNullableString(draft.description ?? ""),
  mapUrl: toNullableString(draft.mapUrl ?? ""),
  dmNote: toNullableString(draft.dmNote ?? ""),
  location: toNullableString(draft.location ?? ""),
  imageUrls: draft.imageUrls.map((url) => url.trim()).filter(Boolean),
  entities: draft.entities
    .map((entity) => ({
      ...entity,
      name: entity.name.trim(),
      referenceId: toNullableString(entity.referenceId ?? ""),
      note: toNullableString(entity.note ?? ""),
      quantity: entity.quantity > 0 ? entity.quantity : 1,
    }))
    .filter((entity) => entity.name.length > 0),
  loot: draft.loot
    .map((item) => ({
      ...item,
      name: item.name.trim(),
      equipmentId: toNullableString(item.equipmentId ?? ""),
      note: toNullableString(item.note ?? ""),
      quantity: item.quantity > 0 ? item.quantity : 1,
    }))
    .filter((item) => item.name.length > 0),
});

const sortEntities = (entities: EncounterEntity[]) =>
  [...entities].sort((left, right) => {
    const leftInitiative = left.initiative ?? Number.NEGATIVE_INFINITY;
    const rightInitiative = right.initiative ?? Number.NEGATIVE_INFINITY;

    if (leftInitiative !== rightInitiative) {
      return rightInitiative - leftInitiative;
    }

    return left.name.localeCompare(right.name);
  });

function EncounterSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Paper p="lg" radius="md" withBorder bg="rgba(255,255,255,0.02)">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={38} radius="md" variant="light" color="grape">
              {icon}
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg" c="grape.0">
                {title}
              </Text>
              {description ? (
                <Text size="sm" c="dimmed">
                  {description}
                </Text>
              ) : null}
            </Box>
          </Group>
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}

function ReadOnlyEncounterState({
  encounter,
  activeSession,
  isActiveEncounter,
}: {
  encounter: Encounter;
  activeSession: Session | null;
  isActiveEncounter: boolean;
}) {
  const entities = useMemo(() => sortEntities(encounter.entities), [encounter.entities]);

  return (
    <Stack gap="lg">
      <EncounterSection
        title="Encounter Details"
        description="Shared encounter information for the campaign."
        icon={<IconSparkles size={18} />}
      >
        <SimpleGrid cols={{ base: 1, md: 4 }}>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Status
            </Text>
            <Badge mt="xs" size="lg" color={encounter.status === "Active" ? "green" : "grape"}>
              {encounter.status}
            </Badge>
          </Card>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Location
            </Text>
            <Text mt="xs">{encounter.location || "Unknown"}</Text>
          </Card>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Session
            </Text>
            <Text mt="xs">{activeSession?.name || "Standalone encounter"}</Text>
          </Card>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Visibility
            </Text>
            <Text mt="xs">{isActiveEncounter ? "Live for players" : "Waiting for activation"}</Text>
          </Card>
        </SimpleGrid>

        <Box>
          <Text size="sm" fw={600} mb="xs">
            Description
          </Text>
          {encounter.description ? (
            <MarkdownRenderer content={encounter.description} />
          ) : (
            <Text c="dimmed">No description provided.</Text>
          )}
        </Box>
      </EncounterSection>

      <EncounterSection
        title="Map and Gallery"
        description="Main battle map plus any supporting reference images."
        icon={<IconMap2 size={18} />}
      >
        <Stack gap="md">
          {encounter.mapUrl ? (
            <Stack gap="xs">
              <Image src={encounter.mapUrl} radius="md" alt={`${encounter.name} map`} mah={420} fit="contain" />
              <Anchor href={encounter.mapUrl} target="_blank" rel="noreferrer" size="sm">
                Open map source
              </Anchor>
            </Stack>
          ) : (
            <Text c="dimmed">No battle map attached.</Text>
          )}

          {encounter.imageUrls.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }}>
              {encounter.imageUrls.map((url) => (
                <Image key={url} src={url} radius="md" alt="Encounter reference" mah={220} fit="cover" />
              ))}
            </SimpleGrid>
          ) : (
            <Text c="dimmed">No extra encounter images.</Text>
          )}
        </Stack>
      </EncounterSection>

      <EncounterSection
        title="Entities"
        description="All creatures and participants in the encounter."
        icon={<IconUsersGroup size={18} />}
      >
        {entities.length > 0 ? (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Initiative</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Note</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entities.map((entity, index) => (
                <Table.Tr key={`${entity.name}-${index}`}>
                  <Table.Td>{entity.name}</Table.Td>
                  <Table.Td>{entity.type}</Table.Td>
                  <Table.Td>{entity.initiative ?? "-"}</Table.Td>
                  <Table.Td>{entity.quantity}</Table.Td>
                  <Table.Td>{entity.status}</Table.Td>
                  <Table.Td>{entity.note || "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed">No entities added yet.</Text>
        )}
      </EncounterSection>

      <EncounterSection
        title="Loot"
        description="Encounter rewards, drops, and claim tracking."
        icon={<IconPackage size={18} />}
      >
        {encounter.loot.length > 0 ? (
          <Stack gap="sm">
            {encounter.loot.map((item, index) => (
              <Card key={`${item.name}-${index}`} radius="md" p="md" bg="rgba(255,255,255,0.02)">
                <Group justify="space-between" align="flex-start">
                  <Box>
                    <Text fw={600}>
                      {item.name} x{item.quantity}
                    </Text>
                    {item.note ? <Text size="sm" c="dimmed">{item.note}</Text> : null}
                  </Box>
                  <Badge color={item.isClaimed ? "teal" : "gray"}>
                    {item.isClaimed ? "Claimed" : "Available"}
                  </Badge>
                </Group>
              </Card>
            ))}
          </Stack>
        ) : (
          <Text c="dimmed">No loot has been added.</Text>
        )}
      </EncounterSection>
    </Stack>
  );
}

function UrlListEditor({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (next: string[]) => void;
}) {
  const [pendingUrl, setPendingUrl] = useState("");

  const handleAdd = () => {
    const trimmed = pendingUrl.trim();
    if (!trimmed || urls.includes(trimmed)) {
      return;
    }

    onChange([...urls, trimmed]);
    setPendingUrl("");
  };

  return (
    <Stack gap="sm">
      <Group align="flex-end">
        <TextInput
          label="Extra image URL"
          placeholder="https://..."
          value={pendingUrl}
          onChange={(event) => setPendingUrl(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
          Add
        </Button>
      </Group>

      {urls.length > 0 ? (
        <Stack gap="xs">
          {urls.map((url) => (
            <Group key={url} justify="space-between" wrap="nowrap">
              <Anchor href={url} target="_blank" rel="noreferrer" truncate>
                {url}
              </Anchor>
              <ActionIcon color="red" variant="subtle" onClick={() => onChange(urls.filter((item) => item !== url))}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed">
          No gallery images configured.
        </Text>
      )}
    </Stack>
  );
}

function AdminEncounterEditor({
  draft,
  sessions,
  isActiveEncounter,
  saving,
  onChange,
  onSave,
  onDelete,
  onActivate,
  onClearActive,
  onReset,
}: {
  draft: Encounter;
  sessions: Session[];
  isActiveEncounter: boolean;
  saving: boolean;
  onChange: (next: Encounter) => void;
  onSave: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onClearActive: () => void;
  onReset: () => void;
}) {
  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: session.name,
  }));

  const mutateEntity = (index: number, mutate: (current: EncounterEntity) => EncounterEntity) => {
    onChange({
      ...draft,
      entities: draft.entities.map((entity, entityIndex) =>
        entityIndex === index ? mutate(entity) : entity,
      ),
    });
  };

  const mutateLoot = (index: number, mutate: (current: EncounterLootItem) => EncounterLootItem) => {
    onChange({
      ...draft,
      loot: draft.loot.map((item, itemIndex) => (itemIndex === index ? mutate(item) : item)),
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Box>
          <Title order={2} c="grape.0">
            {draft.name.trim() || "Untitled Encounter"}
          </Title>
          <Text c="dimmed" size="sm">
            Edit encounter data, then promote it to the campaign when ready.
          </Text>
        </Box>
        <Group>
          <Button variant="default" onClick={onReset}>
            Reset
          </Button>
          {isActiveEncounter ? (
            <Button variant="outline" color="yellow" onClick={onClearActive} loading={saving}>
              Clear Active
            </Button>
          ) : (
            <Button variant="outline" color="green" onClick={onActivate} loading={saving} disabled={!draft.id}>
              Make Active
            </Button>
          )}
          <Button color="red" variant="light" leftSection={<IconTrash size={16} />} onClick={onDelete} loading={saving}>
            Delete
          </Button>
          <Button leftSection={<IconDeviceFloppy size={16} />} onClick={onSave} loading={saving} disabled={!draft.name.trim()}>
            Save
          </Button>
        </Group>
      </Group>

      <EncounterSection title="Encounter Details" description="Campaign, session, timing, and narrative fields." icon={<IconSparkles size={18} />}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Encounter name"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.currentTarget.value })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Status"
              data={ENCOUNTER_STATUSES.map((status) => ({ value: status, label: status }))}
              value={draft.status}
              onChange={(value) => onChange({ ...draft, status: (value as Encounter["status"]) ?? draft.status })}
              allowDeselect={false}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Session"
              placeholder="Optional"
              data={sessionOptions}
              value={draft.sessionId}
              onChange={(value) => onChange({ ...draft, sessionId: value || null })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Location"
              value={draft.location ?? ""}
              onChange={(event) => onChange({ ...draft, location: toNullableString(event.currentTarget.value) })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              label="Started at"
              type="datetime-local"
              value={getDateTimeInputValue(draft.startedAt)}
              onChange={(event) => onChange({ ...draft, startedAt: parseDateInput(event.currentTarget.value) })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              label="Ended at"
              type="datetime-local"
              value={getDateTimeInputValue(draft.endedAt)}
              onChange={(event) => onChange({ ...draft, endedAt: parseDateInput(event.currentTarget.value) })}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <MarkdownTextarea
              label="Description"
              value={draft.description ?? ""}
              onChange={(value) => onChange({ ...draft, description: toNullableString(value) })}
              minHeightRem={10}
            />
          </Grid.Col>
        </Grid>
      </EncounterSection>

      <EncounterSection title="Map and Gallery" description="Primary battlefield plus any supporting images." icon={<IconMap2 size={18} />}>
        <Stack gap="md">
          <TextInput
            label="Map URL"
            placeholder="https://..."
            value={draft.mapUrl ?? ""}
            onChange={(event) => onChange({ ...draft, mapUrl: toNullableString(event.currentTarget.value) })}
          />

          {draft.mapUrl ? <Image src={draft.mapUrl} radius="md" alt="Battle map preview" mah={320} fit="contain" /> : null}

          <UrlListEditor
            urls={draft.imageUrls}
            onChange={(imageUrls) => onChange({ ...draft, imageUrls })}
          />
        </Stack>
      </EncounterSection>

      <EncounterSection title="Entities" description="Players, enemies, NPCs, and grouped creatures." icon={<IconUsersGroup size={18} />}>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              One initiative field per entity row. Quantity can represent grouped creatures.
            </Text>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => onChange({ ...draft, entities: [...draft.entities, structuredClone(encounterEntityTemplate)] })}
            >
              Add Entity
            </Button>
          </Group>

          {draft.entities.length > 0 ? (
            draft.entities.map((entity, index) => (
              <Paper key={`entity-${index}`} withBorder radius="md" p="md" bg="rgba(255,255,255,0.02)">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>Entity {index + 1}</Text>
                    <ActionIcon color="red" variant="subtle" onClick={() => onChange({ ...draft, entities: draft.entities.filter((_, entityIndex) => entityIndex !== index) })}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Name"
                        value={entity.name}
                        onChange={(event) => mutateEntity(index, (current) => ({ ...current, name: event.currentTarget.value }))}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <Select
                        label="Type"
                        data={ENCOUNTER_ENTITY_TYPES.map((type) => ({ value: type, label: type }))}
                        value={entity.type}
                        onChange={(value) => mutateEntity(index, (current) => ({ ...current, type: (value as EncounterEntity["type"]) ?? current.type }))}
                        allowDeselect={false}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <NumberInput
                        label="Initiative"
                        value={entity.initiative ?? undefined}
                        onChange={(value) => mutateEntity(index, (current) => ({ ...current, initiative: typeof value === "number" ? value : null }))}
                        allowDecimal={false}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <NumberInput
                        label="Qty"
                        value={entity.quantity}
                        min={1}
                        onChange={(value) => mutateEntity(index, (current) => ({ ...current, quantity: typeof value === "number" && value > 0 ? value : 1 }))}
                        allowDecimal={false}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <Select
                        label="Status"
                        data={ENCOUNTER_ENTITY_STATUSES.map((status) => ({ value: status, label: status }))}
                        value={entity.status}
                        onChange={(value) => mutateEntity(index, (current) => ({ ...current, status: (value as EncounterEntity["status"]) ?? current.status }))}
                        allowDeselect={false}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Reference ID"
                        placeholder="Optional source record ID"
                        value={entity.referenceId ?? ""}
                        onChange={(event) => mutateEntity(index, (current) => ({ ...current, referenceId: toNullableString(event.currentTarget.value) }))}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <TextInput
                        label="Note"
                        value={entity.note ?? ""}
                        onChange={(event) => mutateEntity(index, (current) => ({ ...current, note: toNullableString(event.currentTarget.value) }))}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            ))
          ) : (
            <Text c="dimmed">No entities added yet.</Text>
          )}
        </Stack>
      </EncounterSection>

      <EncounterSection title="Loot" description="Track rewards and whether they have been claimed." icon={<IconPackage size={18} />}>
        <Stack gap="sm">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Loot can be linked to an equipment record or kept as free text.
            </Text>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => onChange({ ...draft, loot: [...draft.loot, structuredClone(encounterLootItemTemplate)] })}
            >
              Add Loot
            </Button>
          </Group>

          {draft.loot.length > 0 ? (
            draft.loot.map((item, index) => (
              <Paper key={`loot-${index}`} withBorder radius="md" p="md" bg="rgba(255,255,255,0.02)">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>Loot {index + 1}</Text>
                    <ActionIcon color="red" variant="subtle" onClick={() => onChange({ ...draft, loot: draft.loot.filter((_, lootIndex) => lootIndex !== index) })}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Name"
                        value={item.name}
                        onChange={(event) => mutateLoot(index, (current) => ({ ...current, name: event.currentTarget.value }))}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput
                        label="Equipment ID"
                        value={item.equipmentId ?? ""}
                        onChange={(event) => mutateLoot(index, (current) => ({ ...current, equipmentId: toNullableString(event.currentTarget.value) }))}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <NumberInput
                        label="Quantity"
                        value={item.quantity}
                        min={1}
                        allowDecimal={false}
                        onChange={(value) => mutateLoot(index, (current) => ({ ...current, quantity: typeof value === "number" && value > 0 ? value : 1 }))}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <Checkbox
                        mt={28}
                        label="Claimed"
                        checked={item.isClaimed}
                        onChange={(event) => mutateLoot(index, (current) => ({ ...current, isClaimed: event.currentTarget.checked }))}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <TextInput
                        label="Note"
                        value={item.note ?? ""}
                        onChange={(event) => mutateLoot(index, (current) => ({ ...current, note: toNullableString(event.currentTarget.value) }))}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Paper>
            ))
          ) : (
            <Text c="dimmed">No loot recorded.</Text>
          )}
        </Stack>
      </EncounterSection>

      <EncounterSection title="DM Notes" description="Private notes visible to administrators only." icon={<IconSkull size={18} />}>
        <MarkdownTextarea
          label="DM notes"
          value={draft.dmNote ?? ""}
          onChange={(value) => onChange({ ...draft, dmNote: toNullableString(value) })}
          minHeightRem={12}
        />
      </EncounterSection>
    </Stack>
  );
}

function CreateEncounterModal({
  opened,
  draft,
  sessions,
  saving,
  onClose,
  onChange,
  onCreate,
}: {
  opened: boolean;
  draft: Encounter | null;
  sessions: Session[];
  saving: boolean;
  onClose: () => void;
  onChange: (next: Encounter) => void;
  onCreate: () => void;
}) {
  if (!draft) {
    return null;
  }

  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: session.name,
  }));

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Create Encounter"
      showSaveButton={false}
      showCancelButton={false}
      hideHeader
      withCloseButton
      size="lg"
    >
      <Stack gap="md">
        <Title order={3} c="grape.0">
          New Encounter
        </Title>
        <Text size="sm" c="dimmed">
          Prefilled from the selected campaign and current session where available.
        </Text>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Encounter name"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.currentTarget.value })}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Status"
              data={ENCOUNTER_STATUSES.map((status) => ({ value: status, label: status }))}
              value={draft.status}
              onChange={(value) => onChange({ ...draft, status: (value as Encounter["status"]) ?? draft.status })}
              allowDeselect={false}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              label="Session"
              placeholder="Optional"
              data={sessionOptions}
              value={draft.sessionId}
              onChange={(value) => onChange({ ...draft, sessionId: value || null })}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Location"
              value={draft.location ?? ""}
              onChange={(event) => onChange({ ...draft, location: toNullableString(event.currentTarget.value) })}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Map URL"
              placeholder="https://..."
              value={draft.mapUrl ?? ""}
              onChange={(event) => onChange({ ...draft, mapUrl: toNullableString(event.currentTarget.value) })}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <MarkdownTextarea
              label="Description"
              value={draft.description ?? ""}
              onChange={(value) => onChange({ ...draft, description: toNullableString(value) })}
              minHeightRem={8}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <MarkdownTextarea
              label="DM notes"
              value={draft.dmNote ?? ""}
              onChange={(value) => onChange({ ...draft, dmNote: toNullableString(value) })}
              minHeightRem={6}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate} loading={saving} disabled={!draft.name.trim()}>
            Create Encounter
          </Button>
        </Group>
      </Stack>
    </BaseModal>
  );
}

export default function EncounterPage({ embedded = false }: { embedded?: boolean }) {
  const token = useAuthStore((state) => state.token);
  const roles = useAuthStore((state) => state.roles);
  const character = useCharacterStore((state) => state.character);
  const selectedAdminCampaignId = useAdminCampaignStore((state) => state.selectedId);
  const isAdmin = roles.includes("Admin");

  const {
    campaign,
    encounters,
    sessions,
    selectedEncounterId,
    loading,
    saving,
    error,
    loadCampaignContext,
    selectEncounter,
    createEncounter: createEncounterRecord,
    updateEncounter: updateEncounterRecord,
    removeEncounter,
    setActiveEncounter,
    clearActiveEncounter,
  } = useEncounterStore();

  const [resolvedCampaignId, setResolvedCampaignId] = useState<string | null>(selectedAdminCampaignId ?? null);
  const [resolvingCampaign, setResolvingCampaign] = useState(false);
  const [draft, setDraft] = useState<Encounter | null>(null);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [createDraft, setCreateDraft] = useState<Encounter | null>(null);

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
      useEncounterStore.getState().clear();
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

  const pageContent = () => {
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
          <div className={classes.sidebar}>
            <Paper radius="lg" p="md" className={classes.sidebarPanel}>
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
                            className={`${classes.encounterButton} ${isSelected ? classes.encounterButtonActive : ""}`}
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
          </div>
        ) : null}

        <div className={classes.main}>
          <Paper radius="lg" p="lg" className={classes.mainPanel}>
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
                    isActiveEncounter={draft.id === campaign.activeEncounterId}
                    saving={saving}
                    onChange={setDraft}
                    onSave={() => void handleSaveDraft()}
                    onDelete={() => void handleDeleteSelected()}
                    onActivate={() => draft.id ? void setActiveEncounter(draft.id) : void handleSaveDraft()}
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
                <Button
                  component="a"
                  href={activeEncounter.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="light"
                  leftSection={<IconLink size={16} />}
                >
                  Open Live Map
                </Button>
              ) : null}
              {!isAdmin && activeEncounter ? (
                <Button variant="light" leftSection={<IconCheck size={16} />} disabled>
                  Viewing Live Encounter
                </Button>
              ) : null}
            </Group>
          </Group>
        </Paper>

        {pageContent()}
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
