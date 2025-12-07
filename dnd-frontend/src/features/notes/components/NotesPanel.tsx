import { Badge, Divider, Group, Paper, Skeleton, Stack, Text } from "@mantine/core";
import type { Note } from "@appTypes/Note";
import { NotesHeader } from "./NotesHeader";
import { NotesFilters } from "./NotesFilters";
import { NoteCard } from "./NoteCard";
import { NoteSnapshotPanel } from "./NoteSnapshotPanel";

interface NotesPanelProps {
  isMobile: boolean;
  loading: boolean;
  summary: {
    total: number;
    favorites: number;
    tags: number;
    filtered: number;
    latestUpdatedAt?: string | number | Date | null;
    characterName?: string;
  };
  search: string;
  onSearchChange: (value: string) => void;
  allTags: string[];
  tagQuery: string[];
  onTagsChange: (tags: string[]) => void;
  showTagFilter: boolean;
  toggleTagFilter: () => void;
  favoriteNotes: Note[];
  regularNotes: Note[];
  filteredCount: number;
  hasAnyNotes: boolean;
  highlightQuery: string;
  onToggleFavorite: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onImportClick: () => void;
  onReload: () => void;
}

export function NotesPanel({
  isMobile,
  loading,
  summary,
  search,
  onSearchChange,
  allTags,
  tagQuery,
  onTagsChange,
  showTagFilter,
  toggleTagFilter,
  favoriteNotes,
  regularNotes,
  filteredCount,
  hasAnyNotes,
  highlightQuery,
  onToggleFavorite,
  onEdit,
  onDelete,
  onAdd,
  onImportClick,
  onReload,
}: NotesPanelProps) {
  const panelStyle = {
    background: "rgba(16, 14, 28, 0.75)",
    border: "1px solid rgba(120, 120, 160, 0.35)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  };

  const textDim = "rgba(225, 219, 255, 0.72)";

  return (
    <Stack gap={isMobile ? "sm" : "md"}>
      <Paper
        withBorder
        p={isMobile ? "md" : "lg"}
        radius="md"
        style={panelStyle}
      >
        <NotesHeader
          loading={loading}
          onReload={onReload}
          onAdd={onAdd}
          onImport={onImportClick}
          isMobile={isMobile}
          summary={summary}
        />
      </Paper>

      <Paper withBorder p={isMobile ? "md" : "lg"} radius="md" style={panelStyle}>
        <NotesFilters
          isMobile={isMobile}
          search={search}
          onSearchChange={onSearchChange}
          showTagFilter={showTagFilter}
          toggleTagFilter={toggleTagFilter}
          allTags={allTags}
          tagQuery={tagQuery}
          onTagsChange={onTagsChange}
          filteredCount={filteredCount}
        />
      </Paper>

      <NoteSnapshotPanel isMobile={isMobile} summary={summary} panelStyle={panelStyle} textDim={textDim} allTags={allTags} />

      <Paper
        withBorder
        p={isMobile ? "md" : "lg"}
        radius="md"
        style={panelStyle}
      >
        {loading && filteredCount === 0 ? (
          <Stack gap="sm">
            {[1, 2, 3].map((item) => (
              <Paper
                key={item}
                withBorder
                p="sm"
                radius="md"
                style={{
                  ...panelStyle,
                  background: "rgba(30, 26, 60, 0.6)",
                }}
              >
                <Skeleton height={14} width="40%" mb="xs" radius="sm" />
                <Skeleton height={10} width="90%" mb={6} radius="sm" />
                <Skeleton height={10} width="80%" mb={6} radius="sm" />
                <Skeleton height={10} width="70%" radius="sm" />
              </Paper>
            ))}
          </Stack>
        ) : (
          <Stack gap="md">
            {favoriteNotes.length > 0 && (
              <>
                <Group justify="space-between" align="flex-end">
                  <Text size="sm" fw={700} c="grape.2">
                    Favorites
                  </Text>
                  <Badge color="yellow" variant="light" size="sm">
                    {favoriteNotes.length}
                  </Badge>
                </Group>
                <Stack gap={isMobile ? "sm" : "md"}>
                  {favoriteNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      searchQuery={highlightQuery}
                      onToggleFavorite={() => onToggleFavorite(note)}
                      onEdit={() => onEdit(note)}
                      onDelete={() => onDelete(note.id!)}
                      isMobile={isMobile}
                    />
                  ))}
                </Stack>
                {regularNotes.length > 0 && (
                  <Divider
                    variant="dashed"
                    label="More notes"
                    labelPosition="center"
                    color="rgba(180,150,255,0.45)"
                    style={{ borderColor: "rgba(180,150,255,0.35)" }}
                  />
                )}
              </>
            )}

            <Stack gap={isMobile ? "sm" : "md"}>
              {regularNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  searchQuery={highlightQuery}
                  onToggleFavorite={() => onToggleFavorite(note)}
                  onEdit={() => onEdit(note)}
                  onDelete={() => onDelete(note.id!)}
                  isMobile={isMobile}
                />
              ))}
            </Stack>

            {!loading && filteredCount === 0 && (
              <Text c={textDim} ta="center">
                {hasAnyNotes ? "No notes match your search." : "No notes yet."}
              </Text>
            )}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
