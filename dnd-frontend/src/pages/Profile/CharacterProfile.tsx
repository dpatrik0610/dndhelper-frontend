import { useEffect, useState } from "react";
import { Box, Group, Text, Badge, Title } from "@mantine/core";
import { IconStar } from "@tabler/icons-react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterSelectModal } from "./CharacterSelectModal";
import { CharacterHeader } from "./components/CharacterHeader";
import { CombatStats } from "./components/CombatStats";
import { AbilityScores } from "./components/AbilityScores";
import { ExtraInfo } from "./components/ExtraInfo";
import { SpellBlock } from "./components/SpellBlock";
import type { Character } from "../../types/Character/Character";

export default function CharacterProfile() {
  const { character, characters, setCharacter } = useCharacterStore();
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    if (!character) setModalOpened(true);
  }, [character]);

  const handleSelect = (char: Character) => {
    setCharacter(char);
  };

  return (
    <>
      <CharacterSelectModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        characters={characters}
        onSelect={handleSelect}
      />

      {/* Only show character details if a character is selected */}
      {character && (
        <Box style={{ maxWidth: 900, margin: "0 auto" }} p="md">
          <Group justify="space-between" mb="md">
            <Title order={2} mb="md" mt="xs">
              Character Profile
              <Badge ml="sm" color="yellow" variant="light" leftSection={<IconStar size={12} />}>
                BETA
              </Badge>
            </Title>
            {character.ownerId && (
              <Text size="xs" c="dimmed">
                Owner ID: {character.ownerId}
              </Text>
            )}
          </Group>

          <CharacterHeader character={character} />
          <CombatStats character={character} />
          <SpellBlock character={character} />
          <AbilityScores
            strength={character.abilityScores.str}
            dexterity={character.abilityScores.dex}
            constitution={character.abilityScores.con}
            intelligence={character.abilityScores.int}
            wisdom={character.abilityScores.wis}
            charisma={character.abilityScores.cha}
            strSave={character.savingThrows.strength}
            dexSave={character.savingThrows.dexterity}
            conSave={character.savingThrows.constitution}
            intSave={character.savingThrows.intelligence}
            wisSave={character.savingThrows.wisdom}
            chaSave={character.savingThrows.charisma}
          />
          <ExtraInfo character={character} />
        </Box>
      )}
    </>
  );
}
