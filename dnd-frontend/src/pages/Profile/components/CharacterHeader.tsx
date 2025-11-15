import {
  Paper,
  Title,
  Badge,
  Grid,
  Text,
  Stack,
  Progress,
  Box,
  Group,
} from "@mantine/core";
import { IconSkull } from "@tabler/icons-react";
import ReloadButton from "./ReloadButton";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useMediaQuery } from "@mantine/hooks";
import { CharacterCurrencyArea } from "../../../components/CharacterCurrencyArea";

export function CharacterHeader() {
  const character = useCharacterStore((s) => s.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");


  return (
    <Paper
    mb={15}
      p="lg"
      radius="sm"
      withBorder
      style={{
        background: "linear-gradient(165deg, rgba(10,0,30,0.45), rgba(60,0,20,0.40))",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px) saturate(130%)",
        boxShadow: "0 0 18px rgba(0,0,0,0.55)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Arcane Glow Corners */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,200,120,0.08), transparent 60%)," +
            "radial-gradient(circle at 100% 0%, rgba(120,200,255,0.08), transparent 60%)," +
            "radial-gradient(circle at 100% 100%, rgba(255,120,150,0.07), transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {/* TOP BAR */}

      <Group justify="space-between" wrap="wrap">

      </Group>
      <Grid align="stretch">

        {/* LEFT: Portrait + Basics */}
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <Group
            align={isMobile ? "center" : "flex-start"}
            justify={isMobile ? "center" : "flex-start"}
            gap={isMobile ? "sm" : "md"}
            dir={isMobile ? "column" : "row"}
          >
            {/* Identity */}
            <Stack
              gap={6}
              style={{
                flex: 1,
                textAlign: isMobile ? "center" : "left",
                width: "100%",
              }}
            >
              <Title order={2} c="white" lh={1.1} style={{ textShadow: "0 0 6px rgba(255,255,255,0.3)" }}>
                {character.name}
                {character.hitPoints <= 0 && (
                  <Badge
                  size="sm"
                  color="red"
                  leftSection={<IconSkull size={12} />}
                  ml={8}
                  variant="filled"
                  radius="sm"
                  >
                    Dead
                  </Badge>
                )}
              </Title>

              <Group
                gap={10}
                mt={10}
                mb={10}
                wrap="wrap"
                justify={isMobile ? "center" : "flex-start"}
              >
                <Badge variant="gradient" gradient={{ from: "yellow", to: "grape" }}>
                  {character.characterClass}
                </Badge>
                <Badge variant="gradient" gradient={{ from: "teal", to: "blue" }}>
                  {character.race}
                </Badge>
                <Badge color="gray" variant="outline">
                  {character.alignment}
                </Badge>
                
              </Group>

              {/* Currency */}
              {character.currencies && <CharacterCurrencyArea />}

              {/* HP Bar */}
              <Box>
                <Text size="xs" c="red.4" mb={4}>
                  HP: {character.hitPoints} / {character.maxHitPoints}
                </Text>
                <Progress
                  value={(character.hitPoints / character.maxHitPoints) * 100}
                  color="red"
                  radius="xl"
                  size="lg"
                  striped
                />
              </Box>
            </Stack>
          </Group>
        </Grid.Col>

        {/* RIGHT: Stats */}
        <Grid.Col span={{ base: 12, sm: 5 }}>
          <Stack
            align={isMobile ? "" : "flex-end"}
            mt={isMobile ? "sm" : 0}
            gap={10}
          >
            <RPGStat label="Level" value={character.level} color="#ffe38f" />
            <RPGStat label="Experience" value={character.experience} color="#ff9191" />
            <RPGStat label="Inspiration" value={character.inspiration} color="#8fffe0" />
            <ReloadButton />
          </Stack>
        </Grid.Col>

      </Grid>
    </Paper>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RPGStat({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <Box
      style={{
        padding: "5px 0px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 2px ${color}55`,
        textAlign: "center",
        minWidth: 100,
      }}
    >
      <Text size="xs" c={color} fw={700} tt="uppercase" lts={1}>
        {label}
      </Text>
      <Text size="lg" fw={500} c="white">
        {value}
      </Text>
    </Box>
  );
}
