import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useState } from "react";
import { normalizeJoinCode } from "../../utils/joinCodeGenerator";

interface JoinRoomModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (joinCode: string) => Promise<void> | void;
}

export function JoinRoomModal({ opened, onClose, onSubmit }: JoinRoomModalProps) {
  const [joinCode, setJoinCode] = useState("");

  const submit = async () => {
    if (!joinCode.trim()) return;
    await onSubmit(normalizeJoinCode(joinCode));
    setJoinCode("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Join encounter room" centered>
      <Stack>
        <TextInput
          label="Join code"
          value={joinCode}
          onChange={(event) => setJoinCode(normalizeJoinCode(event.currentTarget.value))}
          maxLength={8}
        />
        <Button onClick={submit}>Join Room</Button>
      </Stack>
    </Modal>
  );
}
