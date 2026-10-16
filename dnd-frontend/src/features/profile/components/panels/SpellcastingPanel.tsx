import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Text, TextInput } from "@mantine/core";
import { IconBookmark, IconBookmarkFilled, IconSearch } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { ListSkeleton } from "@components/common/Skeletons";
import { LayoutToggle } from "@components/common/LayoutToggle";
import { SectionColor } from "@appTypes/SectionColor";
import type { Spell } from "@appTypes/Spell";
import type { CharacterSpell } from "@appTypes/Character/CharacterSpell";
import { getSpellById } from "@services/spellService";
import { useToken } from "@store/auth/authSelectors";
import { useSpellActions } from "@store/spell/spellSelectors";
import { useCharacterSpellActions, useCurrentCharacter, useEffectiveStats } from "@store/character/characterSelectors";
import { ABILITIES, abilityMod, signed, toAbility } from "@utils/effects";
import { EffectHint } from "@features/profile/components/EffectHint";
import { SpellModal } from "@features/profile/components/modals/SpellModal";
import { useItemLayout } from "@hooks/useItemLayout";
import { getSchool, levelChip, levelHeading } from "@features/spells/spellMeta";
import book from "@features/spells/Spellbook.module.css";
import classes from "./SpellcastingPanel.module.css";

const PANEL_STYLE: CSSProperties = {
  background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
  backdropFilter: "blur(24px) saturate(130%)",
  WebkitBackdropFilter: "blur(24px) saturate(130%)",
  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
  borderRadius: "16px",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
  padding: "20px",
};

const NO_SPELLS: CharacterSpell[] = [];

type Entry = { spellId: string; spell: Spell; prepared: boolean };

function SlotCard({ level, current, max }: { level: number; current: number; max: number }) {
  const { useSpellSlot: spend, restoreSpellSlot: restore } = useCharacterSpellActions();
  const name = levelHeading(level);

  return (
    <div className={classes.slot} data-empty={current <= 0 || undefined}>
      <span className={classes.slotLevel}>{name}</span>
      <div className={classes.pips}>
        {Array.from({ length: max }, (_, i) => {
          const ready = i < current;
          return (
            <button
              key={i}
              type="button"
              className={classes.pip}
              data-ready={ready || undefined}
              aria-label={ready ? `Spend a ${name} slot` : `Recover a ${name} slot`}
              title={ready ? "Spend" : "Recover"}
              onClick={() => (ready ? spend(level) : restore(level))}
            />
          );
        })}
      </div>
      <span className={classes.slotCount}>
        {current}<span className={classes.slotMax}>/{max}</span>
      </span>
    </div>
  );
}

function SpellRow({ entry, onOpen }: { entry: Entry; onOpen: () => void }) {
  const { prepareSpell, unprepareSpell } = useCharacterSpellActions();
  const { spell, spellId, prepared } = entry;
  const school = getSchool(spell.school?.name);
  const meta = [spell.castingTime, spell.range, spell.duration].filter(Boolean).join(" · ");

  return (
    <div className={classes.row} style={{ "--school": school.color } as CSSProperties}>
      <button type="button" className={classes.open} onClick={onOpen}>
        <span className={classes.sigil} aria-hidden>
          <school.icon size={16} stroke={1.75} />
        </span>
        <span className={classes.text}>
          <span className={classes.name}>
            <span className={classes.nameText}>{spell.name}</span>
            {spell.concentration && <span className={classes.tag} title="Concentration">Conc.</span>}
            {spell.ritual && <span className={classes.tag} title="Can be cast as a ritual">Ritual</span>}
          </span>
          <span className={classes.meta}>{meta}</span>
        </span>
      </button>
      {spell.level > 0 && (
        <button
          type="button"
          className={classes.prep}
          aria-pressed={prepared}
          aria-label={`${prepared ? "Unprepare" : "Prepare"} ${spell.name}`}
          onClick={() => (prepared ? unprepareSpell(spellId) : prepareSpell(spellId))}
        >
          {prepared ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} stroke={1.75} />}
          <span className={classes.prepLabel}>{prepared ? "Prepared" : "Prepare"}</span>
        </button>
      )}
    </div>
  );
}

