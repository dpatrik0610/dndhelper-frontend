import { Paper, Title, Group, Badge, Grid, Text} from "@mantine/core";
import { IconSkull, IconSword } from "@tabler/icons-react";
import { StatBox } from "./StatBox";
import ReloadButton from "./ReloadButton";
import type { Character } from "../../../types/Character/Character";

interface CharacterHeaderProps {
  character : Character;
}

export function CharacterHeader({
  character
}: CharacterHeaderProps) {
  return (
    <Paper p="xl" withBorder mb="md" style={{ background: "linear-gradient(135deg, #667eea48 0%, #764ba23b 100%)", }} >
      <Title order={1} c="white" mb="xs">
        {`${character.name} `}             
        {character.isDead ? (
              <Badge size="md" color="red" leftSection={<IconSkull size={16} />}>
                Deceased
              </Badge>
            ) : null}
      </Title>
      <Text c="white" mb="md">ID: {character.id}</Text>

      {/* Split layout */}
      <Grid align="center">
        {/* LEFT HALF — Badges */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Group gap="sm">
            <Badge size="lg" color="blue" leftSection={<IconSword size={16} />}>
              {character.characterClass}
            </Badge>
            <Badge size="lg" color="teal">
              {character.race}
            </Badge>
            <Badge size="lg" color="orange" variant="outline" style={{ borderColor: "white", color: "white" }} >
              {character.alignment}
            </Badge>
          </Group>
        </Grid.Col>

        {/* RIGHT HALF — Level & XP */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Group justify="flex-end" gap="md">
            <StatBox label="Background" value={character.background} size="xs" background="dark" color={"cyan"}/>
            <StatBox label="Inspirations" value={character.inspiration} size="xs" background="dark" color="green"/>
            <StatBox label="Level" value={character.level} size="xs" background="dark" color="white"/>
            <StatBox label="Experience" value={character.experience} size="xs" background="dark" color="red"/>
          </Group>
        </Grid.Col>
      </Grid>
      <ReloadButton characterId={character.id!}/>
    </Paper>
  );
}
