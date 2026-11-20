import { Tooltip } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useCharacterList, useCharacterCoreActions } from "@store/character/characterSelectors";
import { useState } from "react";
import { CharacterSelectModal } from "@features/home/components/CharacterSelectModal";
import type { Character } from "@appTypes/Character/Character";
import fun from "./HeaderFun.module.css";

export function SwitchCharacterButton() {
  const characters = useCharacterList();
  const { setCharacter } = useCharacterCoreActions();
  const canSwitch = (characters?.length ?? 0) > 1;
  const [opened, setOpened] = useState(false);

  if (!canSwitch) return null;

  const handleSelect = (char: Character) => {
    setCharacter(char);
    setOpened(false);
  };

  return (
    <>
      <Tooltip label="Switch Character" withArrow>
        <button type="button" className={fun.switchBtn} onClick={() => setOpened(true)} aria-label="Switch character">
          <IconArrowsExchange size={18} aria-hidden />
        </button>
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
