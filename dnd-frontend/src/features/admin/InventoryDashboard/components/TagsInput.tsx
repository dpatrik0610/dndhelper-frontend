import { TextInput, Button, Group, Badge, Stack } from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { Equipment } from "@appTypes/Equipment/Equipment";

export function TagsInput({
  equipment,
  handleChange,
}: {
  equipment: Equipment;
  handleChange: any;
}) {
  const [tagValue, setTagValue] = useState("");

  const addTag = () => {
    const clean = tagValue.trim();
    if (!clean) return;

    const newTags = [...(equipment.tags ?? []), clean];
    handleChange("tags", newTags);
    setTagValue("");
  };

  const removeTag = (tag: string) => {
    const newTags = (equipment.tags ?? []).filter((t) => t !== tag);
    handleChange("tags", newTags);
  };

  return (
    <Stack gap="xs">
      {/* Input + Button row */}
      <Group gap={8} wrap="nowrap">
        <TextInput
          classNames={{ input: "glassy-input", label: "glassy-label" }}
          label="Tags"
          placeholder="Enter tag..."
          value={tagValue}
          onChange={(e) => setTagValue(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          variant="gradient"
          gradient={{ from: "violet", to: "cyan", deg: 90 }}
          onClick={addTag}
          leftSection={<IconPlus size={14} />}
          disabled={!tagValue.trim()}
          size="sm"
          radius="md"
          styles={{
            root: {
              marginTop: "22px",
              backdropFilter: "blur(6px)",
              background: "linear-gradient(90deg, #6c1bff88, #00eaff77)",
              border: "1px solid rgba(255,255,255,0.15)",
            },
          }}
        >
          Add
        </Button>
      </Group>

      {/* Tag Pills */}
      <Group gap={6}>
        {(equipment.tags ?? []).map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            size="md"
            rightSection={
              <IconX
                size={12}
                style={{ cursor: "pointer" }}
                onClick={() => removeTag(tag)}
              />
            }
            styles={{
              root: {
                backdropFilter: "blur(6px)",
                background: "rgba(140,0,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "white",
                paddingRight: 6,
              },
            }}
          >
            {tag}
          </Badge>
        ))}
      </Group>
    </Stack>
  );
}
