import { Box, Paper, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { Character } from "@appTypes/Character/Character";
import { CharacterMetaBox } from "@features/profile/components/CharacterMetaBox";
import { HpRing } from "@features/profile/components/HpRing";
import { InspirationBox } from "@features/profile/components/InspirationBox";
import { CharacterCurrencyArea } from "@features/profile/components/CharacterCurrencyArea";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";

interface CharacterCardProps {
  character: Character;
  containerStyle?: React.CSSProperties;
  onUpdate?: (update: Partial<Character>) => void;
}

export function CharacterCard({ character, containerStyle, onUpdate }: CharacterCardProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { updateCharacter } = useAdminCharacterStore();

  const handleUpdate = (delta: Partial<Character>) => {
    updateCharacter(character.id!, delta);
    onUpdate?.(delta);
  };

  const glassTile = {
    background: "rgba(30, 20, 60, 0.45)",
    backdropFilter: "blur(8px) saturate(120%)",
    WebkitBackdropFilter: "blur(8px) saturate(120%)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    padding: 10,
  } as const;

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        ...containerStyle,
      }}
    >
      <Stack gap={12}>
        {/* Main Row */}
        <Box
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 12,
          }}
        >
          {/* Left: Meta */}
          <Box style={{ flex: 1, minWidth: 120 }}>
            <CharacterMetaBox
              character={character}
              containerStyle={glassTile}
            />
          </Box>

          {/* Middle: HP & Inspiration */}
          <Box style={{ flex: 1, minWidth: 120 }}>
            <Paper style={glassTile}>
              <Stack align="center" gap={12}>
                <HpRing
                  character={character}
                />
                <InspirationBox
                  value={character.inspiration}
                  onClick={() => handleUpdate({ inspiration: character.inspiration + 1 })}
                />
              </Stack>
            </Paper>
          </Box>

          {/* Right: Currencies */}
          <Box style={{ flex: 1, minWidth: 120 }}>
            <CharacterCurrencyArea
              character={character}
              containerStyle={{
                ...glassTile,
                maxHeight: 200,
                overflowY: "auto",
              }}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
}
