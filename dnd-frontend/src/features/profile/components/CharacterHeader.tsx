import { Stack, Box, Group } from "@mantine/core";
import { useCharacterStore } from "@store/useCharacterStore";
import { useMediaQuery } from "@mantine/hooks";
import { CharacterCurrencyArea } from "./CharacterCurrencyArea";
import { showNotification } from "@components/Notification/Notification";
import { HpRing } from "./HpRing";
import { XpProgressCard } from "./XpProgressCard";
import { InspirationBox } from "./InspirationBox";
import { CharacterMetaBox } from "./CharacterMetaBox";

export function CharacterHeader() {
  const character = useCharacterStore((s) => s.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  async function handleUseInspiration() {
    const current = useCharacterStore.getState().character;
    if (!current) return;
    if (!current.inspiration || current.inspiration <= 0) return;

    const confirmed = window.confirm(
      "Use one point of Inspiration?"
    );
    if (!confirmed) return;

    const newInspiration = current.inspiration - 1;

    useCharacterStore.getState().updateCharacter({inspiration: newInspiration});

    showNotification({
      title: "Inspiration used",
      message: "You spent 1 Inspiration point.",
      color: "blue",
    });
  }

  const tileStyle = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
    padding: 10,
  } as const;

  return (
    <Box
      style={{
        padding: isMobile ? "8px" : "10px",
        borderRadius: 16,
        background: "linear-gradient(145deg, rgba(15,10,35,0.6), rgba(35,10,25,0.55))",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.45)",
        position: "relative",
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <Stack gap={10} style={{ position: "relative" }}>
        <Group justify="space-between" align="center">
          <Group gap="xs" wrap="nowrap">
            
          </Group>
        </Group>

        <Group wrap={isMobile ? "wrap" : "nowrap"} align="stretch" style={{ width: "100%" }}>
          {/* Left Side */}
          <Box style={{ flex: isMobile ? 1 : 1.25, minWidth: isMobile ? "100%" : 0 }}>
            <CharacterMetaBox containerStyle={{ ...tileStyle, minHeight: 130 }} />
          </Box>

          {/* Middle */}
          <Box style={{ flex: isMobile ? 1 : 0.65, minWidth: isMobile ? "100%" : 0 }}>
            <Box
              style={{
                ...tileStyle,
                boxShadow: "none",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack gap={0} align="center" style={{ width: "100%" }}>
                <HpRing />
                <InspirationBox value={character.inspiration} onClick={handleUseInspiration} containerStyle={{ width: "100%" }} />
              </Stack>
            </Box>

          {/* Right Side */}
          </Box>
          <Box style={{ flex: isMobile ? 1 : 1.25, minWidth: isMobile ? "100%" : 0 }}>
            <CharacterCurrencyArea containerStyle={{ ...tileStyle, minHeight: 130 }} />
          </Box>
        </Group>

        {/* XP Progress */}
        <Box style={{ width: "100%" }}>
          <XpProgressCard experience={character.experience} containerStyle={{ ...tileStyle }} />
        </Box>
      </Stack>
    </Box>
  );
}
