import { SectionColor } from "@appTypes/SectionColor";
import { ExpandableSection } from "@components/ExpandableSection";
import { Text, Group, Stack, ThemeIcon, SimpleGrid, Badge } from "@mantine/core";
import { IconNotebook } from "@tabler/icons-react";

interface NoteSnapshotPanelProps {
  isMobile: boolean;
  summary: {
    total: number;
    favorites: number;
    tags: number;
    filtered: number;
    latestUpdatedAt?: string | number | Date | null;
    characterName?: string;
  };
  panelStyle: {
    background: string;
    border: string,
    boxShadow: string,
  };
  textDim: string;
  allTags: string[];
}

export function NoteSnapshotPanel ( {
    isMobile,
    panelStyle,
    textDim,
    summary,
    allTags,
} :NoteSnapshotPanelProps) {
    const infoCardStyle = {
    background: "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(99,102,241,0.12))",
    border: "1px solid rgba(120, 120, 160, 0.35)",
    borderRadius: 12,
    padding: isMobile ? 10 : 14,
  };

  return (
    <ExpandableSection
        title="Library Snapshot"
        style={panelStyle}
        padding={isMobile? "md": "lg"}
        color={SectionColor.Grape}
        icon= {
            <ThemeIcon variant="light" color="grape">
                <IconNotebook size={16} />
            </ThemeIcon>
        }>    
    <Stack gap="sm">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
        <Stack gap={6} style={infoCardStyle}>
            <Text fw={600} size="sm">
            Notes on hand
            </Text>
            <Text size="sm" c={textDim}>
            {summary.total} notes for {summary.characterName ?? "your character"}.
            </Text>
            <Group gap={6}>
            <Badge color="violet" variant="light">
                Total: {summary.total}
            </Badge>
            <Badge color="yellow" variant="light">
                Favorites: {summary.favorites}
            </Badge>
            </Group>
        </Stack>

        <Stack gap={6} style={infoCardStyle}>
            <Text fw={600} size="sm">
            Tags & structure
            </Text>
            <Text size="sm" c={textDim}>
            {allTags.length > 0 ? "Tap tags to jump between quests or NPCs." : "Add #tags to group ideas."}
            </Text>
            <Group gap={6} wrap="wrap">
            {allTags.slice(0, 4).map((tag) => (
                <Badge key={tag} size="sm" variant="outline" color="grape">
                #{tag}
                </Badge>
            ))}
            {allTags.length === 0 && (
                <Badge size="sm" variant="outline" color="gray">
                No tags yet
                </Badge>
            )}
            </Group>
        </Stack>

        <Stack gap={6} style={infoCardStyle}>
            <Text fw={600} size="sm">
            Activity
            </Text>
            <Text size="sm" c={textDim}>
            Latest edit{" "}
            {summary.latestUpdatedAt
                ? new Date(summary.latestUpdatedAt).toLocaleString()
                : "not recorded yet"}
            </Text>
            <Badge size="sm" color="grape" variant="light">
            Matching now: {summary.filtered} note{summary.filtered === 1 ? "" : "s"}
            </Badge>
        </Stack>
        </SimpleGrid>
    </Stack>
    </ExpandableSection>
    )
}