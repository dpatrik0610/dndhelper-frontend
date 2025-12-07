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
      background: "linear-gradient(20deg, rgba(40, 24, 12, 0.55), rgba(90, 18, 12, 0.45))",
      borderColor: "rgba(148, 120, 104, 0.25)",
      boxShadow: "none",
      borderRadius: 12,
    };

    if (!hasFilters) return defaultStyle;
    if (!hasMatches) return defaultStyle;

    return {
      ...defaultStyle,
      borderColor: "rgba(94, 234, 212, 0.2)",
      boxShadow: "0 6px 18px rgba(6, 78, 59, 0.12)",
      background: "linear-gradient(145deg, rgba(10, 60, 55, 0.35), rgba(4, 47, 40, 0.3))",
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


