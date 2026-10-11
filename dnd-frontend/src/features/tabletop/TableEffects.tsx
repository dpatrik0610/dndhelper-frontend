import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Tooltip, UnstyledButton } from "@mantine/core";
import { IconChevronUp, IconSparkles } from "@tabler/icons-react";
import { computeEffects, describeModifier, modifierApplies } from "@utils/effects";
import { EFFECT_SOURCES } from "@features/profile/components/effectSources";
import { useMyTableCharacter } from "./characterSheet";
import { useCharacterList } from "@store/character/characterSelectors";
import { useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import { getCharacterById } from "@services/characterService";
import type { Character } from "@appTypes/Character/Character";

const OPEN_KEY = "tt-effects-open";

const readOpen = () => {
  try {
    return localStorage.getItem(OPEN_KEY) !== "0";
  } catch {
    return true;
  }
};

/**
 * The DM's pick: the token they last clicked, dragged or right-clicked, else the one whose turn it is.
 * A new turn drops the pick, so in combat the box follows the initiative order.
 */
function useDmFocusCharacter(): Character | null {
  const currentTokenId = useTabletopStore((s) => s.snapshot?.turn.currentTokenId ?? null);
  const characterId = useTabletopStore((s) => {
    const tokens = s.snapshot?.tokens ?? [];
    const focus = tokens.find((t) => t.id === s.focusTokenId && t.characterId);
    const turn = tokens.find((t) => t.id === s.snapshot?.turn.currentTokenId && t.characterId);
    return (focus ?? turn)?.characterId ?? null;
  });
  const listed = useCharacterList().find((c) => c.id === characterId) ?? null;
  const [fetched, setFetched] = useState<Character | null>(null);

  useEffect(() => {
    useTabletopStore.getState().set({ focusTokenId: null });
  }, [currentTokenId]);

  // Campaign characters are normally in the list (and kept live by SignalR); fetch once if one is not.
  useEffect(() => {
    if (!characterId || listed) return;
    let cancelled = false;
    getCharacterById(characterId)
      .then((c) => !cancelled && setFetched(c ?? null))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [characterId, listed]);

  return listed ?? (fetched?.id === characterId ? fetched : null);
}

/** What is changing a character right now, under the top bar; folds down to a pill. Players see their own, the DM their pick. */
export function TableEffects() {
  const dmView = useDmView();
  const mine = useMyTableCharacter();
  const focused = useDmFocusCharacter();
  const character = dmView ? focused : mine;
  const [open, setOpen] = useState(readOpen);

  // Only what counts now: switched-off effects, idle situational changes and items that change nothing stay out.
  const effects = useMemo(
    () =>
      character
        ? computeEffects(character)
            .effects.map((e) => ({ ...e, modifiers: e.modifiers.filter((m) => modifierApplies(character, m)) }))
            .filter((e) => e.modifiers.length > 0)
        : [],
    [character]
  );

  // A player with nothing going on gets no box; the DM gets a line, so a clicked token always answers.
  if (!character || (!effects.length && !dmView)) return null;

  const toggle = () => {
    setOpen(!open);
    try {
      localStorage.setItem(OPEN_KEY, open ? "0" : "1");
    } catch {
      // Private mode: it just won't be remembered.
    }
  };

  if (!open) {
    return (
      <div className="tt-effects">
        <Tooltip label={`Show what is affecting ${character.name}`}>
          <UnstyledButton className="tt-glass tt-effects-pill" onClick={toggle} aria-expanded={false}>
            <IconSparkles size={14} />
            {effects.length} effect{effects.length === 1 ? "" : "s"}
          </UnstyledButton>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="tt-effects">
      <section className="tt-glass tt-effects-card" aria-label={`Effects on ${character.name}`}>
        <div className="tt-effects-head">
          <span>Effects on {character.name}</span>
          <ActionIcon size="sm" variant="subtle" color="gray" onClick={toggle} aria-label="Collapse effects" aria-expanded>
            <IconChevronUp size={14} />
          </ActionIcon>
        </div>
        {effects.length === 0 && <p className="tt-effects-empty">Nothing is affecting {character.name} right now.</p>}
        <ul className="tt-effects-list">
          {effects.map((e) => {
            const { Icon, color } = EFFECT_SOURCES[e.source];
            return (
              <li key={e.id}>
                <span className="tt-effects-icon" style={{ color: `var(--mantine-color-${color}-4)` }} aria-hidden>
                  <Icon size={14} />
                </span>
                <span className="tt-effects-text">
                  <span className="tt-effects-name">{e.name}</span>
                  <span className="tt-effects-mods">{e.modifiers.map(describeModifier).filter(Boolean).join(", ")}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
