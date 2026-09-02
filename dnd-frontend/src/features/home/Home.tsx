import { useEffect, useMemo, useState } from "react";
import { Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { useCharacterList, useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { useToken } from "@store/auth/authSelectors";
import { useSessionStore } from "@store/session/sessionStore";
import { getCampaignOverviewByCharacter } from "@services/campaignService";
import type { Character } from "@appTypes/Character/Character";
import type { CampaignOverviewDto } from "@appTypes/CampaignOverview";
import { CharacterSelectModal } from "./components/CharacterSelectModal";
import { HeaderCard } from "./components/HeaderCard";
import { ActiveSessionCard } from "./components/ActiveSessionCard";
import { showNotification } from "@components/Notification/Notification";
import { useIsMobile } from "@hooks/useIsMobile";

export default function Home() {
  const navigate = useNavigate();
  const characters = useCharacterList();
  const { setCharacter } = useCharacterCoreActions();
  const character = useCurrentCharacter();
  const { sessions, loadByCampaign } = useSessionStore();

  const [modalOpened, setModalOpened] = useState(false);
  const [campaign, setCampaign] = useState<CampaignOverviewDto | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!character && characters.length === 1) {
      setCharacter(characters[0]);
    }
  }, [characters, character, setCharacter]);

  const token = useToken();
  useEffect(() => {
    const load = async () => {
      if (!character?.id) {
        setCampaign(null);
        return;
      }
      if (!token) return;
      try {
        const overview = await getCampaignOverviewByCharacter(character.id);
        if (!overview) {
          showNotification({
            title: "No Campaign Found",
            message: "No campaign found for this character.",
            color: "yellow",
          });
          setCampaign(null);
          return;
        }
        setCampaign(overview);
        void loadByCampaign(overview.id);
      } catch (error) {
        console.warn("[Home] Failed to load campaign overview", { characterId: character.id, error });
        setCampaign(null);
      }
    };
    void load();
  }, [character?.id, loadByCampaign, token]);

  const campaignCharacters = useMemo(() => {
    if (!campaign) return characters;
    const campaignCharIds = new Set(campaign.characters.map((c) => c.id).filter(Boolean));
    return characters.filter((char) => campaignCharIds.has(char.id));
  }, [characters, campaign]);

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
      w="100%"
      style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: isMobile ? "12px" : "24px",
      }}
      gap="xl"
    >
      <HeaderCard
        campaignName={campaign?.name ?? null}
        character={character ?? null}
        onSelectCharacter={() => setModalOpened(true)}
        onProfile={() => navigate("/profile")}
        characterSelector={
          <CharacterSelectModal
            opened={modalOpened}
            onClose={() => setModalOpened(false)}
            characters={campaignCharacters}
            onSelect={handleSelectCharacter}
          />
        }
        isMobile={isMobile}
      />

      {activeSession && <ActiveSessionCard session={activeSession} />}
    </Stack>
  );
}
