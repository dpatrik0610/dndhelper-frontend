import type { ReactNode } from "react";
import { Divider, Group, Stack, Text } from "@mantine/core";
import s from "@styles/CharacterForm.module.css";

interface FormGroupProps {
  icon?: ReactNode;
  title: ReactNode;
  /** Item count shown after the title, for groups that hold a list. */
  count?: number;
  children: ReactNode;
}

/** Flat titled block inside the character form: heading + hairline, no surrounding box. */
export function FormGroup({ icon, title, count, children }: FormGroupProps) {
  return (
    <Stack gap="sm">
      <Group gap={6} wrap="nowrap" style={{ color: "var(--theme-color-accent-primary)" }}>
        {icon}
        <Text
          className="narrative-title"
          style={{ fontSize: "12px", letterSpacing: "1.5px", color: "var(--theme-color-text-primary, #fff)" }}
        >
          {title}
          {count !== undefined && <span className={s.count}>{count}</span>}
        </Text>
      </Group>
      <Divider color="var(--theme-border-subtle, rgba(255,255,255,0.06))" />
      {children}
    </Stack>
  );
}

