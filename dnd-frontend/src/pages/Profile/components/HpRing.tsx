import { RingProgress, Text, Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export function HpRing({
  currentHp,
  maxHp,
  tempHp,
}: {
  currentHp: number;
  maxHp: number;
  tempHp: number;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const hpRatio = currentHp / maxHp;
  const tempRatio = tempHp / maxHp;

  let hpPercent = hpRatio * 100;
  let tempPercent = tempRatio * 100;

  // Scale segments so the total never exceeds 100%
  const total = hpPercent + tempPercent;
  if (total > 100) {
    const scale = 100 / total;
    hpPercent *= scale;
    tempPercent *= scale;
  }

  const showTemp = tempHp > 0 && tempPercent > 0;

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-start",
        width: "100%",
      }}
    >
      <RingProgress
        size={120}
        thickness={10}
        sections={[
          { value: hpPercent, color: "red" },
          showTemp ? { value: tempPercent, color: "yellow" } : null,
        ].filter(
          (s): s is { value: number; color: string } => s !== null
        )}
        label={
          <Box ta="center">
            {currentHp <= 0 ? (
              <Text size="md" c="gray.5" fw={700}>
                ☠️ Dead
              </Text>
            ) : (
              <>
                <Text size="sm" c="gray.5">
                  HP
                </Text>
                <Text size="md" c="white" fw={700}>
                  {currentHp}/{maxHp}
                </Text>
                {tempHp > 0 && (
                  <Text size="xs" c="yellow.3">
                    +{tempHp}
                  </Text>
                )}
              </>
            )}
          </Box>
        }
      />
    </Box>
  );
}
