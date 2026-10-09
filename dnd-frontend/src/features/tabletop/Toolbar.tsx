import { ActionIcon, ColorInput, ColorSwatch, Group, SegmentedControl, SimpleGrid, Slider, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconArrowBackUp } from "@tabler/icons-react";
import { useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { AoeKind, FxKind } from "@appTypes/Tabletop";
import { tabletop } from "./useTabletopHub";
import { DRAW_COLORS as COLORS, FX, TOOLS, fxShape } from "./tools";
import { FxView } from "./board/Effects";

/** Left tool rail, with the active tool's options beside it. */
export function Toolbar() {
  const isDm = useDmView();
  const tool = useTabletopStore((s) => s.tool);
  const set = useTabletopStore((s) => s.set);

  return (
    <div className="tt-toolbar-wrap">
      <Stack gap={4} className="tt-toolbar tt-glass">
        {TOOLS.filter((t) => isDm || !t.dmOnly).map(({ tool: t, icon: ToolIcon, label, key }) => (
          <Tooltip key={t} label={`${label} (${key})`} position="right">
            <ActionIcon
              size="lg"
              variant={tool === t ? "filled" : "subtle"}
              color={tool === t ? "violet" : "gray"}
              onClick={() => set({ tool: t })}
              aria-label={label}
              aria-pressed={tool === t}
            >
              <ToolIcon size={20} />
            </ActionIcon>
          </Tooltip>
        ))}
      </Stack>
      {tool === "draw" && <DrawOptions />}
      {tool === "template" && <TemplateOptions />}
      {tool === "fx" && <FxOptions />}
      {tool === "fog" && isDm && <FogOptions />}
      {tool === "measure" && (
        <div className="tt-tool-options tt-glass">
          <Text size="xs" c="dimmed">
            Drag to measure. Everyone sees your ruler.
          </Text>
        </div>
      )}
    </div>
  );
}

function Swatches({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <Group gap={6}>
      {COLORS.map((c) => (
        <ColorSwatch
          key={c}
          color={c}
          size={20}
          component="button"
          onClick={() => onChange(c)}
          style={{ cursor: "pointer", outline: value === c ? "2px solid #a78bfa" : undefined, outlineOffset: 2 }}
          aria-label={`Color ${c}`}
        />
      ))}
    </Group>
  );
}

function DrawOptions() {
  const color = useTabletopStore((s) => s.drawColor);
  const width = useTabletopStore((s) => s.drawWidth);
  const set = useTabletopStore((s) => s.set);
  return (
    <Stack gap="xs" className="tt-tool-options tt-glass">
      <Swatches value={color} onChange={(drawColor) => set({ drawColor })} />
      <Text size="xs" c="dimmed">
        Width
      </Text>
      <Slider min={1} max={24} value={width} onChange={(drawWidth) => set({ drawWidth })} size="sm" />
    </Stack>
  );
}

function TemplateOptions() {
  const kind = useTabletopStore((s) => s.templateKind);
  const color = useTabletopStore((s) => s.templateColor);
  const centered = useTabletopStore((s) => s.templateCentered);
  const widthFt = useTabletopStore((s) => s.templateWidthFt);
  const set = useTabletopStore((s) => s.set);
  return (
    <Stack gap="xs" className="tt-tool-options tt-glass">
      <SegmentedControl
        size="xs"
        value={kind}
        onChange={(v) => set({ templateKind: v as AoeKind })}
        data={["Circle", "Cone", "Line", "Cube"]}
      />
      {kind === "Cube" && (
        <SegmentedControl
          size="xs"
          value={centered ? "token" : "free"}
          onChange={(v) => set({ templateCentered: v === "token" })}
          data={[
            { value: "free", label: "Free" },
            { value: "token", label: "On token" },
          ]}
        />
      )}
      {kind === "Line" && (
        <div>
          <Text size="xs" c="dimmed">
            Width: {widthFt} ft
          </Text>
          <Slider
            min={5}
            max={60}
            step={5}
            value={widthFt}
            onChange={(templateWidthFt) => set({ templateWidthFt })}
            label={(v) => `${v} ft`}
            size="sm"
          />
        </div>
      )}
      <Swatches value={color} onChange={(templateColor) => set({ templateColor })} />
      <Text size="xs" c="dimmed">
        {kind === "Cube" && centered
          ? "Start on a token and drag outward: the cube centres on it and follows it. Click for 5 ft."
          : "Drag from the origin. Size snaps to 5 ft."}
      </Text>
    </Stack>
  );
}

/** Each effect previewed live at button size, in its own default colour. */
function FxPreview({ kind, color }: { kind: FxKind; color: string }) {
  const shape = fxShape(kind);
  const template = {
    id: `preview-${kind}`,
    kind: shape,
    fx: kind,
    color,
    x: shape === "Circle" ? 20 : 4,
    y: 20,
    sizeFt: shape === "Circle" ? 5 : 10,
    widthFt: 2,
    angle: 0,
  };
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden>
      <FxView template={template} grid={{ type: "Square", cellSize: 16, color: "" }} />
    </svg>
  );
}

