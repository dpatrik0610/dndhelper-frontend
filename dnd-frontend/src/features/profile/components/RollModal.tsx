import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { showNotification } from "@components/Notification/Notification";

import { useCurrentCharacter } from "@store/character/characterSelectors";
import { rollByDice, rollByExpression, subtleRoll } from "@services/rollService";
import type { RollResult } from "@appTypes/Roll";
import { formatRollExpression } from "@utils/rollFormat";

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

function RollModalBase({ opened, onClose, variant }: RollModalProps & { variant: RollModalVariant }) {

  const character = useCurrentCharacter();

  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [expression, setExpression] = useState("");
  const [numberOfDice, setNumberOfDice] = useState(1);
  const [sides, setSides] = useState(20);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RollResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (opened) return;
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
        await subtleRoll(
          {
            characterId: character!.id!,
            expression: hasExpression ? expression.trim() : undefined,
            numberOfDice: hasExpression ? undefined : numberOfDice,
            sides: hasExpression ? undefined : sides,
            note: note.trim() || undefined,
          },

        );

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
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      styles={{
        header: { display: "none" },
        content: {
          background: "rgba(20,0,0,0.45)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,100,100,0.2)",
          boxShadow: "0 0 12px rgba(255,60,60,0.25)",
        },
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            {variant === "public" ? "Roll Dice" : "Subtle Roll"}
          </Text>
          <ActionIcon
            variant="subtle"
            size="lg"
            onClick={onClose}
            aria-label="Close roll modal"
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <Paper
          p="sm"
          radius="md"
          withBorder
          style={{
            background: "rgba(0,0,0,0.22)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Roll input
            </Text>
            <SegmentedControl
              value={inputMode}
              onChange={handleModeChange}
              data={[
                { label: "Expression", value: "expression" },
                { label: "Quick", value: "manual" },
              ]}
              size="xs"
              fullWidth
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
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={() => handleExpressionChange("")}
                  aria-label="Clear expression"
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
            classNames={{ input: "glassy-input", label: "glassy-label" }}
          />
        )}

        {inputMode === "manual" && (
          <>
            <Stack gap="xs">
              <Text size="md" fw={500}>
                Quick buttons
              </Text>
              <SimpleGrid cols={2} spacing="xs">
                <Stack gap="xs">
                  {quickDiceCounts.map((count) => (
                    <Button
                      key={`dice-${count}`}
                      size="xs"
                      variant="light"
                      onClick={() => handleManualDiceChange(count)}
                      fullWidth
                    >
                      {count} dice
                    </Button>
                  ))}
                </Stack>
                <Stack gap="xs">
                  {quickSides.map((value) => (
                    <Button
                      key={`sides-${value}`}
                      size="xs"
                      variant="outline"
                      onClick={() => handleManualSidesChange(value)}
                      fullWidth
                    >
                      d{value}
                    </Button>
                  ))}
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
              />
              <FormNumberInput
                label="Sides"
                min={2}
                value={sides}
                onChange={handleManualSidesChange}
                classNames={{ input: "glassy-input", label: "glassy-label" }}
                hideControls
                style={{ width: "100%" }}
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
          />
        )}

        {variant === "public" && result && (
          <>
            <Divider my="xs" />
            <Paper
              p="sm"
              radius="md"
              withBorder
              style={{
                background: "rgba(0,0,0,0.25)",
                borderColor: "rgba(120,255,180,0.35)",
                boxShadow: "0 0 14px rgba(120,255,180,0.22)",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text fw={600}>Result</Text>
                  <Badge
                    color="violet"
                    variant="filled"
                    size="lg"
                    style={{
                      boxShadow: "0 0 12px rgba(128, 90, 255, 0.65)",
                      border: "1px solid rgba(150,120,255,0.6)",
                    }}
                  >
                    Total {result.total}
                  </Badge>
                </Group>
                {resultExpression && <Text size="sm">Expression: {resultExpression}</Text>}
                <Stack gap={4}>
                  <Text size="sm">Rolls:</Text>
                  <Group wrap="wrap">
                    {result.rolls.map((roll, idx) => (
                      <Badge
                        key={`roll-${idx}`}
                        color="gray"
                        variant="light"
                        size="lg"
                        radius="sm"
                        style={{ fontSize: 16, fontWeight: 450, border: "none" }}
                      >
                        {roll}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
                <Group
                  wrap="nowrap"
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "4px 8px",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  {typeof result.min === "number" && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      Min {result.min}
                    </Text>
                  )}
                  {typeof result.max === "number" && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      Max {result.max}
                    </Text>
                  )}
                  {typeof result.average === "number" && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      Avg {result.average.toFixed(2)}
                    </Text>
                  )}
                </Group>
              </Stack>
            </Paper>
          </>
        )}

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
          variant="gradient"
          gradient={{ from: "violet", to: "cyan", deg: 180 }}
          type="submit"
        >
          {variant === "public" ? "Roll" : "Roll Subtle"}
        </Button>
        </Stack>
      </form>
    </Modal>
  );
}

export function RollModal(props: RollModalProps) {
  return <RollModalBase {...props} variant="public" />;
}

export function SubtleRollModal(props: RollModalProps) {
  return <RollModalBase {...props} variant="subtle" />;
}
