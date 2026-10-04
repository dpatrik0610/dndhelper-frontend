import type { RollResult } from "@appTypes/Roll";

/** Mirrors dndhelper/Models/Tabletop.cs */

export type GridType = "Square" | "HexPointy" | "HexFlat";

export interface GridSettings {
  type: GridType;
  /** One cell (5 ft) in world px; flat-to-flat width for hex grids. */
  cellSize: number;
  color: string;
}

export interface MapLayer {
  imageUrl: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TableEffect {
  id: string;
  label: string;
  /** Turns left; null = indefinite. */
  remaining: number | null;
}

export interface TurnEconomy {
  action: boolean;
  bonus: boolean;
  reaction: boolean;
  movedFt: number;
}

/** Map: background props. Token: the play layer. Dm: never sent to players. */
export type TableLayer = "Token" | "Map" | "Dm";

export type FxKind =
  | "Beam"
  | "Ray"
  | "Lightning"
  | "Breath"
  | "Fire"
  | "Bubble"
  | "Frost"
  | "Cloud"
  | "Darkness"
  | "Light"
  | "Arcane"
  | "Explosion"
  | "Healing"
  | "Vortex"
  | "Acid";

export interface TableToken {
  id: string;
  name: string;
  characterId: string | null;
  ownerIds: string[];
  imageUrl: string | null;
  color: string;
  x: number;
  y: number;
  size: number;
  layer: TableLayer;
  initiative: number | null;
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  speed: number;
  effects: TableEffect[];
  economy: TurnEconomy;
  /** Healthy / Wounded / Bloodied / Down. Players get only this for monsters and NPCs (numbers are zeroed). */
  health: string | null;
}

export interface TableTurn {
  active: boolean;
  round: number;
  currentTokenId: string | null;
}

export interface TableStroke {
  id: string;
  userId: string;
  layer: TableLayer;
  color: string;
  width: number;
  /** Flat x0, y0, x1, y1, ... */
  points: number[];
}

export type AoeKind = "Circle" | "Cone" | "Line" | "Cube";

export interface AoeTemplate {
  id: string;
  userId: string;
  layer: TableLayer;
  kind: AoeKind;
  /** Animated effect drawn in the template's shape; null for a plain rules template. */
  fx: FxKind | null;
  x: number;
  y: number;
  sizeFt: number;
  /** Line width in ft. */
  widthFt: number;
  /** Cube centred on its origin instead of extending from it. */
  centered: boolean;
  /** Pinned to this token; follows it around. */
  tokenId: string | null;
  angle: number;
  color: string;
  remaining: number | null;
}

export type FogShape = "Rect" | "Brush";

export interface FogOp {
  id: string;
  reveal: boolean;
  shape: FogShape;
  points: number[];
  radius: number;
}

export interface FogState {
  enabled: boolean;
  ops: FogOp[];
}

export interface TableLogEntry {
  id: string;
  userId: string;
  userName: string;
  name: string;
  label: string;
  rolls: RollResult[];
  private: boolean;
  at: string;
}

export interface TableEncounterInfo {
  id: string;
  name: string;
  startedAt: string;
}

export interface TableSnapshot {
  grid: GridSettings;
  map: MapLayer;
  tokens: TableToken[];
  turn: TableTurn;
  templates: AoeTemplate[];
  /** The campaign encounter being played, if one is running. */
  encounter: TableEncounterInfo | null;
}

export interface TableEncounterSummary {
  id: string;
  name: string;
  status: "Planned" | "Active" | "Completed" | "Cancelled";
  startedAt: string | null;
  endedAt: string | null;
  tokenCount: number;
  hasBoard: boolean;
  active: boolean;
}

/** Sent after the whole board was swapped (encounter started, ended or loaded). */
export interface TableResync {
  state: TableSnapshot;
  strokes: TableStroke[];
  fog: FogState;
  log: TableLogEntry[];
}

export interface TableJoinResult {
  tableId: string;
  campaignId: string;
  campaignName: string;
  joinCode: string;
  isDm: boolean;
  state: TableSnapshot;
  strokes: TableStroke[];
  fog: FogState;
  log: TableLogEntry[];
}

export interface MeasureEvent {
  userId: string;
  name: string;
  points: number[] | null;
}

export type TableTool = "select" | "draw" | "erase" | "measure" | "template" | "fx" | "fog";
