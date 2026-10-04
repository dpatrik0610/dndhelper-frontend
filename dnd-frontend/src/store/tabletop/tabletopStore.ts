import { create } from "zustand";
import type {
  AoeKind,
  FxKind,
  FogOp,
  FogShape,
  FogState,
  GridSettings,
  MeasureEvent,
  TableJoinResult,
  TableLogEntry,
  TableResync,
  TableSnapshot,
  TableStroke,
  TableLayer,
  TableToken,
  TableTool,
} from "@appTypes/Tabletop";

const ordinal = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Initiative desc, then name (ordinal, ignore case), then id: the same order the server uses for turns. */
export const initiativeOrder = (tokens: TableToken[]) =>
  tokens
    .filter((t) => t.initiative !== null)
    .sort(
      (a, b) =>
        b.initiative! - a.initiative! ||
        ordinal(a.name.toUpperCase(), b.name.toUpperCase()) ||
        ordinal(a.id, b.id)
    );

export interface TabletopSession {
  tableId: string;
  campaignId: string;
  campaignName: string;
  joinCode: string;
  isDm: boolean;
}

interface TabletopState {
  connected: boolean;
  joinError: string | null;
  session: TabletopSession | null;
  snapshot: TableSnapshot | null;
  strokes: TableStroke[];
  fog: FogState;
  log: TableLogEntry[];
  /** Other people's live rulers, by user id. */
  measures: Record<string, MeasureEvent>;

  tool: TableTool;
  drawColor: string;
  drawWidth: number;
  templateKind: AoeKind;
  templateColor: string;
  /** Cube mode: centred on a token instead of free. */
  templateCentered: boolean;
  templateWidthFt: number;
  fogReveal: boolean;
  fogShape: FogShape;
  fogRadius: number;
  fxKind: FxKind;
  fxColor: string;

  /** DM only: which layer new things go on and which layer can be grabbed. */
  activeLayer: TableLayer;
  /** DM only: render the table exactly as players see it. */
  playerView: boolean;

  /** World point at the middle of the screen, for placing new tokens. */
  viewCenter: { x: number; y: number };
  editingTokenId: string | null;
  profileCharacterId: string | null;
  settingsOpen: boolean;
}

interface TabletopActions {
  setConnected: (connected: boolean) => void;
  setJoinError: (error: string | null) => void;
  joined: (result: TableJoinResult) => void;
  setSnapshot: (snapshot: TableSnapshot) => void;
  resync: (payload: TableResync) => void;
  /** Local-only grid preview while the DM drags a slider. */
  previewGrid: (grid: GridSettings) => void;
  moveTokenLocal: (tokenId: string, x: number, y: number) => void;
  addStroke: (stroke: TableStroke) => void;
  removeStroke: (strokeId: string) => void;
  clearStrokes: () => void;
  setFog: (fog: FogState) => void;
  addFogOp: (op: FogOp) => void;
  addLog: (entry: TableLogEntry) => void;
  setMeasure: (measure: MeasureEvent) => void;
  setCode: (code: string) => void;
  set: (partial: Partial<TabletopState>) => void;
  reset: () => void;
}

const initial: TabletopState = {
  connected: false,
  joinError: null,
  session: null,
  snapshot: null,
  strokes: [],
  fog: { enabled: false, ops: [] },
  log: [],
  measures: {},

  tool: "select",
  drawColor: "#f8fafc",
  drawWidth: 4,
  templateKind: "Circle",
  templateColor: "#f97316",
  templateCentered: false,
  templateWidthFt: 5,
  fogReveal: true,
  fogShape: "Brush",
  fogRadius: 60,
  fxKind: "Fire",
  fxColor: "#f97316",

  activeLayer: "Token",
  playerView: false,

  viewCenter: { x: 0, y: 0 },
  editingTokenId: null,
  profileCharacterId: null,
  settingsOpen: false,
};

export const useTabletopStore = create<TabletopState & TabletopActions>()((set) => ({
  ...initial,

  setConnected: (connected) => set({ connected }),
  setJoinError: (joinError) => set({ joinError }),
  joined: (r) =>
    set({
      joinError: null,
      session: {
        tableId: r.tableId,
        campaignId: r.campaignId,
        campaignName: r.campaignName,
        joinCode: r.joinCode,
        isDm: r.isDm,
      },
      snapshot: r.state,
      strokes: r.strokes,
      fog: r.fog,
      log: r.log,
      measures: {},
    }),
  setSnapshot: (snapshot) => set({ snapshot }),
  resync: (r) => set({ snapshot: r.state, strokes: r.strokes, fog: r.fog, log: r.log, measures: {}, editingTokenId: null }),
  previewGrid: (grid) => set((s) => (s.snapshot ? { snapshot: { ...s.snapshot, grid } } : s)),
  moveTokenLocal: (tokenId, x, y) =>
    set((s) =>
      s.snapshot
        ? { snapshot: { ...s.snapshot, tokens: s.snapshot.tokens.map((t) => (t.id === tokenId ? { ...t, x, y } : t)) } }
        : s
    ),
  addStroke: (stroke) => set((s) => ({ strokes: [...s.strokes, stroke] })),
  removeStroke: (strokeId) => set((s) => ({ strokes: s.strokes.filter((x) => x.id !== strokeId) })),
  clearStrokes: () => set({ strokes: [] }),
  setFog: (fog) => set({ fog }),
  addFogOp: (op) => set((s) => ({ fog: { ...s.fog, ops: [...s.fog.ops, op] } })),
  addLog: (entry) => set((s) => ({ log: [...s.log, entry].slice(-100) })),
  setMeasure: (m) =>
    set((s) => {
      const measures = { ...s.measures };
      if (m.points) measures[m.userId] = m;
      else delete measures[m.userId];
      return { measures };
    }),
  setCode: (joinCode) => set((s) => (s.session ? { session: { ...s.session, joinCode } } : s)),
  set: (partial) => set(partial),
  // Keeps tool preferences across tables; drops everything table-specific.
  reset: () =>
    set((s) => ({
      ...initial,
      connected: s.connected,
      tool: s.tool,
      drawColor: s.drawColor,
      drawWidth: s.drawWidth,
      templateKind: s.templateKind,
      templateColor: s.templateColor,
      templateCentered: s.templateCentered,
      templateWidthFt: s.templateWidthFt,
      fogRadius: s.fogRadius,
      fxKind: s.fxKind,
      fxColor: s.fxColor,
    })),
}));

/** True when the viewer gets the DM's picture: the DM, unless previewing the player view. */
export const useDmView = () => useTabletopStore((s) => !!s.session?.isDm && !s.playerView);
