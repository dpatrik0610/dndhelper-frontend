import { useEffect, useRef, useState, type DragEvent } from "react";
import { ActionIcon, Avatar, Button, CloseButton, Group, Loader, ScrollArea, SegmentedControl, Text, TextInput, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconEye, IconGhost2, IconHandGrab, IconLock, IconPlus, IconSearch, IconChessKnight } from "@tabler/icons-react";
import { MonsterFormModal } from "@features/admin/MonsterManager/components/MonsterFormModal";
import { MonsterViewModal } from "@features/admin/MonsterManager/components/MonsterViewModal";
import { monsterService } from "@services/Admin/monsterService";
import { spawnPoints, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { Monster } from "@appTypes/Monster";
import type { TableLayer, TableToken } from "@appTypes/Tabletop";
import { crLabel } from "@utils/monster";
import { tabletop } from "@features/tabletop/useTabletopHub";
import { MONSTER_DRAG_TYPE } from "@features/tabletop/tools";

const PAGE_SIZE = 30;

const setOpen = (monsterPanelOpen: boolean) => useTabletopStore.getState().set({ monsterPanelOpen });

/** A token for this monster; stats come along. The caller adds x/y. */
const monsterToken = (m: Monster, layer: TableLayer): Partial<TableToken> => {
  const hp = m.hitPoints || 10;
  return {
    layer,
    name: m.name || "Monster",
    hp,
    maxHp: hp,
    ac: m.armorClass || 10,
    speed: m.speed.walk,
    imageUrl: m.imageUrl ?? null,
    color: "#f87171",
  };
};

/** Top-bar button that opens the monster panel. */
export function MonsterPanelButton() {
  const open = useTabletopStore((s) => s.monsterPanelOpen);
  return (
    <Tooltip label="Monsters">
      <ActionIcon
        variant={open ? "light" : "subtle"}
        color={open ? "red" : "gray"}
        onClick={() => setOpen(!open)}
        aria-label="Monsters"
        aria-pressed={open}
      >
        <IconGhost2 size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

/** DM's bestiary under the top bar: drag a monster onto the map, or + to drop it in the middle of the view. */
export function MonsterPanel() {
  const open = useTabletopStore((s) => s.monsterPanelOpen);
  return open ? <MonsterPanelBody /> : null;
}

function MonsterPanelBody() {
  const cellSize = useTabletopStore((s) => s.snapshot!.grid.cellSize);
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query.trim(), 300);
  const [results, setResults] = useState<{ items: Monster[]; total: number } | null>(null);
  // Hidden (DM layer) for ambushes and reinforcements, visible otherwise.
  const [layer, setLayer] = useState<TableLayer>(() => (useTabletopStore.getState().activeLayer === "Dm" ? "Dm" : "Token"));
  const [viewing, setViewing] = useState<Monster | null>(null);
  const [creating, setCreating] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  // Bumped after a save so the list picks up the new monster.
  const [version, setVersion] = useState(0);

  const openNew = () => {
    setCreating(true);
    if (!types.length) monsterService.types().then(setTypes).catch(() => {});
  };

  useEffect(() => {
    let current = true;
    monsterService
      .search({ query: debounced || undefined, sortBy: "name", pageSize: PAGE_SIZE })
      .then((r) => current && setResults(r))
      .catch(() => current && setResults({ items: [], total: 0 }));
    return () => {
      current = false;
    };
  }, [debounced, version]);

  const place = (m: Monster) => {
    const [p] = spawnPoints(1, cellSize);
    void tabletop.upsertToken({ ...monsterToken(m, layer), x: p.x, y: p.y });
  };

  return (
    <div className="tt-monster-panel tt-glass tt-pop-in">
      <Group justify="space-between" wrap="nowrap" className="tt-monster-head">
        <Group gap={8} wrap="nowrap">
          <IconGhost2 size={18} color="#f87171" />
          <Text fw={700}>Monsters</Text>
        </Group>
        <Group gap={6} wrap="nowrap">
          <Button size="compact-xs" variant="light" color="red" radius="xl" leftSection={<IconPlus size={13} />} onClick={openNew}>
            New
          </Button>
          <CloseButton size="sm" onClick={() => setOpen(false)} aria-label="Close monsters" />
        </Group>
      </Group>

      <div className="tt-monster-controls">
        <TextInput
          autoFocus
          size="xs"
          radius="xl"
          placeholder="Search monsters…"
          leftSection={<IconSearch size={14} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Escape" && (query ? setQuery("") : setOpen(false))}
          aria-label="Search monsters"
        />
        <SegmentedControl
          fullWidth
          size="xs"
          radius="xl"
          value={layer}
          onChange={(v) => setLayer(v as TableLayer)}
          data={[
            {
              value: "Token",
              label: (
                <span className="tt-layer-label">
                  <IconChessKnight size={13} /> Visible
                </span>
              ),
            },
            {
              value: "Dm",
              label: (
                <span className="tt-layer-label">
                  <IconLock size={13} /> DM layer
                </span>
              ),
            },
          ]}
          aria-label="Place monsters on"
        />
      </div>

      <ScrollArea className="tt-monster-list" type="auto" offsetScrollbars>
        {results === null ? (
          <Group justify="center" py="md">
            <Loader size="sm" color="red" />
          </Group>
        ) : results.items.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">
            {debounced ? `No monsters match “${debounced}”.` : "No monsters in this campaign yet."}
          </Text>
        ) : (
          <div className="tt-roster">
            {results.items.map((m) => (
              <MonsterCard key={m.id} monster={m} layer={layer} onPlace={() => place(m)} onView={() => setViewing(m)} />
            ))}
          </div>
        )}
        {results && results.total > results.items.length && (
          <Text size="xs" c="dimmed" ta="center" mt="xs">
            Showing {results.items.length} of {results.total}. Search to narrow it down.
          </Text>
        )}
      </ScrollArea>

      <Text size="xs" c="dimmed" className="tt-monster-hint">
        Drag onto the map, or + to place in the middle of your view.
      </Text>
      <MonsterViewModal monster={viewing} onClose={() => setViewing(null)} />
      <MonsterFormModal opened={creating} monster={null} onClose={() => setCreating(false)} onSaved={() => setVersion((v) => v + 1)} types={types} />
    </div>
  );
}

function MonsterCard({ monster: m, layer, onPlace, onView }: { monster: Monster; layer: TableLayer; onPlace: () => void; onView: () => void }) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData(MONSTER_DRAG_TYPE, JSON.stringify(monsterToken(m, layer)));
    e.dataTransfer.effectAllowed = "copy";
    // Drag the round portrait, not the whole card.
    if (avatarRef.current) e.dataTransfer.setDragImage(avatarRef.current, 20, 20);
    setDragging(true);
  };

  return (
    <div className={`tt-roster-card${dragging ? " dragging" : ""}`} draggable onDragStart={onDragStart} onDragEnd={() => setDragging(false)}>
      <IconHandGrab size={14} className="tt-roster-grip" />
      <Avatar ref={avatarRef} src={m.imageUrl} radius="xl" size={40} className="tt-roster-avatar monster" color="red">
        <IconGhost2 size={18} />
      </Avatar>
      <div className="tt-roster-text">
        <strong>{m.name}</strong>
        <span>
          CR {crLabel(m.challengeRating)}
          {m.type ? ` · ${m.type}` : ""}
        </span>
        <span className="tt-roster-hp">
          HP {m.hitPoints} · AC {m.armorClass}
        </span>
      </div>
      <Group gap={4} wrap="nowrap">
        <Tooltip label="Stat block">
          <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onView} aria-label={`${m.name} stat block`}>
            <IconEye size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Place in the middle of the view">
          <ActionIcon variant="light" color="red" radius="xl" onClick={onPlace} aria-label={`Place ${m.name}`}>
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </div>
  );
}
