import { useEffect, useMemo, useState } from "react";
import { Stack } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { useCharacterList, useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { useCurrentUserId, useToken } from "@store/auth/authSelectors";
import { useSessionStore } from "@store/session/sessionStore";
import { featuredSession, nextPlanned } from "@store/session/sessionSelectors";
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
  const { sessions, campaignId: sessionsCampaignId, load: loadSessions } = useSessionStore();

  const [modalOpened, setModalOpened] = useState(false);
  const [campaign, setCampaign] = useState<CampaignOverviewDto | null>(null);
  const isMobile = useIsMobile();

  // Auto-pick only when exactly one of the visible characters is mine (DMs also see their players' characters).
  const me = useCurrentUserId();
  useEffect(() => {
    if (character) return;
    const mine = characters.filter((c) => me && c.ownerIds?.includes(me));
    if (mine.length === 1) setCharacter(mine[0]);
  }, [characters, character, setCharacter, me]);

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
        void loadSessions(overview.id);
      } catch (error) {
        console.warn("[Home] Failed to load campaign overview", { characterId: character.id, error });
        setCampaign(null);
      }
    };
    void load();
  }, [character?.id, loadSessions, token]);

  const { activeSession, upcoming } = useMemo(() => {
    const own = campaign && sessionsCampaignId === campaign.id ? sessions : [];
    const active = featuredSession(own);
    return { activeSession: active, upcoming: nextPlanned(own, active) };
  }, [campaign, sessions, sessionsCampaignId]);

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
            characters={characters}
            onSelect={handleSelectCharacter}
          />
        }
        isMobile={isMobile}
      />

      {activeSession && <ActiveSessionCard session={activeSession} next={upcoming} />}
    </Stack>
  );
}
