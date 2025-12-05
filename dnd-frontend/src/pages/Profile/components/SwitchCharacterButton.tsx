import { ActionIcon, Group, Text, Tooltip } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useState } from "react";
import { CharacterSelectModal } from "../../Home/components/CharacterSelectModal";
import type { Character } from "../../../types/Character/Character";
import { SectionColor } from "../../../types/SectionColor";
import CustomBadge from "../../../components/common/CustomBadge";

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
          variant="outline"
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
