import type { ReactNode } from "react";
import { Group, Text } from "@mantine/core";
import { FormNumberInput } from "@components/common/FormNumberInput";
import s from "@styles/CharacterForm.module.css";

interface ResourceRowProps {
  label: string;
  current: number;
  max: number;
  onCurrentChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  /** Optional second line under the counters (e.g. recharge select + delete). */
  footer?: ReactNode;
}

/** One "Name — current / max" list row, shared by spell slots and class resources. */
export function ResourceRow({ label, current, max, onCurrentChange, onMaxChange, footer }: ResourceRowProps) {
  const numberProps = {
    hideControls: true,
    min: 0,
    size: "xs",
    classNames: { input: "glassy-input" },
    style: { width: 48, flexShrink: 0 },
    styles: { input: { textAlign: "center" as const, padding: 0 } },
  };

  return (
    <div className={s.row}>
      <div className={s.rowHead}>
        <div className={s.rowTitle}>
          <span className={s.truncate}>{label}</span>
        </div>
        <Group gap={6} wrap="nowrap">
          <FormNumberInput
            {...numberProps}
            max={max}
            value={current}
            onChange={(v) => onCurrentChange(v ?? 0)}
            aria-label={`${label} current`}
          />
          <Text size="sm" c="dimmed">/</Text>
          <FormNumberInput
            {...numberProps}
            value={max}
            onChange={(v) => onMaxChange(v ?? 0)}
            aria-label={`${label} max`}
          />
        </Group>
      </div>

      {footer && (
        <Group justify="space-between" align="center" wrap="nowrap" gap="xs" mt={8}>
          {footer}
        </Group>
      )}
    </div>
  );
}

