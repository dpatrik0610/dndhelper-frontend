import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { CreateRoomRequest, Point2D, ShapeType } from "@appTypes/EncounterRoom";
import { useEncounterRoomStore } from "@store/useEncounterRoomStore";
import { BattleCanvas, type EncounterTool } from "./components/canvas/BattleCanvas";
import { RoomHeader } from "./components/header/RoomHeader";
import { RoomLobby } from "./components/lobby/RoomLobby";
import { AddEntityModal } from "./components/modals/AddEntityModal";
import { MapSettingsModal } from "./components/modals/MapSettingsModal";
import { EntityPanel } from "./components/panels/EntityPanel";
import { InitiativePanel } from "./components/panels/InitiativePanel";
import { InventoryPanel } from "./components/panels/InventoryPanel";
import { MapToolbar } from "./components/toolbar/MapToolbar";
import { useEncounterRoomHub } from "./hooks/useEncounterRoomHub";
import { useRoomActions } from "./hooks/useRoomActions";
import { useRoomPermissions } from "./hooks/useRoomPermissions";
import { snapToGrid } from "./utils/gridMath";
import classes from "./EncounterRoomPage.module.css";

export default function EncounterRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const room = useEncounterRoomStore((state) => state.room);
  const selectedEntityId = useEncounterRoomStore((state) => state.selectedEntityId);
  const myRooms = useEncounterRoomStore((state) => state.myRooms);
  const loading = useEncounterRoomStore((state) => state.loading);
  const error = useEncounterRoomStore((state) => state.error);
  const loadMyRooms = useEncounterRoomStore((state) => state.loadMyRooms);
  const loadRoom = useEncounterRoomStore((state) => state.loadRoom);
  const createRoom = useEncounterRoomStore((state) => state.createRoom);
  const joinRoomByCode = useEncounterRoomStore((state) => state.joinRoomByCode);
  const leaveRoom = useEncounterRoomStore((state) => state.leaveRoom);
  const deleteRoom = useEncounterRoomStore((state) => state.deleteRoom);
  const regenerateJoinCode = useEncounterRoomStore((state) => state.regenerateJoinCode);
  const setSelectedEntityId = useEncounterRoomStore((state) => state.setSelectedEntityId);
  const clearRoom = useEncounterRoomStore((state) => state.clearRoom);

  const { invoke, isConnected } = useEncounterRoomHub(room?.id ?? roomId ?? null);
  const actions = useRoomActions(invoke);
  const permissions = useRoomPermissions(room);
  const [activeTool, setActiveTool] = useState<EncounterTool>("select");
  const [shapeType, setShapeType] = useState<ShapeType>("Circle");
  const [drawColor, setDrawColor] = useState("#facc15");
  const [thickness, setThickness] = useState(3);
  const [addEntityOpened, addEntityHandlers] = useDisclosure(false);
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  useEffect(() => {
    if (roomId) void loadRoom(roomId);
    else {
      clearRoom();
      void loadMyRooms();
    }
  }, [clearRoom, loadMyRooms, loadRoom, roomId]);

  const createAndOpen = async (request: CreateRoomRequest) => {
    const created = await createRoom(request);
    if (created) navigate(`/encounter-room/${created.id}`);
  };

  const joinAndOpen = async (joinCode: string) => {
    const joined = await joinRoomByCode(joinCode);
    if (joined) navigate(`/encounter-room/${joined.id}`);
  };

  if (!room) {
    return (
      <div className={classes.page}>
        <RoomLobby
          rooms={myRooms}
          loading={loading}
          error={error}
          onCreateRoom={createAndOpen}
          onJoinRoom={joinAndOpen}
          onOpenRoom={(id) => navigate(`/encounter-room/${id}`)}
        />
      </div>
    );
  }

  const addTokenAtDefaultPosition = (entityId: string) => {
    const position = snapToGrid({ x: room.mapSettings.gridCellSize, y: room.mapSettings.gridCellSize }, room.mapSettings);
    void actions.addToken({ entityId, position, size: 1 });
  };

  const leaveOrNavigate = async () => {
    await leaveRoom(room.id);
    navigate("/encounter-room");
  };

  const endOrNavigate = async () => {
    await deleteRoom(room.id);
    navigate("/encounter-room");
  };

  return (
    <div className={classes.page}>
      <div className={classes.roomLayout}>
        <div className={classes.header}>
          <RoomHeader
            room={room}
            isConnected={isConnected}
            isDM={permissions.isDM}
            onLeave={leaveOrNavigate}
            onEnd={endOrNavigate}
            onRegenerateCode={() => void regenerateJoinCode(room.id)}
          />
        </div>

        <div className={classes.toolbar}>
          <Group justify="space-between" align="center" gap="xs">
            <MapToolbar
              activeTool={activeTool}
              shapeType={shapeType}
              color={drawColor}
              thickness={thickness}
              onToolChange={setActiveTool}
              onShapeTypeChange={setShapeType}
              onColorChange={setDrawColor}
              onThicknessChange={setThickness}
            />
            {permissions.isDM && (
              <Group gap="xs">
                <Button size="xs" variant="light" onClick={addEntityHandlers.open}>Add Entity</Button>
                <Button size="xs" variant="light" onClick={settingsHandlers.open}>Map Settings</Button>
              </Group>
            )}
          </Group>
        </div>

        <div className={classes.canvas}>
          <BattleCanvas
            activeTool={activeTool}
            shapeType={shapeType}
            color={drawColor}
            thickness={thickness}
            onMoveToken={(tokenId: string, position: Point2D) => void actions.moveToken({ tokenId, position })}
            onAddMapElement={(request) => void actions.addMapElement(request)}
            onRemoveMapElement={(elementId) => void actions.removeMapElement({ elementId })}
          />
        </div>

        <Stack className={classes.sidebar}>
          <InitiativePanel
            room={room}
            onSetInitiative={(entityId, initiative) => void actions.setInitiative({ entityId, initiative })}
            onStartCombat={() => void actions.startCombat()}
            onEndCombat={() => void actions.endCombat()}
            onAdvanceTurn={() => void actions.advanceTurn()}
            onSelectEntity={setSelectedEntityId}
          />
          <EntityPanel
            room={room}
            selectedEntityId={selectedEntityId}
            onUpdateEntity={(entityId, updates) => void actions.updateEntity({ entityId, updates })}
            onAddToken={addTokenAtDefaultPosition}
          />
          <InventoryPanel inventoryIds={room.inventoryIds} />
        </Stack>
      </div>

      <AddEntityModal opened={addEntityOpened} onClose={addEntityHandlers.close} onSubmit={(request) => void actions.addEntity(request)} />
      <MapSettingsModal
        opened={settingsOpened}
        settings={room.mapSettings}
        onClose={settingsHandlers.close}
        onSubmit={(request) => void actions.updateMapSettings(request)}
      />
    </div>
  );
}
