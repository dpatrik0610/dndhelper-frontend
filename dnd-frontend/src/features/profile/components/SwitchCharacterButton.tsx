import { Tooltip } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useCharacterStore } from "@store/useCharacterStore";
import { useState } from "react";
import { CharacterSelectModal } from "@features/home/components/CharacterSelectModal";
import type { Character } from "@appTypes/Character/Character";
import { SectionColor } from "@appTypes/SectionColor";
import CustomBadge from "@components/common/CustomBadge";

export function SwitchCharacterButton() {
  const { characters, setCharacter } = useCharacterStore();
  const canSwitch = (characters?.length ?? 0) > 1;
  const [opened, setOpened] = useState(false);

  if (!canSwitch) return null;

  const handleSelect = (char: Character) => {
    setCharacter(char);
    setOpened(false);
  };

  return (
    <>
      <Tooltip label="Switch character" withArrow>
          <CustomBadge 
          label={"Swap"} 
          variant="light"
          icon={<IconArrowsExchange 
            size={16} 
            style={{ cursor: "pointer" }}/>
          }
          color={SectionColor.Grape}
          onClick={() => setOpened(true)}
          />
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
