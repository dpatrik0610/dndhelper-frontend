import { Button, Group, NumberInput, Paper, SegmentedControl, Slider, Stack, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import type { GridType, MapSettings, UpdateMapSettingsRequest } from "@appTypes/EncounterRoom";

interface RoomMapConfigProps {
  settings: MapSettings | null;
  onSave: (request: UpdateMapSettingsRequest) => void;
}

export function RoomMapConfig({ settings, onSave }: RoomMapConfigProps) {
  const [draft, setDraft] = useState<MapSettings | null>(settings);

  useEffect(() => setDraft(settings), [settings]);

  if (!draft) return null;

  return (
    <Paper withBorder p="sm" radius="sm">
      <Stack>
        <TextInput
          label="Map image URL"
          value={draft.mapImageUrl ?? ""}
          onChange={(event) => setDraft({ ...draft, mapImageUrl: event.currentTarget.value || null })}
        />
        <SegmentedControl value={draft.gridType} data={["Square", "Hex"]} onChange={(value) => setDraft({ ...draft, gridType: value as GridType })} />
        <Group grow>
          <NumberInput label="Grid width" value={draft.gridWidth} onChange={(value) => setDraft({ ...draft, gridWidth: Number(value) || 20 })} />
          <NumberInput label="Grid height" value={draft.gridHeight} onChange={(value) => setDraft({ ...draft, gridHeight: Number(value) || 20 })} />
        </Group>
        <NumberInput
          label="Cell size"
          min={8}
          max={256}
          value={draft.gridCellSize}
          onChange={(value) => setDraft({ ...draft, gridCellSize: Number(value) || 50 })}
        />
        <Slider label={(value) => `${value}px`} min={8} max={256} value={draft.gridCellSize} onChange={(value) => setDraft({ ...draft, gridCellSize: value })} />
        <Button onClick={() => onSave(draft)}>Save Map</Button>
      </Stack>
    </Paper>
  );
}
