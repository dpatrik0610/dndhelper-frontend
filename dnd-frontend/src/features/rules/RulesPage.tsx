import { Fragment, Suspense, lazy, useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Loader } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconBook2, IconPencil, IconSearch, IconX } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router";
import type { Rule } from "@appTypes/Rules/Rule";
import { useRulesStore } from "@store/rules/rulesStore";
import { useCanEditContent, useCurrentCampaignId, useIsDm } from "@store/campaign/campaignSelectors";
import { useIsMobile } from "@hooks/useIsMobile";
import { excerpt, parseQuery, searchRules } from "./ruleSearch";
import s from "./Rules.module.css";

const MarkdownRenderer = lazy(() => import("@components/MarkdownRender").then((m) => ({ default: m.MarkdownRenderer })));

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const pattern = terms.map(escapeRegex).join("|");
  const match = new RegExp(`^(?:${pattern})$`, "i");
  let offset = 0;
  return (
    <>
      {text.split(new RegExp(`(${pattern})`, "gi")).map((part) => {
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

export default function RulesPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const campaignId = useCurrentCampaignId();
  const { rules, loading, load } = useRulesStore();
  const isDm = useIsDm();
  const canEdit = useCanEditContent();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    void load(campaignId ?? null);
  }, [campaignId, load]);

  useEffect(() => {
    if (!isMobile) inputRef.current?.focus();
  }, [isMobile]);

  const parsed = useMemo(() => parseQuery(deferred), [deferred]);
  const hits = useMemo(() => searchRules(rules, deferred), [rules, deferred]);
  const searching = deferred.trim().length > 0;
  const list = useMemo(() => hits.map((h) => h.rule), [hits]);
  const current = rules.find((r) => r.slug === slug) ?? (isMobile ? null : list[0] ?? null);
  const index = current ? list.findIndex((r) => r.id === current.id) : -1;

  const open = (rule: Rule | undefined, replace = false) => {
    if (rule) navigate(`/rules/${rule.slug}`, { replace });
  };

  useEffect(() => {
    if (current) navRef.current?.querySelector(`[data-slug="${CSS.escape(current.slug)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  const onSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      open(list[Math.min(list.length - 1, Math.max(0, index + step))], true);
    } else if (e.key === "Enter") {
      open(current && index >= 0 ? current : list[0], true);
    } else if (e.key === "Escape" && query) {
      e.preventDefault();
      setQuery("");
    }
  };

  const addFilter = (token: string) => {
    if (!query.toLowerCase().split(/\s+/).includes(token.toLowerCase())) setQuery(`${query} ${token}`.trim());
    inputRef.current?.focus();
  };

  const groups = useMemo(() => {
    const map = new Map<string, Rule[]>();
    for (const rule of list) map.set(rule.category, [...(map.get(rule.category) ?? []), rule]);
    return [...map.entries()];
  }, [list]);

  const navItem = (rule: Rule, snippet?: string) => (
    <button
      key={rule.id}
      type="button"
      data-slug={rule.slug}
      className={s.navItem}
      aria-current={current?.id === rule.id ? "page" : undefined}
      onClick={() => open(rule)}
    >
      <span className={s.navTitle}>
        <Highlight text={rule.title} terms={parsed.terms} />
      </span>
      {searching && (
        <span className={s.navSnippet}>
          <Highlight text={snippet ?? excerpt(rule.content, 90)} terms={parsed.terms} />
        </span>
      )}
    </button>
  );

  const showNav = !isMobile || !current;
  const showReader = !isMobile || !!current;
  const filters = [
    ...parsed.categories.map((v) => ({ label: "in", value: v, keys: "cat:|category:|in:|c:" })),
    ...parsed.tags.map((v) => ({ label: "#", value: v, keys: "#|tags?:|t:" })),
  ];

  return (
    <div className={s.page}>
      <header className={s.top}>
        <div className={s.brand}>
          <IconBook2 size={22} stroke={1.6} />
          <h1 className="narrative-title" data-themed>Rules</h1>
        </div>

        <div className={s.searchWrap}>
          <label className={s.search}>
            <IconSearch size={18} stroke={1.8} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={onSearchKey}
              placeholder="Search rules, or narrow with #tag and cat:combat"
              aria-label="Search rules"
              spellCheck={false}
            />
            {query ? (
              <button type="button" className={s.clear} onClick={() => setQuery("")} aria-label="Clear search">
                <IconX size={16} />
              </button>
            ) : null}
          </label>
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
        </div>

        {isDm && (
          <button type="button" className={`glass-btn-secondary ${s.manage}`} onClick={() => navigate("/dashboard/rules")}>
            <IconPencil size={15} />
            Manage
          </button>
        )}
      </header>

      <div className={s.body}>
        {showNav && (
          <nav ref={navRef} className={s.nav} aria-label="Rules">
            <div className={s.navMeta}>
              {searching ? `${list.length} of ${rules.length} rules` : `${rules.length} rules`}
              {loading && <Loader size={12} color="var(--theme-color-accent-primary)" />}
            </div>
            {searching
              ? hits.map((h) => navItem(h.rule, h.snippet))
              : groups.map(([category, items]) => (
                  <section key={category} className={s.group}>
                    <h2 className={s.groupTitle}>
                      {category}
                      <span>{items.length}</span>
                    </h2>
                    {items.map((r) => navItem(r))}
                  </section>
                ))}
            {!loading && list.length === 0 && (
              <p className={s.navEmpty}>
                {rules.length ? "Nothing matches. Try fewer words or remove a filter." : "This campaign has no rules yet."}
              </p>
            )}
          </nav>
        )}

        {showReader && (
          <main className={s.reader}>
            {current ? (
              <article key={current.id}>
                {isMobile && (
                  <button type="button" className={s.back} onClick={() => navigate("/rules")}>
                    <IconArrowLeft size={16} /> All rules
                  </button>
                )}
                <header className={s.head}>
                  <div className={s.meta}>
                    <button type="button" className={s.category} onClick={() => addFilter(`cat:${quoted(current.category)}`)}>
                      {current.category}
                    </button>
                    {current.source && <span className={s.source}>{current.source}</span>}
                    {canEdit(current.campaignId) && (
                      <button
                        type="button"
                        className={s.edit}
                        onClick={() => navigate(`/dashboard/rules?rule=${encodeURIComponent(current.slug)}`)}
                      >
                        <IconPencil size={14} /> Edit
                      </button>
                    )}
                  </div>
                  <h2 className={`narrative-title ${s.title}`} data-themed>{current.title}</h2>
                  {current.tags.length > 0 && (
                    <div className={s.tags}>
                      {current.tags.map((t) => (
                        <button key={t} type="button" className={s.tag} onClick={() => addFilter(`#${quoted(t)}`)}>
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                </header>

                <div className={s.content}>
                  {current.content.trim() ? (
                    <Suspense fallback={<Loader size="sm" color="var(--theme-color-accent-primary)" />}>
                      <MarkdownRenderer
                        content={current.content}
                        highlightQuery={parsed.terms[0]}
                        textColor="var(--theme-color-text-primary)"
                        onInternalLink={(href) => open(rules.find((r) => r.slug === href.slice(1)))}
                      />
                    </Suspense>
                  ) : (
                    <p className={s.muted}>This rule has no text yet.</p>
                  )}
                </div>

                {index >= 0 && list.length > 1 && (
                  <footer className={s.pager}>
                    {list[index - 1] ? (
                      <button type="button" onClick={() => open(list[index - 1])}>
                        <span><IconArrowLeft size={14} /> Previous</span>
                        <strong>{list[index - 1].title}</strong>
                      </button>
                    ) : <span />}
                    {list[index + 1] && (
                      <button type="button" className={s.next} onClick={() => open(list[index + 1])}>
                        <span>Next <IconArrowRight size={14} /></span>
                        <strong>{list[index + 1].title}</strong>
                      </button>
                    )}
                  </footer>
                )}
              </article>
            ) : (
              <div className={s.empty}>
                <IconBook2 size={36} stroke={1.3} />
                <p>{loading ? "Loading rules…" : rules.length ? "Pick a rule from the list." : "No rules here yet."}</p>
                {!loading && !rules.length && isDm && (
                  <button type="button" className="glass-btn-primary" onClick={() => navigate("/dashboard/rules")}>
                    Write the first rule
                  </button>
                )}
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
