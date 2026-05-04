import {
  IconArrowsMove,
  IconCircle,
  IconEraser,
  IconHandMove,
  IconLine,
  IconPencil,
  IconPointer,
  IconRulerMeasure,
  type Icon,
} from "@tabler/icons-react";
import type { EncounterTool } from "../canvas/BattleCanvas";

export interface ToolDefinition {
  key: EncounterTool;
  label: string;
  icon: Icon;
}

export const toolDefinitions: ToolDefinition[] = [
  { key: "select", label: "Select", icon: IconPointer },
  { key: "pan", label: "Pan", icon: IconHandMove },
  { key: "draw", label: "Draw", icon: IconPencil },
  { key: "shape", label: "Shape", icon: IconCircle },
  { key: "measure", label: "Measure", icon: IconRulerMeasure },
  { key: "eraser", label: "Eraser", icon: IconEraser },
];

export const utilityTools = {
  fit: IconArrowsMove,
  line: IconLine,
};
