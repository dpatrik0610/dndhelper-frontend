import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ActionIcon, Avatar, Loader, Tooltip } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconBook2, IconGhost2, IconSearch } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { MonsterViewModal } from "@features/admin/MonsterManager/components/MonsterViewModal";
import { SpellModal } from "@features/profile/components/modals/SpellModal";
import { monsterService } from "@services/Admin/monsterService";
import { getSpellById, getSpellNames } from "@services/spellService";
import { useSpellStore } from "@store/spell/spellStore";
import { useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { Monster } from "@appTypes/Monster";
import { crLabel } from "@utils/monster";

type Scope = "all" | "spells" | "monsters";

/** One result row; `pick` opens it. */
interface Hit {
  key: string;
  group: "Spells" | "Monsters";
  title: string;
  meta: string;
  imageUrl?: string | null;
  pick: () => void | Promise<void>;
}

const setOpen = (searchOpen: boolean) => useTabletopStore.getState().set({ searchOpen });

/** Top-bar button for the search popup (also Ctrl+K or /). */
export function SearchButton() {
  const open = useTabletopStore((s) => s.searchOpen);
  return (
    <Tooltip label="Search · Ctrl K">
      <ActionIcon
        data-table-search
        variant={open ? "light" : "subtle"}
        color={open ? "violet" : "gray"}
        onClick={() => setOpen(!open)}
        aria-label="Search"
        aria-pressed={open}
      >
        <IconSearch size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * The centered search over everything you can look up on the table: spells for everyone, monsters in the DM's view.
 * Escape or a click anywhere else closes it; picking a result opens its card.
 */
export function TableSearch() {
  const open = useTabletopStore((s) => s.searchOpen);
  const [spellOpen, setSpellOpen] = useState(false);
  const [monster, setMonster] = useState<Monster | null>(null);
  return (
    <>
      {open && <SearchPopup onSpell={() => setSpellOpen(true)} onMonster={setMonster} />}
      <SpellModal opened={spellOpen} onClose={() => setSpellOpen(false)} />
      <MonsterViewModal monster={monster} onClose={() => setMonster(null)} />
    </>
  );
}

function SearchPopup({ onSpell, onMonster }: { onSpell: () => void; onMonster: (m: Monster) => void }) {
  const dmView = useDmView();
  const names = useSpellStore((s) => s.spellNames);
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query.trim(), 250);
  const [scope, setScope] = useState<Scope>("all");
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [searching, setSearching] = useState(false);
  const [opening, setOpening] = useState(false);
  const [active, setActive] = useState(0);
  const close = () => setOpen(false);

  // A click anywhere else closes it, and still does what it does there. The top-bar button toggles on its own.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!ref.current?.contains(target) && !target.closest("[data-table-search]")) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  // Spell names are cached in the spell store; fetch once.
  useEffect(() => {
    if (names.length) return;
    getSpellNames()
      .then((list) => useSpellStore.getState().setSpellNames(list ?? []))
      .catch(() => showNotification({ message: "Couldn't load the spell list.", color: "red" }));
  }, [names.length]);

  const wantMonsters = dmView && scope !== "spells" && debounced.length >= 2;
  useEffect(() => {
    if (!wantMonsters) return;
    let current = true;
    setSearching(true);
    monsterService
      .search({ query: debounced, pageSize: 8 })
      .then((r) => current && setMonsters(r.items))
      .catch(() => current && setMonsters([]))
      .finally(() => current && setSearching(false));
    return () => {
      current = false;
    };
  }, [wantMonsters, debounced]);

  const q = query.trim().toLowerCase();
  const spellHits: Hit[] =
    scope === "monsters" || !q
      ? []
      : [...new Map(names.filter((n) => n.name.toLowerCase().includes(q)).map((n) => [n.name, n])).values()]
          // Names that start with the query first, then the rest alphabetically.
          .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)) || a.name.localeCompare(b.name))
          .slice(0, 8)
          .map((n) => ({
            key: `spell-${n.id}`,
            group: "Spells",
            title: n.name,
            meta: [n.level ? `Level ${n.level}` : "Cantrip", n.school?.name].filter(Boolean).join(" · "),
            pick: async () => {
              setOpening(true);
              const spell = await getSpellById(n.id).catch(() => null);
              setOpening(false);
              if (!spell) return showNotification({ message: `Couldn't load ${n.name}.`, color: "red" });
              useSpellStore.getState().setCurrentSpell(spell);
              onSpell();
              close();
            },
          }));
  const monsterHits: Hit[] = (wantMonsters ? monsters : []).map((m) => ({
    key: `monster-${m.id}`,
    group: "Monsters",
    title: m.name,
    meta: [`CR ${crLabel(m.challengeRating)}`, m.type, `HP ${m.hitPoints} · AC ${m.armorClass}`].filter(Boolean).join(" · "),
    imageUrl: m.imageUrl,
    pick: () => {
      onMonster(m);
      close();
    },
  }));
  const hits = [...spellHits, ...monsterHits];
  const current = Math.min(active, Math.max(0, hits.length - 1));

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (hits.length) setActive((current + (e.key === "ArrowDown" ? 1 : hits.length - 1)) % hits.length);
    }
    if (e.key === "Enter" && hits[current]) void hits[current].pick();
  };

  const scopes: { value: Scope; label: string }[] = [
    { value: "all", label: "All" },
    { value: "spells", label: "Spells" },
    { value: "monsters", label: "Monsters" },
  ];
  const empty = !q
    ? dmView
      ? "Search spells and monsters"
      : "Search spells"
    : searching && !hits.length
      ? null
      : !hits.length
        ? `Nothing matches “${query.trim()}”`
        : null;

  return (
    <div className="tt-search-layer">
      <div ref={ref} className="tt-search tt-glass tt-pop-in" role="dialog" aria-label="Search">
        <div className="tt-search-bar">
          <IconSearch size={18} className="tt-search-icon" />
          <input
            autoFocus
            className="tt-search-input"
            placeholder={dmView ? "Search spells, monsters…" : "Search spells…"}
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="tt-search-results"
            aria-activedescendant={hits[current]?.key}
          />
          {(searching || opening) && <Loader size={14} color="violet" />}
          <kbd className="tt-search-kbd">Esc</kbd>
        </div>

        {dmView && (
          <div className="tt-search-scopes" role="tablist">
            {scopes.map((s) => (
              <button
                key={s.value}
                type="button"
                role="tab"
                aria-selected={scope === s.value}
                className={`tt-search-scope${scope === s.value ? " on" : ""}`}
                onClick={() => {
                  setScope(s.value);
                  setActive(0);
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {hits.length > 0 && (
          <div id="tt-search-results" className="tt-search-results" role="listbox">
            {hits.map((hit, i) => (
              <div key={hit.key}>
                {hit.group !== hits[i - 1]?.group && <div className="tt-search-group">{hit.group}</div>}
                <div
                  id={hit.key}
                  role="option"
                  aria-selected={i === current}
                  className={`tt-search-hit${i === current ? " active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => void hit.pick()}
                >
                  <Avatar src={hit.imageUrl} size={30} radius="xl" color={hit.group === "Spells" ? "violet" : "red"}>
                    {hit.group === "Spells" ? <IconBook2 size={16} /> : <IconGhost2 size={16} />}
                  </Avatar>
                  <div className="tt-search-hit-text">
                    <strong>{hit.title}</strong>
                    <span>{hit.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {empty && <div className="tt-search-empty">{empty}</div>}
      </div>
    </div>
  );
}
