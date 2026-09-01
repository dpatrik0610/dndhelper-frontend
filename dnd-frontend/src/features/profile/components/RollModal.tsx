import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconX, IconDice5 } from "@tabler/icons-react";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { showNotification } from "@components/Notification/Notification";

import { useCurrentCharacter } from "@store/character/characterSelectors";
import { rollByDice, rollByExpression, subtleRoll } from "@services/rollService";
import type { RollResult } from "@appTypes/Roll";
import { formatRollExpression } from "@utils/rollFormat";
import { BaseModal } from "@components/BaseModal";

interface RollModalProps {
  opened: boolean;
  onClose: () => void;
}

type RollModalVariant = "public" | "subtle";
type InputMode = "expression" | "manual";

const quickSides = [4, 6, 8, 10, 12, 20];
const quickDiceCounts = [1, 2, 3, 4, 5, 6];

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  if ("status" in error && typeof (error as { status?: number }).status === "number") {
    return (error as { status?: number }).status ?? null;
  }
  return null;
}

export function RollModal({ opened, onClose }: RollModalProps) {
  const character = useCurrentCharacter();

  const [variant, setVariant] = useState<RollModalVariant>("public");
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [expression, setExpression] = useState("");
  const [numberOfDice, setNumberOfDice] = useState(1);
  const [sides, setSides] = useState(20);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setVariant("public");
    setInputMode("manual");
    setExpression("");
    setNumberOfDice(1);
    setSides(20);
    setNote("");
    setResult(null);
    setShowValidation(false);
  }, [opened]);

  const hasExpression = inputMode === "expression" && expression.trim().length > 0;
  const hasDice = inputMode === "manual" && numberOfDice > 0 && sides > 0;
  const canSubmit = hasExpression || hasDice;

  const resultExpression = useMemo(() => {
    if (!result) return null;
    return formatRollExpression(result);
  }, [result]);

  const handleError = (error: unknown) => {
    const status = getErrorStatus(error);
    if (status === 429) {
      showNotification({
        title: "Slow down",
        message: "Too many rolls. Please wait a moment and try again.",
        color: "yellow",
      });
      return;
    }

    showNotification({
      title: "Roll failed",
      message: "Could not complete the roll. Please try again.",
      color: "red",
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setShowValidation(true);
      showNotification({
        title: "Missing input",
        message: "Enter a dice expression or both number of dice and sides.",
        color: "red",
      });
      return;
    }

    if (variant === "subtle" && !character?.id) {
      showNotification({
        title: "Character missing",
        message: "Select a character before sending a subtle roll.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      if (variant === "public") {
        const roll = hasExpression
          ? await rollByExpression(expression.trim())
          : await rollByDice(numberOfDice, sides);
        setResult(roll);
      } else {
        await subtleRoll({
          characterId: character!.id!,
          expression: hasExpression ? expression.trim() : undefined,
          numberOfDice: hasExpression ? undefined : numberOfDice,
          sides: hasExpression ? undefined : sides,
          note: note.trim() || undefined,
        });

        showNotification({
          title: "Sent",
          message: "Sent to DM",
          color: "green",
        });
        onClose();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (value: string) => {
    const mode = value as InputMode;
    setInputMode(mode);
    setResult(null);
    setShowValidation(false);
    if (mode === "manual") {
      setExpression("");
      return;
    }
  };

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    setResult(null);
    setShowValidation(false);
  };

  const handleManualDiceChange = (value: number) => {
    setNumberOfDice(value);
    setResult(null);
    setShowValidation(false);
    setInputMode("manual");
  };

  const handleManualSidesChange = (value: number) => {
    setSides(value);
    setResult(null);
    setShowValidation(false);
    setInputMode("manual");
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
          
          {/* THEMED SEGMENTED CONTROLS */}
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
            styles={{
              root: {
                background: "rgba(255, 255, 255, 0.01)",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                borderRadius: "8px",
                padding: "4px",
              },
              indicator: {
                background: "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))",
                boxShadow: "var(--theme-glow-shadow-primary)",
                borderRadius: "6px",
              },
              label: {
                color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 500,
                fontSize: "11px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                transition: "color 0.2s ease",
                "&[data-active]": {
                  color: "#121214 !important",
                  fontWeight: 700,
                }
              }
            }}
          />

          <Paper
            p="sm"
            radius="md"
            withBorder
            style={{
              background: "rgba(0, 0, 0, 0.12)",
              borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
            }}
          >
            <Stack gap="xs">
              <Text
                size="xs"
                fw={400}
                style={{
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "var(--theme-color-text-secondary)",
                }}
              >
                Roll Input Mode
              </Text>
              <SegmentedControl
                value={inputMode}
                onChange={handleModeChange}
                data={[
                  { label: "Expression Input", value: "expression" },
                  { label: "Quick Pick", value: "manual" },
                ]}
                size="xs"
                fullWidth
                styles={{
                  root: {
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                    borderRadius: "8px",
                    padding: "4px",
                  },
                  indicator: {
                    background: "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))",
                    boxShadow: "var(--theme-glow-shadow-primary)",
                    borderRadius: "6px",
                  },
                  label: {
                    color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 500,
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    transition: "color 0.2s ease",
                    "&[data-active]": {
                      color: "#121214 !important",
                      fontWeight: 700,
                    }
                  }
                }}
              />
            </Stack>
          </Paper>

          {inputMode === "expression" && (
            <TextInput
              label="Dice Expression"
              placeholder="e.g., 2d20+5"
              value={expression}
              onChange={(e) => handleExpressionChange(e.currentTarget.value)}
              rightSection={
                expression ? (
                  <Button
                    size="xs"
                    variant="unstyled"
                    onClick={() => handleExpressionChange("")}
                    aria-label="Clear expression"
                    style={{ color: "rgba(255,255,255,0.5)", border: "none", background: "none", cursor: "pointer" }}
                  >
                    <IconX size={14} />
                  </Button>
                ) : null
              }
              classNames={{ input: "glassy-input", label: "glassy-label" }}
              styles={{
                label: {
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 300,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  color: "var(--theme-color-text-secondary)",
                  marginBottom: "4px",
                },
              }}
            />
          )}

          {inputMode === "manual" && (
            <>
              <Stack gap="xs">
                <Text
                  size="xs"
                  fw={400}
                  style={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    color: "var(--theme-color-text-secondary)",
                  }}
                >
                  Quick Selector Matrix
                </Text>
                
                <SimpleGrid cols={2} spacing="xs">
                  {/* Dice counts column with active glass buttons */}
                  <Stack gap="xs">
                    {quickDiceCounts.map((count) => {
                      const isSelected = numberOfDice === count;
                      return (
                        <Button
                          key={`dice-${count}`}
                          size="xs"
                          className={isSelected ? "glass-btn-primary" : "glass-btn-secondary"}
                          onClick={() => handleManualDiceChange(count)}
                          fullWidth
                          style={{
                            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                            fontSize: "11px",
                            fontWeight: 400,
                            letterSpacing: "1px",
                          }}
                        >
                          {count} dice
                        </Button>
                      );
                    })}
                  </Stack>

                  {/* Sides counts column with active glass buttons */}
                  <Stack gap="xs">
                    {quickSides.map((value) => {
                      const isSelected = sides === value;
                      return (
                        <Button
                          key={`sides-${value}`}
                          size="xs"
                          className={isSelected ? "glass-btn-primary" : "glass-btn-secondary"}
                          onClick={() => handleManualSidesChange(value)}
                          fullWidth
                          style={{
                            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                            fontSize: "11px",
                            fontWeight: 400,
                            letterSpacing: "1px",
                          }}
                        >
                          d{value}
                        </Button>
                      );
                    })}
                  </Stack>
                </SimpleGrid>
              </Stack>

              <Stack gap="sm">
                <FormNumberInput
                  label="Number of Dice"
                  min={1}
                  value={numberOfDice}
                  onChange={handleManualDiceChange}
                  classNames={{ input: "glassy-input", label: "glassy-label" }}
                  hideControls
                  style={{ width: "100%" }}
                  styles={{
                    label: {
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                      fontWeight: 300,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontSize: "10px",
                      color: "var(--theme-color-text-secondary)",
                      marginBottom: "4px",
                    },
                  }}
                />
                <FormNumberInput
                  label="Sides"
                  min={2}
                  value={sides}
                  onChange={handleManualSidesChange}
                  classNames={{ input: "glassy-input", label: "glassy-label" }}
                  hideControls
                  style={{ width: "100%" }}
                  styles={{
                    label: {
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                      fontWeight: 300,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontSize: "10px",
                      color: "var(--theme-color-text-secondary)",
                      marginBottom: "4px",
                    },
                  }}
                />
              </Stack>
            </>
          )}

          {showValidation && !canSubmit && (
            <Text size="xs" c="red">
              Provide either a dice expression or both number of dice and sides.
            </Text>
          )}

          {variant === "subtle" && (
            <Textarea
              label="Note"
              placeholder="Optional note for the DM"
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
              autosize
              minRows={2}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
              styles={{
                label: {
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                  fontWeight: 300,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontSize: "10px",
                  color: "var(--theme-color-text-secondary)",
                  marginBottom: "4px",
                },
              }}
            />
          )}

          {/* ACTIVE CAMPAIGN THEMED ROLL OUTCOMES CARD */}
          {variant === "public" && result && (
            <>
              <Divider color="rgba(255,255,255,0.03)" my="xs" />
              <Paper
                p="sm"
                radius="md"
                withBorder
                style={{
                  background: "rgba(0, 0, 0, 0.12)",
                  borderColor: "var(--theme-border-glow, rgba(255, 255, 255, 0.15))",
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3), var(--theme-glow-shadow-primary)",
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between" align="center">
                    <Text
                      fw={400}
                      className="narrative-title"
                      style={{
                        fontSize: "12px",
                        letterSpacing: "1.5px",
                        color: "var(--theme-color-text-primary, #fff)",
                      }}
                    >
                      Roll Result
                    </Text>
                    <Badge
                      size="lg"
                      variant="transparent"
                      style={{
                        background: "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))",
                        boxShadow: "var(--theme-glow-shadow-primary)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#121214",
                        fontWeight: 600,
                      }}
                    >
                      Total {result.total}
                    </Badge>
                  </Group>
                  {resultExpression && <Text size="xs" c="dimmed">Expression: {resultExpression}</Text>}
                  
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      fw={400}
                      style={{
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        color: "var(--theme-color-text-secondary)",
                      }}
                    >
                      Individual Dice
                    </Text>
                    <Group wrap="wrap" gap="xs">
                      {result.rolls.map((roll, idx) => (
                        <Badge
                          key={`roll-${idx}`}
                          variant="transparent"
                          size="lg"
                          radius="sm"
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                            color: "var(--theme-color-accent-primary, #fff)",
                            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)",
                          }}
                        >
                          {roll}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>

                  <Group
                    wrap="nowrap"
                    gap="sm"
                    style={{
                      border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.08))",
                      borderRadius: 8,
                      padding: "6px 10px",
                      background: "rgba(255,255,255,0.01)",
                    }}
                  >
                    {typeof result.min === "number" && (
                      <Text size="11px" c="dimmed" lineClamp={1}>
                        Min: {result.min}
                      </Text>
                    )}
                    {typeof result.max === "number" && (
                      <Text size="11px" c="dimmed" lineClamp={1}>
                        Max: {result.max}
                      </Text>
                    )}
                    {typeof result.average === "number" && (
                      <Text size="11px" c="dimmed" lineClamp={1}>
                        Avg: {result.average.toFixed(2)}
                      </Text>
                    )}
                  </Group>
                </Stack>
              </Paper>
            </>
          )}

          <Group justify="flex-end" mt="md" gap="sm">
            <Button
              type="button"
              onClick={onClose}
              className="glass-btn-secondary"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              onClick={handleSubmit}
              loading={loading}
              disabled={!canSubmit}
              className="glass-btn-primary"
              leftSection={<IconDice5 size={14} />}
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontWeight: 300,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontSize: "11px",
              }}
            >
              {variant === "public" ? "Roll" : "Roll Subtle"}
            </Button>
          </Group>

        </Stack>
      </form>
    </BaseModal>
  );
}
