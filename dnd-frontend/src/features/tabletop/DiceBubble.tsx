import { useState } from "react";
import { ActionIcon, Button, Group, ScrollArea, SegmentedControl, Select, Switch, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconDice5, IconSkull, IconX } from "@tabler/icons-react";
import { Die, DiceResult } from "@components/roll/Dice";
import { DEFAULT_SKILLS } from "@features/characterForm/Tooltips/tooltips";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { AbilityScores } from "@appTypes/Character/AbilityScores";
import type { Character } from "@appTypes/Character/Character";
import type { SavingThrows } from "@appTypes/Character/SavingThrows";
import { abilityMod, saveCharacter, togglePip } from "./characterSheet";
import { d20With, signed, useTableRoll } from "./useTableRoll";

const DICE = [4, 6, 8, 10, 12, 20, 100];

const ABILITIES: { key: keyof AbilityScores; label: string }[] = [
  { key: "str", label: "Strength" },
  { key: "dex", label: "Dexterity" },
  { key: "con", label: "Constitution" },
  { key: "int", label: "Intelligence" },
  { key: "wis", label: "Wisdom" },
  { key: "cha", label: "Charisma" },
];

const SAVES: { key: keyof SavingThrows; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "dexterity", label: "Dexterity" },
  { key: "constitution", label: "Constitution" },
  { key: "intelligence", label: "Intelligence" },
  { key: "wisdom", label: "Wisdom" },
  { key: "charisma", label: "Charisma" },
];

type Tab = "abilities" | "skills" | "saves";

const ordinal = (n: number) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

const abilityOf = (skill: string) =>
  DEFAULT_SKILLS.find((d) => d.name === skill)?.ability.toUpperCase() ?? "";

/**
 * Dice tray at the bottom left, for everyone at the table. Rolls land in the shared log as the picked token;
 * with a character behind it there are also one-click ability checks, skills, saving throws, death saves and spell slots.
 */
export function DiceBubble() {
  const me = useCurrentUserId() ?? "";
  const tokens = useTabletopStore((s) => s.snapshot?.tokens ?? []);
  const currentTokenId = useTabletopStore((s) => s.snapshot?.turn.currentTokenId ?? null);
  const isDm = useTabletopStore((s) => !!s.session?.isDm);
  const dmView = useDmView();
  const characters = useCharacterList();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("abilities");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const dice = useTableRoll();

  // The DM rolls as any token, or as themselves; players as their own tokens.
  const candidates = dmView ? tokens : tokens.filter((t) => t.layer !== "Dm" && t.ownerIds.includes(me));
  const token =
    candidates.find((t) => t.id === pickedId) ??
    (dmView ? undefined : (candidates.find((t) => t.id === currentTokenId) ?? candidates[0]));
  const character = characters.find((c) => c.id === token?.characterId);
  const as = character?.name ?? token?.name;

  const roll = (expressions: string[], label: string, sides: number) =>
    void dice.roll({ expressions, label, as, private: isDm && isPrivate }, sides);
  const check = (label: string, modifier: number) => roll([d20With(modifier)], label, 20);

  return (
    <div className={`tt-bubble${open ? " open" : ""}`}>
      {open && (
        <div className="tt-bubble-panel tt-glass" role="dialog" aria-label="Dice and checks">
          <Group justify="space-between" wrap="nowrap" gap="xs">
            {dmView || candidates.length > 1 ? (
              <Select
                size="xs"
                aria-label="Roll as"
                placeholder="Roll as the DM"
                value={token?.id ?? null}
                data={candidates.map((t) => ({ value: t.id, label: t.name }))}
                onChange={setPickedId}
                clearable={dmView}
                allowDeselect={dmView}
                searchable
                style={{ flex: 1 }}
              />
            ) : (
              <Text fw={700} truncate>
                {as ?? "Dice"}
              </Text>
            )}
            <ActionIcon size="sm" variant="subtle" color="gray" onClick={() => setOpen(false)} aria-label="Close">
              <IconX size={14} />
            </ActionIcon>
          </Group>

          <div className="tt-dice-row">
            {DICE.map((sides) => (
              <UnstyledButton
                key={sides}
                className="tt-die-btn"
                onClick={() => roll([`1d${sides}`], `d${sides}`, sides)}
                aria-label={`Roll a d${sides}`}
                disabled={dice.rolling}
              >
                <Die sides={sides} value={`d${sides}`} size={34} active={dice.rolling && dice.sides === sides} />
              </UnstyledButton>
            ))}
          </div>

          {(dice.rolling || dice.result) && (
            <div className="tt-bubble-dice">
              <DiceResult result={dice.result} rolling={dice.rolling} sides={dice.sides} count={dice.count} />
            </div>
          )}

          {isDm && (
            <Switch size="xs" label="Private roll (DM only)" checked={isPrivate} onChange={(e) => setIsPrivate(e.currentTarget.checked)} />
          )}

          {character && <Checks character={character} tab={tab} onTab={setTab} onCheck={check} />}
        </div>
      )}

      <Tooltip label="Dice & checks" position="right" disabled={open}>
        <UnstyledButton
          className="tt-bubble-button tt-glass"
          onClick={() => setOpen((o) => !o)}
          aria-label="Dice and checks"
          aria-expanded={open}
        >
          <IconDice5 size={24} />
        </UnstyledButton>
      </Tooltip>
    </div>
  );
}

