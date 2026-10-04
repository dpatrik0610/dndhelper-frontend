import { useState } from "react";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useCharacterCoreActions, useCharacterList, useCurrentCharacter } from "@store/character/characterSelectors";
import { CharacterSelectModal } from "@features/home/components/CharacterSelectModal";
import type { Character } from "@appTypes/Character/Character";
import classes from "./CharacterCard.module.css";

/** Active character at the top of the sidebar: portrait, name, class line, HP. Click to switch characters. */
export function CharacterCard() {
  const character = useCurrentCharacter();
  const characters = useCharacterList();
  const { setCharacter } = useCharacterCoreActions();
  const [selecting, setSelecting] = useState(false);

  const hpPercent = character?.maxHitPoints ? Math.min(100, Math.max(0, (character.hitPoints / character.maxHitPoints) * 100)) : 0;
  const subtitle = character ? [character.race, character.characterClass].filter(Boolean).join(" · ") : "Choose one to begin";

  return (
    <>
      <button
        type="button"
        className={classes.card}
        onClick={() => setSelecting(true)}
        aria-label={character ? `${character.name}. Switch character` : "Choose a character"}
      >
        <span className={classes.portrait}>
          {character?.imageUrl ? (
            <img src={character.imageUrl} alt="" className={classes.image} />
          ) : (
            <span className={classes.initial}>{character?.name?.charAt(0) || "?"}</span>
          )}
          {character && <span className={classes.level}>{character.level ?? 1}</span>}
        </span>

        <span className={classes.info}>
          <span className={classes.name}>{character?.name ?? "No character"}</span>
          <span className={classes.subtitle}>{subtitle}</span>
          {character && (
            <span className={classes.hp} title={`HP ${character.hitPoints}/${character.maxHitPoints}`}>
              <span className={classes.hpFill} style={{ width: `${hpPercent}%` }} />
            </span>
          )}
        </span>

        <IconArrowsExchange size={16} className={classes.swap} aria-hidden />
      </button>

      <CharacterSelectModal
        opened={selecting}
        onClose={() => setSelecting(false)}
        characters={characters}
        onSelect={(char: Character) => setCharacter(char)}
      />
    </>
  );
}
