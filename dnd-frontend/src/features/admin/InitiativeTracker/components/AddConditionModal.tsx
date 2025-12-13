import { useEffect, useMemo, useState } from "react";
import { Autocomplete, Button, Chip, Group, Loader, Modal, NumberInput, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconCheck, IconSparkles } from "@tabler/icons-react";
import { getConditions } from "@services/conditionService";
import { magicGlowTheme } from "@styles/magic/glowTheme";

interface AddConditionModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (label: string, remaining: number | null) => void;
  existingLabels?: string[];
}

export function AddConditionModal({ opened, onClose, onSubmit, existingLabels = [] }: AddConditionModalProps) {
  const [label, setLabel] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (opened) {
      setLabel("");
      setDuration("");
      setSelected(null);
      setSearch("");

      let active = true;
      setLoading(true);
      void getConditions().then((list) => {
        if (!active) return;
        setConditions(list);
        setLoading(false);
      });

      return () => {
        active = false;
      };
    }
  }, [opened]);

  const filteredList = useMemo(() => {
    if (!search.trim()) return conditions;
    return conditions.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  }, [conditions, search]);

  const existingSet = useMemo(
    () => new Set(existingLabels.map((c) => c.trim().toLowerCase()).filter(Boolean)),
    [existingLabels]
  );

  const candidateLabel = (selected || label).trim();
  const isDuplicate = candidateLabel.length > 0 && existingSet.has(candidateLabel.toLowerCase());

  const handleSubmit = () => {
    const trimmed = candidateLabel;
    if (!trimmed) return;
    if (existingSet.has(trimmed.toLowerCase())) return;
    const parsed = duration === "" ? null : Number(duration);
    const normalized = typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
    onSubmit(trimmed, normalized);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap={6}>
          <IconSparkles size={18} color={magicGlowTheme.palette.primary} />
          <Text fw={700} style={magicGlowTheme.text}>
            Add condition
          </Text>
        </Group>
      }
      centered
      styles={{
        content: {
          ...magicGlowTheme.card,
          borderRadius: 14,
          border: magicGlowTheme.card.border,
        },
        header: { background: "transparent" },
        title: { ...magicGlowTheme.text, display: "flex", alignItems: "center", gap: 6 },
      }}
    >
      <Stack gap="md">
        <Autocomplete
          label="Condition"
          placeholder="Search or type a custom condition"
          data={filteredList}
          value={selected ?? label}
          onChange={(val) => {
            setSelected(null);
            setLabel(val);
            setSearch(val);
          }}
          onOptionSubmit={(val) => {
            setSelected(val);
            setLabel(val);
          }}
          rightSection={loading ? <Loader size="xs" /> : undefined}
          styles={{
            input: {
              background: "rgba(255,255,255,0.06)",
              border: magicGlowTheme.badge.border,
              color: magicGlowTheme.text.color,
            },
            dropdown: {
              ...magicGlowTheme.card,
            },
          }}
        />

        {loading ? (
          <Loader size="sm" />
        ) : (
          <Chip.Group multiple={false} value={selected} onChange={setSelected}>
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3 }}
              spacing={8}
              verticalSpacing={8}
              style={{ maxHeight: 260, overflowY: "auto", padding: 20 }}
            >
              {filteredList.map((cond) => (
                <Chip
                  key={cond}
                  value={cond}
                  size="sm"
                  variant={selected === cond ? "filled" : "outline"}
                  color="grape"
                  styles={{
                    label: {
                      width: "100%",
                      background:
                        selected === cond
                          ? "linear-gradient(135deg, rgba(160,120,255,0.5), rgba(120,200,255,0.35))"
                          : "rgba(255,255,255,0.04)",
                      border: magicGlowTheme.badge.border,
                      color: magicGlowTheme.text.color,
                      boxShadow: magicGlowTheme.badge.boxShadow,
                    },
                  }}
                >
                  {cond}
                </Chip>
              ))}
              {filteredList.length === 0 && <Text size="xs" c="dimmed">No matches</Text>}
            </SimpleGrid>
          </Chip.Group>
        )}

        <NumberInput
          label="Duration (rounds, optional)"
          placeholder="Indefinite"
          min={0}
          max={99}
          value={duration}
          onChange={(val) => setDuration(typeof val === "number" ? val : "")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          styles={{
            input: {
              background: "rgba(255,255,255,0.06)",
              border: magicGlowTheme.badge.border,
              color: magicGlowTheme.text.color,
            },
          }}
        />

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="filled"
            color="grape"
            leftSection={<IconCheck size={16} />}
            onClick={handleSubmit}
            disabled={!candidateLabel || isDuplicate}
          >
            Apply
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
