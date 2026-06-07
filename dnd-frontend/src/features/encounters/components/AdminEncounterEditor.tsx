import { useMemo, useState } from "react";
import {
  ActionIcon,
  Autocomplete,
  Button,
  Checkbox,
  Grid,
  Group,
  Image,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Title,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconMap2,
  IconPackage,
  IconPlus,
  IconSkull,
  IconSparkles,
  IconTrash,
  IconUsersGroup,
  IconInfoCircle,
} from "@tabler/icons-react";
import { MarkdownTextarea } from "@components/common/MarkdownTextarea";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import type { Encounter, EncounterEntity, EncounterLootItem } from "@appTypes/Encounter";
import type { Character } from "@appTypes/Character/Character";
import {
  encounterEntityTemplate,
  encounterLootItemTemplate,
  ENCOUNTER_ENTITY_STATUSES,
  ENCOUNTER_ENTITY_TYPES,
  ENCOUNTER_STATUSES,
} from "@appTypes/Encounter";
import type { Session } from "@appTypes/Session";
import { useAuthStore } from "@store/auth/authStore";
import { searchEquipmentByName } from "@services/equipmentService";
import { monsterService } from "@services/Admin/monsterService";
import { getDateTimeInputValue, parseDateInput, toNullableString } from "../encounterUtils";
import { UrlListEditor } from "./UrlListEditor";

type AdminEncounterEditorProps = {
  draft: Encounter;
  sessions: Session[];
  campaignCharacters: Character[];
  isActiveEncounter: boolean;
  saving: boolean;
  onChange: (next: Encounter) => void;
  onSave: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onClearActive: () => void;
  onReset: () => void;
};

type SelectMode = "custom" | "existing";
type Option = { value: string; label: string; id: string | null };

const glassInput = { input: "glassy-input", label: "glassy-label" };

