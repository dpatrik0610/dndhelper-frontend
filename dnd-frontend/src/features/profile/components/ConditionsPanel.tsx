import { useState, useCallback } from "react";
import {
  Badge,
  Group,
  Stack,
  ActionIcon,
} from "@mantine/core";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCharacterStore } from "@store/useCharacterStore";
import { getCondition } from "@services/conditionService";
import { updateCharacter } from "@services/characterService";
import { useAuthStore } from "@store/useAuthStore";
import { ConditionDetailsModal } from "./ConditionDetailsModal";

const BADGE_STYLES: React.CSSProperties = {
  background: "rgba(255, 60, 60, 0.15)",
  border: "1px solid rgba(255, 100, 100, 0.3)",
  backdropFilter: "blur(6px)",
  transition: "all 0.25s ease",
};

export function ConditionsPanel() {
  const character = useCharacterStore((state) => state.character);
  const removeCondition = useCharacterStore((state) => state.removeCondition);

  const token = useAuthStore((s) => s.token)!;

  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [desc, setDesc] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = useCallback(async (condition: string) => {
    setSelected(condition);
    setDesc([]);
    setError(null);
    setLoading(true);

    try {
      const result = await getCondition(condition);
      setDesc(result);

      if (!result.length) {
        setError("No detailed description found.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load condition details.");
    } finally {
      setLoading(false);

      setOpened(true);
    }
  }, []);

  const handleRemoveFromModal = useCallback(async () => {
    if (!selected) return;

    setSaving(true);

    try {
      removeCondition(selected);
      setOpened(false);

      Promise.resolve().then(async () => {
        const updated = useCharacterStore.getState().character;
        if (updated) {
          await updateCharacter(updated, token);
        }
      });
    } catch (err) {
      console.error(err);
      setError("Failed to remove condition.");
    } finally {
      setSaving(false);
    }
  }, [selected, token, removeCondition]);

  if (!character?.conditions?.length) return null;

  return (
    <>
      <ExpandableSection
        title="Active Conditions"
        icon={<IconSparkles />}
        color={SectionColor.Red}
        defaultOpen
      >
        <Stack gap="sm">
          <Group gap="xs">
            {character.conditions.map((condition) => (
              <Badge
                key={condition}
                color="red"
                variant="gradient"
                gradient={{ from: "red", to: "orange", deg: 45 }}
                radius="md"
                size="lg"
                rightSection={
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    onClick={() => handleOpen(condition)}
                    title="View details"
                  >
                    <IconSearch size={14} />
                  </ActionIcon>
                }
                style={BADGE_STYLES}
              >
                {condition}
              </Badge>
            ))}
          </Group>
        </Stack>
      </ExpandableSection>
      <ConditionDetailsModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={selected ? selected.toUpperCase() : "Condition"}
        loading={loading}
        desc={desc}
        error={error}
        onRemove={handleRemoveFromModal}
        saving={saving}
      />
    </>
  );
}
