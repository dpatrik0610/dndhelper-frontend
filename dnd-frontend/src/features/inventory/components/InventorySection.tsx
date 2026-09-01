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
      background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
      borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
      boxShadow: "none",
      borderRadius: 12,
      backdropFilter: "blur(24px) saturate(130%)",
      WebkitBackdropFilter: "blur(24px) saturate(130%)",
    };

    if (!hasFilters) return defaultStyle;
    if (!hasMatches) return defaultStyle;

    return {
      ...defaultStyle,
      borderColor: "var(--theme-border-glow, rgba(255, 255, 255, 0.15))",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)",
      background: "rgba(255, 255, 255, 0.02)",
    };
  }, [hasFilters, hasMatches]);

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


