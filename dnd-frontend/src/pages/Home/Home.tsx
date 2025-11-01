import { useEffect, useState } from "react";
import {
  Card,
  Group,
  Text,
  Title,
  Grid,
  Button,
  Stack,
  Badge,
  Divider,
  Avatar,
  Box,
  Progress,
  Tooltip,
  Paper,
} from "@mantine/core";
import {
  IconUser,
  IconBook,
} from "@tabler/icons-react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterSelectModal } from "./components/CharacterSelectModal";
import { useNavigate } from "react-router-dom";
import { getRecentEvents } from "../../services/eventService";
import type { Event } from "../../types/Event";
import { RecentEventsSection } from "./components/RecentEvents";
import type { Character } from "../../types/Character/Character";
import { useMediaQuery } from "@mantine/hooks";
import { useAuthStore } from "../../store/useAuthStore";
import { CharacterSelectButton } from "./components/CharacterSelectButton";

export default function Home() {
  const isAdmin = useAuthStore.getState().roles.includes("Admin");
  const navigate = useNavigate();
  const { characters, setCharacter } = useCharacterStore();
  const character = useCharacterStore((state) => state.character);

  const [modalOpened, setModalOpened] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const quickNavigations = [
    { label: "Spellbook", icon: <IconBook />, path: "/spells" },
    // { label: "Quests", icon: <IconSword />, path: "/quests" },
  ];

  // === Palette ===
  const palette = {
    accent: "#b197fc",
    border: "rgba(140, 120, 255, 0.3)",
    bg: "rgba(30, 30, 60, 0.4)",
    cardBg: "rgba(45, 35, 85, 0.5)",
    hoverBg: "rgba(180, 150, 255, 0.08)",
    textMain: "#f0f0ff",
    textDim: "rgba(220, 220, 255, 0.65)",
  };

  // Random flavor quotes
  const quotes = [
    "“Fortune favors the bold... and the prepared.” — Guild Proverb",
    "“Every blade remembers the hand that forged it.”",
    "“Stars fall not in silence, but to light the path of explorers.”",
    "“Knowledge is the sharpest weapon of them all.”",
    "“Magic is not power — it’s the art of will given form.”",
  ];

  useEffect(() => setQuote(quotes[Math.floor(Math.random() * quotes.length)]), []);

  useEffect(() => {
    getRecentEvents()
      .then((data: Event[]) => setEvents(data))
      // .catch(() =>
      //   notifications.show({
      //     title: "Error",
      //     message: "Failed to load recent events.",
      //     color: "red",
      //   })
      // )
      .finally(() => setLoading(false));
  }, []);

  const handleSelectCharacter = (char: Character) => {
    setCharacter(char);
    setModalOpened(false);
  };

  return (
    <Stack 
    w  = {isMobile? "100%" : "75%"} 
    m  = {isMobile? "0 auto": "20 auto" }
    p  = {isMobile? "0"  : "md"  }>
      {/* === Character Selection Modal === */}
      <CharacterSelectModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        characters={characters}
        onSelect={handleSelectCharacter}
      />
      <CharacterSelectButton setModalOpened={setModalOpened}/>

      {/* === Header === */}
      <Paper
        radius="md"
        p="lg"
        withBorder
        style={{
          background: palette.bg,
          borderColor: palette.border,
          backdropFilter: "blur(8px)",
          color: palette.textMain,
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} style={{ color: palette.textMain }}>
              Welcome back, {character?.name ?? "Adventurer"}!
            </Title>
            <Text size="sm" fs="italic" c={palette.textDim}>
              {quote}
            </Text>
          </div>

          <Badge
            variant="gradient"
            gradient={{ from: "grape", to: "violet" }}
            size="lg"
          >
            {character ? "Active Character" : "No Character Selected"}
          </Badge>
        </Group>
      </Paper>

      {/* === Character Overview === */}
      {character && (
        <Card
          shadow="lg"
          radius="md"
          withBorder
          p="lg"
          style={{
            background: palette.cardBg,
            borderColor: palette.border,
            color: palette.textMain,
          }}
        >
          <Group justify="space-between" align="center">
            <Group>
              <Avatar radius="xl" size="lg" color="violet">
                {character.name.charAt(0)}
              </Avatar>
              <div>
                <Text fw={700} c={palette.textMain}>
                  {character.name}
                </Text>
                <Text size="sm" c={palette.textDim}>
                  Level {character.level} {character.race}{" "}
                  {character.characterClass}
                </Text>
              </div>
            </Group>

            <Button
              leftSection={<IconUser size={16} />}
              onClick={() => navigate("/profile")}
              variant="gradient"
              gradient={{ from: "violet", to: "grape" }}
            >
              View Profile
            </Button>
          </Group>

          <Divider my="md" color={palette.border} />

          <Group grow>
            <Box>
              <Text size="xs" c={palette.textDim}>
                Experience
              </Text>
              <Progress
                value={(character.experience ?? 0) % 100}
                color="violet"
                radius="md"
              />
            </Box>

            <Box>
              <Text size="xs" c={palette.textDim}>
                Health
              </Text>
              <Progress
                value={(character.hitPoints / character.maxHitPoints) * 100}
                color="red"
                radius="md"
              />
            </Box>
          </Group>
        </Card>
      )}

      {/* === Quick Actions === */}
      <Grid mt="lg">
        {quickNavigations.map((action) => (
          <Grid.Col key={action.label} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Tooltip label={`Open ${action.label}`} withArrow>
              <Card
                withBorder
                shadow="xl"
                radius="lg"
                onClick={() => navigate(action.path)}
                style={{
                  cursor: "pointer",
                  backgroundColor: palette.cardBg,
                  borderColor: palette.border,
                  transition: "transform 0.15s ease, background-color 0.15s ease",
                  color: palette.textMain,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = palette.hoverBg)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = palette.cardBg)
                }
              >
                <Group>
                  <Badge
                    color="violet"
                    radius="sm"
                    variant="light"
                    style={{ backgroundColor: "rgba(150, 120, 255, 0.15)" }}
                  >
                    {action.icon}
                  </Badge>
                  <Text fw={500}>{action.label}</Text>
                </Group>
              </Card>
            </Tooltip>
          </Grid.Col>
        ))}
      </Grid>
      
      {/* === Recent Events === */}
      <RecentEventsSection events={events} loading={loading} />
    </Stack>
  );
}
