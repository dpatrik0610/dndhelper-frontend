import { Box, RingProgress, Text, Title } from "@mantine/core";
import { useCharacterStore } from "@store/useCharacterStore";
import { SwitchCharacterButton } from "./SwitchCharacterButton";

export function HpRing() {
  const character = useCharacterStore((s) => s.character);
  if (!character) return null;

  const currentHp = character.hitPoints ?? 0;
  const maxHp = Math.max(1, character.maxHitPoints || 1);
  const tempHp = Math.max(0, character.temporaryHitPoints ?? 0);

  const hpRatio = Math.max(0, currentHp) / maxHp;
  const tempRatio = tempHp / maxHp;

  let hpPercent = hpRatio * 100;
  let tempPercent = tempRatio * 100;

  const total = hpPercent + tempPercent;
  if (total > 100) {
    const scale = 100 / total;
    hpPercent *= scale;
    tempPercent *= scale;
  }

  const showTemp = tempHp > 0 && tempPercent > 0;

  const renderLabel = () => {
    if ((character.deathSavesFailures ?? 0) >= 3) {
      return (
        <Text size="md" c="red.5" fw={700}>
          Dead
        </Text>
      );
    }

    if (currentHp <= 0) {
      return (
        <Text size="md" c="yellow.4" fw={700}>
          Down
        </Text>
      );
    }

    return (
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
    );
  };

  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Title order={2} c="white" mb={2} ta="center" lts={1.5}  style={{ textShadow: "0 1 6px rgba(255,255,255,0.5)" }}>
        {character.name}
      </Title>
      <SwitchCharacterButton />
      <RingProgress
        size={110}
        thickness={8}
        sections={[
          { value: hpPercent, color: "red" },
          showTemp ? { value: tempPercent, color: "yellow" } : null,
        ].filter((s): s is { value: number; color: string } => s !== null)}
        label={<Box ta="center">{renderLabel()}</Box>}
      />

    </Box>
  );
}
