import { Text, Box } from "@mantine/core";
import type { SectionColor } from "../../types/SectionColor";

interface DividerWithLabelProps {
  label: string;
  color?: string | SectionColor;
  thickness?: string; // line height
  marginY?: string; // vertical spacing
}

export function DividerWithLabel({
  label,
  color = "rgba(119, 0, 255, 0.52)",
  thickness = "1px",
  marginY = "1rem",
}: DividerWithLabelProps) {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        margin: `${marginY} 0`,
      }}
    >
      <Box
        style={{
          flex: 1,
          height: thickness,
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />
      <Text
        size="sm"
        c="dimmed"
        mx="sm"
        style={{ whiteSpace: "nowrap" }}
      >
        {label}
      </Text>
      <Box
        style={{
          flex: 1,
          height: thickness,
          background: `linear-gradient(to left, transparent, ${color})`,
        }}
      />
    </Box>
  );
}
