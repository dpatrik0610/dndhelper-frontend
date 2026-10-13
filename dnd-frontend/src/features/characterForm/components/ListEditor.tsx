import { useState } from "react";
import { TextInput } from "@mantine/core";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { List, ListAddBar, ListEmpty, ListRow, RowAction } from "./FormList";

interface ListEditorProps {
  field: "languages" | "proficiencies";
  noun: string;
  placeholder: string;
}

/** Add / rename / remove for a plain string list on the character form. */
export function ListEditor({ field, noun, placeholder }: ListEditorProps) {
  const items = useCharacterFormStore((st) => st.characterForm[field]) ?? [];
  const setCharacterForm = useCharacterFormStore((st) => st.setCharacterForm);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<{ index: number; value: string } | null>(null);

  const save = (next: string[]) => setCharacterForm(field === "languages" ? { languages: next } : { proficiencies: next });

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    save([...items, value]);
    setDraft("");
  };

  const commitEdit = () => {
    if (!editing) return;
    const value = editing.value.trim();
    if (value) save(items.map((item, i) => (i === editing.index ? value : item)));
    setEditing(null);
  };

  const remove = (index: number) => {
    save(items.filter((_, i) => i !== index));
    setEditing(null);
  };

  return (
    <>
      <ListAddBar onAdd={add} disabled={!draft.trim()}>
        <TextInput
          classNames={{ input: "glassy-input" }}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.currentTarget.value)}
          aria-label={`New ${noun}`}
        />
      </ListAddBar>

      {items.length === 0 ? (
        <ListEmpty>No {noun === "proficiency" ? "proficiencies" : `${noun}s`} added yet.</ListEmpty>
      ) : (
        <List cols={2}>
          {items.map((item, i) =>
            editing?.index === i ? (
              <ListRow
                key={i}
                active
                title={
                  <TextInput
                    size="xs"
                    w="100%"
                    autoFocus
                    classNames={{ input: "glassy-input" }}
                    value={editing.value}
                    onChange={(e) => setEditing({ index: i, value: e.currentTarget.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitEdit();
                      } else if (e.key === "Escape") {
                        setEditing(null);
                      }
                    }}
                    aria-label={`Rename ${item}`}
                  />
                }
                actions={
                  <>
                    <RowAction label="Save" onClick={commitEdit}>
                      <IconCheck size={15} />
                    </RowAction>
                    <RowAction label="Cancel" onClick={() => setEditing(null)}>
                      <IconX size={15} />
                    </RowAction>
                  </>
                }
              />
            ) : (
              <ListRow
                key={i}
                title={item}
                actions={
                  <>
                    <RowAction label={`Rename ${item}`} onClick={() => setEditing({ index: i, value: item })}>
                      <IconPencil size={15} />
                    </RowAction>
                    <RowAction label={`Delete ${item}`} danger onClick={() => remove(i)}>
                      <IconTrash size={15} />
                    </RowAction>
                  </>
                }
              />
            )
          )}
        </List>
      )}
    </>
  );
}

