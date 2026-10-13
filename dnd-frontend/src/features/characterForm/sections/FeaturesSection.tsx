import { useState } from "react";
import { Button, Group, Stack, TextInput, Textarea } from "@mantine/core";
import { IconBookmark, IconCheck, IconList, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { FormGroup } from "@features/characterForm/components/FormGroup";
import { List, ListEmpty, ListRow, RowAction } from "@features/characterForm/components/FormList";

export function FeaturesSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const features = characterForm.features ?? [];

  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const glass = { input: "glassy-input", label: "glassy-label" };

  const resetBuilder = () => {
    setEditing(null);
    setName("");
    setDescription("");
  };

  const save = () => {
    if (!name.trim()) return;
    const feature = { name: name.trim(), description: description.trim() };
    setCharacterForm({
      features: editing === null ? [...features, feature] : features.map((f, i) => (i === editing ? feature : f)),
    });
    resetBuilder();
  };

  const remove = (index: number) => {
    setCharacterForm({ features: features.filter((_, i) => i !== index) });
    if (editing === index) resetBuilder();
  };

  return (
    <Stack gap="xl">
      <FormGroup icon={<IconBookmark size={16} />} title={editing === null ? "New Feature" : "Edit Feature"}>
        <TextInput
          label="Name"
          placeholder="e.g. Action Surge, War Caster"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          classNames={glass}
        />
        <Textarea
          label="Description"
          description="Supports Markdown: **bold**, *italic*, - lists, # headings"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={4}
          autosize
          classNames={glass}
        />
        <Group justify="flex-end" gap="sm">
          {editing !== null && (
            <Button className="glass-btn-secondary" onClick={resetBuilder}>
              Cancel
            </Button>
          )}
          <Button
            className="glass-btn-primary"
            onClick={save}
            disabled={!name.trim()}
            leftSection={editing === null ? <IconPlus size={14} /> : <IconCheck size={14} />}
          >
            {editing === null ? "Add Feature" : "Save Feature"}
          </Button>
        </Group>
      </FormGroup>

      <FormGroup icon={<IconList size={16} />} title="Features" count={features.length}>
        {features.length === 0 ? (
          <ListEmpty>No features added yet.</ListEmpty>
        ) : (
          <List>
            {features.map((f, i) => (
              <ListRow
                key={i}
                title={f.name}
                active={editing === i}
                actions={
                  <>
                    <RowAction
                      label={`Edit ${f.name}`}
                      onClick={(e) => {
                        setEditing(i);
                        setName(f.name);
                        setDescription(f.description ?? "");
                        // Back to the builder: top of the pane (desktop scrolls inside it, phones scroll the page)
                        const pane = e.currentTarget.closest<HTMLElement>("[data-form-pane]");
                        pane?.scrollTo({ top: 0, behavior: "smooth" });
                        pane?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <IconPencil size={15} />
                    </RowAction>
                    <RowAction label={`Delete ${f.name}`} danger onClick={() => remove(i)}>
                      <IconTrash size={15} />
                    </RowAction>
                  </>
                }
              >
                {f.description ? <MarkdownRenderer content={f.description} /> : undefined}
              </ListRow>
            ))}
          </List>
        )}
      </FormGroup>
    </Stack>
  );
}
