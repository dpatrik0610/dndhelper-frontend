import { useState } from "react";
import { ActionIcon, Group, ScrollArea, SegmentedControl, Select, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconDice5, IconSkull, IconX } from "@tabler/icons-react";
import { DiceResult } from "@components/roll/Dice";
import { showNotification } from "@components/Notification/Notification";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";
import { updateCharacter } from "@services/characterService";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useCharacterStore } from "@store/character/characterStore";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { Character } from "@appTypes/Character/Character";
import type { SavingThrows } from "@appTypes/Character/SavingThrows";
import { d20With, signed, useTableRoll } from "./useTableRoll";

const SAVES: { key: keyof SavingThrows; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
];

const abilityOf = (skill: string) =>
  DEFAULT_SKILLS.find((d) => d.name === skill)?.ability.toUpperCase() ?? "";

/**
 * Floating bubble for players: skill checks and saving throws as one-click d20 rolls (modifiers from the
 * sheet), plus death saves. Only shows when one of your characters is on the table.
 */
export function CharacterBubble() {
  const me = useCurrentUserId() ?? "";
  const tokens = useTabletopStore((s) => s.snapshot?.tokens ?? []);
  const currentTokenId = useTabletopStore((s) => s.snapshot?.turn.currentTokenId ?? null);
  const characters = useCharacterList();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"skills" | "saves">("skills");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const dice = useTableRoll();

  const myTokens = tokens.filter((t) => t.characterId && t.layer !== "Dm" && t.ownerIds.includes(me));
  const mine = characters.filter((c) => myTokens.some((t) => t.characterId === c.id));
  if (mine.length === 0) return null;

  const currentCharacterId = tokens.find((t) => t.id === currentTokenId)?.characterId;
  const character =
    mine.find((c) => c.id === pickedId) ?? mine.find((c) => c.id === currentCharacterId) ?? mine[0];

  const rollCheck = (label: string, modifier: number) =>
    void dice.roll({ expressions: [d20With(modifier)], label, as: character.name }, 20);

  const skills = [...(character.skills ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={`tt-bubble${open ? " open" : ""}`}>
      {open && (
        <div className="tt-bubble-panel tt-glass" role="dialog" aria-label="Checks and saves">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            {mine.length > 1 ? (
              <Select
                size="xs"
                value={character.id ?? null}
                data={mine.map((c) => ({ value: c.id!, label: c.name }))}
                onChange={setPickedId}
                allowDeselect={false}
                style={{ flex: 1 }}
              />
            ) : (
              <Text fw={700} truncate>
                {character.name}
              </Text>
            )}
            <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setOpen(false)} aria-label="Close">
              <IconX size={14} />
            </ActionIcon>
          </Group>

          <DeathSaves character={character} onRoll={() => rollCheck("Death saving throw", 0)} />

          {(dice.rolling || dice.result) && (
            <div className="tt-bubble-dice">
              <DiceResult result={dice.result} rolling={dice.rolling} sides={dice.sides} count={dice.count} />
            </div>
          )}

          <SegmentedControl
            size="xs"
            fullWidth
            value={tab}
            onChange={(v) => setTab(v as "skills" | "saves")}
            data={[
              { value: "skills", label: "Skills" },
              { value: "saves", label: "Saving throws" },
            ]}
          />

          <ScrollArea.Autosize mah={260} type="auto">
            <div className="tt-check-list">
              {tab === "skills"
                ? skills.map((s) => (
                    <UnstyledButton key={s.name} className="tt-check" onClick={() => rollCheck(`${s.name} check`, s.value)}>
                      <span className={`tt-check-prof${s.proficient ? " on" : ""}`} aria-label={s.proficient ? "Proficient" : undefined} />
                      <span className="tt-check-name">{s.name}</span>
                      <span className="tt-check-ability">{abilityOf(s.name)}</span>
                      <span className="tt-check-mod">{signed(s.value)}</span>
                    </UnstyledButton>
                  ))
                : SAVES.map(({ key, label }) => {
                    const mod = character.savingThrows?.[key] ?? 0;
                    return (
                      <UnstyledButton key={key} className="tt-check" onClick={() => rollCheck(`${label} saving throw`, mod)}>
                        <span className="tt-check-name">{label}</span>
                        <span className="tt-check-ability">{label.slice(0, 3).toUpperCase()}</span>
                        <span className="tt-check-mod">{signed(mod)}</span>
                      </UnstyledButton>
                    );
                  })}
              {tab === "skills" && skills.length === 0 && (
                <Text size="xs" c="dimmed" ta="center" py="sm">
                  No skills on this character yet.
                </Text>
              )}
            </div>
          </ScrollArea.Autosize>
        </div>
      )}

      <Tooltip label="Checks & saves" position="right" disabled={open}>
        <UnstyledButton
          className="tt-bubble-button tt-glass"
          onClick={() => setOpen((o) => !o)}
          aria-label="Checks and saving throws"
          aria-expanded={open}
        >
          <IconDice5 size={24} />
        </UnstyledButton>
      </Tooltip>
    </div>
  );
}

/** Three success and three failure pips, saved straight to the character sheet. */
function DeathSaves({ character, onRoll }: { character: Character; onRoll: () => void }) {
  const successes = character.deathSavesSuccesses ?? 0;
  const failures = character.deathSavesFailures ?? 0;

  const apply = (c: Character) => {
    const store = useCharacterStore.getState();
    store.setCharacters(store.characters.map((x) => (x.id === c.id ? c : x)));
    if (store.character?.id === c.id) store.setCharacter(c);
  };

  const save = async (patch: Partial<Character>) => {
    const next = { ...character, ...patch };
    apply(next); // show it right away
    const saved = await updateCharacter(next);
    apply(saved ?? character);
    if (!saved) showNotification({ message: "Couldn't save death saves.", color: "red" });
  };

  // Clicking the last filled pip clears it; any other pip fills up to it.
  const toggle = (count: number, index: number) => (count === index + 1 ? index : index + 1);

  return (
    <div className="tt-death">
      <IconSkull size={14} className="tt-death-icon" />
      <span className="tt-death-label">Death saves</span>
      <span className="tt-death-pips" role="group" aria-label="Successes">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            className={`tt-pip success${i < successes ? " on" : ""}`}
            onClick={() => void save({ deathSavesSuccesses: toggle(successes, i) })}
            aria-label={`${i + 1} success${i ? "es" : ""}`}
            aria-pressed={i < successes}
          />
        ))}
      </span>
      <span className="tt-death-pips" role="group" aria-label="Failures">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            className={`tt-pip failure${i < failures ? " on" : ""}`}
            onClick={() => void save({ deathSavesFailures: toggle(failures, i) })}
            aria-label={`${i + 1} failure${i ? "s" : ""}`}
            aria-pressed={i < failures}
          />
        ))}
      </span>
      <Tooltip label="Roll a death save">
        <ActionIcon size="sm" variant="subtle" color="gray" onClick={onRoll} aria-label="Roll a death save">
          <IconDice5 size={14} />
        </ActionIcon>
      </Tooltip>
    </div>
  );
}
