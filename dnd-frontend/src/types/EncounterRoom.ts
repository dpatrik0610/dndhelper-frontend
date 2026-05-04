export interface Point2D {
  x: number;
  y: number;
}

export type GridType = "Square" | "Hex";
export type MapElementType = "Drawing" | "Shape" | "Marker" | "Ruler" | "Text";
export type ShapeType = "Circle" | "Square" | "Rectangle" | "Cone" | "Line" | "Cube" | "Sphere";

export interface MapSettings {
  mapImageUrl: string | null;
  gridType: GridType;
  gridCellSize: number;
  gridWidth: number;
  gridHeight: number;
}

export interface SessionEntity {
  id: string;
  name: string;
  ownerId: string | null;
  isPlayer: boolean;
  isVisible: boolean;
  initiative: number | null;
  color: string;
  attributes: Record<string, unknown>;
}

export interface RoomToken {
  id: string;
  entityId: string;
  position: Point2D;
  size: number;
  hidden: boolean;
  imageUrl: string | null;
}

export interface MapElement {
  id: string;
  type: MapElementType;
  shape: ShapeType | null;
  points: Point2D[];
  color: string;
  thickness: number;
  isVisible: boolean;
  createdById: string;
}

export interface TurnState {
  round: number;
  currentIndex: number;
  isActive: boolean;
}

export interface EncounterRoom {
  id: string;
  name: string;
  dungeonMasterId: string;
  playerIds: string[];
  joinCode: string;
  inventoryIds: string[];
  entities: SessionEntity[];
  tokens: RoomToken[];
  mapElements: MapElement[];
  turnState: TurnState;
  mapSettings: MapSettings;
  revision: number;
  createdAt: string | null;
  updatedAt: string | null;
  isDeleted: boolean;
}

export interface CreateRoomRequest {
  name: string;
  mapSettings?: Partial<MapSettings>;
}

export interface JoinRoomResponse {
  roomId: string;
  roomState: EncounterRoom;
}

export interface AddEntityRequest {
  name: string;
  isPlayer: boolean;
  ownerId?: string | null;
  color?: string;
  attributes?: Record<string, unknown>;
}

export interface UpdateEntityRequest {
  entityId: string;
  updates: Record<string, unknown>;
}

export interface RemoveEntityRequest {
  entityId: string;
}

export interface MoveTokenRequest {
  tokenId: string;
  position: Point2D;
}

export interface AddTokenRequest {
  entityId: string;
  position: Point2D;
  size?: number;
  imageUrl?: string | null;
}

export interface RemoveTokenRequest {
  tokenId: string;
}

export interface AddMapElementRequest {
  type: MapElementType;
  shape?: ShapeType | null;
  points: Point2D[];
  color: string;
  thickness: number;
}

export interface RemoveMapElementRequest {
  elementId: string;
}

export interface UpdateMapSettingsRequest {
  mapImageUrl?: string | null;
  gridType?: GridType;
  gridCellSize?: number;
  gridWidth?: number;
  gridHeight?: number;
}

export interface SetInitiativeRequest {
  entityId: string;
  initiative: number;
}

export interface AddInventoryRequest {
  inventoryId: string;
}

export interface RemoveInventoryRequest {
  inventoryId: string;
}

export interface RoomActionEnvelope<T> {
  roomId: string;
  expectedRevision: number;
  action: T;
}

export const defaultMapSettings: MapSettings = {
  mapImageUrl: null,
  gridType: "Square",
  gridCellSize: 50,
  gridWidth: 20,
  gridHeight: 20,
};
