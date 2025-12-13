import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Divider, Group, Paper, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconRun, IconUserPlus, IconPlus } from "@tabler/icons-react";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";
import { useInitiativeTrackerStore, type ConditionEntry } from "@store/admin/useInitiativeTrackerStore";
import { InitiativeTable } from "./InitiativeTable";
import { InitiativeControls } from "./InitiativeControls";
import { getCharacterById } from "@services/characterService";
import { updateCharacter } from "@services/characterService";
import { useAuthStore } from "@store/useAuthStore";

export function InitiativeTracker() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { selectedId: campaignId } = useAdminCampaignStore();
  const { characters, loadAll: loadCharacters } = useAdminCharacterStore();
  const token = useAuthStore.getState().token;
  const {
    rows,
    activeIndex,
    cycleCount,
    addCharacter,
    addEntry,
    updateEntry,
    removeEntry,
    addCondition,
    removeCondition,
    nextTurn,
    setCycleCount,
    resetCycles,
    reset,
  } = useInitiativeTrackerStore();
  const lastManualEdit = useRef<Record<string, number>>({});

  const [customName, setCustomName] = useState("");
  const [customInit, setCustomInit] = useState<number>(0);
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.initiative === b.initiative) return a.name.localeCompare(b.name);
        return b.initiative - a.initiative;
      }),
    [rows]
  );
  const characterRows = useMemo(
    () => rows.filter((row) => row.type === "character"),
    [rows]
  );

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    addEntry({
      id: "",
      name: customName.trim(),
      initiative: Number(customInit) || 0,
      type: "enemy",
      hp: 0,
      ac: 0,
      conditions: [],
    });
    setCustomName("");
    setCustomInit(0);
  };

  const persistCharacterRow = useCallback(
    async (rowId: string) => {
      if (!token) return;
      const storeRows = useInitiativeTrackerStore.getState().rows;
      const row = storeRows.find((r) => r.id === rowId);
      if (!row || row.type !== "character") return;
      const characterId = row.characterId || row.id;

      setSavingIds((prev) => new Set(prev).add(rowId));
      try {
        const full = await getCharacterById(characterId, token);
        if (!full) return;

        await updateCharacter(
          {
            ...full,
            name: row.name,
            hitPoints: row.hp ?? full.hitPoints,
            temporaryHitPoints: row.tempHp ?? full.temporaryHitPoints,
            armorClass: row.ac ?? full.armorClass,
            conditions: (row.conditions ?? []).map((c) => c.label),
          },
          token
        );
      } catch {
        // silent for now
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(rowId);
          return next;
        });
      }
    },
    [token]
  );

  const handleAddCharacter = async (characterId: string) => {
    const summary = characters.find((c) => c.id === characterId);
    if (!summary || !token) return;

    const full = await getCharacterById(characterId, token);
    if (!full) return;

    addCharacter({
      id: full.id!,
      name: full.name,
      armorClass: full.armorClass,
      hitPoints: full.hitPoints,
      maxHitPoints: full.maxHitPoints,
      temporaryHitPoints: full.temporaryHitPoints,
      conditions: full.conditions,
    });
  };

  useEffect(() => {
    if (campaignId) {
      void loadCharacters(campaignId);
    }
  }, [campaignId, loadCharacters]);

  const mergeConditionsWithDurations = useCallback(
    (labels: string[] | undefined, existing: ConditionEntry[] | undefined, ownerId: string) => {
      const byLabel = new Map((existing ?? []).map((cond) => [cond.label.toLowerCase(), cond]));
      return (labels ?? []).map((label) => {
        const match = byLabel.get(label.toLowerCase());
        return {
          id: match?.id ?? `${ownerId}-${label}`,
          label,
          remaining: match?.remaining ?? null,
        };
      });
    },
    []
  );

  const syncCharacterRows = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      // small delay to allow backend/state to settle after SignalR change
      await new Promise((resolve) => setTimeout(resolve, 200));

      await Promise.all(
        characterRows.map(async (row) => {
          const lookupId = row.characterId || row.id;
          let summary = characters.find((c) => c.id === lookupId);
          if (!summary) {
            summary = characters.find((c) => c.name === row.name);
            if (summary) {
              updateEntry(row.id, { characterId: summary.id });
            } else {
              return;
            }
          }

          const full = await getCharacterById(summary.id!, token);
          if (!full) return;

          const nextFields = {
            name: full.name,
            hp: full.hitPoints,
            tempHp: full.temporaryHitPoints,
            ac: full.armorClass,
            conditions: mergeConditionsWithDurations(
              full.conditions,
              row.conditions,
              full.id ?? row.id
            ),
          };

          const lastEdit = lastManualEdit.current[row.id] ?? 0;
          const recentlyEdited = Date.now() - lastEdit < 2000;

          if (
            row.name !== nextFields.name ||
            row.hp !== nextFields.hp ||
            row.tempHp !== nextFields.tempHp ||
            row.ac !== nextFields.ac ||
            (row.conditions?.map((c) => c.label).join("|") ?? "") !==
              (nextFields.conditions?.map((c) => c.label).join("|") ?? "")
          ) {
            if (!recentlyEdited) {
              updateEntry(row.id, nextFields);
            }
          }
        })
      );
    } catch (err) {
      console.error("[InitiativeTracker] Failed to sync character rows", err);
    }
  }, [characters, characterRows, mergeConditionsWithDurations, token, updateEntry]);

  // Keep tracker rows in sync when characters update via SignalR
  useEffect(() => {
    void syncCharacterRows();
  }, [syncCharacterRows, characters]);

  const handleReloadTable = async () => {
    try {
      if (campaignId) {
        await loadCharacters(campaignId);
      }
      await syncCharacterRows();
    } catch (err) {
      console.error("[InitiativeTracker] Failed to reload table", err);
    }
  };

  const [addConditionTarget, setAddConditionTarget] = useState<string | null>(null);
  const adjustHp = useCallback(
    (id: string, delta: number) => {
      const storeRows = useInitiativeTrackerStore.getState().rows;
      const row = storeRows.find((r) => r.id === id);
      if (!row) return;
      const nextHp = Math.max(0, (row.hp ?? 0) + delta);
      updateEntry(id, { hp: nextHp });
      void persistCharacterRow(id);
    },
    [updateEntry, persistCharacterRow]
  );

  const handleNextTurn = useCallback(async () => {
    const before = useInitiativeTrackerStore.getState().rows;
    nextTurn();

    if (!token) return;

    const after = useInitiativeTrackerStore.getState().rows;
    await Promise.all(
      before.map(async (prevRow) => {
        if (prevRow.type !== "character") return;
        const nextRow = after.find((r) => r.id === prevRow.id);
        if (!nextRow) return;
        const prevLabels = new Set((prevRow.conditions ?? []).map((c) => c.label));
        const nextLabels = new Set((nextRow.conditions ?? []).map((c) => c.label));
        const removed = [...prevLabels].filter((label) => !nextLabels.has(label));
        if (removed.length > 0) {
          await persistCharacterRow(nextRow.id);
        }
      })
    );
  }, [nextTurn, token, persistCharacterRow]);

  const handleToggleEdit = (rowId: string, enable: boolean) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      if (enable) next.add(rowId);
      else next.delete(rowId);
      return next;
    });
  };

  const handleApplyEdit = async (rowId: string) => {
    if (!token) return;
    const row = rows.find((r) => r.id === rowId);
    if (!row || row.type !== "character") return;

    const characterId = row.characterId || row.id;
    setSavingIds((prev) => new Set(prev).add(rowId));
    try {
      const full = await getCharacterById(characterId, token);
      if (!full) return;

      await updateCharacter(
        {
          ...full,
          name: row.name,
          hitPoints: row.hp ?? full.hitPoints,
          temporaryHitPoints: row.tempHp ?? full.temporaryHitPoints,
          armorClass: row.ac ?? full.armorClass,
          conditions: (row.conditions ?? []).map((c) => c.label),
        },
        token
      );
      setEditingIds((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    } catch (error) {
      console.error("[InitiativeTracker] Failed to apply edit", error);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(rowId);
        return next;
      });
    }
  };

  return (
    <Stack gap="md">
      <Paper
        withBorder
        radius="md"
        p="md"
        style={{
          background: "linear-gradient(135deg, rgba(20,16,32,0.85), rgba(32,26,60,0.8))",
          border: "1px solid rgba(180,150,255,0.35)",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Group gap="xs">
            <IconRun size={20} color="#a78bfa" />
            <Title order={3}>Initiative Tracker</Title>
            <Badge color="grape" variant="light">
              {sortedRows.length} slots
            </Badge>
            <Badge color="cyan" variant="light">
              Cycles: {cycleCount}
            </Badge>
          </Group>
          <Button variant="outline" color="gray" size="xs" onClick={reset}>
            Clear tracker
          </Button>
        </Group>

        <Divider my="sm" />

        <Stack gap="sm">
          <Text size="sm" fw={600}>
            Campaign characters {campaignId ? "" : "(no campaign selected)"}
          </Text>
          <Group gap="xs" wrap="wrap">
            {characters.map((c) => (
              <Button
                key={c.id}
                size="compact-sm"
                variant="light"
                color="indigo"
                leftSection={<IconUserPlus size={14} />}
                onClick={() => handleAddCharacter(c.id!)}
              >
                {c.name}
              </Button>
            ))}
            {characters.length === 0 && <Text size="xs" c="dimmed">No characters loaded.</Text>}
          </Group>
        </Stack>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        <Paper
          withBorder
          radius="md"
          p="md"
          style={{
            background: "linear-gradient(135deg, rgba(32,18,40,0.85), rgba(24,18,60,0.75))",
            border: "1px solid rgba(120,100,200,0.4)",
          }}
        >
          <Stack gap="xs">
            <Text fw={600} size="sm">
              Add custom combatant
            </Text>
            <Group gap="xs" wrap="wrap">
              <TextInput
                placeholder="Name (e.g. Goblin, Fire, Trap)"
                value={customName}
                onChange={(e) => setCustomName(e.currentTarget.value)}
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                style={{ flex: 1, minWidth: isMobile ? "100%" : 200 }}
              />
              <TextInput
                placeholder="Initiative"
                type="number"
                value={customInit}
                onChange={(e) => setCustomInit(Number(e.currentTarget.value))}
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom();
                  }
                }}
                style={{ width: isMobile ? "100%" : 120 }}
              />
              <Button
                variant="gradient"
                gradient={{ from: "violet", to: "cyan" }}
                leftSection={<IconPlus size={16} />}
                onClick={handleAddCustom}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper
          withBorder
          radius="md"
          p="md"
          style={{
            background: "linear-gradient(135deg, rgba(28,24,44,0.85), rgba(20,16,36,0.85))",
            border: "1px solid rgba(100,150,255,0.35)",
          }}
        >
          <InitiativeControls
            cycleCount={cycleCount}
            onSetCycle={setCycleCount}
            onNext={handleNextTurn}
            onReset={resetCycles}
          />
        </Paper>
      </SimpleGrid>

      <Paper
        withBorder
        radius="md"
        p="md"
        style={{
          background: "linear-gradient(135deg, rgba(18,16,32,0.85), rgba(30,26,60,0.85))",
          border: "1px solid rgba(180,150,255,0.35)",
        }}
      >
        <InitiativeTable
          rows={sortedRows}
          activeIndex={activeIndex}
          onChange={(id, field, value) => {
            lastManualEdit.current[id] = Date.now();
            updateEntry(id, { [field]: value });
          }}
          onRemove={removeEntry}
          onAddCondition={(id, label, remaining) => {
            lastManualEdit.current[id] = Date.now();
            addCondition(id, label, remaining);
            void persistCharacterRow(id);
          }}
          onRemoveCondition={(id, condId) => {
            lastManualEdit.current[id] = Date.now();
            removeCondition(id, condId);
            void persistCharacterRow(id);
          }}
        onReload={handleReloadTable}
        editingIds={editingIds}
        savingIds={savingIds}
        onToggleEdit={handleToggleEdit}
        onApplyEdit={handleApplyEdit}
        addConditionTarget={addConditionTarget}
        onAddConditionShortcut={(id) => setAddConditionTarget(id)}
        onClearAddConditionShortcut={() => setAddConditionTarget(null)}
        onAdjustHp={adjustHp}
        />
      </Paper>
    </Stack>
  );
}