export function SpellcastingPanel() {
  const token = useToken();
  const character = useCurrentCharacter()!;
  const { stats } = useEffectiveStats()!;
  const { setCurrentSpell } = useSpellActions();

  const owned = character.spells ?? NO_SPELLS;
  const idsKey = owned.map((s) => s.spellId).join("|");
  const [fetched, setFetched] = useState<Record<string, Spell> | null>(null);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [preparedOnly, setPreparedOnly] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [layout, setLayout] = useItemLayout("spellLayout");

  useEffect(() => {
    if (!idsKey || !token) return setFetched({});
    let alive = true;
    const ids = idsKey.split("|");
    void Promise.allSettled(ids.map(getSpellById)).then((results) => {
      if (!alive) return;
      const byId: Record<string, Spell> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) byId[ids[i]] = r.value;
      });
      setFetched(byId);
    });
    return () => {
      alive = false;
    };
  }, [idsKey, token]);

  const entries = useMemo<Entry[]>(
    () =>
      owned
        .filter((s) => fetched?.[s.spellId])
        .map((s) => ({ spellId: s.spellId, spell: fetched![s.spellId], prepared: s.isPrepared }))
        .sort((a, b) => a.spell.level - b.spell.level || a.spell.name.localeCompare(b.spell.name)),
    [owned, fetched]
  );

  const levels = [...new Set(entries.map((e) => e.spell.level))];
  const query = search.trim().toLowerCase();
  const shown = entries.filter(
    (e) =>
      (level === null || e.spell.level === level) &&
      (!preparedOnly || e.prepared || e.spell.level === 0) &&
      (!query || e.spell.name.toLowerCase().includes(query))
  );
  const groups = levels
    .map((l) => ({ level: l, spells: shown.filter((e) => e.spell.level === l) }))
    .filter((g) => g.spells.length);

  const slots = (character.spellSlots ?? []).filter((s) => s.max > 0).sort((a, b) => a.level - b.level);

  const abilityKey = toAbility(character.spellcastingAbility);
  const ability = ABILITIES.find((a) => a.key === abilityKey);
  const abilityName = ability ? abilityKey!.toUpperCase() : "None";

  const figures = [
    { label: "Spell save DC", value: String(stats.spellDc.value), sub: `8 + proficiency + ${abilityName}`, stat: stats.spellDc },
    { label: "Spell attack", value: signed(stats.spellAttack.value), sub: `d20 + proficiency + ${abilityName}`, stat: stats.spellAttack },
    {
      label: "Casting ability",
      value: ability ? `${abilityName} ${signed(abilityMod(stats[ability.key].value))}` : "—",
      sub: ability?.name ?? "Set one under Edit Character",
      stat: ability ? stats[ability.key] : undefined,
    },
  ];

  const isEmpty = !abilityKey && !owned.length && !slots.length;

  return (
    <>
      <ExpandableSection
        title="Spellcasting"
        titleContent={<h3 className={`narrative-title ${classes.title}`} data-themed>Spellcasting</h3>}
        color={SectionColor.Grape}
        defaultOpen
        expandable={false}
        marginTop="md"
        style={PANEL_STYLE}
      >
        {isEmpty ? (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            No spellcasting yet. Add a spellcasting ability, slots and spells under Edit Character.
          </Text>
        ) : (
          <div className={classes.stack}>
            <div className={classes.figures}>
              {figures.map((f) => (
                <div key={f.label} className={classes.figure}>
                  <div className={classes.figureLabel}>{f.label}</div>
                  <div className={classes.figureValue}>
                    <EffectHint stat={f.stat}>{f.value}</EffectHint>
                  </div>
                  <div className={classes.figureSub}>{f.sub}</div>
                </div>
              ))}
            </div>

            {slots.length > 0 && (
              <section>
                <h4 className={classes.heading}>Spell slots</h4>
                <div className={classes.slots}>
                  {slots.map((s) => (
                    <SlotCard key={s.level} level={s.level} current={s.current} max={s.max} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className={classes.bookHead}>
                <h4 className={classes.heading}>Spellbook</h4>
                {entries.length > 0 && (
                  <div className={classes.bookTools}>
                    <TextInput
                      classNames={{ input: "glassy-input" }}
                      className={classes.search}
                      size="xs"
                      placeholder="Search spells"
                      aria-label="Search spells"
                      leftSection={<IconSearch size={14} />}
                      value={search}
                      onChange={(e) => setSearch(e.currentTarget.value)}
                    />
                    <LayoutToggle value={layout} onChange={setLayout} className={classes.layoutToggle} />
                  </div>
                )}
              </div>

              {owned.length > 0 && fetched === null ? (
                <ListSkeleton rows={4} height={48} />
              ) : !entries.length ? (
                <Text size="sm" c="dimmed" py="sm">
                  No spells known.
                </Text>
              ) : (
                <>
                  <div className={`${book.chips} ${classes.filters}`} role="group" aria-label="Filter spells">
                    <button type="button" className={book.chip} data-active={level === null || undefined} aria-pressed={level === null} onClick={() => setLevel(null)}>
                      All
                    </button>
                    {levels.map((l) => (
                      <button
                        key={l}
                        type="button"
                        className={book.chip}
                        data-active={level === l || undefined}
                        aria-pressed={level === l}
                        aria-label={levelHeading(l)}
                        onClick={() => setLevel(level === l ? null : l)}
                      >
                        {levelChip(l)}
                      </button>
                    ))}
                    <span className={classes.filterGap} />
                    <button type="button" className={book.chip} data-active={preparedOnly || undefined} aria-pressed={preparedOnly} onClick={() => setPreparedOnly(!preparedOnly)}>
                      <IconBookmarkFilled size={12} />
                      Prepared
                    </button>
                  </div>

                  {groups.length === 0 ? (
                    <Text size="sm" c="dimmed" py="sm">
                      No spells match.
                    </Text>
                  ) : (
                    groups.map((g) => {
                      const slot = slots.find((s) => s.level === g.level);
                      return (
                        <div key={g.level} className={classes.group}>
                          <div className={classes.groupHead}>
                            <span>{levelHeading(g.level)}</span>
                            <span className={classes.groupMeta}>
                              {g.level === 0 ? "At will" : slot ? `${slot.current} of ${slot.max} slots` : "No slots"}
                            </span>
                          </div>
                          <div className={classes.spells} data-layout={layout}>
                            {g.spells.map((e) => (
                              <SpellRow
                                key={e.spellId}
                                entry={e}
                                onOpen={() => {
                                  setCurrentSpell(e.spell);
                                  setModalOpened(true);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </ExpandableSection>

      <SpellModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </>
  );
}