/** Death saves, spell slots, and ability checks, skills and saving throws as d20 rolls with the sheet's modifiers. */
function Checks({
  character,
  tab,
  onTab,
  onCheck,
}: {
  character: Character;
  tab: Tab;
  onTab: (tab: Tab) => void;
  onCheck: (label: string, modifier: number) => void;
}) {
  const skills = [...(character.skills ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <DeathSaves character={character} onRoll={() => onCheck("Death saving throw", 0)} />
      <SpellSlots character={character} />

      <SegmentedControl
        size="xs"
        fullWidth
        value={tab}
        onChange={(v) => onTab(v as Tab)}
        data={[
          { value: "abilities", label: "Abilities" },
          { value: "skills", label: "Skills" },
          { value: "saves", label: "Saves" },
        ]}
      />

      <ScrollArea.Autosize mah={240} type="auto">
        <div className="tt-check-list">
          {tab === "abilities" &&
            ABILITIES.map(({ key, label }) => {
              const score = character.abilityScores?.[key] ?? 10;
              const mod = abilityMod(score);
              return (
                <UnstyledButton key={key} className="tt-check" onClick={() => onCheck(`${label} check`, mod)}>
                  <span className="tt-check-name">{label}</span>
                  <span className="tt-check-ability">{score}</span>
                  <span className="tt-check-mod">{signed(mod)}</span>
                </UnstyledButton>
              );
            })}
          {tab === "skills" &&
            skills.map((s) => (
              <UnstyledButton key={s.name} className="tt-check" onClick={() => onCheck(`${s.name} check`, s.value)}>
                <span className={`tt-check-prof${s.proficient ? " on" : ""}`} aria-label={s.proficient ? "Proficient" : undefined} />
                <span className="tt-check-name">{s.name}</span>
                <span className="tt-check-ability">{abilityOf(s.name)}</span>
                <span className="tt-check-mod">{signed(s.value)}</span>
              </UnstyledButton>
            ))}
          {tab === "saves" &&
            SAVES.map(({ key, label }) => {
              const mod = character.savingThrows?.[key] ?? 0;
              return (
                <UnstyledButton key={key} className="tt-check" onClick={() => onCheck(`${label} saving throw`, mod)}>
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
    </>
  );
}

/** Three success and three failure pips, saved straight to the character sheet. */
function DeathSaves({ character, onRoll }: { character: Character; onRoll: () => void }) {
  const successes = character.deathSavesSuccesses ?? 0;
  const failures = character.deathSavesFailures ?? 0;
  const save = (patch: Partial<Character>) => void saveCharacter(character, patch, "Couldn't save death saves.");

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
            onClick={() => save({ deathSavesSuccesses: togglePip(successes, i) })}
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
            onClick={() => save({ deathSavesFailures: togglePip(failures, i) })}
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

/** Only the slot levels the character has. A filled pip is a slot left: tap the last one to spend it, an empty one to get it back. */
function SpellSlots({ character }: { character: Character }) {
  const all = character.spellSlots ?? [];
  const slots = all.filter((s) => s.max > 0).sort((a, b) => a.level - b.level);
  if (slots.length === 0) return null;

  const set = (changes: Record<number, number>) =>
    void saveCharacter(
      character,
      { spellSlots: all.map((s) => (s.level in changes ? { ...s, current: changes[s.level] } : s)) },
      "Couldn't save spell slots."
    );
  const spent = slots.some((s) => s.current < s.max);

  return (
    <div className="tt-slots">
      <Group justify="space-between">
        <span className="tt-death-label">Spell slots</span>
        {spent && (
          <Button size="compact-xs" variant="subtle" color="gray" onClick={() => set(Object.fromEntries(slots.map((s) => [s.level, s.max])))}>
            Restore all
          </Button>
        )}
      </Group>
      {slots.map((s) => {
        const current = Math.min(Math.max(s.current, 0), s.max);
        return (
          <div key={s.level} className="tt-slot-row">
            <span className="tt-slot-level">{ordinal(s.level)}</span>
            <span className="tt-death-pips" role="group" aria-label={`Level ${s.level} slots`}>
              {Array.from({ length: Math.min(s.max, 9) }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`tt-pip slot${i < current ? " on" : ""}`}
                  onClick={() => set({ [s.level]: togglePip(current, i) })}
                  aria-label={`Level ${s.level} slot ${i + 1}`}
                  aria-pressed={i < current}
                />
              ))}
            </span>
            <span className="tt-slot-count">
              {current}/{s.max}
            </span>
          </div>
        );
      })}
    </div>
  );
}
