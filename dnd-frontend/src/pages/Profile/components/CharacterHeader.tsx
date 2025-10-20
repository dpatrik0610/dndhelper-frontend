import { Paper, Title, Group, Badge, Grid, Text, Stack} from "@mantine/core";
import { IconSkull, IconSword } from "@tabler/icons-react";
import { StatBox } from "./StatBox";
import ReloadButton from "./ReloadButton";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useMediaQuery } from "@mantine/hooks";
import { SectionColor } from "../../../types/SectionColor";

export function CharacterHeader() {
  const character = useCharacterStore((state) => state.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const statBoxStyle: React.CSSProperties = {
    maxWidth: isMobile? "100%" : "30%",
    minWidth: "25%",
    width: isMobile? "100%" : "30%",
  };

  return (
<Paper p="md" withBorder mb="md" style={{ background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)" }}>
  <Grid align="start" justify="space-between">
    {/* LEFT STACK — Profile Info */}
    <Grid.Col span={{ base: 12, sm: 6 }}>
      <Stack lts="xs">
        <Title order={1} c="white">{character.name} {character.isDead && <Badge size="md" color="red" leftSection={<IconSkull size={16} />}>Deceased</Badge>}</Title>
        <Text c="white">ID: {character.id}</Text>
        <Group gap="sm">
          <Badge size="lg" w={isMobile? "100%" : undefined} color="blue"variant="gradient" gradient={{from: SectionColor.Yellow, to: SectionColor.Dark, deg: 45}}>{character.characterClass}</Badge>
          <Badge size="lg" w={isMobile? "100%" : undefined} color="teal" variant="gradient" gradient={{from: SectionColor.Grape, to: SectionColor.Dark, deg: 45}}>{character.race}</Badge>
          <Badge size="lg" w={isMobile? "100%" : undefined} color="orange" variant="outline" style={{ borderColor: "white", color: "white" }}>{character.alignment}</Badge>
        </Group>
      </Stack>
    </Grid.Col>

    {/* RIGHT STACK — Stat Boxes */}
    <Grid.Col span={{ base: 12, sm: 6 }}>
      <Stack lts="xs" align={isMobile ? "center" : "flex-end"}>
        <StatBox label="Inspirations" value={character.inspiration} size="xs" background="dark" color="green" style={statBoxStyle}/>
        <StatBox label="Level" value={character.level} size="xs" background="dark" color="white" style={statBoxStyle}/>
        <StatBox label="Experience" value={character.experience} size="xs" background="dark" color="red" style={statBoxStyle}/>
      </Stack>
    </Grid.Col>
  </Grid>
  <ReloadButton/>
</Paper>
  );
}
