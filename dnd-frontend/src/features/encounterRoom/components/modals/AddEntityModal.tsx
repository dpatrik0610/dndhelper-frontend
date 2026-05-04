import { Button, Checkbox, ColorInput, Group, Modal, NumberInput, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import type { AddEntityRequest } from "@appTypes/EncounterRoom";

interface AddEntityModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (request: AddEntityRequest) => void;
}

export function AddEntityModal({ opened, onClose, onSubmit }: AddEntityModalProps) {
  const [name, setName] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [color, setColor] = useState("#7c3aed");
  const [maxHp, setMaxHp] = useState(10);
  const [ac, setAc] = useState(10);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      isPlayer,
      color,
      attributes: { MaxHp: maxHp, CurrentHp: maxHp, AC: ac },
    });
    setName("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Add entity" centered>
      <Stack>
        <TextInput label="Name" value={name} onChange={(event) => setName(event.currentTarget.value)} />
        <Checkbox label="Player entity" checked={isPlayer} onChange={(event) => setIsPlayer(event.currentTarget.checked)} />
        <ColorInput label="Token color" value={color} onChange={setColor} />
        <Group grow>
          <NumberInput label="Max HP" min={1} value={maxHp} onChange={(value) => setMaxHp(Number(value) || 1)} />
          <NumberInput label="AC" min={1} value={ac} onChange={(value) => setAc(Number(value) || 1)} />
        </Group>
        <Button onClick={submit}>Add Entity</Button>
      </Stack>
    </Modal>
  );
}
