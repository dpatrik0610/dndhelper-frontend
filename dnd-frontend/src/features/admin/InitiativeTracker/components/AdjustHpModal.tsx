import { useState } from "react";
import { Button, Group, Modal, NumberInput, Stack, Text } from "@mantine/core";
import { IconCheck, IconDroplet, IconHeartPlus } from "@tabler/icons-react";
import { magicGlowTheme } from "@styles/magic/glowTheme";

type Mode = "heal" | "damage";

interface AdjustHpModalProps {
  opened: boolean;
  mode: Mode;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}

export function AdjustHpModal({ opened, mode, onClose, onSubmit }: AdjustHpModalProps) {
  const [amount, setAmount] = useState<number | "">("");

  const isHeal = mode === "heal";
  const title = isHeal ? "Heal" : "Damage";
  const icon = isHeal ? <IconHeartPlus size={16} /> : <IconDroplet size={16} />;
  const color = isHeal ? "teal" : "red";

  const handleApply = () => {
    const val = typeof amount === "number" ? amount : Number(amount);
    if (!Number.isFinite(val) || val <= 0) return;
    onSubmit(val);
    setAmount("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title={
        <Group gap={6}>
          {icon}
          <Text fw={700} style={magicGlowTheme.text}>
            {title} HP
          </Text>
        </Group>
      }
      styles={{
        content: {
          ...magicGlowTheme.card,
          borderRadius: 14,
          border: magicGlowTheme.card.border,
        },
        header: { background: "transparent" },
        title: { ...magicGlowTheme.text, display: "flex", alignItems: "center", gap: 6 },
      }}
    >
      <Stack gap="sm">
        <NumberInput
          label={`${title} amount`}
          placeholder="Enter amount"
          min={1}
          value={amount}
          onChange={(val) => setAmount(typeof val === "number" ? val : "")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          styles={{
            input: {
              background: "rgba(255,255,255,0.06)",
              border: magicGlowTheme.badge.border,
              color: magicGlowTheme.text.color,
            },
            label: { color: magicGlowTheme.text.color },
          }}
        />
        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color={color}
            leftSection={icon}
            onClick={handleApply}
          >
            Apply
          </Button>
        </Group>
        <Text size="xs" c="dimmed">
          {isHeal ? "Healing cannot exceed max HP (enforced by save logic)." : "Damage will not drop below 0 HP."}
        </Text>
      </Stack>
    </Modal>
  );
}
