import type { Character } from "@appTypes/Character/Character";
import { Box, Text } from "@mantine/core";
import type { CSSProperties } from "react";

interface Props {
  character: Pick<Character, "characterClass" | "race" | "alignment">;
  containerStyle?: CSSProperties;
}

export function CharacterMetaBox({ character, containerStyle }: Props) {
  if (!character) return null;

  const { characterClass, race, alignment } = character;

  return (
    <Box
      style={{
        height: "100%",
        padding: "8px",
        borderRadius: 10,
        background: "linear-gradient(135deg, rgba(120,200,255,0.12), rgba(80,120,255,0.1))",
        border: "1px solid rgba(120,180,255,0.25)",
        boxShadow: "0 6px 12px rgba(0,0,0,0.25)",
        ...containerStyle,
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          height: "100%",
        }}
      >
        {[
          {
            label: "Class",
            value: characterClass,
            bg: "linear-gradient(135deg, rgba(255,210,120,0.18), rgba(255,170,90,0.14))",
          },
          {
            label: "Race",
            value: race,
            bg: "linear-gradient(135deg, rgba(120,255,200,0.16), rgba(80,200,160,0.14))",
          },
          {
            label: "Alignment",
            value: alignment,
            bg: "linear-gradient(135deg, rgba(180,190,255,0.16), rgba(120,140,210,0.14))",
          },
        ].map((item) => (
          <Box
            key={item.label}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 8,
              background: item.bg,
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Text size="xs" fw={700} tt="uppercase" c="rgba(255,255,255,0.85)" mb={2}>
              {item.label}
            </Text>
            <Text size="sm" fw={800} c="white" lineClamp={1}>
              {item.value}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
