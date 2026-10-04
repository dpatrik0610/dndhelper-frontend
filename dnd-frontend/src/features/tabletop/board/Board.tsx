import { useEffect, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from "react";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import { useCurrentUserId } from "@store/auth/authSelectors";
import type { AoeKind, AoeTemplate, FxKind, GridSettings, TableLayer, TableStroke, TableToken } from "@appTypes/Tabletop";
import { resolveImageUrl, tabletop } from "@features/tabletop/useTabletopHub";
import { CHARACTER_DRAG_TYPE, fxShape } from "@features/tabletop/tools";
import { FogLayer, type View } from "./FogLayer";
import { FxView } from "./Effects";
import {
  cellCorners,
  distanceFt,
  distanceToPolyline,
  gridTile,
  pointInTemplate,
  polylinePath,
  snap,
  templateShape,
  toPoints,
  type Pt,
} from "./gridMath";

type Gesture =
  | { kind: "pan"; sx: number; sy: number; start: View; moved: boolean; clicked?: TableToken }
  | { kind: "pinch"; dist: number; mid: Pt; start: View }
  | { kind: "token"; token: TableToken; from: Pt; offset: Pt; pos: Pt; moved: boolean }
  | { kind: "draw"; points: number[] }
  | { kind: "erase" }
  | { kind: "measure"; from: Pt; to: Pt }
  | { kind: "template"; origin: Pt; cursor: Pt; tokenId: string | null; fx: FxKind | null }
  | { kind: "fogRect"; from: Pt; to: Pt }
  | { kind: "fogBrush"; points: number[] };

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 5;
const MAX_COORDS = 1000; // server cap for strokes and fog brushes

const tokenRadius = (t: TableToken, grid: GridSettings) => t.size * grid.cellSize * 0.42;
const samePoint = (a: Pt, b: Pt) => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/** Keep every k-th point so long strokes fit the server cap (always keeps the last point). */
function thin(points: number[]): number[] {
  if (points.length <= MAX_COORDS) return points;
  const step = Math.ceil(points.length / 2 / (MAX_COORDS / 2 - 1));
  const out: number[] = [];
  for (let i = 0; i < points.length; i += step * 2) out.push(points[i], points[i + 1]);
  out.push(points[points.length - 2], points[points.length - 1]);
  return out;
}

interface DraftOptions {
  kind: AoeKind;
  color: string;
  centered: boolean;
  widthFt: number;
  layer: TableLayer;
  fx: FxKind | null;
}

function templateDraft(o: DraftOptions, grid: GridSettings, origin: Pt, cursor: Pt, tokenId: string | null) {
  const dx = cursor.x - origin.x;
  const dy = cursor.y - origin.y;
  const centered = o.kind === "Cube" && o.centered;
  // Centred cubes grow in whole rings of cells around the origin (5, 15, 25 ft...) so they sit on the grid.
  const sizeFt = centered
    ? (2 * Math.round(Math.max(Math.abs(dx), Math.abs(dy)) / grid.cellSize) + 1) * 5
    : Math.max(5, Math.round(Math.hypot(dx, dy) / grid.cellSize) * 5);
  return {
    kind: o.kind,
    fx: o.fx,
    layer: o.layer,
    color: o.color,
    x: origin.x,
    y: origin.y,
    sizeFt,
    widthFt: o.widthFt,
    centered,
    tokenId,
    angle: centered ? 0 : (Math.atan2(dy, dx) * 180) / Math.PI,
    remaining: null,
  };
}

/** Templates pinned to a token are drawn on the token's (snapped) cell, like the token itself. */
const placed = (grid: GridSettings, t: AoeTemplate): AoeTemplate => (t.tokenId ? { ...t, ...snap(grid, t) } : t);

/** Readable colour per user for rulers. */
function userColor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 85% 65%)`;
}

let rippleId = 0;

export function Board() {
  const me = useCurrentUserId() ?? "";
  const session = useTabletopStore((s) => s.session);
  const snapshot = useTabletopStore((s) => s.snapshot);
  const strokes = useTabletopStore((s) => s.strokes);
  const fog = useTabletopStore((s) => s.fog);
  const measures = useTabletopStore((s) => s.measures);
  const tool = useTabletopStore((s) => s.tool);
  const drawColor = useTabletopStore((s) => s.drawColor);
  const drawWidth = useTabletopStore((s) => s.drawWidth);
  const templateKind = useTabletopStore((s) => s.templateKind);
  const templateColor = useTabletopStore((s) => s.templateColor);
  const templateCentered = useTabletopStore((s) => s.templateCentered);
  const templateWidthFt = useTabletopStore((s) => s.templateWidthFt);
  const fxKind = useTabletopStore((s) => s.fxKind);
  const fxColor = useTabletopStore((s) => s.fxColor);
  const fogReveal = useTabletopStore((s) => s.fogReveal);
  const fogShape = useTabletopStore((s) => s.fogShape);
  const fogRadius = useTabletopStore((s) => s.fogRadius);
  const activeLayer = useTabletopStore((s) => s.activeLayer);
  const playerView = useTabletopStore((s) => s.playerView);

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 });
  const [gesture, setGestureState] = useState<Gesture | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  /** Stroke or template the eraser would remove at the pointer. */
  const [eraseHoverId, setEraseHoverId] = useState<string | null>(null);
  /** Cell under a party member being dragged in from the settings drawer. */
  const [dropPoint, setDropPoint] = useState<Pt | null>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  // Handlers read the refs: several pointer events can arrive before React re-renders.
  const gestureRef = useRef<Gesture | null>(null);
  const pointers = useRef(new Map<number, Pt>());
  const afterPinch = useRef(false);
  const erased = useRef(new Set<string>());
  const lastMeasureSent = useRef(0);
  const spaceDown = useRef(false);
  const centeredFor = useRef<string | null>(null);

  const setGesture = (next: Gesture | null) => {
    gestureRef.current = next;
    setGestureState(next);
  };

  // Size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Wheel zoom around the cursor (native listener: React's wheel handler is passive).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      setView((v) => {
        const zoom = clampZoom(v.zoom * Math.exp(-e.deltaY * 0.0015));
        const wx = (sx - v.x) / v.zoom;
        const wy = (sy - v.y) / v.zoom;
        return { zoom, x: sx - wx * zoom, y: sy - wy * zoom };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Hold space to pan with any tool.
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e)) spaceDown.current = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") spaceDown.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Centre the view once per table: on the tokens, else the map, else the origin.
  useEffect(() => {
    if (!session || !snapshot || size.width === 0 || centeredFor.current === session.tableId) return;
    centeredFor.current = session.tableId;
    const { tokens, map } = snapshot;
    const focus = tokens.length
      ? {
          x: tokens.reduce((sum, t) => sum + t.x, 0) / tokens.length,
          y: tokens.reduce((sum, t) => sum + t.y, 0) / tokens.length,
        }
      : map.imageUrl
        ? { x: map.x + map.width / 2, y: map.y + map.height / 2 }
        : { x: 0, y: 0 };
    setView({ zoom: 1, x: size.width / 2 - focus.x, y: size.height / 2 - focus.y });
  }, [session, snapshot, size.width, size.height]);

  // Where new tokens should appear.
  useEffect(() => {
    useTabletopStore.getState().set({
      viewCenter: { x: (size.width / 2 - view.x) / view.zoom, y: (size.height / 2 - view.y) / view.zoom },
    });
  }, [view, size]);

  if (!session || !snapshot) return <div ref={containerRef} className="tt-board" />;

  const { grid, map, turn } = snapshot;
  // The DM sees and edits everything (on the active layer) unless previewing the player view.
  const dmView = session.isDm && !playerView;
  const myLayer: TableLayer = dmView ? activeLayer : "Token";

  const tokens = dmView ? snapshot.tokens : snapshot.tokens.filter((t) => t.layer !== "Dm");
  const dmTokenIds = new Set(snapshot.tokens.filter((t) => t.layer === "Dm").map((t) => t.id));
  const visibleStrokes = dmView ? strokes : strokes.filter((s) => s.layer !== "Dm");
  const templates = (dmView
    ? snapshot.templates
    : snapshot.templates.filter((t) => t.layer !== "Dm" && !(t.tokenId && dmTokenIds.has(t.tokenId)))
  ).map((t) => placed(grid, t));

  const owns = (t: TableToken) => t.ownerIds.includes(me);
  /** Tokens this viewer can grab or click: the DM's active layer, or a player's own play-layer tokens. */
  const interactive = (t: TableToken) => (dmView ? t.layer === activeLayer : t.layer === "Token");
  const canMove = (t: TableToken) =>
    dmView ? t.layer === activeLayer : owns(t) && t.layer === "Token" && (!turn.active || turn.currentTokenId === t.id);
  const opensSomething = (t: TableToken) => interactive(t) && (dmView || (owns(t) && !!t.characterId));
  const aboveFog = (t: TableToken) => fog.enabled && !dmView && owns(t) && t.layer === "Token";
  const redact = (t: TableToken) => !dmView && t.characterId === null;
  const posOf = (t: TableToken) => snap(grid, t);

  const toScreen = (e: { clientX: number; clientY: number }): Pt => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const toWorld = (e: { clientX: number; clientY: number }): Pt => {
    const s = toScreen(e);
    return { x: (s.x - view.x) / view.zoom, y: (s.y - view.y) / view.zoom };
  };

  const hitToken = (p: Pt) =>
    [...tokens].reverse().find((t) => {
      if (!interactive(t)) return false;
      const c = posOf(t);
      return Math.hypot(p.x - c.x, p.y - c.y) <= tokenRadius(t, grid);
    });

  const clickToken = (t: TableToken) => {
    const store = useTabletopStore.getState();
    if (dmView) store.set({ editingTokenId: t.id });
    else if (owns(t) && t.characterId) store.set({ profileCharacterId: t.characterId });
  };

  const ripple = (p: Pt) => {
    const id = ++rippleId;
    setRipples((r) => [...r.slice(-6), { id, ...p }]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 500);
  };

  const mineToErase = (item: { layer: TableLayer; userId: string }) =>
    dmView ? item.layer === activeLayer : item.layer === "Token" && item.userId === me;

  /** Topmost thing the eraser would take at p: drawings first, then templates/effects. Same rule for hover and erase. */
  const findErasable = (p: Pt): { stroke: TableStroke } | { template: AoeTemplate } | null => {
    const tolerance = 8 / view.zoom;
    const stroke = [...visibleStrokes]
      .reverse()
      .find((s) => !erased.current.has(s.id) && mineToErase(s) && distanceToPolyline(p, s.points) <= s.width / 2 + tolerance);
    if (stroke) return { stroke };
    const template = [...templates]
      .reverse()
      .find((t) => !erased.current.has(t.id) && mineToErase(t) && pointInTemplate(p, templateShape(grid, t)));
    return template ? { template } : null;
  };
  const erasableId = (target: ReturnType<typeof findErasable>) =>
    target ? ("stroke" in target ? target.stroke.id : target.template.id) : null;

  const eraseAt = (p: Pt) => {
    const target = findErasable(p);
    if (!target) return;
    if ("stroke" in target) {
      erased.current.add(target.stroke.id);
      useTabletopStore.getState().removeStroke(target.stroke.id);
      void tabletop.removeStroke(target.stroke.id);
    } else {
      erased.current.add(target.template.id);
      void tabletop.removeTemplate(target.template.id);
    }
    setEraseHoverId(null);
  };

  /** What a template/effect gesture would place right now. */
  const draftOptions = (fx: FxKind | null): DraftOptions =>
    fx
      ? { kind: fxShape(fx), color: fxColor, centered: false, widthFt: templateWidthFt, layer: myLayer, fx }
      : { kind: templateKind, color: templateColor, centered: templateCentered, widthFt: templateWidthFt, layer: myLayer, fx: null };

  const startPan = (e: ReactPointerEvent, clicked?: TableToken) =>
    setGesture({ kind: "pan", sx: e.clientX, sy: e.clientY, start: view, moved: false, clicked });

  /** Drop whatever the first finger was doing when a second one lands. */
  const cancelGesture = () => {
    if (gestureRef.current?.kind === "measure") tabletop.measure(null);
    setGesture(null);
  };

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    const rect = containerRef.current!.getBoundingClientRect();
    setGesture({
      kind: "pinch",
      dist: Math.hypot(a.x - b.x, a.y - b.y),
      mid: { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top },
      start: view,
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);

    if (pointers.current.size === 2) {
      cancelGesture();
      startPinch();
      return;
    }
    if (pointers.current.size > 2 || afterPinch.current || gestureRef.current) return;
    if (e.button === 1 || e.button === 2 || (e.button === 0 && spaceDown.current)) return startPan(e);
    if (e.button !== 0) return;

    const p = toWorld(e);
    ripple(p);
    switch (tool) {
      case "select": {
        const token = hitToken(p);
        if (token && canMove(token)) {
          const c = posOf(token);
          setGesture({ kind: "token", token, from: c, offset: { x: p.x - c.x, y: p.y - c.y }, pos: c, moved: false });
        } else startPan(e, token);
        break;
      }
      case "draw":
        setGesture({ kind: "draw", points: [p.x, p.y] });
        break;
      case "erase":
        erased.current.clear();
        setGesture({ kind: "erase" });
        eraseAt(p);
        break;
      case "measure": {
        const from = snap(grid, p);
        setGesture({ kind: "measure", from, to: from });
        break;
      }
      case "template":
      case "fx": {
        const fx = tool === "fx" ? fxKind : null;
        const shape = fx ? fxShape(fx) : templateKind;
        // "On token": cubes and area effects started on a token centre on it and stay pinned to it.
        const pin = templateCentered && (fx ? shape === "Circle" : shape === "Cube");
        const token = pin ? hitToken(p) : undefined;
        const origin = token ? posOf(token) : snap(grid, p);
        setGesture({ kind: "template", origin, cursor: origin, tokenId: token?.id ?? null, fx });
        break;
      }
      case "fog":
        if (!dmView) return startPan(e);
        setGesture(fogShape === "Rect" ? { kind: "fogRect", from: p, to: p } : { kind: "fogBrush", points: [p.x, p.y] });
        break;
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;

    if (!g) {
      // Hover feedback for mouse users: what the eraser would take, or a ring + grab cursor on usable tokens.
      if (e.pointerType === "mouse" && pointers.current.size === 0) {
        const p = toWorld(e);
        if (tool === "erase") {
          const id = erasableId(findErasable(p));
          if (id !== eraseHoverId) setEraseHoverId(id);
          if (hoverId) setHoverId(null);
        } else {
          const t = hitToken(p);
          const id = t && (canMove(t) || opensSomething(t)) ? t.id : null;
          if (id !== hoverId) setHoverId(id);
        }
      }
      return;
    }
    if (hoverId) setHoverId(null);
    const p = toWorld(e);

    switch (g.kind) {
      case "pinch": {
        if (pointers.current.size < 2) return;
        const [a, b] = [...pointers.current.values()];
        const rect = containerRef.current!.getBoundingClientRect();
        const mid = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
        const zoom = clampZoom(g.start.zoom * (Math.hypot(a.x - b.x, a.y - b.y) / Math.max(1, g.dist)));
        // Keep the world point that was under the fingers' midpoint under it.
        const wx = (g.mid.x - g.start.x) / g.start.zoom;
        const wy = (g.mid.y - g.start.y) / g.start.zoom;
        setView({ zoom, x: mid.x - wx * zoom, y: mid.y - wy * zoom });
        break;
      }
      case "pan": {
        const dx = e.clientX - g.sx;
        const dy = e.clientY - g.sy;
        if (!g.moved && Math.hypot(dx, dy) < 4) return;
        setView({ ...g.start, x: g.start.x + dx, y: g.start.y + dy });
        if (!g.moved) setGesture({ ...g, moved: true });
        break;
      }
      case "token": {
        const pos = { x: p.x - g.offset.x, y: p.y - g.offset.y };
        setGesture({ ...g, pos, moved: g.moved || Math.hypot(pos.x - g.from.x, pos.y - g.from.y) > 4 / view.zoom });
        break;
      }
      case "draw": {
        const n = g.points.length;
        if (Math.hypot(p.x - g.points[n - 2], p.y - g.points[n - 1]) < 3 / view.zoom) return;
        setGesture({ ...g, points: [...g.points, p.x, p.y] });
        break;
      }
      case "erase":
        eraseAt(p);
        break;
      case "measure": {
        const to = snap(grid, p);
        if (samePoint(to, g.to)) return;
        setGesture({ ...g, to });
        const now = performance.now();
        if (now - lastMeasureSent.current > 50) {
          lastMeasureSent.current = now;
          tabletop.measure([g.from.x, g.from.y, to.x, to.y]);
        }
        break;
      }
      case "template":
        setGesture({ ...g, cursor: p });
        break;
      case "fogRect":
        setGesture({ ...g, to: p });
        break;
      case "fogBrush": {
        const n = g.points.length;
        if (Math.hypot(p.x - g.points[n - 2], p.y - g.points[n - 1]) < fogRadius / 4) return;
        setGesture({ ...g, points: [...g.points, p.x, p.y] });
        break;
      }
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    const g = gestureRef.current;

    // After a pinch, ignore the remaining finger until every finger is up.
    if (g?.kind === "pinch") {
      if (pointers.current.size < 2) {
        setGesture(null);
        afterPinch.current = pointers.current.size > 0;
      }
      return;
    }
    if (afterPinch.current) {
      if (pointers.current.size === 0) afterPinch.current = false;
      return;
    }

    setGesture(null);
    if (!g) return;

    switch (g.kind) {
      case "pan":
        if (!g.moved && g.clicked && opensSomething(g.clicked)) clickToken(g.clicked);
        break;
      case "token": {
        if (!g.moved) {
          clickToken(g.token);
          break;
        }
        const to = snap(grid, g.pos);
        if (samePoint(to, g.from)) break;
        const store = useTabletopStore.getState();
        store.moveTokenLocal(g.token.id, to.x, to.y);
        void tabletop.moveToken(g.token.id, to.x, to.y, distanceFt(grid, g.from, to)).then((ok) => {
          if (!ok) store.moveTokenLocal(g.token.id, g.token.x, g.token.y);
        });
        break;
      }
      case "draw":
        if (g.points.length >= 4)
          void tabletop.addStroke({ color: drawColor, width: drawWidth, points: thin(g.points), layer: myLayer });
        break;
      case "measure":
        tabletop.measure(null);
        break;
      case "template": {
        const options = draftOptions(g.fx);
        // A click places the smallest centred cube or area effect; the rest need a drag for direction and size.
        const clickable = (options.kind === "Cube" && options.centered) || (g.fx !== null && options.kind === "Circle");
        if (!clickable && Math.hypot(g.cursor.x - g.origin.x, g.cursor.y - g.origin.y) < grid.cellSize / 2) break;
        void tabletop.addTemplate(templateDraft(options, grid, g.origin, g.cursor, g.tokenId));
        break;
      }
      case "fogRect":
        if (Math.abs(g.to.x - g.from.x) * view.zoom > 4 && Math.abs(g.to.y - g.from.y) * view.zoom > 4)
          void tabletop.addFogOp({ reveal: fogReveal, shape: "Rect", points: [g.from.x, g.from.y, g.to.x, g.to.y], radius: 0 });
        break;
      case "fogBrush":
        void tabletop.addFogOp({ reveal: fogReveal, shape: "Brush", points: thin(g.points), radius: fogRadius });
        break;
    }
  };

  // ── Party drag & drop (from the settings drawer) ──

  const isCharacterDrag = (e: DragEvent) => dmView && e.dataTransfer.types.includes(CHARACTER_DRAG_TYPE);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!isCharacterDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const p = snap(grid, toWorld(e));
    if (!dropPoint || !samePoint(p, dropPoint)) setDropPoint(p);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    setDropPoint(null);
    const characterId = e.dataTransfer.getData(CHARACTER_DRAG_TYPE);
    if (!characterId || !dmView) return;
    e.preventDefault();
    const p = snap(grid, toWorld(e));
    ripple(p);
    void tabletop.placeCharacter(characterId, p.x, p.y);
  };

  // ── Render ──

  const tile = gridTile(grid);
  const visible = {
    x: -view.x / view.zoom,
    y: -view.y / view.zoom,
    width: size.width / view.zoom,
    height: size.height / view.zoom,
  };
  const worldTransform = `translate(${view.x} ${view.y}) scale(${view.zoom})`;
  const draggingId = gesture?.kind === "token" ? gesture.token.id : null;
  const hovered = hoverId ? tokens.find((t) => t.id === hoverId) : undefined;
  const cursor =
    (gesture?.kind === "pan" && gesture.moved) || gesture?.kind === "token"
      ? "grabbing"
      : tool === "select"
        ? hovered && canMove(hovered)
          ? "grab"
          : hovered
            ? "pointer"
            : "default"
        : tool === "erase"
          ? "cell"
          : "crosshair";

  /** Off-layer items fade so the DM can tell what's grabbable; the DM layer always looks "ghosted". */
  const layerOpacity = (layer: TableLayer) =>
    !dmView ? 1 : layer === "Dm" ? (activeLayer === "Dm" ? 0.85 : 0.55) : layer === "Token" && activeLayer === "Map" ? 0.5 : 1;

  const on = <T extends { layer: TableLayer }>(items: T[], layer: TableLayer) => items.filter((i) => i.layer === layer);
  const shapes = templates.filter((t) => !t.fx);
  const effects = templates.filter((t) => t.fx);

  const renderTokens = (list: TableToken[]) =>
    list
      .filter((t) => t.id !== draggingId)
      .map((t) => (
        <TokenView
          key={t.id}
          token={t}
          grid={grid}
          pos={posOf(t)}
          current={turn.active && turn.currentTokenId === t.id}
          mine={owns(t)}
          redact={redact(t)}
        />
      ));

  const renderLayer = (layer: TableLayer, withCells: boolean) => {
    const layerTokens = on(tokens, layer);
    return (
      <>
        {withCells &&
          layerTokens.map((t) => (
            <polygon key={`cell-${t.id}`} points={toPoints(cellCorners(grid, posOf(t)))} fill={t.color} fillOpacity={0.14} />
          ))}
        {on(visibleStrokes, layer).map((s) => (
          <StrokeView key={s.id} stroke={s} />
        ))}
        {on(shapes, layer).map((t) => (
          <TemplateView key={t.id} template={t} grid={grid} />
        ))}
        {renderTokens(layerTokens.filter((t) => !aboveFog(t)))}
      </>
    );
  };

  const fxLayer = (layer: TableLayer) => {
    const list = on(effects, layer);
    if (list.length === 0) return null;
    return (
      <svg className="tt-layer tt-fx-layer" width={size.width} height={size.height} opacity={layerOpacity(layer)}>
        <g transform={worldTransform}>
          {list.map((t) => (
            <FxView key={t.id} template={t as AoeTemplate & { fx: FxKind }} grid={grid} />
          ))}
        </g>
      </svg>
    );
  };

  const draft =
    gesture?.kind === "template"
      ? { id: "draft", userId: me, ...templateDraft(draftOptions(gesture.fx), grid, gesture.origin, gesture.cursor, gesture.tokenId) }
      : null;

  return (
    <div
      ref={containerRef}
      className="tt-board"
      style={{ cursor }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => {
        if (hoverId) setHoverId(null);
        if (eraseHoverId) setEraseHoverId(null);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={onDragOver}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDropPoint(null);
      }}
      onDrop={onDrop}
    >
      {/* Map layer: battle map, props, then the grid on top of them */}
      <svg className="tt-layer" width={size.width} height={size.height}>
        <defs>
          <pattern id="tt-grid" patternUnits="userSpaceOnUse" width={tile.width} height={tile.height}>
            <path d={tile.d} fill="none" stroke={grid.color} strokeWidth={1 / view.zoom} />
          </pattern>
        </defs>
        <g transform={worldTransform}>
          {map.imageUrl && map.width > 0 && map.height > 0 && (
            <image href={resolveImageUrl(map.imageUrl)} x={map.x} y={map.y} width={map.width} height={map.height} preserveAspectRatio="none" />
          )}
          <g opacity={layerOpacity("Map")}>{renderLayer("Map", false)}</g>
          <rect {...visible} fill="url(#tt-grid)" />
        </g>
      </svg>
      {fxLayer("Map")}

      {/* Token layer */}
      <svg className="tt-layer" width={size.width} height={size.height}>
        <g transform={worldTransform} opacity={layerOpacity("Token")}>
          {renderLayer("Token", true)}
        </g>
      </svg>
      {fxLayer("Token")}

      {fog.enabled && <FogLayer ops={fog.ops} view={view} width={size.width} height={size.height} translucent={dmView} />}

      {/* DM layer: above the fog, only for the DM */}
      {dmView && (
        <>
          <svg className="tt-layer" width={size.width} height={size.height}>
            <g transform={worldTransform} opacity={layerOpacity("Dm")}>
              {renderLayer("Dm", true)}
            </g>
          </svg>
          {fxLayer("Dm")}
        </>
      )}

      {/* Overlay: own tokens above fog, gestures, rulers, feedback */}
      <svg className="tt-layer" width={size.width} height={size.height}>
        <g transform={worldTransform}>
          {renderTokens(tokens.filter(aboveFog))}

          {tool === "erase" && eraseHoverId && (
            <EraseTarget
              stroke={visibleStrokes.find((s) => s.id === eraseHoverId)}
              template={templates.find((t) => t.id === eraseHoverId)}
              grid={grid}
              zoom={view.zoom}
            />
          )}

          {hovered && hovered.id !== draggingId && (
            <circle
              cx={posOf(hovered).x}
              cy={posOf(hovered).y}
              r={tokenRadius(hovered, grid) + 6 / view.zoom}
              className="tt-hover-ring"
              strokeWidth={2 / view.zoom}
              strokeDasharray={`${6 / view.zoom} ${4 / view.zoom}`}
            />
          )}

          {gesture?.kind === "token" && (
            <TokenDrag
              gesture={gesture}
              grid={grid}
              zoom={view.zoom}
              current={turn.active && turn.currentTokenId === gesture.token.id}
              redact={redact(gesture.token)}
            />
          )}
          {gesture?.kind === "draw" && <StrokeView stroke={{ id: "draft", userId: me, layer: myLayer, color: drawColor, width: drawWidth, points: gesture.points }} />}
          {draft && (
            <>
              {draft.fx ? (
                <FxView template={draft as AoeTemplate & { fx: FxKind }} grid={grid} />
              ) : (
                <TemplateView template={draft} grid={grid} />
              )}
              <TemplateLabel template={draft} grid={grid} zoom={view.zoom} />
            </>
          )}
          {gesture?.kind === "fogRect" && (
            <rect
              x={Math.min(gesture.from.x, gesture.to.x)}
              y={Math.min(gesture.from.y, gesture.to.y)}
              width={Math.abs(gesture.to.x - gesture.from.x)}
              height={Math.abs(gesture.to.y - gesture.from.y)}
              className={fogReveal ? "tt-fog-preview reveal" : "tt-fog-preview"}
              strokeWidth={2 / view.zoom}
            />
          )}
          {gesture?.kind === "fogBrush" && (
            <path
              d={polylinePath(gesture.points.length === 2 ? [...gesture.points, gesture.points[0] + 0.01, gesture.points[1]] : gesture.points)}
              className={fogReveal ? "tt-fog-brush reveal" : "tt-fog-brush"}
              strokeWidth={fogRadius * 2}
            />
          )}

          {Object.values(measures).map((m) =>
            m.points ? (
              <Ruler
                key={m.userId}
                from={{ x: m.points[0], y: m.points[1] }}
                to={{ x: m.points[2], y: m.points[3] }}
                grid={grid}
                zoom={view.zoom}
                color={userColor(m.userId)}
                name={m.name}
              />
            ) : null
          )}
          {gesture?.kind === "measure" && <Ruler from={gesture.from} to={gesture.to} grid={grid} zoom={view.zoom} color={userColor(me)} />}

          {dropPoint && (
            <g className="tt-drop-target">
              <polygon points={toPoints(cellCorners(grid, dropPoint))} strokeWidth={2 / view.zoom} />
              <circle cx={dropPoint.x} cy={dropPoint.y} r={grid.cellSize * 0.42} strokeWidth={2 / view.zoom} strokeDasharray={`${6 / view.zoom} ${4 / view.zoom}`} />
              <Pill at={{ x: dropPoint.x, y: dropPoint.y - grid.cellSize * 0.4 }} zoom={view.zoom} text="Drop to place" />
            </g>
          )}

          {ripples.map((r) => (
            <circle key={r.id} cx={r.x} cy={r.y} r={16 / view.zoom} className="tt-ripple" strokeWidth={2 / view.zoom} />
          ))}
        </g>
      </svg>
    </div>
  );
}

/** Red outline on whatever the eraser is about to remove. */
function EraseTarget({
  stroke,
  template,
  grid,
  zoom,
}: {
  stroke?: TableStroke;
  template?: AoeTemplate;
  grid: GridSettings;
  zoom: number;
}) {
  if (stroke) {
    return (
      <path
        d={polylinePath(stroke.points)}
        className="tt-erase-target"
        strokeWidth={stroke.width + 8 / zoom}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  if (!template) return null;
  const shape = templateShape(grid, template);
  const props = { className: "tt-erase-target area", strokeWidth: 3 / zoom, strokeDasharray: `${8 / zoom} ${5 / zoom}` };
  return "circle" in shape ? (
    <circle cx={shape.circle.cx} cy={shape.circle.cy} r={shape.circle.r} {...props} />
  ) : (
    <polygon points={toPoints(shape.polygon)} {...props} />
  );
}

function StrokeView({ stroke: s }: { stroke: TableStroke }) {
  return (
    <path d={polylinePath(s.points)} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  );
}

function TokenView({
  token,
  grid,
  pos,
  current,
  mine,
  redact,
  dragging,
}: {
  token: TableToken;
  grid: GridSettings;
  pos: Pt;
  current: boolean;
  mine: boolean;
  redact: boolean;
  dragging?: boolean;
}) {
  const r = tokenRadius(token, grid);
  const image = resolveImageUrl(token.imageUrl);
  const initials = token.name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const prop = token.layer === "Map";
  const hpRatio = !redact && !prop && token.maxHp > 0 ? Math.max(0, Math.min(1, token.hp / token.maxHp)) : null;
  const ring = Math.max(2, r * 0.1);
  const label = Math.max(10, grid.cellSize * 0.18);

  return (
    // CSS transform (not the attribute) so moves by other people slide smoothly.
    <g className={`tt-token${dragging ? " dragging" : ""}`} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
      <g className={`tt-token-body${token.layer === "Dm" ? " dm" : ""}`}>
        {current && <circle r={r + ring * 2.2} className="tt-token-turn" strokeWidth={ring} />}
        <circle r={r} fill={token.color} />
        {image ? (
          <>
            <clipPath id={`tt-clip-${token.id}`}>
              <circle r={r - ring / 2} />
            </clipPath>
            <image
              href={image}
              x={-r}
              y={-r}
              width={r * 2}
              height={r * 2}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#tt-clip-${token.id})`}
            />
          </>
        ) : (
          <text className="tt-token-initials" fontSize={r * 0.8} dy="0.35em">
            {initials}
          </text>
        )}
        <circle
          r={r}
          fill="none"
          stroke={mine ? "#f8fafc" : token.color}
          strokeOpacity={mine ? 0.9 : 1}
          strokeWidth={ring}
          strokeDasharray={token.layer === "Dm" ? `${ring * 3} ${ring * 2}` : undefined}
        />
        {!prop && token.effects.length > 0 && (
          <g transform={`translate(${r * 0.74} ${-r * 0.74})`}>
            <circle r={Math.max(7, r * 0.28)} className="tt-token-badge" />
            <text className="tt-token-badge-text" fontSize={Math.max(8, r * 0.3)} dy="0.35em">
              {token.effects.length}
            </text>
          </g>
        )}
        {hpRatio !== null && (
          <g transform={`translate(${-r * 0.8} ${r + ring})`}>
            <rect width={r * 1.6} height={Math.max(3, r * 0.1)} rx={2} className="tt-token-hp-bg" />
            <rect
              width={r * 1.6 * hpRatio}
              height={Math.max(3, r * 0.1)}
              rx={2}
              fill={hpRatio > 0.5 ? "#4ade80" : hpRatio > 0.25 ? "#facc15" : "#f87171"}
              className="tt-token-hp"
            />
          </g>
        )}
        {!prop && (
          <text className="tt-token-name" y={r + ring + label * 1.4} fontSize={label}>
            {token.name}
          </text>
        )}
      </g>
    </g>
  );
}

