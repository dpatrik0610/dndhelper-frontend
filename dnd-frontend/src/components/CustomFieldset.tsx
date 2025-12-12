import { Box, Text, useMantineTheme } from "@mantine/core";
import type { ReactNode, CSSProperties } from "react";

interface CustomFieldsetProps {
  label?: ReactNode;
  children: ReactNode;
  borderColor?: string;
  borderRadius?: number;
  labelBg?: string;
  labelPadding?: string;
  padding?: string;
  style?: CSSProperties;
}

export function CustomFieldset({
  label,
  children,
  borderColor,
  borderRadius = 8,
  labelBg,
  labelPadding = "0 8px",
  padding = "sm",
  style,
}: CustomFieldsetProps) {
  const theme = useMantineTheme();

  const border = borderColor ?? `1px solid ${theme.colors.gray[7]}`;
  const background = labelBg ?? ``;

  return (
    <Box
      pos="relative"
      p={padding}
      mt={"md"}
      style={{
        border,
        borderRadius,
        ...style,
      }}
    >
      {label && (
        <Text
          size="sm"
          fw={500}
          style={{
            position: "absolute",
            top: -10,
            left: 12,
            background,
            padding: labelPadding,
            lineHeight: 1,
            color: theme.colors.gray[3],
          }}
        >
          {label}
        </Text>
      )}
      {children}
    </Box>
  );
}
