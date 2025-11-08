import { ActionIcon, Group, Stack, TextInput, Text, Button } from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import "../../../styles/glassyInput.css"

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
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500} c="gray.2">{label}</Text>

      {/* Input fields */}
      <Group align="flex-end">
        <TextInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
        {isFeature && (
          <TextInput
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            placeholder="Add description..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.currentTarget.value)}
            style={{ flexGrow: 2 }}
          />
        )}
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addItem}>
          Add
        </Button>
      </Group>

      {/* Render list */}
      {form.values[field]?.length ? (
        <Stack gap="xs">
          {form.values[field].map((item: any, i: number) => (
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

              <ActionIcon color="red" variant="light" onClick={() => removeItem(i)}>
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="xs" c="dimmed" fs="italic">
          No {label.toLowerCase()} added yet.
        </Text>
      )}
    </Stack>
  );
}
