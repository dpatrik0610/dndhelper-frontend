import { useEffect, useState, useMemo } from "react";
import { Modal, Button, Chip, Stack, Loader, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

import { getConditions } from "../../../services/conditionService";
import { updateCharacter as apiUpdateCharacter } from "../../../services/characterService";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useAuthStore } from "../../../store/useAuthStore";

interface AddConditionModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddConditionModal({ opened, onClose }: AddConditionModalProps) {
  const character = useCharacterStore((s) => s.character);
  const updateCharacterLocal = useCharacterStore((s) => s.updateCharacter);
  const token = useAuthStore.getState().token!;

  const [list, setList] = useState<string[]>([]);
  const [search, setSearch] = useState("");          // NEW
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load conditions on open
  useEffect(() => {
    if (!opened) return;

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const all = await getConditions();
        if (!active || !character) return;

        const filtered = all.filter(
          (c: string) => !character.conditions.includes(c)
        );
        setList(filtered);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [opened, character]);

  // ❗ Compute filtered list based on search
  const filteredList = useMemo(() => {
    if (!search.trim()) return list;
    return list.filter((c) =>
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, list]);

  const handleAdd = async () => {
    if (!character || !selected) return;
    if (character.conditions.includes(selected)) return;

    const updatedConditions = [...character.conditions, selected];
    updateCharacterLocal({ conditions: updatedConditions });

    const updated = useCharacterStore.getState().character;
    if (updated) {
      await apiUpdateCharacter(updated, token);
    }

    setSelected(null);
    onClose();
  };

  return (
  <Modal
    opened={opened}
    onClose={onClose}
    title="Add Condition"
    centered
    styles={{
      header: { background: "transparent" },
      content: {
        background: "rgba(20,0,0,0.45)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,100,100,0.2)",
        boxShadow: "0 0 12px rgba(255,60,60,0.25)",
      },
      body: {
        background: "transparent",
        height: 420,
        display: "flex",
        flexDirection: "column",
      },
      title: {
        color: "white",
        textShadow: "0 0 6px rgba(255,80,80,0.7)",
      },
    }}
  >
    <Stack gap="md" style={{ height: "100%" }}>
      
      {/* SEARCH BAR */}
      {!loading && (
        <TextInput
          placeholder="Search conditions..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<IconSearch size={16} color="rgba(255,150,150,0.8)" />}
          styles={{
            input: {
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,100,100,0.25)",
              color: "white",
              backdropFilter: "blur(6px)",
            },
            wrapper: { width: "100%" },
          }}
        />
      )}

      {loading ? (
        <Loader size="sm" />
      ) : (
        <Chip.Group value={selected} onChange={setSelected} multiple={false}>
          <Stack
            gap="xs"
            style={{
              flex: 1,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {filteredList.map((cond) => (
              <Chip
                key={cond}
                value={cond}
                radius="sm"
                styles={{
                  root: {
                    width: "100%",
                    background: "transparent",
                    marginLeft:"auto",
                    marginRight:"auto",
                  },
                  label: {
                    width: "100%",
                    backdropFilter: "blur(6px)",
                    background:
                      selected === cond
                        ? "linear-gradient(90deg, rgba(255,60,60,0.45), rgba(255,120,40,0.55))"
                        : "rgba(255,255,255,0.06)",
                    border:
                      selected === cond
                        ? "1px solid rgba(255,100,80,0.8)"
                        : "1px solid rgba(255,255,255,0.15)",
                    boxShadow:
                      selected === cond
                        ? "0 0 12px rgba(255,80,60,0.8)"
                        : "0 0 4px rgba(255,60,60,0.3)",
                    color: "white",
                    padding: "8px 10px",
                    borderRadius: 8,
                    transition: "all .15s ease",
                  },
                }}
              >
                {cond}
              </Chip>
            ))}
          </Stack>
        </Chip.Group>
      )}

      <Button onClick={handleAdd} disabled={!selected}>
        Add
      </Button>
    </Stack>
  </Modal>
  );
}
