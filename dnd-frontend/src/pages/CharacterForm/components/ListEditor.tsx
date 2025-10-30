import { ActionIcon, Group, Stack, TextInput, Text, Button } from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { useState } from "react";

interface ListEditorProps {
  label: string;
  field: string;
  placeholder?: string;
  form: any;
}

export function ListEditor({ label, field, placeholder, form }: ListEditorProps) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [...(form.values[field] || []), newItem.trim()];
    form.setFieldValue(field, updated);
    setNewItem("");
  };

  const removeItem = (item: string) => {
    const updated = form.values[field].filter((i: string) => i !== item);
    form.setFieldValue(field, updated);
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500} c="gray.2">{label}</Text>

      <Group>
        <TextInput
          placeholder={placeholder}
          value={newItem}
          onChange={(e) => setNewItem(e.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
        <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addItem}>
          Add
        </Button>
      </Group>

      {form.values[field]?.length ? (
        <Stack gap="xs">
          {form.values[field].map((item: string) => (
            <Group
              key={item}
              justify="space-between"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 6,
                padding: "4px 8px",
              }}
            >
              <Text size="sm" c="gray.2">{item}</Text>
              <ActionIcon color="red" variant="light" onClick={() => removeItem(item)}>
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      ) : (
        <Text size="xs" c="dimmed" fs="italic">No {label.toLowerCase()} added yet.</Text>
      )}
    </Stack>
  );
}
