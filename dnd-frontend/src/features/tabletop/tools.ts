import {
  IconChessKnight,
  IconCloudFog,
  IconEraser,
  IconHandFinger,
  IconLock,
  IconMap2,
  IconPencil,
  IconRuler2,
  IconShape,
  IconSparkles,
  type Icon,
} from "@tabler/icons-react";
import type { AoeKind, FxKind, TableLayer, TableTool } from "@appTypes/Tabletop";

export const TOOLS: { tool: TableTool; icon: Icon; label: string; key: string; dmOnly?: boolean }[] = [
  { tool: "select", icon: IconHandFinger, label: "Select & move", key: "V" },
  { tool: "draw", icon: IconPencil, label: "Draw", key: "D" },
  { tool: "erase", icon: IconEraser, label: "Erase drawings, templates & effects", key: "E" },
  { tool: "measure", icon: IconRuler2, label: "Measure", key: "M" },
  { tool: "template", icon: IconShape, label: "AoE template", key: "T" },
  { tool: "fx", icon: IconSparkles, label: "Effects", key: "X" },
  { tool: "fog", icon: IconCloudFog, label: "Fog of war", key: "F", dmOnly: true },
];

export const LAYERS: { layer: TableLayer; icon: Icon; label: string; hint: string }[] = [
  { layer: "Map", icon: IconMap2, label: "Map", hint: "Map layer: props and decoration under the tokens" },
  { layer: "Token", icon: IconChessKnight, label: "Tokens", hint: "Token layer: what everyone plays on" },
  { layer: "Dm", icon: IconLock, label: "DM", hint: "DM layer: only you can see it" },
];

/** Every effect, in palette order, with the colour it starts with. */
export const FX: { kind: FxKind; color: string }[] = [
  { kind: "Fire", color: "#f97316" },
  { kind: "Explosion", color: "#fb923c" },
  { kind: "Breath", color: "#ef4444" },
  { kind: "Lightning", color: "#a5b4fc" },
  { kind: "Beam", color: "#f472b6" },
  { kind: "Ray", color: "#facc15" },
  { kind: "Frost", color: "#67e8f9" },
  { kind: "Bubble", color: "#60a5fa" },
  { kind: "Cloud", color: "#84cc16" },
  { kind: "Acid", color: "#a3e635" },
  { kind: "Darkness", color: "#a855f7" },
  { kind: "Light", color: "#fde68a" },
  { kind: "Arcane", color: "#a78bfa" },
  { kind: "Healing", color: "#4ade80" },
  { kind: "Vortex", color: "#22d3ee" },
];

/** Beams run along a line, breath fills a cone, everything else is a circle. */
export const fxShape = (kind: FxKind): AoeKind =>
  kind === "Beam" || kind === "Ray" || kind === "Lightning" ? "Line" : kind === "Breath" ? "Cone" : "Circle";

/** dataTransfer type for dragging a campaign character from the settings drawer onto the board. */
export const CHARACTER_DRAG_TYPE = "application/x-tabletop-character";

export const DRAW_COLORS = ["#f8fafc", "#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#a78bfa", "#111827"];

export const TOKEN_SWATCHES = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6", "#e5e7eb"];
