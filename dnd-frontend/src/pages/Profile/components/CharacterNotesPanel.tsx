import { useEffect, useState } from "react";
import { Paper, Stack, Text, ActionIcon, Group } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { Note } from "../../../types/Note";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useNoteStore } from "../../../store/useNoteStore";
import { AddNoteModal } from "./AddNoteModal";
import "../../../styles/glassyInput.css";

export function CharacterNotesPanel() {
  const character = useCharacterStore((s) => s.character);
  const { notes, loadForCharacter, remove, loading } = useNoteStore();

  const [addModalOpened, setAddModalOpened] = useState(false);

  const characterNoteIds = character?.noteIds ?? [];

  // Load notes for the character
  useEffect(() => {
    if (characterNoteIds.length > 0) {
      loadForCharacter(characterNoteIds);
    }
  }, [characterNoteIds, loadForCharacter]);

  // Which notes belong to this character
  const characterNotes: Note[] = notes.filter((n) =>
    characterNoteIds.includes(n.id!)
  );

  async function handleDelete(id: string) {
    await remove(id);
  }

  return (
    <>
      {/* MODAL */}
      <AddNoteModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />

      {/* PANEL */}
      <Paper
        withBorder
        p="md"
        style={{
          background: "rgba(20, 0, 0, 0.35)",
          border: "1px solid rgba(255, 60, 60, 0.35)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* HEADER */}
        <Group justify="space-between" mb="sm">
          <Text size="lg" fw={600} c="red.3">
            Personal Notes
          </Text>

          <ActionIcon
            size="md"
            radius="xl"
            variant="light"
            onClick={() => setAddModalOpened(true)}
            style={{
              background: "rgba(255,0,0,0.35)",
              border: "1px solid rgba(255,100,100,0.6)",
              backdropFilter: "blur(6px)",
              color: "white",
              boxShadow: "0 0 6px rgba(255,60,60,0.6)",
              transition: "0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.55)";
              e.currentTarget.style.boxShadow =
                "0 0 10px rgba(255,80,80,0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.35)";
              e.currentTarget.style.boxShadow =
                "0 0 6px rgba(255,60,60,0.6)";
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        {loading && <Text c="dimmed">Loading notes…</Text>}

        {/* NOTES LIST */}
        <Stack gap="sm">
          {characterNotes.map((note) => (
            <Paper
              key={note.id}
              withBorder
              p="sm"
              style={{
                background: "rgba(50, 0, 0, 0.25)",
                border: "1px solid rgba(255,80,80,0.25)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Group justify="space-between" mb={6}>
                <Text fw={500} c="red.2">
                  {note.title ?? "Untitled"}
                </Text>

                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(note.id!)}
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Group>

              <Stack gap={2}>
                {(note.lines ?? []).map((line, i) => (
                  <Text
                    key={i}
                    size="sm"
                    c="gray.2"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {line}
                  </Text>
                ))}
              </Stack>
            </Paper>
          ))}

          {!loading && characterNotes.length === 0 && (
            <Text c="dimmed" ta="center">
              No notes yet.
            </Text>
          )}
        </Stack>
      </Paper>
    </>
  );
}
