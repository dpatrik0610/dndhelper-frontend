import { Tooltip, Box } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useCharacterList, useCharacterCoreActions } from "@store/character/characterSelectors";
import { useState } from "react";
import { CharacterSelectModal } from "@features/home/components/CharacterSelectModal";
import type { Character } from "@appTypes/Character/Character";

export function SwitchCharacterButton() {
  const characters = useCharacterList();
  const { setCharacter } = useCharacterCoreActions();
  const canSwitch = (characters?.length ?? 0) > 1;
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!canSwitch) return null;

  const handleSelect = (char: Character) => {
    setCharacter(char);
    setOpened(false);
  };

  return (
    <>
      <Tooltip label="Switch Character" withArrow>
        <Box
          onClick={() => setOpened(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "4px",
            opacity: hovered ? 1 : 0.45,
            transform: hovered ? "scale(1.15) rotate(180deg)" : "scale(1) rotate(0deg)",
            transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <IconArrowsExchange
            size={18}
            color="var(--theme-color-accent-primary, #f59e0b)"
            style={{
              filter: hovered ? "drop-shadow(0 0 6px var(--theme-color-accent-primary, #f59e0b))" : "none",
              transition: "filter 0.25s ease",
            }}
          />
        </Box>
      </Tooltip>

      <CharacterSelectModal
        opened={opened}
        onClose={() => setOpened(false)}
        characters={characters}
        onSelect={handleSelect}
      />
    </>
  );
}
