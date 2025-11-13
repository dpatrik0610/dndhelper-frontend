// SpellModal.tsx
import { Modal } from "@mantine/core";
import { useSpellStore } from "../../../store/useSpellStore";
import { SpellCard } from "../../Spells/components/SpellCard";

interface SpellModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SpellModal({ opened, onClose }: SpellModalProps) {
  const spell = useSpellStore((s) => s.currentSpell);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      fullScreen
      title={spell?.name ?? "Spell Details"}
      styles={{
        header: { background: "transparent" },
        content: {
          background: "linear-gradient(175deg, #00093388, rgba(48, 0, 0, 0.4))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,100,255,0.25)",
          boxShadow: "0 0 14px rgba(150, 0, 255, 0.35)",
          paddingTop: 8
        },
        title: {
          color: "white",
          textShadow: "0 0 6px rgba(180,100,255,0.7)",
          letterSpacing: "1px",
        },
      }}
    >
      <SpellCard />
    </Modal>
  );
}
