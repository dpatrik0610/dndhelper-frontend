import type { CSSProperties } from "react";
import { Badge, Button, Group, Paper, TextInput } from "@mantine/core";
import { IconBook2, IconBookmark } from "@tabler/icons-react";

interface RulesFiltersProps {
  topics: { label: string; value: string }[];
  topic: string;
  onTopicChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  palette: { border: string };
  cardStyle: CSSProperties;
}

export function RulesFilters({ topics, topic, onTopicChange, searchTerm, onSearchChange, palette, cardStyle }: RulesFiltersProps) {
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
            onClick={() => onTopicChange(t.value)}
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
        onChange={(e) => onSearchChange(e.currentTarget.value)}
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