export function AdminEncounterEditor({
  draft,
  sessions,
  campaignCharacters,
  isActiveEncounter,
  saving,
  onChange,
  onSave,
  onDelete,
  onActivate,
  onClearActive,
  onReset,
}: AdminEncounterEditorProps) {
  const token = useAuthStore((state) => state.token);
  const [enemyModeByIndex, setEnemyModeByIndex] = useState<Record<number, SelectMode>>({});
  const [lootModeByIndex, setLootModeByIndex] = useState<Record<number, SelectMode>>({});
  const [enemyOptionsByIndex, setEnemyOptionsByIndex] = useState<Record<number, Option[]>>({});
  const [lootOptionsByIndex, setLootOptionsByIndex] = useState<Record<number, Option[]>>({});
  const [loadingEnemyByIndex, setLoadingEnemyByIndex] = useState<Record<number, boolean>>({});
  const [loadingLootByIndex, setLoadingLootByIndex] = useState<Record<number, boolean>>({});

  const normalizeKey = (value: string) => value.trim().toLowerCase();

  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: session.name,
  }));

  const mutateEntity = (index: number, mutate: (current: EncounterEntity) => EncounterEntity) => {
    onChange({
      ...draft,
      entities: draft.entities.map((entity, entityIndex) => (entityIndex === index ? mutate(entity) : entity)),
    });
  };

  const mutateLoot = (index: number, mutate: (current: EncounterLootItem) => EncounterLootItem) => {
    onChange({
      ...draft,
      loot: draft.loot.map((item, itemIndex) => (itemIndex === index ? mutate(item) : item)),
    });
  };

  const characterAutocompleteData = useMemo(() => {
    const seen = new Set<string>();
    const options: Option[] = [];
    for (const character of campaignCharacters) {
      const value = character.name.trim();
      if (!value) continue;
      const key = normalizeKey(value);
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({
        value,
        label: value,
        id: character.id ?? null,
      });
    }
    return options;
  }, [campaignCharacters]);

  const characterIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const character of characterAutocompleteData) {
      if (character.id) {
        map.set(normalizeKey(character.value), character.id);
      }
    }
    return map;
  }, [characterAutocompleteData]);

  const loadEnemyOptions = async (index: number, query: string) => {
    if (!token || query.trim().length < 2) {
      setEnemyOptionsByIndex((current) => ({ ...current, [index]: [] }));
      return;
    }

    setLoadingEnemyByIndex((current) => ({ ...current, [index]: true }));
    try {
      const monsters = await monsterService.getByName(query.trim(), token);
      const seen = new Set<string>();
      const options: Option[] = [];
      for (const monster of monsters) {
        const name = (monster.name ?? "").trim();
        if (!name || !monster.id) continue;
        const key = normalizeKey(name);
        if (seen.has(key)) continue;
        seen.add(key);
        options.push({
          value: name,
          label: name,
          id: monster.id,
        });
      }
      setEnemyOptionsByIndex((current) => ({ ...current, [index]: options }));
    } finally {
      setLoadingEnemyByIndex((current) => ({ ...current, [index]: false }));
    }
  };

  const loadLootOptions = async (index: number, query: string) => {
    if (!token || query.trim().length < 2) {
      setLootOptionsByIndex((current) => ({ ...current, [index]: [] }));
      return;
    }

    setLoadingLootByIndex((current) => ({ ...current, [index]: true }));
    try {
      const equipment = await searchEquipmentByName(query.trim(), token);
      const seen = new Set<string>();
      const options: Option[] = [];
      for (const item of equipment) {
        const name = item.name.trim();
        if (!name || !item.id) continue;
        const key = normalizeKey(name);
        if (seen.has(key)) continue;
        seen.add(key);
        options.push({
          value: name,
          label: name,
          id: item.id,
        });
      }
      setLootOptionsByIndex((current) => ({ ...current, [index]: options }));
    } finally {
      setLoadingLootByIndex((current) => ({ ...current, [index]: false }));
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} c="grape.0">
            {draft.name.trim() || "Untitled Encounter"}
          </Title>
        </div>
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

      <ExpandableSection
        title="Encounter Details"
        icon={<IconSparkles size={16} />}
        color={SectionColor.Violet}
        defaultOpen
        animated
      >
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              classNames={glassInput}
              label="Encounter name"
              value={draft.name}
              onChange={(event) => onChange({ ...draft, name: event.currentTarget.value })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              classNames={glassInput}
              label="Status"
              data={ENCOUNTER_STATUSES.map((status) => ({ value: status, label: status }))}
              value={draft.status}
              onChange={(value) => onChange({ ...draft, status: (value as Encounter["status"]) ?? draft.status })}
              allowDeselect={false}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              classNames={glassInput}
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
              classNames={glassInput}
              label="Location"
              value={draft.location ?? ""}
              onChange={(event) => onChange({ ...draft, location: toNullableString(event.currentTarget.value) })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              classNames={glassInput}
              label="Started at"
              type="datetime-local"
              value={getDateTimeInputValue(draft.startedAt)}
              onChange={(event) => onChange({ ...draft, startedAt: parseDateInput(event.currentTarget.value) })}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <TextInput
              classNames={glassInput}
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
      </ExpandableSection>

      <ExpandableSection title="Map and Gallery" icon={<IconMap2 size={16} />} color={SectionColor.Blue} defaultOpen animated>
        <Stack gap="md">
          <TextInput
            classNames={glassInput}
            label="Map URL"
            placeholder="https://..."
            value={draft.mapUrl ?? ""}
            onChange={(event) => onChange({ ...draft, mapUrl: toNullableString(event.currentTarget.value) })}
          />
          {draft.mapUrl ? <Image src={draft.mapUrl} radius="md" alt="Battle map preview" mah={320} fit="contain" /> : null}
          <UrlListEditor urls={draft.imageUrls} onChange={(imageUrls) => onChange({ ...draft, imageUrls })} />
        </Stack>
      </ExpandableSection>

      <ExpandableSection title="Entities" icon={<IconUsersGroup size={16} />} color={SectionColor.Cyan} defaultOpen animated>
        <Stack gap="sm">
          <Group justify="flex-end">
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() =>
                onChange({
                  ...draft,
                  entities: [
                    ...draft.entities,
                    {
                      ...structuredClone(encounterEntityTemplate),
                      status: "Alive",
                    },
                  ],
                })
              }
            >
              Add Entity
            </Button>
          </Group>

          {draft.entities.length > 0 ? (
            draft.entities.map((entity, index) => {
              const enemyMode = enemyModeByIndex[index] ?? (entity.referenceId ? "existing" : "custom");
              const isPlayerCharacter = entity.type === "PlayerCharacter";
              const isEnemy = entity.type === "Enemy";
              const enemyOptions = enemyOptionsByIndex[index] ?? [];
              const selectedCharacterId =
                entity.referenceId ?? characterIdByName.get(normalizeKey(entity.name)) ?? null;

              return (
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
                        <Select
                          classNames={glassInput}
                          label="Type"
                          data={ENCOUNTER_ENTITY_TYPES.map((type) => ({ value: type, label: type }))}
                          value={entity.type}
                          onChange={(value) =>
                            mutateEntity(index, (current) => {
                              const nextType = (value as EncounterEntity["type"]) ?? current.type;
                              return {
                                ...current,
                                type: nextType,
                                status: nextType === "PlayerCharacter" ? "Alive" : current.status,
                                quantity: nextType === "PlayerCharacter" ? 1 : current.quantity,
                                referenceId: nextType === "PlayerCharacter" ? null : current.referenceId,
                              };
                            })
                          }
                          allowDeselect={false}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 4 }}>
                        {isEnemy ? (
                          <>
                            <Text size="xs" c="dimmed" mb={6}>
                              Enemy source
                            </Text>
                            <SegmentedControl
                              fullWidth
                              data={[
                                { label: "Custom Enemy", value: "custom" },
                                { label: "Existing Enemy", value: "existing" },
                              ]}
                              value={enemyMode}
                              onChange={(value) => {
                                const nextMode = value as SelectMode;
                                setEnemyModeByIndex((current) => ({ ...current, [index]: nextMode }));
                                mutateEntity(index, (current) => ({
                                  ...current,
                                  referenceId: nextMode === "custom" ? null : current.referenceId,
                                }));
                                if (nextMode === "existing") {
                                  void loadEnemyOptions(index, "");
                                }
                              }}
                            />
                          </>
                        ) : null}
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 4 }}>
                        {isPlayerCharacter ? (
                          <Autocomplete
                            classNames={glassInput}
                            label={
                              <Group gap={6}>
                                <Text size="sm">Name</Text>
                                <Tooltip
                                  label={selectedCharacterId ? `ID: ${selectedCharacterId}` : "Select a character to see ID"}
                                  withArrow
                                >
                                  <IconInfoCircle size={14} />
                                </Tooltip>
                              </Group>
                            }
                            placeholder="Select campaign character"
                            value={entity.name}
                            data={characterAutocompleteData.map((option) => option.value)}
                            onChange={(value) =>
                              mutateEntity(index, (current) => ({
                                ...current,
                                name: value,
                                referenceId: characterIdByName.get(normalizeKey(value)) ?? current.referenceId,
                              }))
                            }
                            onOptionSubmit={(value) =>
                              mutateEntity(index, (current) => ({
                                ...current,
                                name: value,
                                referenceId: characterIdByName.get(normalizeKey(value)) ?? null,
                                status: "Alive",
                                quantity: 1,
                              }))
                            }
                            onBlur={() =>
                              mutateEntity(index, (current) => ({
                                ...current,
                                referenceId: characterIdByName.get(normalizeKey(current.name)) ?? current.referenceId,
                              }))
                            }
                            limit={8}
                          />
                        ) : isEnemy && enemyMode === "existing" ? (
                          <Autocomplete
                            classNames={glassInput}
                            label="Existing enemy"
                            placeholder="Type at least 2 letters"
                            value={entity.name}
                            data={enemyOptions.map((option) => option.value)}
                            onChange={(value) => {
                              mutateEntity(index, (current) => ({
                                ...current,
                                name: value,
                                referenceId:
                                  enemyOptions.find((option) => option.value === value)?.id ?? current.referenceId,
                              }));
                              void loadEnemyOptions(index, value);
                            }}
                            onOptionSubmit={(value) => {
                              const selected = enemyOptions.find((option) => option.value === value);
                              mutateEntity(index, (current) => ({
                                ...current,
                                name: value,
                                referenceId: selected?.id ?? null,
                              }));
                            }}
                            onBlur={() =>
                              mutateEntity(index, (current) => {
                                const selected = enemyOptions.find((option) => option.value === current.name);
                                return {
                                  ...current,
                                  referenceId: selected?.id ?? current.referenceId,
                                };
                              })
                            }
                            rightSection={loadingEnemyByIndex[index] ? <Text size="xs">...</Text> : null}
                            limit={8}
                          />
                        ) : isEnemy ? (
                          <TextInput
                            classNames={glassInput}
                            label="Enemy name"
                            value={entity.name}
                            onChange={(event) =>
                              mutateEntity(index, (current) => ({
                                ...current,
                                name: event.currentTarget.value,
                                referenceId: null,
                              }))
                            }
                          />
                        ) : (
                          <TextInput
                            classNames={glassInput}
                            label="Name"
                            value={entity.name}
                            onChange={(event) => mutateEntity(index, (current) => ({ ...current, name: event.currentTarget.value }))}
                          />
                        )}
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 3 }}>
                        <NumberInput
                          classNames={glassInput}
                          label="Initiative"
                          value={entity.initiative ?? undefined}
                          onChange={(value) => mutateEntity(index, (current) => ({ ...current, initiative: typeof value === "number" ? value : null }))}
                          allowDecimal={false}
                        />
                      </Grid.Col>

                      {!isPlayerCharacter ? (
                        <Grid.Col span={{ base: 12, md: 3 }}>
                          <NumberInput
                            classNames={glassInput}
                            label="Qty"
                            value={entity.quantity}
                            min={1}
                            onChange={(value) => mutateEntity(index, (current) => ({ ...current, quantity: typeof value === "number" && value > 0 ? value : 1 }))}
                            allowDecimal={false}
                          />
                        </Grid.Col>
                      ) : null}

                      <Grid.Col span={{ base: 12, md: 3 }}>
                        <Select
                          classNames={glassInput}
                          label="Status"
                          data={ENCOUNTER_ENTITY_STATUSES.map((status) => ({ value: status, label: status }))}
                          value={entity.status}
                          onChange={(value) => mutateEntity(index, (current) => ({ ...current, status: (value as EncounterEntity["status"]) ?? current.status }))}
                          allowDeselect={false}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Paper>
              );
            })
          ) : (
            <Text c="dimmed">No entities added yet.</Text>
          )}
        </Stack>
      </ExpandableSection>

      <ExpandableSection title="Loot" icon={<IconPackage size={16} />} color={SectionColor.Green} defaultOpen animated>
        <Stack gap="sm">
          <Group justify="flex-end">
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => onChange({ ...draft, loot: [...draft.loot, structuredClone(encounterLootItemTemplate)] })}
            >
              Add Loot
            </Button>
          </Group>

          {draft.loot.length > 0 ? (
            draft.loot.map((item, index) => {
              const lootMode = lootModeByIndex[index] ?? (item.equipmentId ? "existing" : "custom");
              const lootOptions = lootOptionsByIndex[index] ?? [];

              return (
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
                        <Text size="xs" c="dimmed" mb={6}>
                          Loot source
                        </Text>
                        <SegmentedControl
                          fullWidth
                          data={[
                            { label: "Custom Loot", value: "custom" },
                            { label: "Existing Item", value: "existing" },
                          ]}
                          value={lootMode}
                          onChange={(value) => {
                            const nextMode = value as SelectMode;
                            setLootModeByIndex((current) => ({ ...current, [index]: nextMode }));
                            mutateLoot(index, (current) => ({
                              ...current,
                              equipmentId: nextMode === "custom" ? null : current.equipmentId,
                            }));
                            if (nextMode === "existing") {
                              void loadLootOptions(index, "");
                            }
                          }}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 4 }}>
                        {lootMode === "existing" ? (
                          <Autocomplete
                            classNames={glassInput}
                            label="Existing item"
                            placeholder="Type at least 2 letters"
                            value={item.name}
                            data={lootOptions.map((option) => option.value)}
                            onChange={(value) => {
                              mutateLoot(index, (current) => ({ ...current, name: value }));
                              void loadLootOptions(index, value);
                            }}
                            onOptionSubmit={(value) => {
                              const selected = lootOptions.find((option) => option.value === value);
                              mutateLoot(index, (current) => ({
                                ...current,
                                name: value,
                                equipmentId: selected?.id ?? null,
                              }));
                            }}
                            rightSection={loadingLootByIndex[index] ? <Text size="xs">...</Text> : null}
                            limit={8}
                          />
                        ) : (
                          <TextInput
                            classNames={glassInput}
                            label="Loot name"
                            value={item.name}
                            onChange={(event) =>
                              mutateLoot(index, (current) => ({
                                ...current,
                                name: event.currentTarget.value,
                                equipmentId: null,
                              }))
                            }
                          />
                        )}
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 2 }}>
                        <NumberInput
                          classNames={glassInput}
                          label="Quantity"
                          value={item.quantity}
                          min={1}
                          allowDecimal={false}
                          onChange={(value) => mutateLoot(index, (current) => ({ ...current, quantity: typeof value === "number" && value > 0 ? value : 1 }))}
                        />
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 2 }}>
                        <Checkbox
                          classNames={glassInput}
                          mt={28}
                          label="Claimed"
                          checked={item.isClaimed}
                          onChange={(event) => mutateLoot(index, (current) => ({ ...current, isClaimed: event.currentTarget.checked }))}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Paper>
              );
            })
          ) : (
            <Text c="dimmed">No loot recorded.</Text>
          )}
        </Stack>
      </ExpandableSection>

      <ExpandableSection title="DM Notes" icon={<IconSkull size={16} />} color={SectionColor.Red} defaultOpen animated>
        <MarkdownTextarea
          label="DM notes"
          value={draft.dmNote ?? ""}
          onChange={(value) => onChange({ ...draft, dmNote: toNullableString(value) })}
          minHeightRem={12}
        />
      </ExpandableSection>
    </Stack>
  );
}
