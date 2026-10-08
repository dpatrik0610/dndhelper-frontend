import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Checkbox,
  ColorInput,
  CopyButton,
  Drawer,
  FileButton,
  Group,
  Loader,
  NumberInput,
  Popover,
  ScrollArea,
  Select,
  SimpleGrid,
  Slider,
  Switch,
  Tabs,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowBackUp,
  IconBell,
  IconCheck,
  IconCloudFog,
  IconCopy,
  IconDoorEnter,
  IconDoorExit,
  IconEraser,
  IconEye,
  IconEyeOff,
  IconGhost2,
  IconGridDots,
  IconHandGrab,
  IconLayoutGrid,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconShape,
  IconTrash,
  IconUpload,
  IconUserMinus,
  IconUserPlus,
  IconUsers,
  IconUsersGroup,
  IconX,
  type Icon,
} from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { showNotification } from "@components/Notification/Notification";
import { getCampaignCharacters } from "@services/campaignService";
import { monsterService } from "@services/Admin/monsterService";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import { useIsMobile } from "@hooks/useIsMobile";
import type { Character } from "@appTypes/Character/Character";
import type { Monster } from "@appTypes/Monster";
import type { GridSettings, GridType, TableParticipant, TableToken } from "@appTypes/Tabletop";
import { gridTile } from "./board/gridMath";
import { resolveImageUrl, tabletop, uploadTableImage } from "./useTabletopHub";

const placeCharacter = tabletop.placeCharacter;
import { CHARACTER_DRAG_TYPE, TOKEN_SWATCHES } from "./tools";
import { EncounterSection } from "./EncounterSection";

const GRID_SWATCHES = ["#ffffff33", "#ffffff66", "#00000066", "#a78bfa66", "#f5c45166", "#22d3ee55"];
const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";

/** Places `count` new tokens in a row around the middle of the screen. */
function spawnPoints(count: number, cellSize: number) {
  const { x, y } = useTabletopStore.getState().viewCenter;
  return Array.from({ length: count }, (_, i) => ({ x: x + (i - (count - 1) / 2) * cellSize, y }));
}


type Tab = "room" | "board" | "tokens" | "fog";
const TABS: { value: Tab; label: string; icon: Icon }[] = [
  { value: "room", label: "Session", icon: IconDoorEnter },
  { value: "board", label: "Board", icon: IconLayoutGrid },
  { value: "tokens", label: "Tokens", icon: IconUsers },
  { value: "fog", label: "Fog", icon: IconCloudFog },
];

/**
 * Everything the DM tunes on the table, behind the cog. No overlay: the board stays live beside it,
 * so party members can be dragged straight from here onto the map.
 */
