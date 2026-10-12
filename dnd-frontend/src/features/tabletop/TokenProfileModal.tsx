import { lazy, Suspense, useEffect, useState } from "react";
import { Center, CloseButton, Loader, Modal } from "@mantine/core";
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

/** A monster or NPC token's art, full screen. Click anywhere or press Escape to close. */
export function TokenImageViewer() {
  const preview = useTabletopStore((s) => s.imagePreview);
  const close = () => useTabletopStore.getState().set({ imagePreview: null });

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  if (!preview) return null;
  return (
    <div className="tt-lightbox" role="dialog" aria-label={preview.name} onClick={close}>
      <figure className="tt-lightbox-figure tt-pop-in">
        <img src={preview.url} alt={preview.name} />
        <figcaption>{preview.name}</figcaption>
      </figure>
      <CloseButton className="tt-lightbox-close" size="lg" variant="transparent" aria-label="Close" />
    </div>
  );
}
