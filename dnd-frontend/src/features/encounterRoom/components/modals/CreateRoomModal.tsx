import { Button, Group, Modal, NumberInput, SegmentedControl, Slider, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import type { CreateRoomRequest, GridType } from "@appTypes/EncounterRoom";

interface CreateRoomModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (request: CreateRoomRequest) => Promise<void> | void;
}

export function CreateRoomModal({ opened, onClose, onSubmit }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [mapImageUrl, setMapImageUrl] = useState("");
  const [gridType, setGridType] = useState<GridType>("Square");
  const [gridWidth, setGridWidth] = useState(20);
  const [gridHeight, setGridHeight] = useState(20);
  const [gridCellSize, setGridCellSize] = useState(50);

  const submit = async () => {
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      mapSettings: {
        mapImageUrl: mapImageUrl.trim() || null,
        gridType,
        gridWidth,
        gridHeight,
        gridCellSize,
      },
    });
    setName("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create encounter room" centered>
      <Stack>
        <TextInput label="Room name" value={name} onChange={(event) => setName(event.currentTarget.value)} />
        <TextInput label="Map image URL" value={mapImageUrl} onChange={(event) => setMapImageUrl(event.currentTarget.value)} />
        <SegmentedControl value={gridType} onChange={(value) => setGridType(value as GridType)} data={["Square", "Hex"]} />
        <Group grow>
          <NumberInput label="Width" min={5} max={200} value={gridWidth} onChange={(value) => setGridWidth(Number(value) || 20)} />
          <NumberInput label="Height" min={5} max={200} value={gridHeight} onChange={(value) => setGridHeight(Number(value) || 20)} />
        </Group>
        <NumberInput label="Cell size" min={8} max={256} value={gridCellSize} onChange={(value) => setGridCellSize(Number(value) || 50)} />
        <Slider label={(value) => `${value}px cells`} min={8} max={256} value={gridCellSize} onChange={setGridCellSize} />
        <Button onClick={submit}>Create Room</Button>
      </Stack>
    </Modal>
  );
}
