import { Box } from "@mantine/core";
import { SpellCard } from "@features/spells/components/SpellCard";
import { BaseModal } from "@components/BaseModal";
import { useIsMobile } from "@hooks/useIsMobile";

interface SpellModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SpellModal({ opened, onClose }: SpellModalProps) {
  const isMobile = useIsMobile();

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Spell Details"
      size="xl"
      fullScreen={isMobile}
      showSaveButton={false}
      showCancelButton={false}
    >
      <Box
        style={{
          paddingLeft: isMobile ? "0px" : "4px",
          paddingRight: isMobile ? "0px" : "4px",
          paddingBottom: isMobile ? "0px" : "4px",
          paddingTop: "0.25rem",
        }}
      >
        <SpellCard flat />
      </Box>
    </BaseModal>
  );
}
