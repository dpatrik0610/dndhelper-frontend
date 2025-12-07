import type { ComponentType, CSSProperties } from "react";
import { Button, Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { RuleCategory, type RuleSnippet } from "@appTypes/Rules/Rule";

interface FeaturedItem {
  icon: ComponentType<{ size?: number }>;
  color: string;
  title: string;
  body: string;
  category: RuleCategory | string;
  bullets?: string[];
}

interface FeaturedGridProps {
  featured: FeaturedItem[];
  rules: RuleSnippet[];
  paletteTextDim: string;
  cardStyle: CSSProperties;
  onOpen?: (slug: string) => void;
}

export function FeaturedGrid({ featured, rules, paletteTextDim, cardStyle, onOpen }: FeaturedGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
      {featured.map((item) => (
        <Card key={item.title} withBorder radius="md" p="md" shadow="sm" style={cardStyle}>
          <Group gap="xs">
            <ThemeIcon color={item.color} variant="light" radius="md">
              <item.icon size={18} />
            </ThemeIcon>
            <div>
              <Text fw={600}>{item.title}</Text>
              <Text size="sm" c={paletteTextDim}>
                {item.body}
              </Text>
              {item.bullets && (
                <ul style={{ marginTop: 8, paddingLeft: 18, color: paletteTextDim, fontSize: "0.85rem", lineHeight: 1.4 }}>
                  {item.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          </Group>
          {onOpen && (
            <Button
              mt="md"
              size="xs"
              variant="light"
              onClick={() => {
                const match = rules.find((r) => r.category === item.category) ?? rules[0];
                if (match) onOpen(match.slug);
              }}
            >
              Open section
            </Button>
          )}
        </Card>
      ))}
    </SimpleGrid>
  );
}
