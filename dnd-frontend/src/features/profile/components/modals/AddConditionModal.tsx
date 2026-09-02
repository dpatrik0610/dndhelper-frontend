import { useEffect, useState, useMemo } from "react";
import { Button, Chip, Stack, Loader, TextInput, Group } from "@mantine/core";
import { IconSearch, IconPlus } from "@tabler/icons-react";

import { getConditions } from "@services/conditionService";
import { updateCharacter as apiUpdateCharacter } from "@services/characterService";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { BaseModal } from "@components/BaseModal";

interface AddConditionModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddConditionModal({ opened, onClose }: AddConditionModalProps) {
  const character = useCurrentCharacter();
  const { updateCharacter: updateCharacterLocal } = useCharacterCoreActions();

  const [list, setList] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      setSelected(null);
      setSearch("");
    }
  }, [opened]);

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

  // Compute filtered list based on search
  const filteredList = useMemo(() => {
    if (!search.trim()) return list;
    return list.filter((c) =>
      c.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, list]);

  // Check if search perfectly matches an existing condition
  const exactMatchExists = useMemo(() => {
    return list.some((c) => c.toLowerCase() === search.trim().toLowerCase());
  }, [search, list]);

  const handleAdd = async () => {
    if (!character || !selected) return;
    if (character.conditions.includes(selected)) return;

    const updatedConditions = [...character.conditions, selected];
    updateCharacterLocal({ conditions: updatedConditions });

    if (character) {
      await apiUpdateCharacter({ ...character, conditions: updatedConditions });
    }

    setSelected(null);
    setSearch("");
    onClose();
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Add Character Condition"
      size="md"
      showSaveButton={false}
      showCancelButton={false}
    >
      <Stack gap="md" style={{ height: 450 }}>
        
        {/* SEARCH BAR (Uses glassy-input class) */}
        {loading ? (
          <Stack justify="center" align="center" style={{ flex: 1 }}>
            <Loader size="sm" />
          </Stack>
        ) : (
          <>
            <TextInput
              placeholder="Search or enter custom condition..."
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={16} style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.5))" }} />}
              classNames={{ input: "glassy-input", label: "glassy-label" }}
            />

            <Chip.Group value={selected} onChange={setSelected} multiple={false}>
              <Stack
                gap="xs"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  paddingRight: 4,
                  minHeight: 0,
                }}
              >
                {/* CUSTOM CONDITION CHIP (Themed active glow pill) */}
                {search.trim().length > 0 && !exactMatchExists && (
                  <Chip
                    key="custom-condition-add"
                    value={search.trim()}
                    radius="sm"
                    styles={{
                      root: {
                        width: "100%",
                        background: "transparent",
                      },
                      label: {
                        width: "100%",
                        backdropFilter: "blur(12px)",
                        background:
                          selected === search.trim()
                            ? "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))"
                            : "rgba(255, 255, 255, 0.02)",
                        border:
                          selected === search.trim()
                            ? "1px solid rgba(255, 255, 255, 0.2)"
                            : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                        boxShadow:
                          selected === search.trim()
                            ? "var(--theme-glow-shadow-primary)"
                            : "none",
                        color: selected === search.trim() ? "#121214" : "white",
                        padding: "10px 14px",
                        borderRadius: 8,
                        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      },
                    }}
                  >
                    ✨ Add Custom: "{search.trim()}"
                  </Chip>
                )}

                {/* STANDARD CONDITIONS (Themed glassy chips list) */}
                {filteredList.map((cond) => {
                  const isSelected = selected === cond;
                  return (
                    <Chip
                      key={cond}
                      value={cond}
                      radius="sm"
                      styles={{
                        root: {
                          width: "100%",
                          background: "transparent",
                        },
                        label: {
                          width: "100%",
                          backdropFilter: "blur(12px)",
                          background: isSelected
                            ? "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))"
                            : "rgba(255, 255, 255, 0.01)",
                          border: isSelected
                            ? "1px solid rgba(255, 255, 255, 0.25)"
                            : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                          boxShadow: isSelected
                            ? "var(--theme-glow-shadow-primary)"
                            : "none",
                          color: isSelected ? "#121214" : "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                          padding: "10px 14px",
                          borderRadius: 8,
                          transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        },
                      }}
                    >
                      {cond}
                    </Chip>
                  );
                })}
              </Stack>
            </Chip.Group>
          </>
        )}

        <Group justify="flex-end" mt="md" gap="sm">
          <Button
            onClick={onClose}
            className="glass-btn-secondary"
            style={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 300,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "11px",
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleAdd}
            disabled={!selected}
            className="glass-btn-primary"
            leftSection={<IconPlus size={14} />}
            style={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 300,
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontSize: "11px",
            }}
          >
            Add
          </Button>
        </Group>

      </Stack>
    </BaseModal>
  );
}
