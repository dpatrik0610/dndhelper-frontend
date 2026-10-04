import { useEffect, useState } from "react";
import { Button, Group, SegmentedControl, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { useReduceMotion } from "@hooks/useReduceMotion";
import { useUiStore } from "@store/ui/uiStore";
import { IconDice5, IconX } from "@tabler/icons-react";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { showNotification } from "@components/Notification/Notification";
import { Die, DiceResult } from "@components/roll/Dice";

import { useCurrentCharacter } from "@store/character/characterSelectors";
import { rollByExpression, subtleRoll } from "@services/rollService";
import type { RollResult } from "@appTypes/Roll";
import { BaseModal } from "@components/BaseModal";

interface RollModalProps {
  opened: boolean;
  onClose: () => void;
}

type RollModalVariant = "public" | "subtle";

const DICE = [4, 6, 8, 10, 12, 20, 100];
const MAX_DICE = 1000; // matches backend DiceRoll:MaxDice
// Same grammar as the backend DiceExpressionParser: [count]d<sides>[+-mod]
const EXPRESSION_RE = /^\s*(\d*)d(\d+)\s*(?:([+-])\s*(\d+))?\s*$/i;

const buttonText = {
  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
  fontWeight: 300,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  fontSize: "11px",
};

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  if ("status" in error && typeof (error as { status?: number }).status === "number") {
    return (error as { status?: number }).status ?? null;
  }
  return null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function RollModal({ opened, onClose }: RollModalProps) {
  const character = useCurrentCharacter();
  const diceAnimation = useUiStore((s) => s.prefs.diceAnimation);
  const reduceMotion = useReduceMotion() || !diceAnimation;

  const [variant, setVariant] = useState<RollModalVariant>("public");
  const [sides, setSides] = useState(20);
  const [count, setCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [expression, setExpression] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);

  useEffect(() => {
    if (!opened) return;
    setVariant("public");
    setSides(20);
    setCount(1);
    setModifier(0);
    setExpression("");
    setNote("");
    setResult(null);
  }, [opened]);

  // A typed expression overrides the dice tray.
  const typed = expression.trim();
  const parsed = typed ? EXPRESSION_RE.exec(typed) : null;
  const expressionInvalid = typed.length > 0 && !parsed;
  const rollSides = parsed ? Number(parsed[2]) : sides;
  const rollCount = parsed ? Number(parsed[1] || 1) : count;
  const rollExpression = typed || `${count}d${sides}${modifier ? `${modifier > 0 ? "+" : ""}${modifier}` : ""}`;
  const canSubmit = !expressionInvalid && rollCount >= 1 && rollCount <= MAX_DICE && rollSides >= 1;

  const pickDie = (value: number) => {
    setExpression("");
    if (value === sides && !typed) {
      setCount((c) => Math.min(c + 1, MAX_DICE));
    } else {
      setSides(value);
      setCount(1);
    }
  };

  const handleError = (error: unknown) => {
    const status = getErrorStatus(error);
    showNotification(
      status === 429
        ? { title: "Slow down", message: "Too many rolls. Please wait a moment and try again.", color: "yellow" }
        : { title: "Roll failed", message: "Could not complete the roll. Please try again.", color: "red" }
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    if (variant === "subtle") {
      if (!character?.id) {
        showNotification({ title: "Character missing", message: "Select a character before sending a subtle roll.", color: "red" });
        return;
      }
      setLoading(true);
      try {
        await subtleRoll({ characterId: character.id, expression: rollExpression, note: note.trim() || undefined });
        showNotification({ title: "Sent", message: "Sent to DM", color: "green" });
        onClose();
      } catch (error) {
        handleError(error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Public: tumble immediately, land when the server answers (min. tumble so it never just blinks).
    setResult(null);
    setLoading(true);
    try {
      const [roll] = await Promise.all([rollByExpression(rollExpression), wait(reduceMotion ? 0 : 650)]);
      setResult(roll);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={variant === "public" ? "Roll Dice" : "Subtle Roll (DM)"}
      size="md"
      showSaveButton={false}
      showCancelButton={false}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Stack gap="md">
          <SegmentedControl
            value={variant}
            onChange={(value) => {
              setVariant(value as RollModalVariant);
              setResult(null);
            }}
            data={[
              { label: "Public Roll", value: "public" },
              { label: "Subtle Roll (DM)", value: "subtle" },
            ]}
            size="xs"
            fullWidth
            classNames={{
              root: "glassy-segmented",
              control: "glassy-segmented__control",
              label: "glassy-segmented__label",
            }}
          />

          {/* DICE TRAY: click a die to pick it, click again to add another */}
          <Group justify="space-between" gap={6} wrap="nowrap" py={4}>
            {DICE.map((value) => {
              const selected = !typed && sides === value;
              return (
                <button
                  key={value}
                  type="button"
                  className="die-btn"
                  onClick={() => pickDie(value)}
                  aria-label={selected ? `Add another d${value}` : `Roll d${value}`}
                  aria-pressed={selected}
                >
                  <Die sides={value} value={`d${value}`} size={42} active={selected} />
                  {selected && count > 1 && (
                    <span key={count} className="die-btn__count">
                      ×{count}
                    </span>
                  )}
                </button>
              );
            })}
          </Group>

          <SimpleGrid cols={2} spacing="sm">
            <FormNumberInput
              label="Dice"
              min={1}
              max={MAX_DICE}
              value={count}
              onChange={(v) => {
                setCount(v);
                setExpression("");
              }}
              disabled={!!typed}
            />
            <FormNumberInput
              label="Modifier"
              min={-999}
              max={999}
              value={modifier}
              onChange={(v) => {
                setModifier(v);
                setExpression("");
              }}
              disabled={!!typed}
            />
          </SimpleGrid>

          <TextInput
            label="Or type an expression"
            placeholder="e.g. 2d20+5"
            value={expression}
            onChange={(e) => setExpression(e.currentTarget.value)}
            error={expressionInvalid ? "Use the form 2d6, d20+5 or 3d8-1" : undefined}
            rightSection={
              expression ? (
                <IconX
                  size={14}
                  style={{ cursor: "pointer", opacity: 0.6 }}
                  onClick={() => setExpression("")}
                  aria-label="Clear expression"
                />
              ) : null
            }
          />

          {variant === "subtle" && (
            <Textarea
              label="Note"
              placeholder="Optional note for the DM"
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
              autosize
              minRows={2}
            />
          )}

          {variant === "public" && (
            <DiceResult result={result} rolling={loading} sides={rollSides} count={rollCount} />
          )}

          <Group justify="space-between" mt="xs" gap="sm" wrap="nowrap">
            <Button type="button" onClick={onClose} className="glass-btn-secondary" style={buttonText}>
              Close
            </Button>

            <Button
              type="submit"
              loading={loading && variant === "subtle"}
              disabled={!canSubmit || loading}
              className="glass-btn-primary"
              leftSection={<IconDice5 size={14} />}
              style={buttonText}
            >
              {variant === "public" ? "Roll" : "Send"} {canSubmit ? rollExpression.replace(/\s+/g, "") : ""}
            </Button>
          </Group>

          {variant === "subtle" && (
            <Text size="xs" c="dimmed" ta="center">
              Only the DM sees the result.
            </Text>
          )}
        </Stack>
      </form>
    </BaseModal>
  );
}
