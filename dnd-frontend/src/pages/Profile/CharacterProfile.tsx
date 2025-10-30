import { Box, Group, Text, Badge, Title, Button } from "@mantine/core";
import { IconStar, IconBackpack } from "@tabler/icons-react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterHeader } from "./components/CharacterHeader";
import { CombatStats } from "./components/CombatStats";
import { AbilityScores } from "./components/AbilityScores";
import { ExtraInfo } from "./components/ExtraInfo";
import { SpellBlock } from "./components/SpellBlock";
import { useNavigate } from "react-router-dom";
import { ActionBar } from "./components/ActionsBar";
import { SectionColor } from "../../types/SectionColor";
import { SkillsPanel } from "./components/SkillsPanel";
import { ConditionsPanel } from "./components/ConditionsPanel";

export default function CharacterProfile() {
  const character  = useCharacterStore((state) => state.character);
  const navigate = useNavigate();

  if (!character) {
    return (
      <Box p="md" m="0 auto" maw={600}>
        <Text size="lg" c="dimmed">
          No character selected. Please select a character from the Home page.
        </Text>
      </Box>
    );
  }

  return (
    <Box p="md" m="0 auto" maw={900}>
      <Group justify="space-between" mb="md">
        <Title order={2} mb="md" mt="xs">
          Character Profile
          <Badge
            ml="sm"
            color="yellow"
            variant="light"
            leftSection={<IconStar size={12} />}
          >
            BETA
          </Badge>
        </Title>
        <Button
            leftSection={<IconBackpack size={20} />}
            onClick={() => navigate("/inventory")}
            variant="gradient"
            gradient={{ from: SectionColor.Grape, to: SectionColor.Orange, deg: 45 }}
            size="sm"
            radius="md"
        >
            Inventories
        </Button>

        {character.ownerId && (
          <Text size="xs" c="dimmed">
            Owner ID: {character.ownerId}
          </Text>
        )}
      </Group>

      <ActionBar/>
      <CharacterHeader/>
      <ConditionsPanel />
      <AbilityScores/>
      <SkillsPanel />
      <CombatStats/>
      <SpellBlock/>
      <ExtraInfo/>
    </Box>
  );
}
