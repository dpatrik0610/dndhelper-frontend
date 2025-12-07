import { useEffect, useMemo, useState} from "react";
import { Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";

import { useCharacterStore } from "@store/useCharacterStore";
import { useAuthStore } from "@store/useAuthStore";
import { useSessionStore } from "@store/session/useSessionStore";
import { getCampaignBasicById } from "@services/campaignService";
import type { Character } from "@appTypes/Character/Character";
import { quotes } from "./quotes";
import { CharacterSelectModal } from "./components/CharacterSelectModal";
import { HeaderCard } from "./components/HeaderCard";
import { ActiveSessionCard } from "./components/ActiveSessionCard";
// import { QuickActionBar } from "./components/QuickActionBar";

const palette = {
  accent: "#b197fc",
  border: "rgba(140, 120, 255, 0.35)",
  bg: "rgba(20, 18, 40, 0.55)",
  cardBg: "rgba(20, 18, 40, 0.65)",
  hoverBg: "rgba(180, 150, 255, 0.08)",
  textMain: "#f2f2ff",
  textDim: "rgba(220, 220, 255, 0.7)",
};

export default function Home() {
  // const isAdmin = useAuthStore.getState().roles.includes("Admin");
  const navigate = useNavigate();
  const { characters, setCharacter } = useCharacterStore();
  const character = useCharacterStore((state) => state.character);
  const { sessions, loadByCampaign } = useSessionStore();

  const [modalOpened, setModalOpened] = useState(false);
  const [quote, setQuote] = useState("");
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // const quickNavigations = [
  //   { label: "Spellbook", icon: <IconBook />, path: "/spells" },
  //   { label: "Personal Notes", icon: <IconNote />, path: "/notes" },
  //   isAdmin ? { label: "Admin Dashboard", icon: <IconDashboard />, path: "/dashboard" } : null,
  // ].filter(Boolean) as { label: string; icon: JSX.Element; path: string }[];

  useEffect(() => {
    if (quotes?.length) {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    } else {
      setQuote("");
    }
  }, []);

  // Auto-select single character
  useEffect(() => {
    if (!character && characters.length === 1) {
      setCharacter(characters[0]);
    }
  }, [characters, character, setCharacter]);

  // Load campaign + sessions for the active character
  useEffect(() => {
    const load = async () => {
      if (!character?.campaignId) {
        console.info("[Home] No campaignId on selected character, skipping session load", { characterId: character?.id });
        setCampaignName(null);
        return;
      }
      const token = useAuthStore.getState().token;
      if (!token) return;
      try {
        const basic = await getCampaignBasicById(character.campaignId, token);
        setCampaignName(basic.name);
      } catch {
        console.warn("[Home] Failed to load campaign basic", { campaignId: character.campaignId });
        setCampaignName(null);
      }
      void loadByCampaign(character.campaignId);
    };
    void load();
  }, [character?.campaignId, loadByCampaign]);

  const activeSession = useMemo(() => {
    const live = sessions.find((s) => s.isLive);
    if (live) return live;
    return sessions.length
      ? [...sessions].sort((a, b) => {
          const aTime = a.scheduledFor ? dayjs(a.scheduledFor).valueOf() : 0;
          const bTime = b.scheduledFor ? dayjs(b.scheduledFor).valueOf() : 0;
          return bTime - aTime;
        })[0]
      : null;
  }, [sessions]);

  const handleSelectCharacter = (char: Character) => {
    setCharacter(char);
    setModalOpened(false);
  };

  return (
    <Stack
      w={isMobile ? "100%" : "75%"}
      m={isMobile ? "0 auto" : "20 auto"}
      p={isMobile ? "0" : "md"}
      style={isMobile ? { margin: "2px" } : undefined}
    >
      <HeaderCard
        campaignName={campaignName}
        character={character ?? null}
        onSelectCharacter={() => setModalOpened(true)}
        onProfile={() => navigate("/profile")}
        quote={quote}
        characterSelector={<CharacterSelectModal opened={modalOpened} onClose={() => setModalOpened(false)} characters={characters} onSelect={handleSelectCharacter} />}
        isMobile={isMobile}
        palette={{ bg: palette.cardBg, border: palette.border, textMain: palette.textMain, textDim: palette.textDim }}
      />

      {/* Active Session */}
      {activeSession && <ActiveSessionCard session={activeSession} palette={{ cardBg: palette.cardBg, border: palette.border, textMain: palette.textMain, textDim: palette.textDim }} />}
    </Stack>
  );
}
