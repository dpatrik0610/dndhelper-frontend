import { useState, useEffect } from "react";
import { Stack, TextInput, Textarea } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { updateCharacter as apiUpdateCharacter } from "@services/characterService";
import { showNotification } from "@components/Notification/Notification";
import { BaseModal } from "@components/BaseModal";
import { useIsMobile } from "@hooks/useIsMobile";

interface AddFeatureModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddFeatureModal({ opened, onClose }: AddFeatureModalProps) {
  const character = useCurrentCharacter();
  const { updateCharacter: updateCharacterLocal } = useCharacterCoreActions();
  const isMobile = useIsMobile();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset form on open
  useEffect(() => {
    if (opened) {
      setName("");
      setDescription("");
    }
  }, [opened]);

  if (!character) return null;

  const handleAdd = async () => {
    if (!name.trim()) {
      showNotification({
        title: "Missing Name",
        message: "Please enter a name for the feature.",
        color: "red",
      });
      return;
    }

    setSaving(true);
    try {
      const newFeature = {
        name: name.trim(),
        description: description.trim(),
      };

      const updatedFeatures = [...(character.features ?? []), newFeature];

      // Update local store
      updateCharacterLocal({ features: updatedFeatures });

      // Persist to server
      await apiUpdateCharacter({
        ...character,
        features: updatedFeatures,
      });

      showNotification({
        title: "Feature Added",
        message: `Successfully added feature "${name.trim()}"!`,
        color: "green",
      });

      onClose();
    } catch (err) {
      showNotification({
        title: "Failed to add feature",
        message: String(err),
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    fontWeight: 300,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    fontSize: "10px",
    color: "var(--theme-color-text-secondary)",
    marginBottom: "4px",
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Add Custom Feature"
      size="xl"
      fullScreen={isMobile}
      onSave={handleAdd}
      saveLabel="Add Feature"
      loading={saving}
      showSaveButton={!!name.trim()}
    >
      <Stack gap="md" mt="sm">
        <TextInput
          label="Feature Name"
          placeholder="e.g., Relentless Endurance"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          styles={{ label: labelStyle }}
        />

        <Textarea
          label="Description (Markdown supported)"
          placeholder="e.g., When you are reduced to 0 hit points but not killed outright..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={isMobile ? 12 : 8}
          autosize
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          styles={{ label: labelStyle }}
        />
      </Stack>
    </BaseModal>
  );
}