const PACE_COLOR = { walk: "#f5c451", dash: "#a78bfa", over: "#f87171" } as const;

function TokenDrag({
  gesture,
  grid,
  zoom,
  current,
  redact,
}: {
  gesture: Extract<Gesture, { kind: "token" }>;
  grid: GridSettings;
  zoom: number;
  current: boolean;
  redact: boolean;
}) {
  const target = snap(grid, gesture.pos);
  const ft = distanceFt(grid, gesture.from, target);
  // On its turn the token's earlier moves count too. Never blocks: spells and features can raise speed.
  const used = ft + (current ? gesture.token.economy.movedFt : 0);
  const speed = redact ? 0 : gesture.token.speed;
  const pace = speed <= 0 || used <= speed ? "walk" : used <= speed * 2 ? "dash" : "over";
  const color = PACE_COLOR[pace];
  const label =
    pace === "walk"
      ? `${ft} ft`
      : pace === "dash"
        ? `Dashing… ${used}/${speed * 2} ft`
        : `Too far · ${used}/${speed * 2} ft`;

  return (
    <g className="tt-drag">
      <polygon
        points={toPoints(cellCorners(grid, target))}
        className="tt-drag-target"
        style={{ stroke: color, fill: color, fillOpacity: 0.16 }}
        strokeWidth={2 / zoom}
      />
      {gesture.moved && <Ruler from={gesture.from} to={target} grid={grid} zoom={zoom} color={color} label={label} />}
      <g opacity={0.9} className="tt-lifted">
        <TokenView token={gesture.token} grid={grid} pos={gesture.pos} current={current} mine redact={redact} dragging />
      </g>
    </g>
  );
}

