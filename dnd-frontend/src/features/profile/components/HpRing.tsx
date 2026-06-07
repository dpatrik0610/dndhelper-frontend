import { Box, Stack, Text } from "@mantine/core";
import type { Character } from "@appTypes/Character/Character";

interface HpRingProps {
  character: Pick<
    Character,
    "hitPoints" | "maxHitPoints" | "temporaryHitPoints" | "deathSavesFailures" | "isDead"
  >;
  size?: number;
}

export function HpRing({ character, size = 110 }: HpRingProps) {
  if (!character) return null;

  const currentHp = character.hitPoints ?? 0;
  const maxHp = Math.max(1, character.maxHitPoints ?? 1);
  const tempHp = Math.max(0, character.temporaryHitPoints ?? 0);

  const hpRatio = Math.max(0, currentHp / maxHp);
  const tempRatio = Math.max(0, tempHp / maxHp);

  let hpPercent = hpRatio * 100;
  let tempPercent = tempRatio * 100;

  // Scale down if together they exceed 100% so they both fit in the globe
  const total = hpPercent + tempPercent;
  if (total > 100) {
    const scale = 100 / total;
    hpPercent *= scale;
    tempPercent *= scale;
  }

  const isDead = character.isDead || (character.deathSavesFailures ?? 0) >= 3;
  const isDown = currentHp <= 0 && !isDead;

  // Determine colors based on HP thresholds
  let hpColor = "linear-gradient(180deg, #4ade80 0%, #16a34a 100%)"; // Green
  if (isDead) {
    hpColor = "linear-gradient(180deg, #4b5563 0%, #1f2937 100%)"; // Gray/Dead
  } else if (hpRatio <= 0.25) {
    hpColor = "linear-gradient(180deg, #f87171 0%, #dc2626 100%)"; // Red
  } else if (hpRatio <= 0.5) {
    hpColor = "linear-gradient(180deg, #fbbf24 0%, #d97706 100%)"; // Orange
  }

  const renderLabel = () => {
    if (isDead) {
      return (
        <Stack gap={0} align="center" justify="center" h="100%">
          <Text size="lg" c="red.2" fw={900} tt="uppercase" lts={2} style={{ textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
            DEAD
          </Text>
        </Stack>
      );
    }

    if (isDown) {
      return (
        <Stack gap={0} align="center" justify="center" h="100%">
          <Text size="lg" c="yellow.3" fw={900} tt="uppercase" lts={2} style={{ textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
            DOWN
          </Text>
        </Stack>
      );
    }

    return (
      <Stack gap={0} align="center" justify="center" h="100%" style={{ lineHeight: 1 }}>
        <Text fw={900} c="white" style={{ fontSize: size * 0.28, textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
          {currentHp}
        </Text>
        <Text size="xs" fw={700} c="rgba(255,255,255,0.7)" mt={2} style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
          / {maxHp}
        </Text>
        {tempHp > 0 && (
          <Text size="xs" fw={800} c="yellow.4" mt={4} style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
            +{tempHp}
          </Text>
        )}
      </Stack>
    );
  };

  return (
    <Box
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, rgba(30,20,40,0.8), rgba(10,5,20,1))",
        boxShadow: "0 8px 16px rgba(0,0,0,0.4), inset 0 0 0 3px rgba(255,255,255,0.08), inset 0 0 20px rgba(0,0,0,0.8)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* Main HP Fill */}
      <Box
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: `${hpPercent}%`,
          background: hpColor,
          transition: "height 0.4s ease-out, background 0.4s ease",
        }}
      >
        {/* Subtle highlight at the top of the liquid */}
        <Box style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)" }} />
      </Box>

      {/* Temporary HP Fill (Stacks visually on top of HP) */}
      {tempHp > 0 && (
        <Box
          style={{
            position: "absolute",
            bottom: `${hpPercent}%`,
            left: 0,
            right: 0,
            height: `${tempPercent}%`,
            background: "linear-gradient(180deg, #fcd34d 0%, #ca8a04 100%)", // Gold
            transition: "height 0.4s ease-out, bottom 0.4s ease-out",
          }}
        >
          {/* Subtle highlight at the top of the temp HP liquid */}
          <Box style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)" }} />
        </Box>
      )}

      {/* Glass Reflection Highlight */}
      <Box
        style={{
          position: "absolute",
          top: "8%",
          left: "15%",
          width: "40%",
          height: "25%",
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)",
          borderRadius: "50%",
          transform: "rotate(-30deg)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />
      
      {/* Inner Shadow to enhance 3D depth over the liquid */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.5), inset 0 10px 20px rgba(0,0,0,0.3)",
          pointerEvents: "none",
          zIndex: 6,
        }}
      />

      {/* Perfectly Centered Content */}
      <Box style={{ position: "relative", zIndex: 10, width: "100%", height: "100%" }}>
        {renderLabel()}
      </Box>
    </Box>
  );
}