function FxOptions() {
  const kind = useTabletopStore((s) => s.fxKind);
  const color = useTabletopStore((s) => s.fxColor);
  const centered = useTabletopStore((s) => s.templateCentered);
  const widthFt = useTabletopStore((s) => s.templateWidthFt);
  const set = useTabletopStore((s) => s.set);
  const shape = fxShape(kind);

  return (
    <Stack gap="xs" className="tt-tool-options tt-glass tt-fx-options">
      <SimpleGrid cols={5} spacing={4}>
        {FX.map((fx) => (
          <Tooltip key={fx.kind} label={fx.kind} openDelay={300}>
            <UnstyledButton
              className={`tt-fx-pick${fx.kind === kind ? " active" : ""}`}
              onClick={() => set({ fxKind: fx.kind, fxColor: fx.color })}
              aria-label={fx.kind}
              aria-pressed={fx.kind === kind}
            >
              <FxPreview kind={fx.kind} color={fx.kind === kind ? color : fx.color} />
            </UnstyledButton>
          </Tooltip>
        ))}
      </SimpleGrid>
      <Group gap="xs" wrap="nowrap" align="center">
        <Text size="sm" fw={600} style={{ flex: 1 }}>
          {kind}
        </Text>
        <ColorInput size="xs" w={120} value={color} onChange={(fxColor) => set({ fxColor })} format="hex" withEyeDropper={false} aria-label="Effect color" />
      </Group>
      {shape === "Circle" && (
        <SegmentedControl
          size="xs"
          value={centered ? "token" : "free"}
          onChange={(v) => set({ templateCentered: v === "token" })}
          data={[
            { value: "free", label: "Free" },
            { value: "token", label: "On token" },
          ]}
        />
      )}
      {shape === "Line" && (
        <>
          <SegmentedControl
            size="xs"
            value={centered ? "token" : "free"}
            onChange={(v) => set({ templateCentered: v === "token" })}
            data={[
              { value: "free", label: "Free" },
              { value: "token", label: "Token to token" },
            ]}
          />
          <div>
            <Text size="xs" c="dimmed">
              Width: {widthFt} ft
            </Text>
            <Slider min={5} max={60} step={5} value={widthFt} onChange={(templateWidthFt) => set({ templateWidthFt })} label={(v) => `${v} ft`} size="sm" />
          </div>
        </>
      )}
      <Text size="xs" c="dimmed">
        {shape === "Line"
          ? centered
            ? "Drag from the caster's token to the target's: the line stays locked between them as they move."
            : "Drag from the source to the target."
          : shape === "Cone"
            ? "Drag from the source in the direction of the breath."
            : centered
              ? "Tap a token to wrap it (it follows the token), or drag out a bigger area."
              : "Tap to place, or drag to set the radius."}
      </Text>
    </Stack>
  );
}

function FogOptions() {
  const reveal = useTabletopStore((s) => s.fogReveal);
  const shape = useTabletopStore((s) => s.fogShape);
  const radius = useTabletopStore((s) => s.fogRadius);
  const enabled = useTabletopStore((s) => s.fog.enabled);
  const set = useTabletopStore((s) => s.set);
  return (
    <Stack gap="xs" className="tt-tool-options tt-glass">
      {!enabled && (
        <Text size="xs" c="yellow">
          Fog is off for players. Turn it on in ⚙ settings.
        </Text>
      )}
      <SegmentedControl
        size="xs"
        value={reveal ? "reveal" : "hide"}
        onChange={(v) => set({ fogReveal: v === "reveal" })}
        data={[
          { value: "reveal", label: "Reveal" },
          { value: "hide", label: "Hide" },
        ]}
      />
      <SegmentedControl
        size="xs"
        value={shape}
        onChange={(v) => set({ fogShape: v as "Brush" | "Rect" })}
        data={[
          { value: "Brush", label: "Brush" },
          { value: "Rect", label: "Rectangle" },
        ]}
      />
      {shape === "Brush" && (
        <>
          <Text size="xs" c="dimmed">
            Brush size
          </Text>
          <Slider min={10} max={400} value={radius} onChange={(fogRadius) => set({ fogRadius })} size="sm" />
        </>
      )}
      <Tooltip label="Undo last fog stroke (Ctrl+Z)">
        <ActionIcon variant="light" color="gray" onClick={() => void tabletop.undoFog()} aria-label="Undo fog">
          <IconArrowBackUp size={16} />
        </ActionIcon>
      </Tooltip>
    </Stack>
  );
}
