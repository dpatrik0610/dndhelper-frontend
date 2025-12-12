import { Badge, Button, Group, Paper, TextInput } from "@mantine/core";
import { IconBook2, IconBookmark } from "@tabler/icons-react";
import { useRulesPalette } from "../hooks/useRulesPalette";
import { useRulesDataStore } from "../store/useRulesDataStore";
import { useRulesUiStore } from "../store/useRulesUiStore";

interface RulesFiltersProps {
}

export function RulesFilters({}: RulesFiltersProps) {
  const { palette, cardStyle } = useRulesPalette();
  const topics = useRulesDataStore((s) => s.topics);
  const topic = useRulesUiStore((s) => s.topic);
  const setTopic = useRulesUiStore((s) => s.setTopic);
  const searchTerm = useRulesUiStore((s) => s.searchTerm);
  const setSearchTerm = useRulesUiStore((s) => s.setSearchTerm);
  return (
    <Paper p="md" withBorder radius="md" shadow="sm" style={cardStyle}>
      <Group gap="xs" wrap="wrap">
        <Badge size="lg" color="grape" variant="light" leftSection={<IconBookmark size={14} />}>
          Browse by topic
        </Badge>
        {topics.map((t) => (
          <Button
            key={t.value}
            size="xs"
            variant={topic === t.value ? "filled" : t.value === "all" ? "light" : "outline"}
            onClick={() => setTopic(topic === t.value ? "all" : t.value)}
          >
            {t.label}
          </Button>
        ))}
      </Group>
      <TextInput
        mt="md"
        placeholder="Search rules, spells, or rulings..."
        leftSection={<IconBook2 size={16} />}
        variant="filled"
        radius="md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        styles={{
          input: {
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            borderColor: palette.border,
            color: "white",
            backdropFilter: "blur(8px)",
          },
        }}
      />
    </Paper>
  );
}
