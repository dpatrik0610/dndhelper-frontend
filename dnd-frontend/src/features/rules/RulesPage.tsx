import { Fragment, Suspense, lazy, useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Loader } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconBook2,
  IconChevronLeft,
  IconChevronRight,
  IconPencil,
  IconSearch,
  IconStar,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import type { Rule } from "@appTypes/Rules/Rule";
import { useRulesStore } from "@store/rules/rulesStore";
import { useCanEditContent, useCurrentCampaignId, useIsDm } from "@store/campaign/campaignSelectors";
import { useIsMobile } from "@hooks/useIsMobile";
import { excerpt, parseQuery, searchRules, type RuleHit } from "./ruleSearch";
import s from "./Rules.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

const ALL = "";
const PINNED = "\u0000pinned";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const pattern = terms.map(escapeRegex).join("|");
  const match = new RegExp(`^(?:${pattern})$`, "i");
  let offset = 0;
  return (
    <>
      {text.split(new RegExp(`(${pattern})`, "gi")).filter(Boolean).map((part) => {
        const key = offset;
        offset += part.length;
        return match.test(part) ? <mark key={key} className={s.mark}>{part}</mark> : <Fragment key={key}>{part}</Fragment>;
      })}
    </>
  );
}

const quoted = (value: string) => (/\s/.test(value) ? `"${value}"` : value);

