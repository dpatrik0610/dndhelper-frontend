import { useEffect, useState } from "react";
import { Box, Group, Text, Badge, Title, Button, Grid } from "@mantine/core";
import { IconStar, IconUser, IconBackpack } from "@tabler/icons-react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterSelectModal } from "./CharacterSelectModal";
import { CharacterHeader } from "./components/CharacterHeader";
import { CombatStats } from "./components/CombatStats";
import { AbilityScores } from "./components/AbilityScores";
import { ExtraInfo } from "./components/ExtraInfo";
import { SpellBlock } from "./components/SpellBlock";
import type { Character } from "../../types/Character/Character";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";

export default function CharacterProfile() {
  const { character, characters, setCharacter } = useCharacterStore();
  const [modalOpened, setModalOpened] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
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

      <Box
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 999,
        }}
      >
        <Button
          color="transparent"
          onClick={() => setModalOpened(true)}
          size="md"
          radius="xl"
          style={{
            background: isMobile? '0 4px 10px rgba(32, 32, 32, 0.62)' : 'rgba(0, 0, 0, 0.25)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.47)',
            border: '1px solid rgba(0, 0, 0, 0.23)',
            transition: 'all 0.3s ease',
            width: isMobile ? 50: 'auto',
            padding: isMobile ? 0 : undefined,
            minWidth: isMobile ? 50 : undefined,
          }}
        >
          <Grid gutter={0} >
            <Grid.Col span={2} mr={isMobile ? 0 : 5}>{isMobile ? <IconUser size={24} /> : <IconUser size={18} />}</Grid.Col>
            <Grid.Col span={6}>{!isMobile && 'Characters'}</Grid.Col>
          </Grid>
        </Button>
      </Box>

      {/* Only show character details if a character is selected */}
      {character && (
        <Box 
        maw={isMobile ? "100%" : 900}
        p = {isMobile? "": "md"}
        m = {isMobile? "": "0 auto"}
        
        >
          <Group justify="space-between" mb="md">
            <Title order={2} mb="md" mt="xs">
              Character Profile
              <Badge ml="sm" color="yellow" variant="light" leftSection={<IconStar size={12} />}>
                BETA
              </Badge>
            </Title>
            <Button
                leftSection={<IconBackpack size={16} />}
                onClick={() => navigate("/inventory")}
                variant="gradient"
                gradient={{ from: "violet", to: "cyan", deg: 45 }}
                size="sm"
                radius="md"
                style={{ marginLeft: "1rem", alignSelf: "center" }}
              >
                Inventories
            </Button>
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
