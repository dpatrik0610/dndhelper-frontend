import { Box, Stack, Text } from "@mantine/core";

interface IdentityPanelProps {
  character: any;
  isMobile: boolean;
}

export function IdentityPanel({ character, isMobile }: IdentityPanelProps) {
  const currentHp = character.hitPoints ?? 0;
  const maxHp = character.maxHitPoints ?? 100;
  const tempHp = character.temporaryHitPoints ?? 0;
  const totalHpStr = tempHp > 0 ? `${currentHp} + ${tempHp} / ${maxHp} HP` : `${currentHp} / ${maxHp} HP`;

  return (
    <Box
      style={{
        flex: 1,
        minWidth: isMobile ? "100%" : 0,
        height: isMobile ? 110 : 130,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Stack gap="sm" style={{ justifyContent: "center", height: "100%" }}>
        {/* Row 1: HP in Large */}
        <Text
          style={{
            fontSize: isMobile ? "20px" : "26px",
            fontWeight: 800,
            color: "var(--theme-color-text-primary, #ffffff)",
            lineHeight: 1.1,
            fontFamily: "var(--font-sans)",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
            letterSpacing: "1px",
          }}
        >
          {totalHpStr}
        </Text>
      </Stack>
    </Box>
  );
}
