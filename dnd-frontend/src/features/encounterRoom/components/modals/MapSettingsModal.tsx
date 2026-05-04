import { Button, Group, Modal, NumberInput, SegmentedControl, Slider, Stack, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import type { GridType, MapSettings, UpdateMapSettingsRequest } from "@appTypes/EncounterRoom";

interface MapSettingsModalProps {
  opened: boolean;
  settings: MapSettings;
  onClose: () => void;
  onSubmit: (request: UpdateMapSettingsRequest) => void;
}

export function MapSettingsModal({ opened, settings, onClose, onSubmit }: MapSettingsModalProps) {
  const [draft, setDraft] = useState<MapSettings>(settings);

  useEffect(() => setDraft(settings), [settings]);

  return (
    <Modal opened={opened} onClose={onClose} title="Map settings" centered>
      <Stack>
        <TextInput
          label="Map image URL"
          value={draft.mapImageUrl ?? ""}
          onChange={(event) => setDraft({ ...draft, mapImageUrl: event.currentTarget.value || null })}
        />
        <SegmentedControl
          value={draft.gridType}
          data={["Square", "Hex"]}
          onChange={(value) => setDraft({ ...draft, gridType: value as GridType })}
        />
        <Group grow>
          <NumberInput label="Width" min={5} value={draft.gridWidth} onChange={(value) => setDraft({ ...draft, gridWidth: Number(value) || 20 })} />
          <NumberInput label="Height" min={5} value={draft.gridHeight} onChange={(value) => setDraft({ ...draft, gridHeight: Number(value) || 20 })} />
        </Group>
        <NumberInput
          label="Cell size"
          description="Pixel spacing between grid lines."
          min={8}
          max={256}
          value={draft.gridCellSize}
          onChange={(value) => setDraft({ ...draft, gridCellSize: Number(value) || 50 })}
        />
        <Slider
          label={(value) => `${value}px cells`}
          min={8}
          max={256}
          value={draft.gridCellSize}
          onChange={(value) => setDraft({ ...draft, gridCellSize: value })}
        />
        <Button
          onClick={() => {
            onSubmit(draft);
            onClose();
          }}
        >
          Save Settings
        </Button>
      </Stack>
    </Modal>
  );
}
