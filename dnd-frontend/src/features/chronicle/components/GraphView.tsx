import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TextInput } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import {
  IconArrowRight,
  IconChartDots3,
  IconFocusCentered,
  IconMinus,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import {
  CHRONICLE_CATEGORIES,
  CHRONICLE_CATEGORY_COLORS,
  CHRONICLE_CATEGORY_LABELS,
  type ChronicleCategory,
  type ChronicleEntry,
} from "@appTypes/Chronicle";
import {
  linkEdges,
  plainText,
  type TitleIndex,
} from "@features/chronicle/chronicleLinks";
import { layoutGraph, type Point } from "@features/chronicle/graphLayout";
import classes from "@features/chronicle/Chronicle.module.css";

interface View {
  x: number;
  y: number;
  k: number;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const DOUBLE_CLICK_MS = 400;

const clampZoom = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

const zoomAt = (v: View, px: number, py: number, factor: number): View => {
  const k = clampZoom(v.k * factor);
  const f = k / v.k;
  return { k, x: px - (px - v.x) * f, y: py - (py - v.y) * f };
};

const snippet = (content: string) =>
  plainText(
    content
      .replace(/%%/g, "")
      .replace(/\[\[(?:[^\]|\n]+\|)?([^\]\n]+)\]\]/g, "$1")
      .replace(/^#+\s*/gm, ""),
  )
    .replace(/\s+/g, " ")
    .slice(0, 220);

const shorten = (title: string) =>
  title.length > 28 ? `${title.slice(0, 27)}…` : title;

const tint = (category: ChronicleCategory) =>
  ({ "--c": CHRONICLE_CATEGORY_COLORS[category] }) as CSSProperties;

interface GraphViewProps {
  entries: ChronicleEntry[];
  index: TitleIndex<ChronicleEntry>;
  selectedId: string | null;
  onOpen: (id: string) => void;
}

export function GraphView({
  entries,
  index,
  selectedId,
  onOpen,
}: GraphViewProps) {
  const { ref: canvasRef, width, height } = useElementSize();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    id: string | null;
    x: number;
    y: number;
    origin: Point;
    moved: boolean;
  } | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const lastClick = useRef<{ id: string; t: number } | null>(null);

  const [hovered, setHovered] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(selectedId);
  const [query, setQuery] = useState("");
  const [hiddenCats, setHiddenCats] = useState<ReadonlySet<ChronicleCategory>>(
    new Set(),
  );
  const [hideOrphans, setHideOrphans] = useState(false);
  const [moved, setMoved] = useState<ReadonlyMap<string, Point>>(new Map());
  const [userView, setUserView] = useState<View | null>(null);
  const [glide, setGlide] = useState(false);

  const { edges, layout, adjacency, byId, counts } = useMemo(() => {
    const edges = linkEdges(entries, index);
    const ids = entries.map((e) => e.id).sort();
    const adjacency = new Map<string, string[]>();
    for (const [a, b] of edges) {
      adjacency.set(a, [...(adjacency.get(a) ?? []), b]);
      adjacency.set(b, [...(adjacency.get(b) ?? []), a]);
    }
    const counts = new Map<ChronicleCategory, number>();
    for (const e of entries)
      counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    const scale = Math.max(1, Math.sqrt(ids.length / 40));
    return {
      edges,
      adjacency,
      counts,
      byId: new Map(entries.map((e) => [e.id, e])),
      layout: layoutGraph(ids, edges, 1200 * scale, 800 * scale),
    };
  }, [entries, index]);

  const shown = useMemo(
    () =>
      entries.filter(
        (e) =>
          layout.has(e.id) &&
          !hiddenCats.has(e.category) &&
          !(hideOrphans && !adjacency.has(e.id)),
      ),
    [entries, layout, hiddenCats, hideOrphans, adjacency],
  );
  const shownIds = useMemo(() => new Set(shown.map((e) => e.id)), [shown]);
  const shownEdges = useMemo(
    () => edges.filter(([a, b]) => shownIds.has(a) && shownIds.has(b)),
    [edges, shownIds],
  );

  const fitView = useMemo<View>(() => {
    if (!width || !height || shown.length === 0) return { x: 0, y: 0, k: 1 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const e of shown) {
      const p = layout.get(e.id)!;
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const pad = 80;
    const k = clampZoom(
      Math.min(
        (width - pad * 2) / Math.max(maxX - minX, 1),
        (height - pad * 2) / Math.max(maxY - minY, 1),
        1.4,
      ),
    );
    return {
      k,
      x: width / 2 - ((minX + maxX) / 2) * k,
      y: height / 2 - ((minY + maxY) / 2) * k,
    };
  }, [shown, layout, width, height]);

  const view = userView ?? fitView;

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      setGlide(false);
      setUserView((prev) =>
        zoomAt(prev ?? fitView, e.clientX - r.left, e.clientY - r.top, factor),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [fitView]);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      q
        ? shown.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.tags.some((t) => t.toLowerCase().includes(q)),
          )
        : null,
    [q, shown],
  );
  const matchIds = useMemo(
    () => (matches ? new Set(matches.map((e) => e.id)) : null),
    [matches],
  );

  const pickedEntry = picked && shownIds.has(picked) ? byId.get(picked) : null;
  const focus =
    (hovered && shownIds.has(hovered) ? hovered : null) ??
    pickedEntry?.id ??
    null;
  const neighbours = useMemo(
    () => new Set(focus ? [focus, ...(adjacency.get(focus) ?? [])] : []),
    [adjacency, focus],
  );

  if (entries.length === 0)
    return (
      <div className={classes.centered}>
        <IconChartDots3 size={36} className={classes.centeredIcon} />
        <p className={classes.muted}>
          No entries yet. Link entries to each other with [[Title]] and their
          connections appear here.
        </p>
      </div>
    );

  const at = (id: string) => moved.get(id) ?? layout.get(id)!;
  const degree = (id: string) => adjacency.get(id)?.length ?? 0;
  const dim = (id: string) =>
    focus ? !neighbours.has(id) : matchIds ? !matchIds.has(id) : false;
  const labelled = (id: string) =>
    focus
      ? neighbours.has(id)
      : matchIds
        ? matchIds.has(id)
        : view.k >= 0.9 || degree(id) >= (view.k >= 0.5 ? 2 : 4);

  const centreOn = (id: string) => {
    const p = at(id);
    const k = Math.max(view.k, 1);
    setGlide(true);
    setUserView({ k, x: width / 2 - p.x * k, y: height / 2 - p.y * k });
  };
  const pick = (id: string) => {
    setPicked(id);
    centreOn(id);
  };
  const zoomBy = (factor: number) => {
    setGlide(true);
    setUserView(zoomAt(view, width / 2, height / 2, factor));
  };
  const fit = () => {
    setGlide(true);
    setUserView(null);
  };

  const local = (e: ReactPointerEvent<SVGSVGElement>): Point => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setGlide(false);
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size > 1) {
      drag.current = null;
      return;
    }
    const id =
      (e.target as Element).closest<SVGGElement>("[data-id]")?.dataset.id ??
      null;
    drag.current = {
      id,
      x: p.x,
      y: p.y,
      origin: id ? at(id) : { x: view.x, y: view.y },
      moved: false,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);

    if (pointers.current.size === 2) {
      const other = [...pointers.current].find(
        ([pid]) => pid !== e.pointerId,
      )![1];
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(p.x - other.x, p.y - other.y);
      if (before > 0)
        setUserView((v) =>
          zoomAt(
            v ?? fitView,
            (p.x + other.x) / 2,
            (p.y + other.y) / 2,
            after / before,
          ),
        );
      return;
    }

    const d = drag.current;
    if (!d) return;
    const dx = p.x - d.x;
    const dy = p.y - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    d.moved = true;
    const id = d.id;
    if (id)
      setMoved((m) =>
        new Map(m).set(id, {
          x: d.origin.x + dx / view.k,
          y: d.origin.y + dy / view.k,
        }),
      );
    else setUserView({ k: view.k, x: d.origin.x + dx, y: d.origin.y + dy });
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || e.type === "pointercancel") return;
    if (!d.id) {
      setPicked(null);
      return;
    }
    const last = lastClick.current;
    if (last?.id === d.id && e.timeStamp - last.t < DOUBLE_CLICK_MS) {
      onOpen(d.id);
      return;
    }
    lastClick.current = { id: d.id, t: e.timeStamp };
    setPicked(d.id);
  };

  const grid = 26 * view.k * (view.k < 0.45 ? 4 : view.k < 0.9 ? 2 : 1);
  const orphans = entries.filter((e) => !adjacency.has(e.id)).length;
  const linked = pickedEntry
    ? (adjacency.get(pickedEntry.id) ?? [])
        .filter((id) => shownIds.has(id))
        .map((id) => byId.get(id)!)
        .sort((a, b) => a.title.localeCompare(b.title))
    : [];
  const preview = pickedEntry ? snippet(pickedEntry.content) : "";

  return (
    <div className={classes.graph}>
      <div
        ref={canvasRef}
        className={classes.graphCanvas}
        data-glide={glide || undefined}
        style={{
          backgroundSize: `${grid}px ${grid}px, 100% 100%`,
          backgroundPosition: `${view.x}px ${view.y}px, 0 0`,
        }}
      >
        <svg
          ref={svgRef}
          className={classes.graphSvg}
          role="group"
          aria-label="Graph of linked Chronicle entries"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <g
            className={classes.graphWorld}
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
            }}
          >
            {shownEdges.map(([a, b]) => {
              const p = at(a);
              const s = at(b);
              const lit = focus != null && (a === focus || b === focus);
              return (
                <line
                  key={`${a}|${b}`}
                  className={classes.graphEdge}
                  data-lit={lit || undefined}
                  data-dim={(!lit && (dim(a) || dim(b))) || undefined}
                  x1={p.x}
                  y1={p.y}
                  x2={s.x}
                  y2={s.y}
                />
              );
            })}
            {shown.map((e) => {
              const p = at(e.id);
              const r = 7 + Math.min(degree(e.id), 10) * 1.3;
              return (
                <g
                  key={e.id}
                  data-id={e.id}
                  className={classes.graphNode}
                  data-dim={dim(e.id) || undefined}
                  data-picked={e.id === pickedEntry?.id || undefined}
                  data-open={e.id === selectedId || undefined}
                  data-match={matchIds?.has(e.id) || undefined}
                  style={tint(e.category)}
                  transform={`translate(${p.x} ${p.y})`}
                  onMouseEnter={() => setHovered(e.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(e.id)}
                  onBlur={() => setHovered(null)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") onOpen(e.id);
                    if (ev.key === " ") {
                      ev.preventDefault();
                      pick(e.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${e.title}, ${CHRONICLE_CATEGORY_LABELS[e.category]}, ${degree(e.id)} links`}
                >
                  <circle className={classes.graphHalo} r={r + 8} />
                  <circle className={classes.graphDot} r={r} />
                  {labelled(e.id) && (
                    <text
                      className={classes.graphLabel}
                      y={r + 15 / view.k}
                      textAnchor="middle"
                      fontSize={12.5 / view.k}
                      strokeWidth={4 / view.k}
                    >
                      {shorten(e.title)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        <TextInput
          className={classes.graphSearch}
          classNames={{ input: "glassy-input" }}
          size="sm"
          aria-label="Find an entry in the graph"
          placeholder="Find in graph"
          leftSection={<IconSearch size={15} />}
          rightSection={
            matches && (
              <span className={classes.chipCount}>{matches.length}</span>
            )
          }
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches?.[0]) pick(matches[0].id);
            if (e.key === "Escape") setQuery("");
          }}
        />

        <div className={classes.graphControls}>
          <button
            type="button"
            className={classes.iconButton}
            onClick={() => zoomBy(1.4)}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <IconPlus size={16} />
          </button>
          <button
            type="button"
            className={classes.iconButton}
            onClick={() => zoomBy(1 / 1.4)}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <IconMinus size={16} />
          </button>
          <button
            type="button"
            className={classes.iconButton}
            onClick={fit}
            aria-label="Fit the whole graph"
            title="Fit the whole graph"
          >
            <IconFocusCentered size={16} />
          </button>
        </div>

        {pickedEntry ? (
          <aside className={classes.graphCard} aria-label="Selected entry">
            <div className={classes.graphCardHead}>
              <span className={classes.graphCardKind}>
                <span
                  className={classes.dot}
                  style={{
                    background: CHRONICLE_CATEGORY_COLORS[pickedEntry.category],
                  }}
                />
                {CHRONICLE_CATEGORY_LABELS[pickedEntry.category]} ·{" "}
                {linked.length} {linked.length === 1 ? "link" : "links"}
              </span>
              <button
                type="button"
                className={classes.iconButton}
                onClick={() => setPicked(null)}
                aria-label="Close preview"
              >
                <IconX size={15} />
              </button>
            </div>
            <h3 className={classes.graphCardTitle}>{pickedEntry.title}</h3>
            {preview && (
              <p className={classes.graphCardText}>
                {preview}
                {preview.length >= 220 && "…"}
              </p>
            )}
            {linked.length > 0 && (
              <div className={classes.filters}>
                {linked.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={classes.chip}
                    onClick={() => pick(n.id)}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <span
                      className={classes.dot}
                      style={{
                        background: CHRONICLE_CATEGORY_COLORS[n.category],
                      }}
                    />
                    <span className={classes.graphChipLabel}>{n.title}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              className={`glass-btn-primary ${classes.button}`}
              onClick={() => onOpen(pickedEntry.id)}
            >
              Open entry <IconArrowRight size={15} />
            </button>
          </aside>
        ) : (
          <p className={classes.graphHint}>
            Drag to pan · scroll to zoom · click to preview · double-click to
            open
          </p>
        )}
      </div>

      <div className={classes.graphLegend}>
        {CHRONICLE_CATEGORIES.filter((c) => counts.has(c)).map((c) => (
          <button
            key={c}
            type="button"
            className={classes.chip}
            data-active={!hiddenCats.has(c) || undefined}
            aria-pressed={!hiddenCats.has(c)}
            title={`${hiddenCats.has(c) ? "Show" : "Hide"} ${CHRONICLE_CATEGORY_LABELS[c]}`}
            onClick={() =>
              setHiddenCats((prev) => {
                const next = new Set(prev);
                if (!next.delete(c)) next.add(c);
                return next;
              })
            }
          >
            <span
              className={classes.dot}
              style={{ background: CHRONICLE_CATEGORY_COLORS[c] }}
            />
            {CHRONICLE_CATEGORY_LABELS[c]}
            <span className={classes.chipCount}>{counts.get(c)}</span>
          </button>
        ))}
        {orphans > 0 && (
          <button
            type="button"
            className={classes.chip}
            data-active={!hideOrphans || undefined}
            aria-pressed={!hideOrphans}
            title={`${hideOrphans ? "Show" : "Hide"} entries with no links`}
            onClick={() => setHideOrphans(!hideOrphans)}
          >
            Unlinked
            <span className={classes.chipCount}>{orphans}</span>
          </button>
        )}
        <span className={classes.graphStats}>
          {shown.length} {shown.length === 1 ? "entry" : "entries"} ·{" "}
          {shownEdges.length} {shownEdges.length === 1 ? "link" : "links"}
        </span>
      </div>
    </div>
  );
}
