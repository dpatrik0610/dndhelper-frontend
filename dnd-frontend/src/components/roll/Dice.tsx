import { useEffect, useState, type CSSProperties } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import type { RollResult } from "@appTypes/Roll";
import { formatRollExpression } from "@utils/rollFormat";
import "./dice.css";

const SHAPED = new Set([4, 6, 8, 10, 12, 20, 100]);
const MAX_VISIBLE = 24;

interface DieProps {
  sides: number;
  value: number | string;
  size?: number;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Die({ sides, value, size = 44, active, className = "", style }: DieProps) {
  const shape = SHAPED.has(sides) ? `die--d${sides}` : "die--dx";
  return (
    <span
      className={`die ${shape} ${active ? "die--active" : ""} ${className}`}
      style={{ width: size, height: size, fontSize: size * (String(value).length > 2 ? 0.28 : 0.38), ...style }}
    >
      {value}
    </span>
  );
}

interface DiceResultProps {
  result: RollResult | null;
  /** True while waiting on the server: dice tumble with random faces. */
  rolling?: boolean;
  /** Dice being rolled, used for the tumble before the result exists. */
  sides: number;
  count: number;
}

export function DiceResult({ result, rolling = false, sides, count }: DiceResultProps) {
  const reduceMotion = useReducedMotion();
  const [faces, setFaces] = useState<number[]>([]);
  const [shownTotal, setShownTotal] = useState(0);
  const [settled, setSettled] = useState(false);
  const [rollKey, setRollKey] = useState(0);

  const dieSides = rolling ? sides : result?.sides ?? sides;
  const totalDice = rolling ? count : result?.rolls.length ?? 0;
  const visible = Math.min(totalDice, MAX_VISIBLE);

  // Tumble: random faces until the server answers.
  useEffect(() => {
    if (!rolling) return;
    setSettled(false);
    const tick = () =>
      setFaces(Array.from({ length: visible }, () => 1 + Math.floor(Math.random() * dieSides)));
    tick();
    if (reduceMotion) return;
    const id = setInterval(tick, 70);
    return () => clearInterval(id);
  }, [rolling, visible, dieSides, reduceMotion]);

  // Land: real faces, then count the total up and pulse.
  useEffect(() => {
    if (rolling || !result) return;
    setFaces(result.rolls.slice(0, MAX_VISIBLE));
    setRollKey((k) => k + 1);

    if (reduceMotion) {
      setShownTotal(result.total);
      setSettled(true);
      return;
    }

    setSettled(false);
    const start = performance.now();
    const duration = 450;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShownTotal(Math.round(result.total * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
      else setSettled(true);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [result, rolling, reduceMotion]);

  if (!rolling && !result) return null;

  const singleD20 = !rolling && result?.numberOfDice === 1 && result.sides === 20;
  const crit = singleD20 && result!.rolls[0] === 20;
  const fumble = singleD20 && result!.rolls[0] === 1;
  const dieSize = visible <= 3 ? 64 : visible <= 8 ? 48 : 36;

  return (
    <Stack align="center" gap="sm" py="xs">
      <Group justify="center" gap="sm" wrap="wrap">
        {faces.map((face, i) => (
          <Die
            key={`${rollKey}-${i}`}
            sides={dieSides}
            value={face}
            size={dieSize}
            active
            className={
              rolling
                ? "die--rolling"
                : `die--landed ${crit ? "die--crit" : ""} ${fumble ? "die--fumble" : ""}`
            }
            style={{ animationDelay: rolling ? `${(i % 4) * -80}ms` : `${i * 35}ms` }}
          />
        ))}
      </Group>

      {totalDice > visible && (
        <Text size="xs" c="dimmed">
          +{totalDice - visible} more dice
        </Text>
      )}

      <div
        key={rollKey}
        className={[
          "roll-total",
          settled && "roll-total--pulse",
          settled && crit && "roll-total--crit",
          settled && fumble && "roll-total--fumble",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ opacity: rolling ? 0.25 : 1 }}
        aria-live="polite"
      >
        {rolling ? "–" : shownTotal}
      </div>

      {settled && (crit || fumble) && (
        <Text className="roll-banner" c={crit ? "#fbbf24" : "#f87171"}>
          {crit ? "Natural 20!" : "Natural 1"}
        </Text>
      )}

      {!rolling && result && (
        <Text size="xs" c="dimmed" ta="center">
          {formatRollExpression(result)}
          {result.rolls.length <= MAX_VISIBLE && ` · [${result.rolls.join(", ")}]`}
          {typeof result.min === "number" && typeof result.max === "number" && ` · range ${result.min}–${result.max}`}
        </Text>
      )}
    </Stack>
  );
}
