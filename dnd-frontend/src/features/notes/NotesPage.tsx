import { Box } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";
import { useCharacterStore } from "@store/useCharacterStore";
import { SectionColor } from "@appTypes/SectionColor";
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
    p={isMobile ? 0 : "md"}
    m={isMobile ? 0 : "0 auto"}
    maw={isMobile ? "100%" : 1280}
    w={isMobile ? "100vw" : "100%"}
    h={isMobile ? "100vh" : "auto"}
    style={
      isMobile
        ? {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: "auto",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(6px)",
          }
        : undefined
    }
  >
    <NotesPanel />
  </Box>
);

}
