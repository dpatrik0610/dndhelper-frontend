import { useMemo, type ReactNode } from "react";
import { Badge, Group, Text } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";

interface InventorySectionProps {
  title: string;
  matchCount: number;
  hasFilters: boolean;
  color?: SectionColor;
  children: ReactNode;
}

export function InventorySection({
  title,
  matchCount,
  hasFilters,
  color = SectionColor.Grape,
  children,
}: InventorySectionProps) {
  const hasMatches = matchCount > 0;
  const sectionStyle = useMemo(() => {
    const defaultStyle = {
      color,
      background: "rgba(0, 0, 0, 0.14)",
      borderColor: "transparent",
      boxShadow: "none",
    };

    if (!hasFilters) return defaultStyle;
    if (!hasMatches) return defaultStyle;

    return {
      ...defaultStyle,
      borderColor: "rgba(34,197,94,0.35)",
      boxShadow: "0 6px 18px rgba(34,197,94,0.14)",
      background: "linear-gradient(145deg, rgba(10,40,20,0.2), rgba(10,60,30,0.12))",
    };
  }, [hasFilters, hasMatches, color]);

  return (
    <ExpandableSection
      title={title}
      defaultOpen={false}
      style={sectionStyle}
      titleContent={
        <Group gap="xs">
          <Text fw={600} c="inherit">
            {title}
          </Text>
          {hasFilters && (
            <Badge size="xs" color={hasMatches ? "green" : "gray"} variant="light">
              {hasMatches ? `${matchCount} match${matchCount === 1 ? "" : "es"}` : "No matches"}
            </Badge>
          )}
        </Group>
      }
    >
      {children}
    </ExpandableSection>
  );
}


