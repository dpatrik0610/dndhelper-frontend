import { Stack, Textarea } from "@mantine/core";
import { IconFileDescription } from "@tabler/icons-react";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { TagsInput } from "@features/admin/InventoryDashboard/components/TagsInput";
import classes from "./EquipmentForm.module.css";
import "@styles/glassyInput.css";

interface Props {
  draft: Equipment;
  handleChange: <K extends keyof Equipment>(key: K, value: Equipment[K]) => void;
}

export function EquipmentDescription({ draft, handleChange }: Props) {
  const glass = { input: "glassy-input", label: "glassy-label" };

  return (
    <div className={classes.glassyCard}>
      <div className={classes.sectionTitle}>
        <IconFileDescription size={16} className={classes.sectionIcon} />
        Description & Tags
      </div>
      <Stack gap="md">
        <Textarea
          classNames={glass}
          label="Description"
          placeholder="Item description..."
          autosize
          minRows={3}
          value={draft.description?.join("\n") ?? ""}
          onChange={(e) => handleChange("description", e.currentTarget.value ? e.currentTarget.value.split("\n") : [])}
        />

        <Textarea
          classNames={glass}
          label="DM Description"
          description="Private notes visible only to the DM"
          placeholder="Secret lore or stats..."
          autosize
          minRows={2}
          value={draft.dmDescription?.join("\n") ?? ""}
          onChange={(e) => handleChange("dmDescription", e.currentTarget.value ? e.currentTarget.value.split("\n") : [])}
        />

        <TagsInput equipment={draft} handleChange={handleChange} />
      </Stack>
    </div>
  );
}