export function SettingsDrawer() {
  const opened = useTabletopStore((s) => s.settingsOpen);
  const campaignName = useTabletopStore((s) => s.session?.campaignName ?? "");
  const close = () => useTabletopStore.getState().set({ settingsOpen: false });
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("room");

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      size={isMobile ? "100%" : 420}
      withOverlay={false}
      withCloseButton={false}
      lockScroll={false}
      trapFocus={false}
      padding={0}
      classNames={{ content: "tt-solid tt-settings", body: "tt-settings-body" }}
    >
      {opened && (
        <>
          <header className="tt-settings-header">
            <div>
              <Text className="tt-settings-eyebrow">Table settings</Text>
              <Text className="tt-settings-title" truncate>
                {campaignName}
              </Text>
            </div>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="xl" onClick={close} aria-label="Close settings">
              <IconX size={18} />
            </ActionIcon>
          </header>

          <Tabs value={tab} onChange={(v) => setTab((v as Tab) ?? "room")} variant="pills" radius="xl" className="tt-settings-tabs">
            <Tabs.List grow className="tt-settings-tablist">
              {TABS.map(({ value, label, icon: TabIcon }) => (
                <Tabs.Tab key={value} value={value} leftSection={<TabIcon size={15} />}>
                  {label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <ScrollArea className="tt-settings-scroll" type="auto">
            <div className="tt-settings-content" key={tab}>
              {tab === "room" && <RoomTab />}
              {tab === "board" && <BoardTab />}
              {tab === "tokens" && <TokensTab />}
              {tab === "fog" && <FogTab />}
            </div>
          </ScrollArea>
        </>
      )}
    </Drawer>
  );
}

function Card({
  icon: CardIcon,
  title,
  description,
  action,
  children,
}: {
  icon: Icon;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="tt-set-card">
      <div className="tt-set-card-head">
        <span className="tt-set-card-icon">
          <CardIcon size={17} />
        </span>
        <div className="tt-set-card-heading">
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children && <div className="tt-set-card-body">{children}</div>}
    </section>
  );
}

// ── Room ──

function RoomTab() {
  const code = useTabletopStore((s) => s.session?.joinCode ?? "");
  const [inviting, setInviting] = useState(false);

  const invite = async () => {
    setInviting(true);
    const count = await tabletop.invitePlayers();
    setInviting(false);
    if (count !== undefined)
      showNotification({
        message: count ? `Sent an invite to ${count} player${count === 1 ? "" : "s"}.` : "No players to invite in this campaign.",
        color: count ? "green" : "yellow",
      });
  };

  return (
    <>
      <EncounterSection />

      <section className="tt-ticket">
        <Text className="tt-settings-eyebrow">Room code</Text>
        <div className="tt-ticket-code" aria-label={`Room code ${code}`}>
          {code.split("").map((ch, i) => (
            <span key={`${i}-${ch}`}>{ch}</span>
          ))}
        </div>
        <div className="tt-ticket-tear" />
        <Group grow gap="xs">
          <CopyButton value={code}>
            {({ copied, copy }) => (
              <Button variant="light" onClick={copy} leftSection={copied ? <IconCheck size={15} /> : <IconCopy size={15} />}>
                {copied ? "Copied" : "Copy code"}
              </Button>
            )}
          </CopyButton>
          <Tooltip label="Old code stops working for new joins">
            <Button variant="default" leftSection={<IconRefresh size={15} />} onClick={() => void tabletop.regenerateCode()}>
              New code
            </Button>
          </Tooltip>
        </Group>
      </section>

      <PeopleCard />

      <Card icon={IconBell} title="Invite the party" description="Online players with a character in this campaign get a notification that opens the table.">
        <Button fullWidth size="md" className="tt-cta" leftSection={<IconBell size={17} />} onClick={invite} loading={inviting}>
          Notify players
        </Button>
      </Card>
    </>
  );
}

function PeopleCard() {
  const me = useCurrentUserId() ?? "";
  const participants = useTabletopStore((s) => s.participants);
  const tokens = useTabletopStore((s) => s.snapshot!.tokens);
  const players = participants.filter((p) => !p.isDm);

  return (
    <Card
      icon={IconUsersGroup}
      title="At the table"
      description="Who's connected right now. Kicked players can come back with the room code until you make a new one."
      action={players.length > 0 ? <KickAllButton count={players.length} /> : undefined}
    >
      {participants.length === 0 ? (
        <Text size="sm" c="dimmed">
          Nobody is connected yet.
        </Text>
      ) : (
        <div className="tt-roster">
          {participants.map((p) => {
            const characters = tokens.filter((t) => t.characterId && t.ownerIds.includes(p.userId)).map((t) => t.name);
            return (
              <div key={p.userId} className="tt-roster-card static">
                <Avatar radius="xl" size={36} className="tt-roster-avatar" style={p.isDm ? { borderColor: "#a78bfa" } : undefined}>
                  {p.name.slice(0, 2).toUpperCase()}
                </Avatar>
                <div className="tt-roster-text">
                  <strong>
                    {p.name}
                    {p.userId === me && " (you)"}
                  </strong>
                  <span>{p.isDm ? "Dungeon master" : characters.length ? characters.join(", ") : "No character on the map"}</span>
                </div>
                {p.isDm ? (
                  <Badge size="sm" variant="light" color="violet">
                    DM
                  </Badge>
                ) : (
                  <KickButton participant={p} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

/** Small confirm popover shared by the kick buttons. */
function ConfirmPopover({
  target,
  title,
  children,
  confirmLabel,
  onConfirm,
}: {
  target: (toggle: () => void) => ReactNode;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) {
  const [opened, setOpened] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
    setOpened(false);
  };

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" withArrow shadow="xl" radius="lg" width={260}>
      <Popover.Target>{target(() => setOpened((o) => !o))}</Popover.Target>
      <Popover.Dropdown>
        <Text size="sm" fw={600}>
          {title}
        </Text>
        {children}
        <Group justify="flex-end" gap="xs" mt="sm">
          <Button size="xs" variant="default" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button size="xs" color="red" loading={busy} onClick={() => void confirm()}>
            {confirmLabel}
          </Button>
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
}

function KickButton({ participant: p }: { participant: TableParticipant }) {
  const kick = async () => {
    if (await tabletop.kick(p.userId)) showNotification({ message: `${p.name} was removed from the table.`, color: "green" });
  };

  return (
    <ConfirmPopover
      title={`Kick ${p.name}?`}
      confirmLabel="Kick"
      onConfirm={kick}
      target={(toggle) => (
        <ActionIcon variant="subtle" color="red" radius="xl" onClick={toggle} aria-label={`Kick ${p.name}`} title={`Kick ${p.name}`}>
          <IconUserMinus size={16} />
        </ActionIcon>
      )}
    >
      <Text size="xs" c="dimmed" mt={4}>
        They drop out of the table right away, in every open tab. Their tokens stay on the map.
      </Text>
    </ConfirmPopover>
  );
}

function KickAllButton({ count }: { count: number }) {
  const [newCode, setNewCode] = useState(false);

  const kickAll = async () => {
    const removed = await tabletop.kickAll();
    if (removed === undefined) return;
    if (newCode) await tabletop.regenerateCode();
    showNotification({
      message: `Removed ${removed} player${removed === 1 ? "" : "s"}${newCode ? " and made a new room code" : ""}.`,
      color: "green",
    });
  };

  return (
    <ConfirmPopover
      title={`Kick all ${count} players?`}
      confirmLabel="Kick all"
      onConfirm={kickAll}
      target={(toggle) => (
        <Button size="compact-xs" variant="light" color="red" radius="xl" leftSection={<IconDoorExit size={13} />} onClick={toggle}>
          Kick all
        </Button>
      )}
    >
      <Text size="xs" c="dimmed" mt={4}>
        Everyone except the DMs leaves the table. Tokens stay on the map.
      </Text>
      <Checkbox
        mt="sm"
        size="xs"
        label="Also make a new room code, so they can't rejoin"
        checked={newCode}
        onChange={(e) => setNewCode(e.currentTarget.checked)}
      />
    </ConfirmPopover>
  );
}

// ── Board ──

function GridPreview({ type, color }: { type: GridType; color: string }) {
  const tile = gridTile({ type, cellSize: 14 });
  const id = `tt-grid-preview-${type}`;
  return (
    <svg width="100%" height="44" aria-hidden>
      <defs>
        <pattern id={id} patternUnits="userSpaceOnUse" width={tile.width} height={tile.height} x={3} y={3}>
          <path d={tile.d} fill="none" stroke={color} strokeWidth={1.2} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function BoardTab() {
  const grid = useTabletopStore((s) => s.snapshot!.grid);
  // Preview locally while dragging; send once the DM lets go.
  const preview = (patch: Partial<GridSettings>) => useTabletopStore.getState().previewGrid({ ...grid, ...patch });
  const commit = (patch: Partial<GridSettings>) => {
    const next = { ...grid, ...patch };
    useTabletopStore.getState().previewGrid(next);
    void tabletop.updateGrid(next);
  };

  const types: { type: GridType; label: string }[] = [
    { type: "Square", label: "Square" },
    { type: "HexPointy", label: "Hex rows" },
    { type: "HexFlat", label: "Hex columns" },
  ];

  return (
    <>
      <Card icon={IconGridDots} title="Grid" description="One cell is 5 ft. Line the grid up with your map's squares.">
        <div className="tt-grid-types" role="radiogroup" aria-label="Grid type">
          {types.map(({ type, label }) => (
            <UnstyledButton
              key={type}
              role="radio"
              aria-checked={grid.type === type}
              className={`tt-grid-type${grid.type === type ? " selected" : ""}`}
              onClick={() => grid.type !== type && commit({ type })}
            >
              <GridPreview type={type} color={grid.type === type ? "#c4b5fd" : "rgba(255,255,255,0.35)"} />
              <span>{label}</span>
            </UnstyledButton>
          ))}
        </div>

        <div className="tt-set-row">
          <span className="tt-set-label">Cell size</span>
          <NumberInput
            key={grid.cellSize}
            w={92}
            size="xs"
            radius="xl"
            min={20}
            max={500}
            clampBehavior="blur"
            suffix=" px"
            defaultValue={grid.cellSize}
            onBlur={(e) => {
              const v = parseInt(e.currentTarget.value, 10);
              if (v >= 20 && v <= 500 && v !== grid.cellSize) commit({ cellSize: v });
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        </div>
        <Slider
          min={20}
          max={500}
          value={grid.cellSize}
          onChange={(cellSize) => preview({ cellSize })}
          onChangeEnd={(cellSize) => commit({ cellSize })}
          label={(v) => `${v}px`}
          color="violet"
          marks={[{ value: 100 }, { value: 200 }, { value: 300 }, { value: 400 }]}
        />

        <div className="tt-set-row">
          <span className="tt-set-label">Line colour</span>
          <Group gap={6}>
            {GRID_SWATCHES.map((c) => (
              <UnstyledButton
                key={c}
                className={`tt-swatch${grid.color === c ? " selected" : ""}`}
                style={{ background: c }}
                onClick={() => commit({ color: c })}
                aria-label={`Grid colour ${c}`}
              />
            ))}
          </Group>
        </div>
        <ColorInput
          size="xs"
          radius="xl"
          format="hexa"
          value={grid.color}
          onChange={(color) => preview({ color })}
          onChangeEnd={(color) => commit({ color })}
          aria-label="Custom grid colour"
        />
      </Card>

      <MapCard />

      <Card icon={IconEraser} title="Clean up" description="Remove everyone's drawings or templates and effects from the board.">
        <Group grow gap="xs">
          <Button variant="default" leftSection={<IconEraser size={15} />} onClick={() => void tabletop.clearStrokes()}>
            Drawings
          </Button>
          <Button variant="default" leftSection={<IconShape size={15} />} onClick={() => void tabletop.clearTemplates()}>
            Templates
          </Button>
        </Group>
      </Card>
    </>
  );
}

function MapCard() {
  const map = useTabletopStore((s) => s.snapshot!.map);
  const cellSize = useTabletopStore((s) => s.snapshot!.grid.cellSize);
  const tableId = useTabletopStore((s) => s.session!.tableId);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const aspect = map.width > 0 ? map.height / map.width : 1;

  const upload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const url = await uploadTableImage(tableId, file);
    if (url) {
      // Natural size first: most battle maps are drawn at a known pixels-per-square.
      const objectUrl = URL.createObjectURL(file);
      const size = await new Promise<{ w: number; h: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => resolve({ w: 1000, h: 1000 });
        img.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);
      await tabletop.updateMap({ imageUrl: url, x: 0, y: 0, width: size.w, height: size.h });
    }
    setUploading(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && IMAGE_TYPES.split(",").includes(file.type)) void upload(file);
  };

  const setWidth = (width: number) => void tabletop.updateMap({ ...map, width, height: width * aspect });

  return (
    <Card icon={IconPhoto} title="Battle map" description="PNG, JPEG, WebP or GIF up to 15 MB.">
      <FileButton onChange={upload} accept={IMAGE_TYPES}>
        {(props) => (
          <UnstyledButton
            {...props}
            className={`tt-dropzone${dragOver ? " over" : ""}${map.imageUrl ? " has-image" : ""}`}
            onDragOver={(e: DragEvent) => {
              if (!e.dataTransfer.types.includes("Files")) return;
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {map.imageUrl && <img src={resolveImageUrl(map.imageUrl)} alt="" className="tt-dropzone-image" />}
            <span className="tt-dropzone-label">
              {uploading ? <Loader size="sm" color="violet" /> : <IconUpload size={20} />}
              <strong>{uploading ? "Uploading…" : map.imageUrl ? "Replace map" : "Upload a battle map"}</strong>
              <span>Click or drop an image here</span>
            </span>
          </UnstyledButton>
        )}
      </FileButton>

      {map.imageUrl && (
        <>
          <div className="tt-set-row">
            <span className="tt-set-label">Map scale</span>
            <Text size="xs" c="dimmed">
              {Math.round((map.width / cellSize) * 10) / 10} squares across
            </Text>
          </div>
          {/* Previews locally while dragging, saves on release (same as the grid size). */}
          <Slider
            min={5}
            max={100}
            step={0.5}
            value={Math.min(100, Math.max(5, map.width / cellSize))}
            onChange={(cells) => {
              const s = useTabletopStore.getState();
              if (s.snapshot) s.setSnapshot({ ...s.snapshot, map: { ...map, width: cells * cellSize, height: cells * cellSize * aspect } });
            }}
            onChangeEnd={(cells) => setWidth(cells * cellSize)}
            label={(v) => `${v} squares`}
            color="violet"
          />
          <SimpleGrid cols={2} spacing="xs">
            <NumberInput
              size="xs"
              label="Squares across"
              min={1}
              decimalScale={1}
              key={`cells-${map.width}-${cellSize}`}
              defaultValue={Math.round((map.width / cellSize) * 10) / 10}
              onBlur={(e) => {
                const cells = Number(e.currentTarget.value);
                if (cells > 0) setWidth(cells * cellSize);
              }}
            />
            <NumberInput
              size="xs"
              label="Width (px)"
              min={50}
              key={`w-${map.width}`}
              defaultValue={Math.round(map.width)}
              onBlur={(e) => {
                const width = Number(e.currentTarget.value);
                if (width >= 50) setWidth(width);
              }}
            />
            <NumberInput
              size="xs"
              label="Offset X"
              key={`x-${map.x}`}
              defaultValue={Math.round(map.x)}
              onBlur={(e) => void tabletop.updateMap({ ...map, x: Number(e.currentTarget.value) || 0 })}
            />
            <NumberInput
              size="xs"
              label="Offset Y"
              key={`y-${map.y}`}
              defaultValue={Math.round(map.y)}
              onBlur={(e) => void tabletop.updateMap({ ...map, y: Number(e.currentTarget.value) || 0 })}
            />
          </SimpleGrid>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            leftSection={<IconTrash size={14} />}
            onClick={() => void tabletop.updateMap({ imageUrl: null, x: 0, y: 0, width: 0, height: 0 })}
          >
            Remove map
          </Button>
        </>
      )}
    </Card>
  );
}

// ── Tokens ──

function TokensTab() {
  const cellSize = useTabletopStore((s) => s.snapshot!.grid.cellSize);
  return (
    <>
      <PartyCard cellSize={cellSize} />
      <Card icon={IconGhost2} title="Monsters" description="Search the bestiary; stats come along. Placed on your active layer.">
        <MonsterPicker cellSize={cellSize} />
      </Card>
      <Card icon={IconUserPlus} title="Custom token" description="NPCs, props and anything else.">
        <CustomToken cellSize={cellSize} />
      </Card>
    </>
  );
}

function PartyCard({ cellSize }: { cellSize: number }) {
  const campaignId = useTabletopStore((s) => s.session!.campaignId);
  const tokens = useTabletopStore((s) => s.snapshot!.tokens);
  const [characters, setCharacters] = useState<Character[] | null>(null);

  useEffect(() => {
    let active = true;
    getCampaignCharacters(campaignId)
      .then((list) => active && setCharacters((list ?? []).filter((c) => !c.isDead)))
      .catch(() => active && setCharacters([]));
    return () => {
      active = false;
    };
  }, [campaignId]);

  const onTable = new Set(tokens.map((t) => t.characterId).filter(Boolean));
  const waiting = (characters ?? []).filter((c) => c.id && !onTable.has(c.id));

  const addAll = () =>
    spawnPoints(waiting.length, cellSize).forEach((p, i) => void placeCharacter(waiting[i].id!, p.x, p.y));

  return (
    <Card
      icon={IconUsers}
      title="Party"
      description="Drag a character onto the map, or click + to place it in the middle of your view."
      action={
        waiting.length > 1 ? (
          <Button size="compact-xs" variant="light" radius="xl" onClick={addAll}>
            Add all
          </Button>
        ) : undefined
      }
    >
      {characters === null ? (
        <Group justify="center" py="sm">
          <Loader size="sm" color="violet" />
        </Group>
      ) : characters.length === 0 ? (
        <Text size="sm" c="dimmed">
          This campaign has no characters yet.
        </Text>
      ) : (
        <div className="tt-roster">
          {characters.map((c) => (
            <RosterCard key={c.id} character={c} placed={onTable.has(c.id!)} cellSize={cellSize} />
          ))}
        </div>
      )}
    </Card>
  );
}

function RosterCard({ character: c, placed, cellSize }: { character: Character; placed: boolean; cellSize: number }) {
  const avatarRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData(CHARACTER_DRAG_TYPE, c.id!);
    e.dataTransfer.effectAllowed = "copy";
    // Drag the round portrait, not the whole card.
    if (avatarRef.current) e.dataTransfer.setDragImage(avatarRef.current, 20, 20);
    setDragging(true);
  };

  const place = () => {
    const [p] = spawnPoints(1, cellSize);
    void placeCharacter(c.id!, p.x, p.y);
  };

  return (
    <div
      className={`tt-roster-card${placed ? " placed" : ""}${dragging ? " dragging" : ""}`}
      draggable={!placed}
      onDragStart={placed ? undefined : onDragStart}
      onDragEnd={() => setDragging(false)}
    >
      {!placed && <IconHandGrab size={14} className="tt-roster-grip" />}
      <Avatar ref={avatarRef} src={resolveImageUrl(c.imageUrl)} radius="xl" size={40} className="tt-roster-avatar">
        {c.name.slice(0, 2).toUpperCase()}
      </Avatar>
      <div className="tt-roster-text">
        <strong>{c.name}</strong>
        <span>
          {[c.race, c.characterClass].filter(Boolean).join(" ")} · Lv {c.level ?? 1}
        </span>
        <span className="tt-roster-hp">
          HP {c.hitPoints}/{c.maxHitPoints} · AC {c.armorClass}
        </span>
      </div>
      {placed ? (
        <Badge size="sm" variant="light" color="teal" leftSection={<IconCheck size={11} />}>
          On map
        </Badge>
      ) : (
        <Tooltip label="Place in the middle of the view">
          <ActionIcon variant="light" color="violet" radius="xl" onClick={place} aria-label={`Place ${c.name}`}>
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      )}
    </div>
  );
}

function MonsterPicker({ cellSize }: { cellSize: number }) {
  const [search, setSearch] = useState("");
  const [debounced] = useDebouncedValue(search, 300);
  const [results, setResults] = useState<Monster[]>([]);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    monsterService
      .search({ name: debounced.trim(), pageSize: 15 })
      .then((r) => active && setResults(r?.monsters ?? []))
      .catch(() => active && setResults([]));
    return () => {
      active = false;
    };
  }, [debounced]);

  const add = (id: string | null) => {
    const monster = results.find((m) => m.id === id);
    if (!monster) return;
    const hp = monster.hitPoints?.average ?? 10;
    const [p] = spawnPoints(1, cellSize);
    void tabletop.upsertToken({
      layer: useTabletopStore.getState().activeLayer,
      name: monster.name ?? "Monster",
      hp,
      maxHp: hp,
      ac: monster.armorClass?.[0] ?? 10,
      speed: monster.speed?.walk ?? 30,
      color: "#f87171",
      x: p.x,
      y: p.y,
    });
    setSearch("");
  };

  return (
    <Select
      radius="xl"
      placeholder="Search monsters…"
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      data={results.filter((m) => m.id).map((m) => ({ value: m.id!, label: `${m.name}${m.cr !== undefined ? ` · CR ${m.cr}` : ""}` }))}
      filter={({ options }) => options}
      value={null}
      onChange={add}
      nothingFoundMessage={debounced.trim().length >= 2 ? "No monsters found" : undefined}
    />
  );
}

function CustomToken({ cellSize }: { cellSize: number }) {
  const tableId = useTabletopStore((s) => s.session!.tableId);
  const activeLayer = useTabletopStore((s) => s.activeLayer);
  const [draft, setDraft] = useState<Partial<TableToken>>({ name: "", hp: 10, maxHp: 10, ac: 12, color: "#f87171" });
  const [uploading, setUploading] = useState(false);
  const set = (patch: Partial<TableToken>) => setDraft((d) => ({ ...d, ...patch }));

  const add = () => {
    if (!draft.name?.trim()) return;
    const [p] = spawnPoints(1, cellSize);
    void tabletop.upsertToken({ ...draft, x: p.x, y: p.y, layer: activeLayer });
    set({ name: "" });
  };

  return (
    <>
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <TextInput
          size="xs"
          label="Name"
          placeholder="Bandit captain"
          value={draft.name}
          onChange={(e) => set({ name: e.currentTarget.value })}
          onKeyDown={(e) => e.key === "Enter" && add()}
          style={{ flex: 1 }}
        />
        <NumberInput size="xs" label="HP" w={64} min={0} value={draft.hp} onChange={(v) => typeof v === "number" && set({ hp: v, maxHp: v })} />
        <NumberInput size="xs" label="AC" w={56} min={0} value={draft.ac} onChange={(v) => typeof v === "number" && set({ ac: v })} />
      </Group>
      <div className="tt-set-row">
        <span className="tt-set-label">Colour</span>
        <Group gap={6}>
          {TOKEN_SWATCHES.map((c) => (
            <UnstyledButton
              key={c}
              className={`tt-swatch round${draft.color === c ? " selected" : ""}`}
              style={{ background: c }}
              onClick={() => set({ color: c })}
              aria-label={`Token colour ${c}`}
            />
          ))}
        </Group>
      </div>
      <Group gap="xs" wrap="nowrap" align="flex-end">
        <TextInput
          size="xs"
          placeholder="Portrait URL (optional)"
          value={draft.imageUrl ?? ""}
          onChange={(e) => set({ imageUrl: e.currentTarget.value || null })}
          style={{ flex: 1 }}
        />
        <FileButton
          accept={IMAGE_TYPES}
          onChange={async (file) => {
            if (!file) return;
            setUploading(true);
            const url = await uploadTableImage(tableId, file);
            setUploading(false);
            if (url) set({ imageUrl: url });
          }}
        >
          {(props) => (
            <Button {...props} size="xs" variant="default" loading={uploading} leftSection={<IconUpload size={14} />}>
              Portrait
            </Button>
          )}
        </FileButton>
      </Group>
      <Group justify="space-between" wrap="nowrap">
        <Text size="xs" c="dimmed">
          Goes on the {activeLayer === "Dm" ? "DM (hidden)" : activeLayer.toLowerCase()} layer
        </Text>
        <Button size="xs" radius="xl" onClick={add} disabled={!draft.name?.trim()} leftSection={<IconPlus size={14} />}>
          Add token
        </Button>
      </Group>
    </>
  );
}

// ── Fog ──

function FogTab() {
  const fog = useTabletopStore((s) => s.fog);
  return (
    <>
      <Card
        icon={fog.enabled ? IconEyeOff : IconEye}
        title="Fog of war"
        description={fog.enabled ? "On: players see solid dark fog. You see through it." : "Off: players see the whole map."}
        action={<Switch size="md" color="violet" checked={fog.enabled} onChange={(e) => void tabletop.setFogEnabled(e.currentTarget.checked)} aria-label="Fog enabled" />}
      />

      <Card icon={IconCloudFog} title="Quick actions" description="Paint precise areas with the fog tool (F) on the left.">
        <div className="tt-fog-actions">
          <UnstyledButton className="tt-fog-action" onClick={() => void tabletop.resetFog(false)}>
            <IconEyeOff size={20} />
            <strong>Hide all</strong>
            <span>Cover the map</span>
          </UnstyledButton>
          <UnstyledButton className="tt-fog-action" onClick={() => void tabletop.resetFog(true)}>
            <IconEye size={20} />
            <strong>Reveal all</strong>
            <span>Clear the fog</span>
          </UnstyledButton>
          <UnstyledButton className="tt-fog-action" disabled={fog.ops.length === 0} onClick={() => void tabletop.undoFog()}>
            <IconArrowBackUp size={20} />
            <strong>Undo</strong>
            <span>Last stroke</span>
          </UnstyledButton>
        </div>
      </Card>
    </>
  );
}
