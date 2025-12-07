import type { CSSProperties } from "react";
import { Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { RuleCategory, type RuleSnippet } from "@appTypes/Rules/Rule";
import { magicGlowTheme } from "@styles/magic/glowTheme";

interface RulesListProps {
  rules: RuleSnippet[];
  paletteTextDim: string;
  cardStyle: CSSProperties;
  onOpen: (slug: string) => void;
  activeTopic?: string;
  searchTerm?: string;
  matchCount?: number;
}

export function RulesList({ rules, paletteTextDim, cardStyle, onOpen, activeTopic, searchTerm, matchCount }: RulesListProps) {
  const categoryBadgeColor = (category: RuleCategory | string) => {
    if (category === RuleCategory.Homebrew) return "yellow";
    if (category === RuleCategory.Combat) return "red";
    if (category === RuleCategory.Magic) return "grape";
    if (category === RuleCategory.Status) return "teal";
    if (category === RuleCategory.Exploration) return "cyan";
    return "gray";
  };

  return (
    <Paper withBorder radius="md" p="lg" shadow="sm" style={cardStyle}>
      <Group justify="space-between" mb="sm">
        <Group gap="xs" wrap="wrap">
          <Badge color="orange" variant="light">
            Current SRD rules
          </Badge>
          {typeof matchCount === "number" && (
            <Badge color="cyan" variant="light">
              Matches: {matchCount}
            </Badge>
          )}
        </Group>
        <Button variant="subtle" size="xs">
          Auto-refresh soon
        </Button>
      </Group>
      <Stack gap="sm">
        {rules.map((rule) => {
          const isActive =
            activeTopic &&
            (rule.category.toString().toLowerCase() === activeTopic.toLowerCase() ||
              rule.tags.some((t) => t.toLowerCase() === activeTopic.toLowerCase()) ||
              (rule.source?.title?.toLowerCase().includes(activeTopic.toLowerCase())));
          const isSearchMode = !!searchTerm && searchTerm.trim().length > 0;
          const highlightStyle = isActive
            ? magicGlowTheme.outline
            : isSearchMode
            ? { borderColor: "rgba(120, 200, 255, 0.35)", boxShadow: "0 0 10px rgba(120, 200, 255, 0.2)" }
            : undefined;

          return (
          <Paper key={rule.slug} p="sm" withBorder radius="md" style={{ ...cardStyle, ...highlightStyle }}>
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap="xs" mb={4}>
                  <Text fw={700}>{rule.title}</Text>
                  <Badge color={categoryBadgeColor(rule.category)} variant="light" size="sm">
                    {rule.category}
                  </Badge>
                  {rule.source?.title?.toLowerCase().includes("homebrew") && (
                    <Badge size="xs" color="yellow" variant="outline">
                      Homebrew
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c={paletteTextDim}>
                  {rule.summary}
                </Text>
                <Group gap={6} mt={6} wrap="wrap">
                  {rule.tags.map((tag) => (
                    <Badge key={tag} size="xs" variant="outline" color="grape">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              </div>
              <Button size="xs" variant="light" onClick={() => onOpen(rule.slug)}>
                View detail
              </Button>
            </Group>
          </Paper>
        )})}
        {rules.length === 0 && (
          <Text size="sm" c="dimmed">
            No rules match this topic yet.
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
