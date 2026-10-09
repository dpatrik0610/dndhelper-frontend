import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  CopyButton,
  Group,
  Indicator,
  Loader,
  SegmentedControl,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconListNumbers,
  IconMessageCircle,
  IconEye,
  IconEyeOff,
  IconPlayerTrackNext,
  IconSettings,
} from "@tabler/icons-react";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useChatStore } from "@store/chat/chatStore";
import { useChatHub } from "@features/chat/chatHub";
import { initiativeOrder, useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableLayer } from "@appTypes/Tabletop";
import { useIsMobile } from "@hooks/useIsMobile";
import { Board } from "./board/Board";
import { TabletopLobby } from "./TabletopLobby";
import { DiceBubble } from "./DiceBubble";
import { SpellSearch } from "./SpellSearch";
import { JoinCombat } from "./JoinCombat";
import { Toolbar } from "./Toolbar";
import { LAYERS, TOOLS } from "./tools";
import { InitiativePanel } from "./panels/InitiativePanel";
import { InventoryButton } from "./panels/InventoryModal";
import { NotesButton } from "./panels/NotesModal";
import { ChatPanel } from "./panels/ChatPanel";
import { LogPanel } from "./panels/LogPanel";
import { TokenEditor } from "./panels/TokenEditor";
import { TokenDialogs } from "./panels/TokenDialogs";
import { TokenMenu } from "./panels/TokenMenu";
import { SettingsDrawer } from "./SettingsDrawer";
import { TokenProfileModal } from "./TokenProfileModal";
import { resolveImageUrl, tabletop, useTabletopHub } from "./useTabletopHub";
import "./tabletop.css";

export default function TabletopPage() {
  const { code } = useParams();
  const joinCode = code?.trim().toUpperCase();
  useTabletopHub(joinCode);
  const session = useTabletopStore((s) => s.session);
  const joinError = useTabletopStore((s) => s.joinError);

  if (!joinCode) return <TabletopLobby />;
  if (!session) return <Splash error={joinError} />;
  return <TableView />;
}

function Splash({ error }: { error: string | null }) {
  const navigate = useNavigate();
  return (
    <div className="tt-root tt-center">
      {error ? (
        <Stack align="center" gap="sm" className="tt-glass tt-card">
          <Title order={4}>Couldn't join the table</Title>
          <Text c="dimmed" ta="center">
            {error}
          </Text>
          <Button variant="light" onClick={() => navigate("/table")}>
            Back to lobby
          </Button>
        </Stack>
      ) : (
        <Stack align="center" gap="xs">
          <Loader color="violet" />
          <Text c="dimmed">Joining table…</Text>
        </Stack>
      )}
    </div>
  );
}

function TableView() {
  const isMobile = useIsMobile();
  const [sideOpen, setSideOpen] = useState(!isMobile);
  const isDm = useTabletopStore((s) => s.session!.isDm);
  const dmView = useDmView();
  const campaignId = useTabletopStore((s) => s.session!.campaignId);
  const chatUnread = useChatStore((s) => s.unread);
  // Here the chat lives in the side panel; the floating chat stays off on the table.
  useChatHub(campaignId);
  useShortcuts(dmView);

  return (
    <div className={`tt-root${sideOpen ? " side-open" : ""}`}>
      <Board />
      <TopBar sideOpen={sideOpen} onToggleSide={() => setSideOpen((o) => !o)} />
      <Toolbar />
      {sideOpen && (
        <aside className="tt-side tt-glass">
          <InitiativePanel />
          <Tabs defaultValue="log" className="tt-side-tabs" keepMounted={false}>
            <Tabs.List grow>
              <Tabs.Tab value="log" leftSection={<IconListNumbers size={14} />}>
                Log
              </Tabs.Tab>
              <Tabs.Tab value="chat" leftSection={<IconMessageCircle size={14} />}>
                <Indicator inline processing disabled={!chatUnread} size={7} offset={-3} color="red">
                  Chat
                </Indicator>
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="log" className="tt-tab-panel">
              <LogPanel />
            </Tabs.Panel>
            <Tabs.Panel value="chat" className="tt-tab-panel">
              <ChatPanel />
            </Tabs.Panel>
          </Tabs>
        </aside>
      )}
      <TurnBar />
      <ConnectionBanner />
      <DiceBubble />
      {isDm && <SettingsDrawer />}
      {isDm && <TokenEditor />}
      {isDm && <TokenMenu />}
      {isDm && <TokenDialogs />}
      <TokenProfileModal />
    </div>
  );
}

/** The current-turn token, unless it's on the DM layer and the viewer gets the player picture. */
function useCurrentToken() {
  const dmView = useDmView();
  const current = useTabletopStore((s) => s.snapshot!.tokens.find((t) => t.id === s.snapshot!.turn.currentTokenId));
  return current && (dmView || current.layer !== "Dm") ? current : undefined;
}

