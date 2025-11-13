import { Paper, Title, Badge, Grid, Text, Stack, Flex, Progress, Box} from "@mantine/core";
import { IconSkull } from "@tabler/icons-react";
import { StatBox } from "./StatBox";
import ReloadButton from "./ReloadButton";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useMediaQuery } from "@mantine/hooks";
import { SectionColor } from "../../../types/SectionColor";
import { CharacterCurrencyArea } from "../../../components/CharacterCurrencyArea";
import { getCampaignById } from "../../../services/campaignService";
import { useAuthStore } from "../../../store/useAuthStore";
import { useEffect, useState } from "react";

export function CharacterHeader() {
  const isAdmin = useAuthStore.getState().roles?.includes("Admin");
  const character = useCharacterStore((state) => state.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  const statBoxStyle: React.CSSProperties = {
    maxWidth: isMobile? "100%" : "30%",
    minWidth: "25%",
    width: isMobile? "100%" : "30%",
  };

  function useCampaignName(campaignId: string | null | undefined) {
    const [name, setName] = useState("Loading...");
    const token = useAuthStore.getState().token!;

    useEffect(() => {
      if (!campaignId) {
        setName("No Campaign");
        return;
      }

      (async () => {
        const data = await getCampaignById(campaignId, token);
        setName(data?.name ?? "Unknown Campaign");
      })();
    }, [campaignId, token]);

    return name;
  }


  return (
<Paper p="md" withBorder mb="md" style={{ background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)" }}>
  <Text c="dimmed" size="sm"><strong>Character:</strong> {character.id}</Text>
  {isAdmin ?? <Text c="dimmed" size="sm"><strong>Campaign:</strong> {character.campaignId} ( {useCampaignName(character.campaignId)} )</Text>}
  <Grid align="start" justify="space-between">
    {/* LEFT STACK — Profile Info */}

    <Grid.Col span={{ base: 12, sm: 6 }}>
      <Stack lts="xs" gap={10}>
        <Title order={1} c="white">{character.name} {character.isDead && <Badge size="md" color="red" leftSection={<IconSkull size={16} />}>Deceased</Badge>}</Title>
              
        <Flex gap="sm" lts="xs" align="center" justify={isMobile ? "center" : "flex-start"} direction={isMobile ? "column" : "row"}>
          <Badge size="lg" w={isMobile ? "100%" : undefined} color="blue" variant="gradient" gradient={{from: SectionColor.Yellow, to: SectionColor.Dark, deg: 45}}>{character.characterClass}</Badge>
          <Badge size="lg" w={isMobile ? "100%" : undefined} color="teal" variant="gradient" gradient={{from: SectionColor.Grape, to: SectionColor.Dark, deg: 45}}>{character.race}</Badge>
          <Badge size="lg" w={isMobile ? "100%" : undefined} color="orange" variant="outline" style={{ borderColor: "white", color: "white" }}>{character.alignment}</Badge>
        </Flex>

        <Stack mt={15}>
          {character.currencies && 
          <CharacterCurrencyArea />
          }
          <Box>
            <Text size="xs" c={SectionColor.Red} mb={4}>
              Health: {character.hitPoints} / {character.maxHitPoints}
            </Text>
            <Progress
              value={(character.hitPoints / character.maxHitPoints) * 100}
              color="red"
              radius="md"
            />
          </Box>
        </Stack>
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
