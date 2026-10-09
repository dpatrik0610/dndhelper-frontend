import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ActionIcon, Slider, Tooltip } from "@mantine/core";
import { IconGripVertical, IconMap, IconZoomScan } from "@tabler/icons-react";
import type { FogState, GridSettings, MapLayer, TableToken } from "@appTypes/Tabletop";
import { useUiStore } from "@store/ui/uiStore";
import { resolveImageUrl } from "@features/tabletop/useTabletopHub";
import { FogLayer, type View } from "./FogLayer";
import { MAX_ZOOM, MIN_ZOOM, clampZoom } from "./gridMath";

const MINI_W = 220;
const MINI_H = 150;
const POS_KEY = "tt-navigator-pos";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Distance from the board's top-right corner, once the panel has been dragged. */
interface Offset {
  right: number;
  top: number;
}

function readOffset(): Offset | null {
  try {
    const o = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
    return o && Number.isFinite(o.right) && Number.isFinite(o.top) ? o : null;
  } catch {
    return null;
  }
}

function storeOffset(o: Offset | null) {
  try {
    if (o) localStorage.setItem(POS_KEY, JSON.stringify(o));
    else localStorage.removeItem(POS_KEY);
  } catch {
    // Private mode: the position just isn't remembered.
  }
}

/** The world area worth showing: the battle map and the tokens, with a cell of margin. */
function contentBounds(map: MapLayer, tokens: TableToken[], grid: GridSettings): Rect | null {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const add = (x: number, y: number, w: number, h: number) => {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x + w);
    y1 = Math.max(y1, y + h);
  };
  if (map.imageUrl && map.width > 0 && map.height > 0) add(map.x, map.y, map.width, map.height);
  for (const t of tokens) {
    const r = (t.size * grid.cellSize) / 2;
    add(t.x - r, t.y - r, r * 2, r * 2);
  }
  if (x0 === Infinity) return null;
  const pad = grid.cellSize;
  return { x: x0 - pad, y: y0 - pad, width: x1 - x0 + pad * 2, height: y1 - y0 + pad * 2 };
}

/**
 * Top-right panel: zoom slider, fit-to-content, and (when on in settings) a minimap of the whole board that pans the
 * view on click or drag. The grip moves the panel; double-clicking it puts the panel back in the corner.
 */
