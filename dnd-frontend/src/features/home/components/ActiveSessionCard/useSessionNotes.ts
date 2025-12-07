import { useEffect, useMemo, useState } from "react";
import type { Note } from "@appTypes/Note";
import { useNoteStore } from "@store/useNoteStore";

export function useSessionNotes(noteIds: (string | null | undefined)[]) {
  const { loadMany } = useNoteStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeIds = useMemo(() => noteIds.filter((n): n is string => Boolean(n)), [noteIds]);

  useEffect(() => {
    let mounted = true;
    if (!safeIds.length) {
      setNotes([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    loadMany(safeIds)
      .then((fetched) => {
        if (mounted) setNotes(fetched);
      })
      .catch((err) => {
        console.warn("Failed to load session notes", err);
        if (mounted) setError("Failed to load notes");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadMany, safeIds]);

  return { notes, loading, error };
}
