import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps, Group, Text, Tooltip, Stack, Divider } from "@mantine/core";
import type { ReactNode } from "react";

export interface CustomBadgeProps extends Omit<MantineBadgeProps, 'children' | 'variant'> {
  label: string | number;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  title?: string;
  hoverText?: string;
  lineBreak?: boolean;
  divider?: 'horizontal' | 'vertical' | false;
  onClick?: () => void;
  variant?: MantineBadgeProps['variant'] | 'themed';
}

export default function CustomBadge({
  label,
  icon,
  iconPosition = 'left',
  color = "gray",
  variant = "filled",
  title,
  hoverText,
  lineBreak = false,
  divider = false,
  onClick,
  style,
  ...props
}: CustomBadgeProps) {
  const isThemed = variant === "themed";

  const themedStyle = isThemed ? {
    background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.1))",
    color: "var(--theme-color-text-primary, #ffffff)",
    textShadow: "0 0 6px var(--theme-border-glow, rgba(255, 255, 255, 0.15))",
    fontWeight: 700,
    boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05)",
    transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
    ...style,
  } : style;

  const badge = (
    <MantineBadge
      variant={isThemed ? "transparent" : (variant as MantineBadgeProps['variant'])}
      color={isThemed ? undefined : color}
      leftSection={iconPosition === 'left' ? icon : undefined}
      rightSection={iconPosition === 'right' ? icon : undefined}
      onClick={onClick}
      style={{
        ...(onClick ? { cursor: "pointer" } : undefined),
        ...themedStyle,
      }}
      {...props}
    >
      {label}
    </MantineBadge>
  );

  const content = title ? (
    lineBreak ? (
      <Stack gap="xs">
        <Text size="xs" c="dimmed" fw={500} ta="center">
          {title}:
        </Text>
        {badge}
      </Stack>
    ) : (
      <Group gap="xs">
        <Text size="xs" c="dimmed" fw={500} ta="center">
          {title}
        </Text>
        {badge}
      </Group>
    )
  ) : badge;

  const withTooltip = hoverText ? (
    <Tooltip label={hoverText} withArrow>
      {content}
    </Tooltip>
  ) : content;

  if (divider === 'horizontal') {
    return (
      <Stack gap="xs">
        {withTooltip}
        <Divider orientation="horizontal" />
      </Stack>
    );
  }

  if (divider === 'vertical') {
    return (
      <Group gap="xs">
        {withTooltip}
        <Divider orientation="vertical" />
      </Group>
    );
  }

  return withTooltip;
}
