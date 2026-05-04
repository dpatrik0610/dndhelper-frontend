import { ActionIcon, ColorInput, Group, NumberInput, Paper, Select, Tooltip } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import type { ShapeType } from "@appTypes/EncounterRoom";
import type { EncounterTool } from "../canvas/BattleCanvas";
import { toolDefinitions } from "./toolDefinitions";

interface MapToolbarProps {
  activeTool: EncounterTool;
  shapeType: ShapeType;
  color: string;
  thickness: number;
  onToolChange: (tool: EncounterTool) => void;
  onShapeTypeChange: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  onThicknessChange: (thickness: number) => void;
}

const shapes: ShapeType[] = ["Circle", "Rectangle", "Square", "Line", "Cone", "Cube", "Sphere"];

export function MapToolbar({
  activeTool,
  shapeType,
  color,
  thickness,
  onToolChange,
  onShapeTypeChange,
  onColorChange,
  onThicknessChange,
}: MapToolbarProps) {
  return (
    <Paper withBorder p="xs" radius="sm" bg="rgba(15, 23, 42, 0.92)">
      <Group gap="xs" wrap="wrap">
        {toolDefinitions.map((tool) => (
          <Tooltip key={tool.key} label={tool.label}>
            <ActionIcon
              variant={activeTool === tool.key ? "filled" : "subtle"}
              color={activeTool === tool.key ? "violet" : "gray"}
              size="lg"
              onClick={() => onToolChange(tool.key)}
              aria-label={tool.label}
            >
              <tool.icon size={18} />
            </ActionIcon>
          </Tooltip>
        ))}

        {activeTool === "shape" && (
          <Select
            size="xs"
            w={132}
            value={shapeType}
            data={shapes}
            onChange={(value) => value && onShapeTypeChange(value as ShapeType)}
          />
        )}

        {(activeTool === "draw" || activeTool === "shape") && (
          <>
            <ColorInput size="xs" w={112} value={color} onChange={onColorChange} />
            <NumberInput
              size="xs"
              w={92}
              min={1}
              max={16}
              value={thickness}
              leftSection={<IconMinus size={12} />}
              rightSection={<IconPlus size={12} />}
              onChange={(value) => onThicknessChange(Number(value) || 1)}
            />
          </>
        )}
      </Group>
    </Paper>
  );
}