function TopBar({ sideOpen, onToggleSide }: { sideOpen: boolean; onToggleSide: () => void }) {
  const navigate = useNavigate();
  const session = useTabletopStore((s) => s.session!);
  const connected = useTabletopStore((s) => s.connected);
  const chatUnread = useChatStore((s) => s.unread);
  const turn = useTabletopStore((s) => s.snapshot!.turn);
  const activeLayer = useTabletopStore((s) => s.activeLayer);
  const playerView = useTabletopStore((s) => s.playerView);
  const set = useTabletopStore((s) => s.set);
  const encounter = useTabletopStore((s) => s.snapshot!.encounter);
  const me = useCurrentUserId() ?? "";
  // A player who owns no token on this table can watch, roll and draw, but has nothing to move.
  const spectating = useTabletopStore(
    (s) => !s.session?.isDm && !s.snapshot?.tokens.some((t) => t.layer !== "Dm" && t.ownerIds.includes(me))
  );

  return (
    <div className="tt-topbar">
      <Group gap="xs" className="tt-glass tt-pillbar" wrap="nowrap">
        <Tooltip label="Leave table">
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate("/home")} aria-label="Leave table">
            <IconArrowLeft size={18} />
          </ActionIcon>
        </Tooltip>
        <Text fw={700} truncate maw={220} className="tt-hide-mobile">
          {session.campaignName}
        </Text>
        <Tooltip label={connected ? "Connected" : "Reconnecting…"}>
          <span className={`tt-dot${connected ? " on" : ""}`} />
        </Tooltip>
        <CopyButton value={session.joinCode}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? "Copied" : "Copy room code"}>
              <Button
                size="compact-sm"
                variant="subtle"
                color="gray"
                onClick={copy}
                rightSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                className="tt-code tt-hide-mobile"
              >
                {session.joinCode}
              </Button>
            </Tooltip>
          )}
        </CopyButton>
        {(encounter || !turn.active) && (
          <Badge variant="light" color="gray">
            {encounter ? encounter.name : "Exploring"}
          </Badge>
        )}
        {spectating && (
          <Tooltip
            multiline
            w={260}
            label="None of your characters are on this table, so there's nothing for you to move. Ask the DM to add your character to the campaign and place it on the map."
          >
            <Badge variant="light" color="blue" leftSection={<IconEye size={12} />}>
              Spectating
            </Badge>
          </Tooltip>
        )}
      </Group>

      <Group gap="xs" className={`tt-glass tt-pillbar${playerView ? " player-view" : ""}`} wrap="nowrap">
        <SpellSearch />
        <InventoryButton />
        <NotesButton />
        {session.isDm && !playerView && (
          <SegmentedControl
            size="xs"
            value={activeLayer}
            onChange={(layer) => set({ activeLayer: layer as TableLayer })}
            className="tt-layers"
            data={LAYERS.map(({ layer, icon: LayerIcon, label, hint }) => ({
              value: layer,
              label: (
                <span className="tt-layer-label" title={hint}>
                  <LayerIcon size={14} />
                  <span className="tt-hide-mobile">{label}</span>
                </span>
              ),
            }))}
          />
        )}
        {session.isDm && (
          <Tooltip label={playerView ? "Back to DM view" : "See what players see"}>
            <ActionIcon
              variant={playerView ? "filled" : "subtle"}
              color={playerView ? "violet" : "gray"}
              onClick={() =>
                // Players have no fog brush, so the preview drops it too.
                set({ playerView: !playerView, ...(!playerView && useTabletopStore.getState().tool === "fog" ? { tool: "select" as const } : {}) })
              }
              aria-label="Player view"
              aria-pressed={playerView}
            >
              {playerView ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </ActionIcon>
          </Tooltip>
        )}
        {session.isDm && (
          <Tooltip label="Table settings">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => useTabletopStore.getState().set({ settingsOpen: true })}
              aria-label="Table settings"
            >
              <IconSettings size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label={sideOpen ? "Hide panel" : "Show panel"}>
          <Indicator processing disabled={sideOpen || !chatUnread} size={7} offset={5} color="red">
            <ActionIcon variant="subtle" color="gray" onClick={onToggleSide} aria-label="Toggle side panel">
              {sideOpen ? <IconLayoutSidebarRightCollapse size={18} /> : <IconLayoutSidebarRightExpand size={18} />}
            </ActionIcon>
          </Indicator>
        </Tooltip>
      </Group>
    </div>
  );
}

/** Shown while the table connection is down; it reconnects and re-syncs by itself. */
function ConnectionBanner() {
  const connected = useTabletopStore((s) => s.connected);
  if (connected) return null;
  return (
    <div className="tt-conn-banner tt-glass" role="status">
      <Loader size={14} color="yellow" />
      <span>Connection lost. Reconnecting… changes will sync when it's back.</span>
    </div>
  );
}

