import { useMemo, useState } from "react";
import { useElementSize } from "@mantine/hooks";
import { IconChartDots3 } from "@tabler/icons-react";
import {
  CHRONICLE_CATEGORIES,
  CHRONICLE_CATEGORY_COLORS,
  CHRONICLE_CATEGORY_LABELS,
  type ChronicleEntry,
} from "@appTypes/Chronicle";
import { linkEdges, type TitleIndex } from "@features/chronicle/chronicleLinks";
import { layoutGraph } from "@features/chronicle/graphLayout";
import classes from "@features/chronicle/Chronicle.module.css";

const snap = (n: number, fallback: number) =>
  Math.round(n / 40) * 40 || fallback;

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
  const [hovered, setHovered] = useState<string | null>(null);
  const { ref, width, height } = useElementSize();
  const w = snap(width, 1600);
  const h = snap(height, 820);

  const { edges, pos, degree } = useMemo(() => {
    const edges = linkEdges(entries, index);
    const ids = [...entries]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((e) => e.id);
    const degree = new Map<string, number>();
    for (const [a, b] of edges) {
      degree.set(a, (degree.get(a) ?? 0) + 1);
      degree.set(b, (degree.get(b) ?? 0) + 1);
    }
    return { edges, pos: layoutGraph(ids, edges, w, h), degree };
  }, [entries, index, w, h]);

  const focus = hovered ?? selectedId;
  const neighbours = useMemo(() => {
    const set = new Set<string>();
    if (!focus) return set;
    set.add(focus);
    for (const [a, b] of edges) {
      if (a === focus) set.add(b);
      if (b === focus) set.add(a);
    }
    return set;
  }, [edges, focus]);

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

  const dim = (id: string) => focus != null && !neighbours.has(id);
  const labelled = (id: string) =>
    w >= 600 ||
    (focus != null ? neighbours.has(id) : (degree.get(id) ?? 0) >= 4);

  return (
    <div className={classes.graph}>
      <svg
        ref={ref}
        className={classes.graphSvg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Graph of linked Chronicle entries"
      >
        <g>
          {edges.map(([a, b]) => {
            const p = pos.get(a)!;
            const q = pos.get(b)!;
            const lit = focus != null && (a === focus || b === focus);
            return (
              <line
                key={`${a}|${b}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={lit ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={lit ? 2 : 1}
                opacity={focus != null && !lit ? 0.25 : 1}
              />
            );
          })}
        </g>
        <g>
          {entries.map((e) => {
            const p = pos.get(e.id);
            if (!p) return null;
            const r = 6 + Math.min(degree.get(e.id) ?? 0, 8) * 1.5;
            return (
              <g
                key={e.id}
                className={classes.graphNode}
                transform={`translate(${p.x} ${p.y})`}
                opacity={dim(e.id) ? 0.3 : 1}
                onMouseEnter={() => setHovered(e.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onOpen(e.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    onOpen(e.id);
                  }
                }}
                onFocus={() => setHovered(e.id)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={e.title}
              >
                <circle
                  r={r}
                  fill={CHRONICLE_CATEGORY_COLORS[e.category]}
                  stroke={e.id === selectedId ? "var(--ink)" : "var(--sheet)"}
                  strokeWidth={e.id === selectedId ? 3 : 1}
                />
                {labelled(e.id) && (
                  <text
                    y={r + 14}
                    textAnchor="middle"
                    fontSize={13}
                    fill="var(--ink)"
                    style={{
                      pointerEvents: "none",
                      paintOrder: "stroke",
                      stroke: "var(--paper)",
                      strokeWidth: 4,
                      fontFamily: "var(--ui)",
                    }}
                  >
                    {e.title.length > 28 ? `${e.title.slice(0, 27)}…` : e.title}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className={classes.graphLegend}>
        {CHRONICLE_CATEGORIES.filter((c) =>
          entries.some((e) => e.category === c),
        ).map((c) => (
          <span
            key={c}
            style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <span
              className={classes.dot}
              style={{ background: CHRONICLE_CATEGORY_COLORS[c] }}
            />
            {CHRONICLE_CATEGORY_LABELS[c]}
          </span>
        ))}
        <span style={{ marginLeft: "auto" }}>
          {entries.length} entries, {edges.length} links. Click a node to open
          it.
        </span>
      </div>
    </div>
  );
}
