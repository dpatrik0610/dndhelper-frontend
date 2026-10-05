import type { ReactNode } from "react";
import { Badge, Group, Text } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import type { Currency } from "@appTypes/Currency";

interface InventorySectionProps {
  title: string;
  itemCount: number;
  totalWeight: number;
  currencies: Currency[];
  matchCount: number;
  hasFilters: boolean;
  children: ReactNode;
}

const baseStyle = {
  background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
  borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
  boxShadow: "none",
  borderRadius: 12,
  backdropFilter: "blur(24px) saturate(130%)",
  WebkitBackdropFilter: "blur(24px) saturate(130%)",
};

const matchStyle = {
  ...baseStyle,
  borderColor: "var(--theme-border-glow, rgba(255, 255, 255, 0.15))",
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.25), var(--theme-glow-shadow-primary)",
  background: "rgba(255, 255, 255, 0.02)",
};

/** Collapsible inventory with a summary in the header, so it can be judged without opening it. */
export function InventorySection({
  title,
  itemCount,
  totalWeight,
  currencies,
  matchCount,
  hasFilters,
  children,
}: InventorySectionProps) {
  const highlighted = hasFilters && matchCount > 0;
  const money = currencies.filter((c) => c.amount > 0);

  return (
    <ExpandableSection
      title={title}
      defaultOpen={false}
      forceOpen={highlighted}
      style={highlighted ? matchStyle : baseStyle}
      titleContent={
        <Group gap="xs" wrap="wrap" style={{ minWidth: 0 }}>
          <Text fw={600} c="inherit" truncate>
            {title}
          </Text>
          {hasFilters ? (
            <Badge size="xs" color={matchCount ? "green" : "gray"} variant="light">
              {matchCount ? `${matchCount} match${matchCount === 1 ? "" : "es"}` : "No matches"}
            </Badge>
          ) : (
            <Text size="xs" c="dimmed">
              {itemCount} item{itemCount === 1 ? "" : "s"}
              {totalWeight > 0 && ` · ${Math.round(totalWeight * 10) / 10} lb`}
            </Text>
          )}
          {money.map((c) => (
            <Badge key={c.currencyCode} size="xs" variant="light" color="yellow">
              {c.amount} {c.currencyCode}
            </Badge>
          ))}
        </Group>
      }
    >
      {children}
    </ExpandableSection>
  );
}
