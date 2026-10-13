import { useState } from "react";
import { Autocomplete, Select } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { ResourceRow } from "@features/characterForm/components/ResourceRow";
import { List, ListAddBar, ListEmpty, RowAction } from "@features/characterForm/components/FormList";
import { clampCounter } from "@features/characterForm/components/clampCounter";
import {
  CLASS_RESOURCE_PRESETS,
  type ClassResource,
  type ResourceRecharge,
} from "@appTypes/Character/ClassResource";

const RECHARGE_OPTIONS = [
  { value: "short", label: "Short Rest" },
  { value: "long", label: "Long Rest" },
  { value: "none", label: "Manual" },
];

export function ClassResourcesSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const resources = characterForm.classResources ?? [];
  const [newName, setNewName] = useState("");

  const update = (index: number, patch: Partial<ClassResource>) =>
    setCharacterForm({
      classResources: resources.map((r, i) => (i === index ? clampCounter({ ...r, ...patch }) : r)),
    });

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const preset = CLASS_RESOURCE_PRESETS.find((p) => p.name.toLowerCase() === name.toLowerCase());
    setCharacterForm({
      classResources: [...resources, { name, current: 0, max: 0, recharge: preset?.recharge ?? "long" }],
    });
    setNewName("");
  };

  const remove = (index: number) =>
    setCharacterForm({ classResources: resources.filter((_, i) => i !== index) });

  return (
    <>
      <ListAddBar onAdd={add} disabled={!newName.trim()}>
        <Autocomplete
          classNames={{ input: "glassy-input", dropdown: "glassy-dropdown" }}
          placeholder="Ki Points, Sorcery Points, or your own..."
          aria-label="New class resource"
          data={CLASS_RESOURCE_PRESETS.map((p) => p.name).filter(
            (n) => !resources.some((r) => r.name.toLowerCase() === n.toLowerCase())
          )}
          value={newName}
          onChange={setNewName}
        />
      </ListAddBar>

      {resources.length === 0 ? (
        <ListEmpty>No class resources added yet.</ListEmpty>
      ) : (
        <List cols={2}>
          {resources.map((r, i) => (
            <ResourceRow
              key={i}
              label={r.name}
              current={r.current}
              max={r.max}
              onCurrentChange={(v) => update(i, { current: v })}
              onMaxChange={(v) => update(i, { max: v })}
              footer={
                <>
                  <Select
                    flex={1}
                    size="xs"
                    allowDeselect={false}
                    classNames={{ input: "glassy-input", dropdown: "glassy-dropdown", option: "glassy-option" }}
                    data={RECHARGE_OPTIONS}
                    value={r.recharge}
                    onChange={(v) => v && update(i, { recharge: v as ResourceRecharge })}
                    aria-label={`${r.name} recharge`}
                  />
                  <RowAction label={`Delete ${r.name}`} danger onClick={() => remove(i)}>
                    <IconTrash size={15} />
                  </RowAction>
                </>
              }
            />
          ))}
        </List>
      )}
    </>
  );
}
