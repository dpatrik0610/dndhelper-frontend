import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, Loader } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconBackpack, IconBook2, IconBox, IconGhost2, IconSearch, IconSword } from "@tabler/icons-react";
import { showNotification } from "@components/Notification/Notification";
import { MonsterViewModal } from "@features/admin/MonsterManager/components/MonsterViewModal";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";
import { SpellModal } from "@features/profile/components/modals/SpellModal";
import { monsterService } from "@services/Admin/monsterService";
import { searchEquipmentByName } from "@services/equipmentService";
import { getAllInventories } from "@services/inventoryService";
import { getSpellById, getSpellNames } from "@services/spellService";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useIsDm } from "@store/campaign/campaignSelectors";
import { useSpellStore } from "@store/spell/spellStore";
import { useDmView } from "@store/tabletop/tabletopStore";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import type { Monster } from "@appTypes/Monster";
import { crLabel } from "@utils/monster";
import { useSearchStore } from "./searchStore";
import "./search.css";

type Scope = "all" | "spells" | "monsters" | "items" | "inventories";
type Group = "Spells" | "Monsters" | "Items" | "Inventories" | "Carried";

const GROUPS: Record<Group, { icon: typeof IconBook2; color: string }> = {
  Spells: { icon: IconBook2, color: "violet" },
  Monsters: { icon: IconGhost2, color: "red" },
  Items: { icon: IconSword, color: "yellow" },
  Inventories: { icon: IconBox, color: "teal" },
  Carried: { icon: IconBackpack, color: "teal" },
};

const SCOPES: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "spells", label: "Spells" },
  { value: "monsters", label: "Monsters" },
  { value: "items", label: "Items" },
  { value: "inventories", label: "Inventories" },
];

const LIMIT = 8;

/** One result row; `pick` opens it. */
interface Hit {
  key: string;
  group: Group;
  title: string;
  meta: string;
  imageUrl?: string | null;
  pick: () => void | Promise<void>;
}

const close = () => useSearchStore.getState().setOpen(false);

/** Names that start with the query first, then the rest alphabetically. */
const byRelevance = (q: string) => (a: string, b: string) =>
  Number(!a.toLowerCase().startsWith(q)) - Number(!b.toLowerCase().startsWith(q)) || a.localeCompare(b);

/** The popup plus the cards its results open. Stays mounted after the first open (see searchStore). */
export default function SearchPalette() {
  const open = useSearchStore((s) => s.open);
  const [spellOpen, setSpellOpen] = useState(false);
  const [monster, setMonster] = useState<Monster | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  return (
    <>
      {open && <SearchPopup onSpell={() => setSpellOpen(true)} onMonster={setMonster} onItem={setItemId} />}
      <SpellModal opened={spellOpen} onClose={() => setSpellOpen(false)} />
      <MonsterViewModal monster={monster} onClose={() => setMonster(null)} />
      <EquipmentModal opened={!!itemId} equipmentId={itemId} onClose={() => setItemId(null)} />
    </>
  );
}

/**
 * The centered search: spells for everyone; monsters, items and inventories (by name, or by an item inside) for the DM.
 * Escape or a click anywhere else closes it; picking a result opens its card.
 */
