import type { ReactNode } from "react";
import { Group, Paper, Stack, Text } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";

/** Near-solid themed surface so the animated backdrop doesn't show through settings panels. */
export const settingsPanelBg = "color-mix(in srgb, var(--theme-bg-panel-opaque, #140f28) 96%, transparent)";

interface SettingsSectionProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** Red border and heading, for destructive actions. */
  danger?: boolean;
  children: ReactNode;
}

/** Glass panel with an uppercase heading, shared by every settings tab. */
export function SettingsSection({ icon, title, description, danger = false, children }: SettingsSectionProps) {
  const isMobile = useIsMobile();

  return (
    <Paper
      p={isMobile ? "md" : "xl"}
      style={{
        background: settingsPanelBg,
        border: danger ? "1px solid rgba(239, 68, 68, 0.35)" : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: isMobile ? 12 : 20,
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
      }}
    >
      <Stack gap="md">
        <Group gap="xs" align="center">
          {icon}
          <Text
            fw={600}
            size="md"
            tt="uppercase"
            style={{
              letterSpacing: "2px",
              color: danger ? "#f87171" : "var(--theme-color-text-primary, #fff)",
            }}
          >
            {title}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
        {children}
      </Stack>
    </Paper>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  children: ReactNode;
}

/** One setting: label and hint on the left, its control on the right (stacked on mobile). */
export function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <Group justify="space-between" align="center" gap="md" py="xs">
      <Stack gap={2} style={{ flex: "1 1 220px", minWidth: 0 }}>
        <Text fw={600} size="sm" style={{ color: "var(--theme-color-text-primary, #fff)" }}>
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </Stack>
      {children}
    </Group>
  );
}
