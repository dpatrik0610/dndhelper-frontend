import { Box, Stack, Text } from "@mantine/core";
import { TopPanel } from "./TopPanel";
import { AvatarHpCrest } from "./AvatarHpCrest";
import type { Character } from "@appTypes/Character/Character";

interface IdentityPanelProps {
  character: Character | null;
  isMobile: boolean;
}

export function IdentityPanel({ character, isMobile }: IdentityPanelProps) {
  const currentHp = character?.hitPoints ?? 0;
  const maxHp = character?.maxHitPoints ?? 100;
  const tempHp = character?.temporaryHitPoints ?? 0;
  const totalHpStr = tempHp > 0 ? `${currentHp} + ${tempHp} / ${maxHp} HP` : `${currentHp} / ${maxHp} HP`;

  return (
    <Box
      style={{
        flex: 1,
        minWidth: isMobile ? "100%" : 0,
        padding: isMobile ? "16px" : "24px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: isMobile ? "1rem" : "1.5rem",
      }}
    >
      <AvatarHpCrest character={character} isMobile={isMobile} />
      <Stack gap="md" style={{ justifyContent: "center", flex: 1, width: "100%" }}>
        <TopPanel character={character} isMobile={isMobile} />
        <Text
          style={{
            fontSize: isMobile ? "20px" : "26px",
            fontWeight: 800,
            color: "var(--theme-color-text-primary, #ffffff)",
            fontFamily: "var(--font-sans)",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
            letterSpacing: "1px",
            textAlign: "left",
          }}
        >
          {totalHpStr}
        </Text>
      </Stack>
    </Box>
  );
}
