import { Box, Group, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "../../components/Notification/Notification";
import { useCharacterStore } from "../../store/useCharacterStore";
import { SectionColor } from "../../types/SectionColor";
import { NotesPanel } from "./components/NotesPanel";

export default function NotesPage() {
  const character = useCharacterStore((state) => state.character);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  useEffect(() => {
    if (!character) {
      showNotification({
        id: "no-character-selected",
        title: "No Character Selected",
        message: "Please select a character to view notes.",
        color: SectionColor.Red,
        withBorder: true,
      });

      navigate("/home", { replace: true });
    }
  }, [character, navigate]);

  if (!character) return null;

  return (
    <Box
      p={isMobile ? "xs" : "md"}
      m={isMobile ? "" : "0 auto"}
      maw={isMobile ? "100%" : 900}
    >
      <Group justify="space-between" mb="sm">
        <div>
          <Text size="xl" fw={700} c="red.2">
            Notes
          </Text>
          <Text size="sm" c="dimmed">
            {character.name}
          </Text>
        </div>
      </Group>

      <NotesPanel />
    </Box>
  );
}
