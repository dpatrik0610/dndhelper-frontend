import { useState, useEffect } from "react";
import { Modal, Button, Stack, TextInput, Textarea } from "@mantine/core";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { updateCharacter as apiUpdateCharacter } from "@services/characterService";
import { showNotification } from "@components/Notification/Notification";

interface AddFeatureModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddFeatureModal({ opened, onClose }: AddFeatureModalProps) {
  const character = useCurrentCharacter();
  const { updateCharacter: updateCharacterLocal } = useCharacterCoreActions();

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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      title="Add New Feature"
      styles={{
        header: { background: "transparent" },
        content: {
          background: "rgba(25, 10, 35, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(170, 90, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(170, 90, 255, 0.2)",
          color: "white",
        },
        title: {
          color: "white",
          fontWeight: 700,
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Feature Name"
          placeholder="e.g., Relentless Endurance"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        <Textarea
          label="Description (Markdown supported)"
          placeholder="e.g., When you are reduced to 0 hit points but not killed outright..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={4}
          autosize
          classNames={{ input: "glassy-input", label: "glassy-label" }}
        />

        <Button
          onClick={handleAdd}
          loading={saving}
          disabled={!name.trim()}
          variant="gradient"
          gradient={{ from: "grape", to: "violet", deg: 135 }}
          fullWidth
        >
          Add Feature
        </Button>
      </Stack>
    </Modal>
  );
}