function TemplateView({ template, grid }: { template: AoeTemplate; grid: GridSettings }) {
  const shape = templateShape(grid, template);
  const style = { fill: template.color, fillOpacity: 0.22, stroke: template.color, strokeWidth: 2, strokeOpacity: 0.9 };
  return (
    <g className="tt-shape-in">
      {"circle" in shape ? (
        <circle cx={shape.circle.cx} cy={shape.circle.cy} r={shape.circle.r} {...style} />
      ) : (
        <polygon points={toPoints(shape.polygon)} {...style} />
      )}
    </g>
  );
}

function TemplateLabel({ template, grid, zoom }: { template: AoeTemplate; grid: GridSettings; zoom: number }) {
  const shape = templateShape(grid, template);
  const anchor = "circle" in shape || template.centered ? { x: template.x, y: template.y } : shape.polygon[0];
  const name = (template.fx ?? template.kind).toLowerCase();
  const text =
    template.kind === "Line"
      ? `${template.sizeFt} × ${template.widthFt} ft ${name}`
      : `${template.sizeFt} ft ${name}${template.tokenId ? " on token" : ""}`;
  return <Pill at={anchor} zoom={zoom} text={text} />;
}

function Ruler({
  from,
  to,
  grid,
  zoom,
  color,
  name,
  label,
}: {
  from: Pt;
  to: Pt;
  grid: GridSettings;
  zoom: number;
  color: string;
  name?: string;
  /** Replaces the default "N ft" text. */
  label?: string;
}) {
  const ft = distanceFt(grid, from, to);
  return (
    <g className="tt-ruler">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={3 / zoom} strokeDasharray={`${8 / zoom} ${5 / zoom}`} />
      <circle cx={from.x} cy={from.y} r={5 / zoom} fill={color} />
      <circle cx={to.x} cy={to.y} r={5 / zoom} fill={color} />
      <Pill at={{ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }} zoom={zoom} text={label ?? (name ? `${name} · ${ft} ft` : `${ft} ft`)} />
    </g>
  );
}

/** Screen-sized label inside the zoomed world. */
function Pill({ at, zoom, text }: { at: Pt; zoom: number; text: string }) {
  const width = text.length * 7 + 16;
  return (
    <g transform={`translate(${at.x} ${at.y}) scale(${1 / zoom})`} className="tt-pill">
      <rect x={-width / 2} y={-26} width={width} height={20} rx={10} />
      <text y={-12}>{text}</text>
    </g>
  );
}
