import { lazy, Suspense, useEffect, useState } from "react";
import { Center, Loader, Modal } from "@mantine/core";
import { useCharacterStore } from "@store/character/characterStore";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import { getCharacterById } from "@services/characterService";
import { useIsMobile } from "@hooks/useIsMobile";

const CharacterProfile = lazy(() => import("@features/profile/CharacterProfile"));

/**
 * A player's own character sheet over the table. The profile page renders the store's current
 * character, so we point that at the token's character and put the previous one back on close.
 */
export function TokenProfileModal() {
  const characterId = useTabletopStore((s) => s.profileCharacterId);
  const isMobile = useIsMobile();
  const [readyFor, setReadyFor] = useState<string | null>(null);
  const close = () => useTabletopStore.getState().set({ profileCharacterId: null });

  useEffect(() => {
    if (!characterId) return;
    const store = useCharacterStore.getState();
    const previousId = store.character?.id ?? null;
    let cancelled = false;

    (async () => {
      const character = store.characters.find((c) => c.id === characterId) ?? (await getCharacterById(characterId));
      if (cancelled) return;
      if (!character) {
        close();
        return;
      }
      useCharacterStore.getState().setCharacter(character);
      setReadyFor(characterId);
    })();

    return () => {
      cancelled = true;
      setReadyFor(null);
      const { characters, setCharacter } = useCharacterStore.getState();
      const previous = characters.find((c) => c.id === previousId);
      if (previous && previousId !== characterId) setCharacter(previous);
    };
  }, [characterId]);

  return (
    <Modal
      opened={!!characterId}
      onClose={close}
      size="min(1200px, 96vw)"
      fullScreen={isMobile}
      padding="md"
      classNames={{ content: "tt-solid", header: "tt-solid" }}
      title="Character"
    >
      <Suspense fallback={<Center py="xl"><Loader /></Center>}>
        {readyFor === characterId && characterId ? <CharacterProfile /> : <Center py="xl"><Loader /></Center>}
      </Suspense>
    </Modal>
  );
}
