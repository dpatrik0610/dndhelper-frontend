import {
  Paper,
  Title,
  Badge,
  Grid,
  Text,
  Stack,
  Box,
  Group,
} from "@mantine/core";
import { IconSkull } from "@tabler/icons-react";
import ReloadButton from "./ReloadButton";
import { useCharacterStore } from "@store/useCharacterStore";
import { useMediaQuery } from "@mantine/hooks";
import { CharacterCurrencyArea } from "@components/CharacterCurrencyArea";
import { showNotification } from "@components/Notification/Notification";
import { HpRing } from "./HpRing";
import { SwitchCharacterButton } from "./SwitchCharacterButton";

export function CharacterHeader() {
  const character = useCharacterStore((s) => s.character)!;
  const isMobile = useMediaQuery("(max-width: 768px)");

  async function handleUseInspiration() {
    const current = useCharacterStore.getState().character;
    if (!current) return;
    if (!current.inspiration || current.inspiration <= 0) return;

    const confirmed = window.confirm(
      "Use one point of Inspiration?"
    );
    if (!confirmed) return;

    const newInspiration = current.inspiration - 1;

    useCharacterStore.getState().updateCharacter({inspiration: newInspiration});

    showNotification({
      title: "Inspiration used",
      message: "You spent 1 Inspiration point.",
      color: "blue",
    });
  }

  return (
    <Paper
      mb={15}
      p="lg"
      radius="sm"
      withBorder
      style={{
        background:
          "linear-gradient(165deg, rgba(10,0,30,0.45), rgba(60,0,20,0.40))",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(12px) saturate(130%)",
        boxShadow: "0 0 18px rgba(0,0,0,0.55)",
        position: "relative",
        overflow: "hidden",
      }}
    >
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

      <Grid align="stretch">
        {/* LEFT: Portrait + Basics */}
        <Grid.Col span={{ base: 12, sm: 7 }}>
          <Group
            align={isMobile ? "center" : "flex-start"}
            justify={isMobile ? "center" : "flex-start"}
            gap={isMobile ? "sm" : "md"}
            dir={isMobile ? "column" : "row"}
          >
            <Stack
              gap={6}
              style={{
                flex: 1,
                textAlign: isMobile ? "center" : "left",
                width: "100%",
              }}
            >
              <Group align="center" gap="xs" justify={isMobile ? "center" : "flex-start"}>
                <Title
                  order={2}
                  c="white"
                  lh={1.1}
                  style={{ textShadow: "0 0 6px rgba(255,255,255,0.3)" }}
                >
                  {character.name}
                </Title>
                <SwitchCharacterButton />
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
              </Group>

              <Group
                gap={10}
                mt={10}
                mb={10}
                wrap="wrap"
                justify={isMobile ? "center" : "flex-start"}
              >
                <Badge
                  variant="gradient"
                  gradient={{ from: "yellow", to: "grape" }}
                >
                  {character.characterClass}
                </Badge>
                <Badge
                  variant="gradient"
                  gradient={{ from: "teal", to: "blue" }}
                >
                  {character.race}
                </Badge>
                <Badge color="gray" variant="outline">
                  {character.alignment}
                </Badge>
              </Group>
              <Grid.Col span={{ base: 12, sm: 5 }}>
                <HpRing
                  currentHp={character.hitPoints}
                  maxHp={character.maxHitPoints}
                  tempHp={character.temporaryHitPoints ?? 0}
                />
              </Grid.Col>
              {/* Currency */}
              {character.currencies && <CharacterCurrencyArea />}

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
            <RPGStat
              label="Experience"
              value={character.experience}
              color="#ff9191"
            />
            <RPGStat
              label="Inspiration"
              value={character.inspiration}
              color="#8fffe0"
              onClick={handleUseInspiration}
            />
            <ReloadButton />
          </Stack>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RPGStat({
  label,
  value,
  color,
  onClick,
}: {
  label: string;
  value: any;
  color: string;
  onClick?: () => void;
}) {
  const clickable = !!onClick && label === "Inspiration";

  return (
    <Box
      onClick={clickable ? onClick : undefined}
      style={{
        padding: "5px 0px",
        borderRadius: 8,
        background: "rgba(255,255,255,0.05)",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 2px ${color}55`,
        textAlign: "center",
        minWidth: 100,
        cursor: clickable ? "pointer" : "default",
        transition: "transform 120ms ease, box-shadow 120ms ease",
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