export function Navigator({
  view,
  size,
  setView,
  tokens,
  map,
  grid,
  fog,
  dmView,
  me,
}: {
  view: View;
  size: { width: number; height: number };
  setView: (view: View) => void;
  /** What this viewer sees on the board (no DM layer for players). */
  tokens: TableToken[];
  map: MapLayer;
  grid: GridSettings;
  fog: FogState;
  dmView: boolean;
  me: string;
}) {
  const showMinimap = useUiStore((s) => s.prefs.tabletopMinimap);
  const setPref = useUiStore((s) => s.setPref);
  const [offset, setOffset] = useState<Offset | null>(readOffset);
  const drag = useRef<{ sx: number; sy: number; start: Offset; max: Offset } | null>(null);
  const panning = useRef(false);

  // Under fog, a player's overview is framed by the map and their own tokens: far-off hidden tokens would give themselves away.
  const own = (t: TableToken) => t.ownerIds.includes(me);
  const framed = dmView || !fog.enabled ? tokens : tokens.filter(own);
  const content = contentBounds(map, framed, grid);
  const visible = { x: -view.x / view.zoom, y: -view.y / view.zoom, width: size.width / view.zoom, height: size.height / view.zoom };
  const bounds = content ?? visible;
  const scale = Math.min(MINI_W / bounds.width, MINI_H / bounds.height);
  const mini: View = {
    zoom: scale,
    x: (MINI_W - bounds.width * scale) / 2 - bounds.x * scale,
    y: (MINI_H - bounds.height * scale) / 2 - bounds.y * scale,
  };

  /** Zoom keeping the middle of the screen still. */
  const zoomTo = (next: number) => {
    const zoom = clampZoom(next);
    const wx = (size.width / 2 - view.x) / view.zoom;
    const wy = (size.height / 2 - view.y) / view.zoom;
    setView({ zoom, x: size.width / 2 - wx * zoom, y: size.height / 2 - wy * zoom });
  };

  const centerOn = (wx: number, wy: number, zoom = view.zoom) =>
    setView({ zoom, x: size.width / 2 - wx * zoom, y: size.height / 2 - wy * zoom });

  const fit = () => {
    if (!content) return;
    centerOn(
      content.x + content.width / 2,
      content.y + content.height / 2,
      clampZoom(Math.min(size.width / content.width, size.height / content.height))
    );
  };

  const panTo = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    centerOn((e.clientX - r.left - mini.x) / mini.zoom, (e.clientY - r.top - mini.y) / mini.zoom);
  };

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const panel = e.currentTarget.closest<HTMLElement>(".tt-navigator");
    const board = panel?.offsetParent?.getBoundingClientRect();
    if (!panel || !board) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = panel.getBoundingClientRect();
    drag.current = {
      sx: e.clientX,
      sy: e.clientY,
      start: { right: board.right - r.right, top: r.top - board.top },
      max: { right: board.width - r.width, top: board.height - r.height },
    };
  };

  const moveDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const clamp = (v: number, max: number) => Math.max(0, Math.min(max, v));
    setOffset({ right: clamp(d.start.right - (e.clientX - d.sx), d.max.right), top: clamp(d.start.top + (e.clientY - d.sy), d.max.top) });
  };

  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    storeOffset(offset);
  };

  const ownAboveFog = fog.enabled && !dmView;
  const dot = (t: TableToken) => (
    <circle key={t.id} cx={t.x} cy={t.y} r={Math.max((t.size * grid.cellSize) / 2, 2.5 / scale)} fill={t.color} />
  );

  return (
    <div
      className={`tt-navigator tt-glass${offset ? " moved" : ""}`}
      // Inline offsets win over the corner default; min() keeps a remembered spot on screen after a resize.
      style={offset ? { right: `min(${offset.right}px, calc(100% - 100px))`, top: `min(${offset.top}px, calc(100% - 48px))` } : undefined}
      // The board under the panel mustn't start a pan or a tool gesture.
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {showMinimap && (
        <div
          className="tt-minimap"
          style={{ width: MINI_W, height: MINI_H }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            panning.current = true;
            panTo(e);
          }}
          onPointerMove={(e) => panning.current && panTo(e)}
          onPointerUp={() => (panning.current = false)}
          onPointerCancel={() => (panning.current = false)}
          role="img"
          aria-label="Minimap: click or drag to move the view"
        >
          <svg width={MINI_W} height={MINI_H}>
            <g transform={`translate(${mini.x} ${mini.y}) scale(${mini.zoom})`}>
              {map.imageUrl && map.width > 0 && map.height > 0 && (
                <image href={resolveImageUrl(map.imageUrl)} x={map.x} y={map.y} width={map.width} height={map.height} preserveAspectRatio="none" />
              )}
              {tokens.filter((t) => !(ownAboveFog && own(t))).map(dot)}
            </g>
          </svg>
          {fog.enabled && <FogLayer ops={fog.ops} view={mini} width={MINI_W} height={MINI_H} translucent={dmView} />}
          <svg width={MINI_W} height={MINI_H} className="tt-minimap-top">
            <g transform={`translate(${mini.x} ${mini.y}) scale(${mini.zoom})`}>
              {ownAboveFog && tokens.filter(own).map(dot)}
              <rect {...visible} className="tt-minimap-view" strokeWidth={1.5 / mini.zoom} />
            </g>
          </svg>
        </div>
      )}
      <div className="tt-navigator-bar">
        <div
          className="tt-navigator-grip"
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={() => {
            setOffset(null);
            storeOffset(null);
          }}
          title="Drag to move · double-click to put back"
        >
          <IconGripVertical size={14} />
        </div>
        <Tooltip label="Fit everything">
          <ActionIcon variant="subtle" color="gray" onClick={fit} disabled={!content} aria-label="Fit everything">
            <IconZoomScan size={17} />
          </ActionIcon>
        </Tooltip>
        <Slider
          className="tt-navigator-zoom"
          size="sm"
          color="violet"
          min={Math.log(MIN_ZOOM)}
          max={Math.log(MAX_ZOOM)}
          step={0.01}
          value={Math.log(view.zoom)}
          onChange={(v) => zoomTo(Math.exp(v))}
          label={null}
          aria-label="Zoom"
        />
        <span className="tt-navigator-pct">{Math.round(view.zoom * 100)}%</span>
        <Tooltip label={showMinimap ? "Hide minimap" : "Show minimap"}>
          <ActionIcon
            variant={showMinimap ? "light" : "subtle"}
            color={showMinimap ? "violet" : "gray"}
            onClick={() => setPref("tabletopMinimap", !showMinimap)}
            aria-label="Minimap"
            aria-pressed={showMinimap}
          >
            <IconMap size={17} />
          </ActionIcon>
        </Tooltip>
      </div>
    </div>
  );
}
