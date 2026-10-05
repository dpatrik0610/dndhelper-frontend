import { CampaignChat } from "@features/chat/CampaignChat";
import { useMyTableCharacter } from "@features/tabletop/characterSheet";

/** The campaign chat in the side panel; players speak as their character on the table. */
export function ChatPanel() {
  const character = useMyTableCharacter();
  return <CampaignChat characterId={character?.id} />;
}
