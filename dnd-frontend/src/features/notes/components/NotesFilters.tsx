import { Badge, Box, Collapse, Group, SimpleGrid, Stack, Text, Button } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { NotesSearch } from "./NotesSearch";
import { MultiTagSelect } from "./NotesHeader";

interface NotesFiltersProps {
  isMobile: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  showTagFilter: boolean;
  toggleTagFilter: () => void;
  allTags: string[];
  tagQuery: string[];
  onTagsChange: (tags: string[]) => void;
  filteredCount: number;
}

export function NotesFilters({
  isMobile,
  search,
  onSearchChange,
  showTagFilter,
  toggleTagFilter,
  allTags,
  tagQuery,
  onTagsChange,
  filteredCount,
}: NotesFiltersProps) {
  const textDim = "rgba(225, 219, 255, 0.72)";

  return (
    <Stack gap="xs">
      <Group gap="xs" wrap="nowrap">
        <Box style={{ flex: 1 }}>
          <NotesSearch value={search} onChange={onSearchChange} isMobile={isMobile} />
        </Box>
        <Button
          size={isMobile ? "sm" : "md"}
          radius="xl"
          variant="light"
          color="indigo"
          leftSection={<IconFilter size={16} />}
          onClick={toggleTagFilter}
          style={{ flexShrink: 0, minWidth: isMobile ? 80 : 100 }}
        >
          {showTagFilter ? "Hide tags" : "Tags"}
        </Button>
      </Group>

      <Collapse in={showTagFilter || tagQuery.length > 0} transitionDuration={140}>
        <Box mt="xs">
          <Text size="xs" fw={600} c={textDim} mb={6}>
            Filter by tags
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
            <Box>
              <Text size="xs" c={textDim} mb={4}>
                Available
              </Text>
              <MultiTagSelect tags={allTags} value={tagQuery} onChange={onTagsChange} />
            </Box>
            <Stack gap={6} justify="center">
              <Badge size="md" variant="light" color="grape">
                Active filters: {tagQuery.length}
              </Badge>
              <Badge size="md" variant="light" color="cyan">
                Visible notes: {filteredCount}
              </Badge>
            </Stack>
          </SimpleGrid>
        </Box>
      </Collapse>
    </Stack>
  );
}