/** Bottom of the board: whose turn it is. On your own turn it grows into a card with movement, economy and End turn. */
function TurnBar() {
  const me = useCurrentUserId() ?? "";
  const turn = useTabletopStore((s) => s.snapshot!.turn);
  const tokens = useTabletopStore((s) => s.snapshot!.tokens);
  const current = useCurrentToken();
  const dmView = useDmView();
  const [endingFor, setEndingFor] = useState<string | null>(null);

  if (!turn.active)
    return (
      <div className="tt-turnbar">
        <JoinCombat />
      </div>
    );
  // The DM plays every token no player owns, so they get the full card (movement, economy) on those turns.
  const mine = !!current && (current.ownerIds.includes(me) || (dmView && current.ownerIds.length === 0));
  const order = initiativeOrder(dmView ? tokens : tokens.filter((t) => t.layer !== "Dm"));
  const index = order.findIndex((t) => t.id === turn.currentTokenId);
  const upNext = order.length > 1 ? order[(index + 1) % order.length] : undefined;
  const ending = endingFor === turn.currentTokenId;

  const endTurn = async () => {
    setEndingFor(turn.currentTokenId);
    await tabletop.endTurn();
    setEndingFor(null);
  };

  const avatar = (size: number) =>
    current && (
      <Avatar src={resolveImageUrl(current.imageUrl)} size={size} radius="xl" style={{ background: current.color }}>
        {current.name.slice(0, 2).toUpperCase()}
      </Avatar>
    );

  if (mine && current) {
    const { movedFt } = current.economy;
    const speed = current.speed;
    const pace = speed <= 0 || movedFt <= speed ? "walk" : movedFt <= speed * 2 ? "dash" : "over";
    const toggle = (key: "action" | "bonus" | "reaction") =>
      void tabletop.setEconomy(current.id, { ...current.economy, [key]: !current.economy[key] });

    return (
      <div className="tt-turnbar">
        <JoinCombat />
        {/* Keyed by turn so the card pops in again whenever the turn comes back to you */}
        <div key={turn.currentTokenId} className="tt-turncard mine tt-glass tt-pop-in" style={{ "--token": current.color } as CSSProperties}>
          <div className="tt-turncard-avatar">{avatar(52)}</div>
          <div className="tt-turncard-info">
            <span className="tt-turncard-eyebrow">Your turn · Round {turn.round}</span>
            <strong className="tt-turncard-name">{current.name}</strong>
            {speed > 0 && (
              <div className={`tt-move ${pace}`} title="Movement used this turn">
                <div className="tt-move-bar">
                  <span style={{ width: `${Math.min(1, movedFt / (speed * 2)) * 100}%` }} />
                  <i style={{ left: "50%" }} />
                </div>
                <span className="tt-move-text">
                  {pace === "walk" ? `${movedFt} / ${speed} ft` : pace === "dash" ? `Dashing · ${movedFt} / ${speed * 2} ft` : `${movedFt} ft · over`}
                </span>
              </div>
            )}
          </div>
          <div className="tt-turncard-economy" role="group" aria-label="Used this turn">
            {(["action", "bonus", "reaction"] as const).map((key) => (
              <button
                key={key}
                type="button"
                className={`tt-econ${current.economy[key] ? " used" : ""}`}
                onClick={() => toggle(key)}
                aria-pressed={current.economy[key]}
              >
                <span className="tt-econ-dot" />
                {key === "bonus" ? "Bonus" : key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <button type="button" className="tt-endturn" onClick={endTurn} disabled={ending}>
            {ending ? <Loader size={16} color="white" /> : <IconPlayerTrackNext size={20} />}
            <span>
              End turn
              {upNext && <small>Next: {upNext.name}</small>}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tt-turnbar">
      <JoinCombat />
      <div key={turn.currentTokenId ?? "none"} className="tt-turncard tt-glass tt-pop-in" style={{ "--token": current?.color ?? "#64748b" } as CSSProperties}>
        <div className="tt-turncard-avatar small">{avatar(36)}</div>
        <div className="tt-turncard-info">
          <span className="tt-turncard-eyebrow">Round {turn.round}</span>
          <strong className="tt-turncard-name small">{current ? `${current.name}'s turn` : "Waiting for the DM"}</strong>
          {upNext && <span className="tt-turncard-next">Up next: {upNext.name}</span>}
        </div>
        {dmView && (
          <button type="button" className="tt-endturn compact" onClick={endTurn} disabled={ending}>
            {ending ? <Loader size={14} color="white" /> : <IconPlayerTrackNext size={16} />}
            <span>End turn</span>
          </button>
        )}
      </div>
    </div>
  );
}

function useShortcuts(isDm: boolean) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      const store = useTabletopStore.getState();
      if (store.editingTokenId || store.profileCharacterId || store.settingsOpen || store.tokenMenu || store.tokenDialog) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (isDm && store.tool === "fog") {
          e.preventDefault();
          void tabletop.undoFog();
        }
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Escape") return store.set({ tool: "select" });
      const match = TOOLS.find((t) => t.key === e.key.toUpperCase() && (isDm || !t.dmOnly));
      if (match) store.set({ tool: match.tool });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDm]);
}

