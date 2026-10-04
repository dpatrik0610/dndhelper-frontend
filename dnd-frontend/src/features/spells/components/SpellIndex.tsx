import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ScrollArea, Text, TextInput, Tooltip } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useSpellStore } from "@store/spell/spellStore";
import { SCHOOLS, getSchool, levelChip, levelHeading } from "@features/spells/spellMeta";
import classes from "@features/spells/Spellbook.module.css";

interface SpellIndexProps {
  activeName?: string;
  onSelect: (name: string) => void;
  /** Fixed list height (desktop pane). Omit to let the list flow with the page (mobile). */
  scrollHeight?: string;
}

export function SpellIndex({ activeName, onSelect, scrollHeight }: SpellIndexProps) {
  const spellNames = useSpellStore((s) => s.spellNames);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [school, setSchool] = useState<string | null>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const levels = useMemo(() => [...new Set(spellNames.map((s) => s.level))].sort((a, b) => a - b), [spellNames]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = spellNames.filter(
      (s) =>
        (level === null || s.level === level) &&
        (school === null || s.school?.name === school) &&
        (!q || s.name.toLowerCase().includes(q))
    );
    const byLevel = new Map<number, typeof matches>();
    for (const s of matches) byLevel.set(s.level, [...(byLevel.get(s.level) ?? []), s]);
    return [...byLevel.entries()]
      .sort(([a], [b]) => a - b)
      .map(([lvl, spells]) => ({ level: lvl, spells: spells.sort((a, b) => a.name.localeCompare(b.name)) }));
  }, [spellNames, query, level, school]);

  // Bring the open spell into view (deep links, back navigation).
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeName, spellNames.length]);

  const list = (
    <div className={classes.list}>
      {groups.length === 0 && (
        <Text size="sm" ta="center" py="xl" c="dimmed">
          {spellNames.length === 0 ? "Loading spells…" : "No spells match these filters."}
        </Text>
      )}
      {groups.map((group) => (
        <section key={group.level} aria-label={levelHeading(group.level)}>
          <div className={classes.groupHeading}>
            <span>{levelHeading(group.level)}</span>
            <span>{group.spells.length}</span>
          </div>
          {group.spells.map((s) => {
            const meta = getSchool(s.school?.name);
            const active = s.name === activeName;
            return (
              <button
                key={s.id}
                ref={active ? activeRef : undefined}
                type="button"
                className={classes.row}
                data-active={active || undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => onSelect(s.name)}
              >
                <meta.icon size={16} color={meta.color} style={{ flexShrink: 0 }} aria-hidden />
                <span className={classes.rowName}>{s.name}</span>
                <span className={classes.rowSchool}>{s.school?.name}</span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );

  return (
    <div className={classes.index}>
      <TextInput
        leftSection={<IconSearch size={16} />}
        placeholder={`Search ${spellNames.length} spells`}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        aria-label="Search spells"
        rightSection={
          query ? (
            <IconX size={14} style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setQuery("")} aria-label="Clear search" />
          ) : null
        }
      />

      <Chips label="Spell level">
        {levels.map((l) => (
          <button
            key={l}
            type="button"
            className={classes.chip}
            data-active={level === l || undefined}
            aria-pressed={level === l}
            aria-label={levelHeading(l)}
            onClick={() => setLevel(level === l ? null : l)}
          >
            {levelChip(l)}
          </button>
        ))}
      </Chips>

      <Chips label="School of magic">
        {Object.entries(SCHOOLS).map(([name, meta]) => (
          <Tooltip key={name} label={name} withArrow openDelay={250}>
            <button
              type="button"
              className={`${classes.chip} ${classes.schoolChip}`}
              style={{ "--school": meta.color } as CSSProperties}
              data-active={school === name || undefined}
              aria-pressed={school === name}
              aria-label={name}
              onClick={() => setSchool(school === name ? null : name)}
            >
              <meta.icon size={15} color={meta.color} />
            </button>
          </Tooltip>
        ))}
      </Chips>

      {scrollHeight ? (
        <ScrollArea h={scrollHeight} type="auto" offsetScrollbars>
          {list}
        </ScrollArea>
      ) : (
        list
      )}
    </div>
  );
}

function Chips({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={classes.chips} role="group" aria-label={label}>
      {children}
    </div>
  );
}
