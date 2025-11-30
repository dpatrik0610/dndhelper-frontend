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
  Avatar,
  Tooltip,
  Paper,
} from "@mantine/core";
import { IconUser, IconBook, IconDashboard, IconUserPlus } from "@tabler/icons-react";
import { useCharacterStore } from "../../store/useCharacterStore";
import { CharacterSelectModal } from "./components/CharacterSelectModal";
import { useNavigate } from "react-router-dom";
import type { Character } from "../../types/Character/Character";
import { useMediaQuery } from "@mantine/hooks";
import { useAuthStore } from "../../store/useAuthStore";
import CustomBadge from "../../components/common/CustomBadge";
import { ConnectionStatus } from "../../components/ConnectionStatus";

export default function Home() {
  const isAdmin = useAuthStore.getState().roles.includes("Admin");
  const navigate = useNavigate();
  const { characters, setCharacter } = useCharacterStore();
  const character = useCharacterStore((state) => state.character);

  const [modalOpened, setModalOpened] = useState(false);
  const [quote, setQuote] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const quickNavigations = [
    { label: "Spellbook", icon: <IconBook />, path: "/spells" },
    isAdmin
      ? { label: "Admin Dashboard", icon: <IconDashboard />, path: "/dashboard" }
      : null,
  ];

  const palette = {
    accent: "#b197fc",
    border: "rgba(140, 120, 255, 0.3)",
    bg: "rgba(30, 30, 60, 0.4)",
    cardBg: "rgba(45, 35, 85, 0.5)",
    hoverBg: "rgba(180, 150, 255, 0.08)",
    textMain: "#f0f0ff",
    textDim: "rgba(220, 220, 255, 0.65)",
  };

  const quotes = [
    "\"Fortune favors the bold... and the prepared.\" — Guild Proverb",
    "\"Every blade remembers the hand that forged it.\"",
    "\"Stars fall not in silence, but to light the path of explorers.\"",
    "\"Knowledge is the sharpest weapon of them all.\"",
    "\"Magic is not power — it's the art of will given form.\"",
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  // Auto-select single character
  useEffect(() => {
    if (!character && characters.length === 1) {
      setCharacter(characters[0]);
    }
  }, [characters, character, setCharacter]);

  const handleSelectCharacter = (char: Character) => {
    setCharacter(char);
    setModalOpened(false);
  };

  return (
    <Stack
      w={isMobile ? "100%" : "75%"}
      m={isMobile ? "0 auto" : "20 auto"}
      p={isMobile ? "0" : "md"}
    >
      <CharacterSelectModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        characters={characters}
        onSelect={handleSelectCharacter}
      />

      {/* Header with SignalR Status */}
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

          <Stack gap="xs" align="flex-end">
            <Badge
              variant="gradient"
              gradient={{ from: "grape", to: "violet" }}
              size="lg"
            >
              {character ? "Active Character" : "No Character Selected"}
            </Badge>
            <ConnectionStatus />
          </Stack>
        </Group>
      </Paper>

      {/* Character Overview / Selector */}
      {character ? (
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
                  Level {character.level} {character.race} {character.characterClass}
                </Text>
              </div>
            </Group>

            <Group gap="md">
              <Button
                variant="outline"
                onClick={() => setModalOpened(true)}
                style={{
                  borderColor: palette.accent,
                  boxShadow: "0 0 5px rgba(177, 151, 252, 0.9)",
                  transition: "box-shadow 0.2s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 8px rgba(177, 151, 252, 1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 5px rgba(177, 151, 252, 0.9)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Switch Character
              </Button>

              <Button
                leftSection={<IconUser size={16} />}
                onClick={() => navigate("/profile")}
                variant="gradient"
                gradient={{ from: "violet", to: "grape" }}
                bg="transparent"
                styles={{
                  root: {
                    boxShadow: "0 0 8px rgba(177, 151, 252, 0.8)",
                  },
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 8px rgba(177, 151, 252, 1)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 5px rgba(177, 151, 252, 0.9)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                View Profile
              </Button>
            </Group>
          </Group>
        </Card>
      ) : characters.length > 0 ? (
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
            <div>
              <Text fw={700} c={palette.textMain}>
                No character selected
              </Text>
              <Text size="sm" c={palette.textDim}>
                {isAdmin
                  ? "You have multiple characters available. Select one to manage or play."
                  : `You have ${characters.length} characters. Choose one to set as active.`}
              </Text>
            </div>

            <Button
              variant="outline"
              onClick={() => setModalOpened(true)}
              style={{
                borderColor: palette.accent,
                boxShadow: "0 0 5px rgba(177, 151, 252, 0.9)",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 8px rgba(177, 151, 252, 1)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 5px rgba(177, 151, 252, 0.9)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Select Character
            </Button>
          </Group>
        </Card>
      ) : (
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
            <div>
              <Text fw={700} c={palette.textMain}>
                No characters yet
              </Text>
              <Text size="sm" c={palette.textDim}>
                Create your first character to begin your adventure.
              </Text>
            </div>

            <Button
              leftSection={<IconUserPlus size={16} />}
              variant="gradient"
              gradient={{ from: "violet", to: "grape" }}
              bg="transparent"
              styles={{
                root: {
                  boxShadow: "0 0 8px rgba(177, 151, 252, 0.8)",
                },
              }}
              onClick={() => navigate("/characters/create")}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 8px rgba(177, 151, 252, 1)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 0 5px rgba(177, 151, 252, 0.9)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Create Character
            </Button>
          </Group>
        </Card>
      )}

      {/* Quick Actions */}
      <Grid mt="md" gutter="md">
        {quickNavigations.map((action) =>
          action ? (
            <Grid.Col
              key={action.label}
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            >
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
                    transition:
                      "transform 0.15s ease, background-color 0.15s ease",
                    color: palette.textMain,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = palette.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = palette.cardBg;
                  }}
                >
                  <CustomBadge
                    label={action.label}
                    icon={action.icon}
                    variant="transparent"
                    size="xl"
                  />
                </Card>
              </Tooltip>
            </Grid.Col>
          ) : null
        )}
      </Grid>

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Stack>
  );
}
