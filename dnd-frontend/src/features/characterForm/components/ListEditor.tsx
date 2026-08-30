import { ActionIcon, Group, Stack, TextInput, Text, Button, Textarea } from "@mantine/core";
import { IconTrash, IconPlus, IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

interface ListEditorProps {
  label: string;
  field: string;
  placeholder?: string;
  form: any;
  type?: "string" | "feature"; // 👈 new
}

export function ListEditor({ label, field, placeholder, form, type = "string" }: ListEditorProps) {
  const [newItem, setNewItem] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Edit item states
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDesc, setEditingDesc] = useState("");

  const isFeature = type === "feature";

  const addItem = () => {
    if (isFeature) {
      if (!newItem.trim()) return;
      const updated = [
        ...(form.values[field] || []),
        { name: newItem.trim(), description: newDescription.trim() },
      ];
      form.setFieldValue(field, updated);
      setNewItem("");
      setNewDescription("");
    } else {
      if (!newItem.trim()) return;
      const updated = [...(form.values[field] || []), newItem.trim()];
      form.setFieldValue(field, updated);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    const updated = [...form.values[field]];
    updated.splice(index, 1);
    form.setFieldValue(field, updated);
    // If the currently editing item is removed, reset edit states
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    const item = form.values[field][index];
    if (isFeature) {
      setEditingName(item.name || "");
      setEditingDesc(item.description || "");
    } else {
      setEditingName(item || "");
    }
  };

  const saveEdit = (index: number) => {
    if (!editingName.trim()) return;

    const updated = [...form.values[field]];
    if (isFeature) {
      updated[index] = {
        name: editingName.trim(),
        description: editingDesc.trim(),
      };
    } else {
      updated[index] = editingName.trim();
    }

    form.setFieldValue(field, updated);
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500} c="gray.2">{label}</Text>

      {/* Input fields */}
      <Stack gap="xs" style={{ width: "100%" }}>
        <Group align="flex-end" style={{ width: "100%" }}>
          <TextInput
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.currentTarget.value)}
            style={{ flexGrow: 1 }}
          />
          <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addItem}>
            Add
          </Button>
        </Group>
        {isFeature && (
          <Textarea
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            placeholder="Add description... (Markdown supported)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.currentTarget.value)}
            minRows={5}
            autosize
            style={{ width: "100%" }}
          />
        )}
      </Stack>

      {/* Render list */}
      {form.values[field]?.length ? (
        <Stack gap="xs">
          {form.values[field].map((item: any, i: number) => {
            const isEditing = editingIndex === i;

            if (isEditing) {
              return (
                <Stack
                  key={i}
                  gap="xs"
                  style={{
                    background: "rgba(170, 90, 255, 0.06)",
                    border: "1px solid rgba(170, 90, 255, 0.35)",
                    boxShadow: "0 4px 15px rgba(170, 90, 255, 0.2)",
                    borderRadius: 8,
                    padding: "12px",
                    width: "100%",
                  }}
                >
                  <TextInput
                    size="xs"
                    classNames={{ input: "glassy-input" }}
                    placeholder="Name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.currentTarget.value)}
                    style={{ width: "100%" }}
                  />
                  {isFeature && (
                    <Textarea
                      size="xs"
                      classNames={{ input: "glassy-input" }}
                      placeholder="Description"
                      value={editingDesc}
                      onChange={(e) => setEditingDesc(e.currentTarget.value)}
                      minRows={4}
                      autosize
                      style={{ width: "100%" }}
                    />
                  )}
                  <Group justify="flex-end" gap="xs">
                    <Button
                      size="xs"
                      color="green"
                      variant="light"
                      leftSection={<IconCheck size={14} />}
                      onClick={() => saveEdit(i)}
                    >
                      Save
                    </Button>
                    <Button
                      size="xs"
                      color="gray"
                      variant="light"
                      leftSection={<IconX size={14} />}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </Group>
                </Stack>
              );
            }

            return (
              <Group
                key={i}
                justify="space-between"
                align="flex-start"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 6,
                  padding: "6px 8px",
                }}
              >
                <Stack gap={2} style={{ flexGrow: 1 }}>
                  <Text size="sm" fw={500} c="gray.2">
                    {isFeature ? item.name : item}
                  </Text>
                  {isFeature && item.description && (
                    <Text size="xs" c="dimmed" fs="italic">
                      {item.description}
                    </Text>
                  )}
                </Stack>

                <Group gap={4}>
                  <ActionIcon size="sm" color="blue" variant="light" onClick={() => startEdit(i)}>
                    <IconPencil size={14} />
                  </ActionIcon>
                  <ActionIcon size="sm" color="red" variant="light" onClick={() => removeItem(i)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            );
          })}
        </Stack>
      ) : (
        <Text size="xs" c="dimmed" fs="italic">
          No {label.toLowerCase()} added yet.
        </Text>
      )}
    </Stack>
  );
}