function withoutFilter(query: string, keys: string, value: string) {
  const v = escapeRegex(value);
  return query.replace(new RegExp(`(^|\\s)(?:${keys})"?${v}"?(?=\\s|$)`, "i"), " ").replace(/\s+/g, " ").trim();
}

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export default function RulesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const campaignId = useCurrentCampaignId();
  const { rules, loading, load } = useRulesStore();
  const isDm = useIsDm();
  const canEdit = useCanEditContent();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(ALL);
  const [pins, setPins] = useLocalStorage<string[]>({ key: "rules-pinned", defaultValue: [] });
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void load(campaignId ?? null);
  }, [campaignId, load]);

  useEffect(() => {
    if (!isMobile) inputRef.current?.focus();
  }, [isMobile]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rules) map.set(r.category, (map.get(r.category) ?? 0) + 1);
    return map;
  }, [rules]);

  const activeTab = tab === ALL || (tab === PINNED ? pins.length > 0 : counts.has(tab)) ? tab : ALL;
  const parsed = useMemo(() => parseQuery(deferred), [deferred]);
  const searching = deferred.trim().length > 0;
  const hits = useMemo(
    () =>
      searchRules(rules, deferred).filter(
        (h) => activeTab === ALL || (activeTab === PINNED ? pins.includes(h.rule.slug) : h.rule.category === activeTab),
      ),
    [rules, deferred, activeTab, pins],
  );
  const list = useMemo(() => hits.map((h) => h.rule), [hits]);
  const current = rules.find((r) => r.slug === slug) ?? null;
  const index = current ? list.findIndex((r) => r.id === current.id) : -1;
  const prev = index > 0 ? list[index - 1] : undefined;
  const next = index >= 0 ? list[index + 1] : undefined;

  const open = (rule: Rule | undefined, replace = false) => {
    if (rule) navigate(`/rules/${rule.slug}`, { replace });
  };
  const close = () => navigate("/rules");

  const togglePin = (ruleSlug: string) =>
    setPins((p) => (p.includes(ruleSlug) ? p.filter((x) => x !== ruleSlug) : [...p, ruleSlug]));

  useEffect(() => {
    if (current) gridRef.current?.querySelector(`[data-slug="${CSS.escape(current.slug)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (typing(e.target)) return;
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape" && slug) {
        navigate("/rules");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slug, navigate]);

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      open(list[Math.min(list.length - 1, Math.max(0, index + step))], true);
    } else if (e.key === "Enter") {
      open(current && index >= 0 ? current : list[0], true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (query) setQuery("");
      else if (slug) close();
      else e.currentTarget.blur();
    }
  };

  const addFilter = (token: string) => {
    if (!query.toLowerCase().split(/\s+/).includes(token.toLowerCase())) setQuery(`${query} ${token}`.trim());
    inputRef.current?.focus();
  };

  const grouped = !searching && activeTab === ALL;
  const groups = useMemo(() => {
    const map = new Map<string, RuleHit<Rule>[]>();
    for (const h of hits) map.set(h.rule.category, [...(map.get(h.rule.category) ?? []), h]);
    return [...map.entries()];
  }, [hits]);

  const filters = [
    ...parsed.categories.map((v) => ({ label: "in", value: v, keys: "cat:|category:|in:|c:" })),
    ...parsed.tags.map((v) => ({ label: "#", value: v, keys: "#|tags?:|t:" })),
  ];

  const pinButton = (rule: Rule, className: string) => {
    const pinned = pins.includes(rule.slug);
    return (
      <button
        type="button"
        className={className}
        onClick={() => togglePin(rule.slug)}
        aria-pressed={pinned}
        aria-label={pinned ? `Unpin ${rule.title}` : `Pin ${rule.title}`}
        title={pinned ? "Unpin" : "Pin"}
      >
        {pinned ? <IconStarFilled size={16} /> : <IconStar size={16} />}
      </button>
    );
  };

  const card = (h: RuleHit<Rule>) => (
    <div key={h.rule.id} data-slug={h.rule.slug} className={s.card} data-active={current?.id === h.rule.id || undefined}>
      <button
        type="button"
        className={s.cardMain}
        onClick={() => open(h.rule)}
        aria-current={current?.id === h.rule.id ? "page" : undefined}
      >
        {!grouped && <span className={s.cardCategory}>{h.rule.category}</span>}
        <span className={s.cardTitle}>
          <Highlight text={h.rule.title} terms={parsed.terms} />
        </span>
        <span className={s.cardText}>
          <Highlight text={h.snippet ?? excerpt(h.rule.content, 110)} terms={parsed.terms} />
        </span>
      </button>
      {pinButton(h.rule, s.cardPin)}
    </div>
  );

  const tabButton = (value: string, label: ReactNode, count: number) => (
    <button key={value || "all"} type="button" className={s.tab} aria-pressed={activeTab === value} onClick={() => setTab(value)}>
      {label}
      <span className={s.tabCount}>{count}</span>
    </button>
  );

  return (
    <div className={s.page} data-reading={current ? "" : undefined}>
      <header className={s.top}>
        <div className={s.bar}>
          <div className={s.brand}>
            <IconBook2 size={22} stroke={1.6} />
            <h1 className="narrative-title" data-themed>Rules</h1>
          </div>

          <label className={s.search}>
            <IconSearch size={18} stroke={1.8} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={onSearchKey}
              placeholder="Search rules"
              aria-label="Search rules"
              spellCheck={false}
            />
            {query ? (
              <button type="button" className={s.clear} onClick={() => setQuery("")} aria-label="Clear search">
                <IconX size={16} />
              </button>
            ) : (
              !isMobile && <kbd className={s.kbd}>/</kbd>
            )}
          </label>

          {isDm && (
            <button
              type="button"
              className={`glass-btn-secondary ${s.manage}`}
              onClick={() => navigate("/dashboard/rules")}
              aria-label="Manage rules"
              title="Manage rules"
            >
              <IconPencil size={16} />
              {!isMobile && "Manage"}
            </button>
          )}
        </div>

        <div className={s.tabs} role="toolbar" aria-label="Categories">
          {tabButton(ALL, "All", rules.length)}
          {pins.length > 0 &&
            tabButton(PINNED, <><IconStarFilled size={13} /> Pinned</>, rules.filter((r) => pins.includes(r.slug)).length)}
          {[...counts].map(([category, count]) => tabButton(category, category, count))}
          {loading && <Loader size={14} color="var(--theme-color-accent-primary)" className={s.tabsLoader} />}
        </div>

        {filters.length > 0 && (
          <div className={s.filters}>
            {filters.map((f) => (
              <button
                key={`${f.label}${f.value}`}
                type="button"
                className={s.filter}
                onClick={() => setQuery(withoutFilter(query, f.keys, f.value))}
                aria-label={`Remove filter ${f.label} ${f.value}`}
              >
                <span className={s.filterKey}>{f.label}</span>
                {f.value}
                <IconX size={12} />
              </button>
            ))}
          </div>
        )}
      </header>

      <div className={s.layout}>
        <div ref={gridRef} className={s.browse}>
          {grouped
            ? groups.map(([category, items]) => (
                <section key={category} className={s.group}>
                  <h2 className={`narrative-title ${s.groupTitle}`} data-themed>
                    {category}
                    <span className={s.groupCount}>{items.length}</span>
                  </h2>
                  <div className={s.grid}>{items.map(card)}</div>
                </section>
              ))
            : hits.length > 0 && <div className={s.grid}>{hits.map(card)}</div>}

          {!loading && hits.length === 0 && (
            <div className={s.empty}>
              <IconBook2 size={36} stroke={1.3} />
              <p>{rules.length ? "Nothing matches. Try fewer words or another category." : "This campaign has no rules yet."}</p>
              {rules.length > 0 ? (
                <button type="button" className="glass-btn-secondary" onClick={() => { setQuery(""); setTab(ALL); }}>
                  Show all rules
                </button>
              ) : (
                isDm && (
                  <button type="button" className="glass-btn-primary" onClick={() => navigate("/dashboard/rules")}>
                    Write the first rule
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {current && (
          <aside className={s.reader} aria-label={current.title}>
            <div className={s.toolbar}>
              <button type="button" className={s.iconBtn} onClick={close} aria-label={isMobile ? "Back to rules" : "Close"} title="Close (Esc)">
                {isMobile ? <IconArrowLeft size={18} /> : <IconX size={18} />}
              </button>
              <div className={s.toolbarEnd}>
                <button type="button" className={s.iconBtn} disabled={!prev} onClick={() => open(prev)} aria-label="Previous rule" title={prev?.title}>
                  <IconChevronLeft size={18} />
                </button>
                <button type="button" className={s.iconBtn} disabled={!next} onClick={() => open(next)} aria-label="Next rule" title={next?.title}>
                  <IconChevronRight size={18} />
                </button>
                {pinButton(current, s.iconBtn)}
                {canEdit(current.campaignId) && (
                  <button
                    type="button"
                    className={s.iconBtn}
                    onClick={() => navigate(`/dashboard/rules?rule=${encodeURIComponent(current.slug)}`)}
                    aria-label="Edit rule"
                    title="Edit"
                  >
                    <IconPencil size={17} />
                  </button>
                )}
              </div>
            </div>

            <article key={current.id} className={s.article}>
              <h2 className={`narrative-title ${s.title}`} data-themed>{current.title}</h2>
              <div className={s.meta}>
                <button type="button" className={s.chip} data-kind="category" onClick={() => setTab(current.category)}>
                  {current.category}
                </button>
                {current.tags.map((t) => (
                  <button key={t} type="button" className={s.chip} onClick={() => addFilter(`#${quoted(t)}`)}>
                    #{t}
                  </button>
                ))}
                {current.source && <span className={s.source}>{current.source}</span>}
              </div>

              {current.content.trim() ? (
                <Suspense fallback={<Loader size="sm" color="var(--theme-color-accent-primary)" />}>
                  <MarkdownRenderer
                    content={current.content}
                    highlightQuery={parsed.terms[0]}
                    className={s.prose}
                    textColor="var(--theme-color-text-primary)"
                    onInternalLink={(href) => open(rules.find((r) => r.slug === href.slice(1)))}
                  />
                </Suspense>
              ) : (
                <p className={s.muted}>This rule has no text yet.</p>
              )}
            </article>
          </aside>
        )}
      </div>
    </div>
  );
}
