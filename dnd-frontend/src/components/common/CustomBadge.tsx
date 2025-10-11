import { Badge as MantineBadge, type BadgeProps as MantineBadgeProps, Group, Text, Tooltip, Stack, Divider } from "@mantine/core";
import type { ReactNode } from "react";

export interface CustomBadgeProps extends Omit<MantineBadgeProps, 'children'> {
  label: string | number;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  title?: string;
  hoverText?: string;
  lineBreak?: boolean;
  divider?: 'horizontal' | 'vertical' | false;
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
  ...props
}: CustomBadgeProps) {
  const badge = (
    <MantineBadge
      color={color}
      variant={variant}
      leftSection={iconPosition === 'left' ? icon : undefined}
      rightSection={iconPosition === 'right' ? icon : undefined}
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