function SearchPopup({ onSpell, onMonster, onItem }: { onSpell: () => void; onMonster: (m: Monster) => void; onItem: (id: string) => void }) {
  const navigate = useNavigate();
  // On a joined table the table's own DM view rules (a DM can preview as a player); everywhere else, the campaign role.
  const onTable = useLocation().pathname.startsWith("/table/");
  const tableDmView = useDmView();
  const isDm = useIsDm();
  const dmView = onTable ? tableDmView : isDm;

  const names = useSpellStore((s) => s.spellNames);
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debounced] = useDebouncedValue(query.trim(), 250);
  const [scope, setScope] = useState<Scope>("all");
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [items, setItems] = useState<Equipment[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [searching, setSearching] = useState(0);
  const [opening, setOpening] = useState(false);
  const [active, setActive] = useState(0);

  // A click anywhere else closes it, and still does what it does there. The search buttons toggle on their own.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (!ref.current?.contains(target) && !target.closest("[data-global-search]")) close();
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

  // Inventories are few: fetch the campaign's once per open and filter here. The server scopes them to what the caller may see.
  useEffect(() => {
    if (!dmView) return;
    getAllInventories()
      .then((list) => setInventories(list ?? []))
      .catch(() => setInventories([]));
  }, [dmView]);

  const wants = (s: Scope) => dmView && (scope === "all" || scope === s) && debounced.length >= 2;
  useServerSearch(wants("monsters"), debounced, (q) => monsterService.search({ query: q, pageSize: LIMIT }).then((r) => r.items), setMonsters, setSearching);
  useServerSearch(wants("items"), debounced, searchEquipmentByName, setItems, setSearching);

  const q = query.trim().toLowerCase();
  const show = (s: Scope) => !!q && (scope === "all" || scope === s);

  const spellHits: Hit[] = !show("spells")
    ? []
    : [...new Map(names.filter((n) => n.name.toLowerCase().includes(q)).map((n) => [n.name, n])).values()]
        .sort((a, b) => byRelevance(q)(a.name, b.name))
        .slice(0, LIMIT)
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

  const monsterHits: Hit[] = (wants("monsters") ? monsters : []).map((m) => ({
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

  const itemHits: Hit[] = (wants("items") ? items : [])
    .filter((e) => e.id)
    .sort((a, b) => byRelevance(q)(a.name, b.name))
    .slice(0, LIMIT)
    .map((e) => ({
      key: `item-${e.id}`,
      group: "Items",
      title: e.name,
      meta: [e.tier, e.damage && `${e.damage.damageDice} ${e.damage.damageType?.name ?? ""}`.trim(), ...(e.tags ?? []).slice(0, 2)].filter(Boolean).join(" · "),
      pick: () => {
        onItem(e.id!);
        close();
      },
    }));

  // Inventories open in the DM dashboard, selected.
  const openInventory = (inv: Inventory) => {
    useAdminInventoryStore.getState().setSelected(inv);
    navigate("/dashboard/inventories");
    close();
  };
  const searchInventories = dmView && show("inventories");
  const inventoryHits: Hit[] = (searchInventories ? inventories : [])
    .filter((inv) => (inv.name ?? "").toLowerCase().includes(q))
    .sort((a, b) => byRelevance(q)(a.name ?? "", b.name ?? ""))
    .slice(0, LIMIT)
    .map((inv) => ({
      key: `inventory-${inv.id}`,
      group: "Inventories",
      title: inv.name || "Inventory",
      meta: `${inv.items?.length ?? 0} items`,
      pick: () => openInventory(inv),
    }));
  // Where an item is: each match inside an inventory, "Longsword ×2 · in Bram's pack".
  const carriedHits: Hit[] = (searchInventories ? inventories : [])
    .flatMap((inv) =>
      (inv.items ?? [])
        .filter((it) => (it.equipmentName ?? "").toLowerCase().includes(q))
        .map((it) => ({
          key: `carried-${inv.id}-${it.equipmentId}`,
          group: "Carried" as const,
          title: it.equipmentName!,
          meta: `×${it.quantity ?? 1} · in ${inv.name || "Inventory"}`,
          pick: () => openInventory(inv),
        })),
    )
    .sort((a, b) => byRelevance(q)(a.title, b.title))
    .slice(0, LIMIT);

  const hits = [...spellHits, ...monsterHits, ...itemHits, ...inventoryHits, ...carriedHits];
  const current = Math.min(active, Math.max(0, hits.length - 1));

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (hits.length) setActive((current + (e.key === "ArrowDown" ? 1 : hits.length - 1)) % hits.length);
    }
    if (e.key === "Enter" && hits[current]) void hits[current].pick();
  };

  const empty = !q
    ? dmView
      ? "Search spells, monsters, items and inventories"
      : "Search spells"
    : searching && !hits.length
      ? null
      : !hits.length
        ? `Nothing matches “${query.trim()}”`
        : null;

  return (
    <div className="gs-layer">
      <div ref={ref} className="gs gs-pop-in" role="dialog" aria-label="Search">
        <div className="gs-bar">
          <IconSearch size={18} className="gs-icon" />
          <input
            autoFocus
            className="gs-input"
            placeholder={dmView ? "Search spells, monsters, items, inventories…" : "Search spells…"}
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="gs-results"
            aria-activedescendant={hits[current]?.key}
          />
          {(searching > 0 || opening) && <Loader size={14} color="violet" />}
          <kbd className="gs-kbd">Esc</kbd>
        </div>

        {dmView && (
          <div className="gs-scopes" role="tablist">
            {SCOPES.map((s) => (
              <button
                key={s.value}
                type="button"
                role="tab"
                aria-selected={scope === s.value}
                className={`gs-scope${scope === s.value ? " on" : ""}`}
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
          <div id="gs-results" className="gs-results" role="listbox">
            {hits.map((hit, i) => {
              const { icon: Icon, color } = GROUPS[hit.group];
              return (
                <div key={hit.key}>
                  {hit.group !== hits[i - 1]?.group && <div className="gs-group">{hit.group === "Carried" ? "In inventories" : hit.group}</div>}
                  <div
                    id={hit.key}
                    role="option"
                    aria-selected={i === current}
                    className={`gs-hit${i === current ? " active" : ""}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => void hit.pick()}
                  >
                    <Avatar src={hit.imageUrl} size={30} radius="xl" color={color}>
                      <Icon size={16} />
                    </Avatar>
                    <div className="gs-hit-text">
                      <strong>{hit.title}</strong>
                      <span>{hit.meta}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {empty && <div className="gs-empty">{empty}</div>}
      </div>
    </div>
  );
}

/** Runs `fetch` for the debounced query while `enabled`, dropping stale answers; `busy` counts searches in flight. */
function useServerSearch<T>(
  enabled: boolean,
  query: string,
  fetch: (q: string) => Promise<T[]>,
  setResults: (r: T[]) => void,
  busy: (f: (n: number) => number) => void,
) {
  useEffect(() => {
    if (!enabled) return;
    let current = true;
    busy((n) => n + 1);
    fetch(query)
      .then((r) => current && setResults(r ?? []))
      .catch(() => current && setResults([]))
      .finally(() => busy((n) => n - 1));
    return () => {
      current = false;
    };
    // fetch and the setters are stable for a given call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, query]);
}
