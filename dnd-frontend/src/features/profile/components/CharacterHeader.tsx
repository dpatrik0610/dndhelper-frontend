import { Stack, Box, Group, Title, Text } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";

import { CharacterCurrencyArea } from "./CharacterCurrencyArea";
import { showNotification } from "@components/Notification/Notification";
import { HpRing } from "./HpRing";
import { XpProgressCard } from "./XpProgressCard";
import { InspirationBox } from "./InspirationBox";
import { SwitchCharacterButton } from "./SwitchCharacterButton";
import { useIsMobile } from "@hooks/useIsMobile";

export function CharacterHeader() {
  const character = useCurrentCharacter()!;
  const { updateCharacter } = useCharacterCoreActions();
  const isMobile = useIsMobile();

  async function handleUseInspiration() {
    if (!character) return;
    if (!character.inspiration || character.inspiration <= 0) return;

    const confirmed = window.confirm("Use one point of Inspiration?");
    if (!confirmed) return;

    const newInspiration = character.inspiration - 1;
    updateCharacter({ inspiration: newInspiration });

    showNotification({
      title: "Inspiration used",
      message: "You spent 1 Inspiration point.",
      color: "blue",
    });
  }

  // Construct meta text safely
  const metaItems = [character.race, character.characterClass, character.alignment].filter(Boolean);
  const metaString = metaItems.length > 0 ? metaItems.join(" • ") : "No details set";

  return (
    <Box
      mb="xl"
      style={{
        background: "rgba(20, 15, 35, 0.4)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: isMobile ? "16px" : "24px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Stack gap="lg">
        <Group wrap={isMobile ? "wrap" : "nowrap"} align="flex-start" gap="xl" style={{ width: "100%" }}>
          
          {/* Left: HP */}
          <Box style={{ flexShrink: 0, margin: isMobile ? "0 auto" : 0 }}>
            <HpRing character={character} size={isMobile ? 120 : 130} />
          </Box>

          {/* Center: Info & Inspiration */}
          <Stack gap="xs" style={{ flex: 1, minWidth: isMobile ? "100%" : 0, textAlign: isMobile ? "center" : "left" }}>
            
            <Group gap="sm" wrap="nowrap" justify={isMobile ? "center" : "flex-start"} align="center">
              <Title order={1} c="white" style={{ fontSize: isMobile ? "24px" : "32px", lineHeight: 1.1, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                {character.name || "Unnamed"}
              </Title>
              <SwitchCharacterButton />
            </Group>

            <Text size="sm" c="dimmed" fw={700} lts={0.5} style={{ textTransform: "uppercase" }}>
              {metaString}
            </Text>

            <Box mt={isMobile ? "xs" : "auto"} style={{ display: "flex", justifyContent: isMobile ? "center" : "flex-start" }}>
              <InspirationBox value={character.inspiration} onClick={handleUseInspiration} />
            </Box>

          </Stack>

          {/* Right: Currency */}
          <Box style={{ width: isMobile ? "100%" : "260px", flexShrink: 0 }}>
            <CharacterCurrencyArea
              character={character}
              containerStyle={{
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: 0,
              }}
            />
          </Box>
          
        </Group>

        {/* Bottom: XP Bar */}
        <Box style={{ width: "100%" }}>
          <XpProgressCard experience={character.experience} containerStyle={{ margin: 0 }} />
        </Box>
      </Stack>
    </Box>
  );
}
