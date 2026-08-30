import React, { useState, useEffect } from "react";
import {
  Group,
  Stack,
  Text,
  Button,
  TextInput,
  NumberInput,
  Select,
  TagsInput,
  Textarea,
  Switch,
  Grid,
  SegmentedControl,
  Box,
} from "@mantine/core";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import type { Equipment } from "@appTypes/Equipment/Equipment";
import { createEquipment, updateEquipmentById } from "@services/equipmentService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { IconSettings, IconCode, IconCheck, IconX } from "@tabler/icons-react";
import { EQUIPMENT_TEMPLATES } from "../templates/equipmentTemplates";
import styles from "@features/admin/ItemManager/ItemManager.module.css";

interface ItemFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  item: Equipment | null; // null means create mode
}

const TIER_OPTIONS = [
  { label: "Common", value: "Common" },
  { label: "Uncommon", value: "Uncommon" },
  { label: "Rare", value: "Rare" },
  { label: "Very Rare", value: "Very Rare" },
  { label: "Legendary", value: "Legendary" },
  { label: "Artifact", value: "Artifact" },
];

const COIN_OPTIONS = [
  { label: "gp", value: "gp" },
  { label: "sp", value: "sp" },
  { label: "cp", value: "cp" },
  { label: "ep", value: "ep" },
  { label: "pp", value: "pp" },
];

const DAMAGE_TYPES = [
  "Slashing",
  "Piercing",
  "Bludgeoning",
  "Fire",
  "Cold",
  "Acid",
  "Poison",
  "Lightning",
  "Thunder",
  "Radiant",
  "Necrotic",
  "Force",
  "Psychic",
];

export const ItemFormModal: React.FC<ItemFormModalProps> = ({ opened, onClose, onSubmit, item }) => {
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [index, setIndex] = useState("");
  const [tier, setTier] = useState<string | null>("Common");
  const [weight, setWeight] = useState<number | "">(0);
  const [costQty, setCostQty] = useState<number | "">(0);
  const [costUnit, setCostUnit] = useState<string | null>("gp");
  const [damageDice, setDamageDice] = useState("");
  const [damageType, setDamageType] = useState<string | null>("");
  const [rangeNormal, setRangeNormal] = useState<number | "">("");
  const [rangeLong, setRangeLong] = useState<number | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);
  const [description, setDescription] = useState("");
  const [dmDescription, setDmDescription] = useState("");

  // JSON states
  const [jsonPayload, setJsonPayload] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Populate states when item changes or modal opens
  useEffect(() => {
    if (opened) {
      setActiveTab("form");
      setJsonError(null);
      if (item) {
        // Edit mode
        setName(item.name || "");
        setIndex(item.index || "");
        setTier(item.tier || "Common");
        setWeight(item.weight ?? 0);
        setCostQty(item.cost?.quantity ?? 0);
        setCostUnit(item.cost?.unit || "gp");
        setDamageDice(item.damage?.damageDice || "");
        setDamageType(item.damage?.damageType?.name || null);
        setRangeNormal(item.range?.normal ?? "");
        setRangeLong(item.range?.long ?? "");
        setTags(item.tags || []);
        setIsCustom(item.isCustom ?? true);
        setIsDeleted(item.isDeleted ?? false);
        setDescription((item.description || []).join("\n"));
        setDmDescription((item.dmDescription || []).join("\n"));

        // Format to JSON
        setJsonPayload(JSON.stringify(item, null, 2));
      } else {
        // Create mode
        setName("");
        setIndex("");
        setTier("Common");
        setWeight(0);
        setCostQty(0);
        setCostUnit("gp");
        setDamageDice("");
        setDamageType(null);
        setRangeNormal("");
        setRangeLong("");
        setTags([]);
        setIsCustom(true);
        setIsDeleted(false);
        setDescription("");
        setDmDescription("");

        const defaultNew: Equipment = {
          index: "",
          name: "",
          tier: "Common",
          weight: 0,
          cost: { quantity: 0, unit: "gp" },
          isCustom: true,
          isDeleted: false,
          description: [],
          tags: [],
        };
        setJsonPayload(JSON.stringify(defaultNew, null, 2));
      }
    }
  }, [opened, item]);

  // Construct Equipment object from current Form states
  const getEquipmentFromForm = (): Equipment => {
    const equip: Equipment = {
      ...(item?.id ? { id: item.id } : {}),
      name: name.trim(),
      index: index.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tier: tier || "Common",
      weight: weight === "" ? undefined : weight,
      isCustom,
      isDeleted,
      tags,
      description: description.trim() ? description.split("\n").filter((p) => p.trim()) : [],
      dmDescription: dmDescription.trim() ? dmDescription.split("\n").filter((p) => p.trim()) : [],
    };

    if (costQty !== "" || costUnit) {
      equip.cost = {
        quantity: Number(costQty || 0),
        unit: costUnit || "gp",
      };
    }

    if (damageDice || damageType) {
      equip.damage = {
        damageDice: damageDice.trim(),
        damageType: { name: damageType || "" },
      };
    }

    if (rangeNormal !== "" || rangeLong !== "") {
      equip.range = {
        normal: Number(rangeNormal || 0),
        long: Number(rangeLong || 0),
      };
    }

    return equip;
  };

  // Keep JSON payload updated if states change, but only if the user is in form mode
  // to avoid overwriting typed JSON.
  const handleTabChange = (value: string) => {
    const targetTab = value as "form" | "json";
    if (targetTab === "json" && activeTab === "form") {
      // Sync from Visual Form to JSON
      const currentEquip = getEquipmentFromForm();
      setJsonPayload(JSON.stringify(currentEquip, null, 2));
      setJsonError(null);
    } else if (targetTab === "form" && activeTab === "json") {
      // Sync from JSON to Visual Form
      try {
        const parsed = JSON.parse(jsonPayload) as Equipment;
        setName(parsed.name || "");
        setIndex(parsed.index || "");
        setTier(parsed.tier || "Common");
        setWeight(parsed.weight ?? 0);
        setCostQty(parsed.cost?.quantity ?? 0);
        setCostUnit(parsed.cost?.unit || "gp");
        setDamageDice(parsed.damage?.damageDice || "");
        setDamageType(parsed.damage?.damageType?.name || null);
        setRangeNormal(parsed.range?.normal ?? "");
        setRangeLong(parsed.range?.long ?? "");
        setTags(parsed.tags || []);
        setIsCustom(parsed.isCustom ?? true);
        setIsDeleted(parsed.isDeleted ?? false);
        setDescription((parsed.description || []).join("\n"));
        setDmDescription((parsed.dmDescription || []).join("\n"));
        setJsonError(null);
      } catch (err) {
        showNotification({
          title: "JSON Error",
          message: "Cannot switch to visual form. Raw JSON is invalid: " + String(err),
          color: SectionColor.Red,
        });
        return; // Prevent tab switch
      }
    }
    setActiveTab(targetTab);
  };

  // Validate JSON on the fly
  const handleJsonChange = (val: string) => {
    setJsonPayload(val);
    if (!val.trim()) {
      setJsonError("JSON cannot be empty.");
      return;
    }
    try {
      const parsed = JSON.parse(val);
      if (!parsed.name) {
        setJsonError("Missing required property: 'name'");
      } else {
        setJsonError(null);
      }
    } catch (err) {
      setJsonError(String(err));
    }
  };

  const handleSelectTemplate = (val: string | null) => {
    if (!val) return;
    const template = EQUIPMENT_TEMPLATES.find((t) => t.value === val);
    if (template && template.data) {
      const d = template.data;
      setName(d.name || "");
      setIndex("");
      setTier(d.tier || "Common");
      setWeight(d.weight ?? 0);
      setCostQty(d.cost?.quantity ?? 0);
      setCostUnit(d.cost?.unit || "gp");
      setDamageDice(d.damage?.damageDice || "");
      setDamageType(d.damage?.damageType?.name || null);
      setRangeNormal(d.range?.normal ?? "");
      setRangeLong(d.range?.long ?? "");
      setTags(d.tags || []);
      setIsCustom(d.isCustom ?? true);
      setIsDeleted(d.isDeleted ?? false);
      setDescription((d.description || []).join("\n"));
      setDmDescription((d.dmDescription || []).join("\n"));

      // Also update JSON editor so the tabs stay beautifully synced!
      const finalGenerated = {
        ...d,
        index: d.name ? d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "",
      };
      setJsonPayload(JSON.stringify(finalGenerated, null, 2));

      showNotification({
        title: "Template Applied",
        message: `Successfully pre-filled form with "${template.label}"!`,
        color: SectionColor.Green,
      });
    }
  };

  // Save changes
  const handleSave = async () => {
    let finalItem: Equipment;

    if (activeTab === "json") {
      try {
        finalItem = JSON.parse(jsonPayload) as Equipment;
        if (!finalItem.name) {
          showNotification({
            title: "Validation Error",
            message: "Item must have a name",
            color: SectionColor.Red,
          });
          return;
        }
        if (!finalItem.index) {
          finalItem.index = finalItem.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
      } catch {
        showNotification({
          title: "Invalid JSON",
          message: "Please fix the raw JSON errors first.",
          color: SectionColor.Red,
        });
        return;
      }
    } else {
      // Visual form
      if (!name.trim()) {
        showNotification({
          title: "Validation Error",
          message: "Item name is required.",
          color: SectionColor.Red,
        });
        return;
      }
      finalItem = getEquipmentFromForm();
    }

    setSaving(true);
    try {
      if (item?.id) {
        // Update
        await updateEquipmentById(item.id, finalItem);
        showNotification({
          title: "Success",
          message: `Updated item "${finalItem.name}" successfully!`,
          color: SectionColor.Green,
        });
      } else {
        // Create
        await createEquipment(finalItem);
        showNotification({
          title: "Success",
          message: `Created item "${finalItem.name}" successfully!`,
          color: SectionColor.Green,
        });
      }
      onSubmit();
      onClose();
    } catch (err) {
      showNotification({
        title: "Error Saving",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGlassModal
      opened={opened}
      onClose={onClose}
      title={item ? `Edit Equipment: ${item.name}` : "Create Custom Equipment"}
      size="xl"
    >
      <Stack gap="md">
        {/* Modern Segmented Control for switcher */}
        <SegmentedControl
          value={activeTab}
          onChange={handleTabChange}
          data={[
            {
              label: (
                <Group gap="xs" justify="center">
                  <IconSettings size={16} />
                  <span>Visual Form</span>
                </Group>
              ),
              value: "form",
            },
            {
              label: (
                <Group gap="xs" justify="center">
                  <IconCode size={16} />
                  <span>Raw JSON Editor</span>
                </Group>
              ),
              value: "json",
            },
          ]}
          fullWidth
          radius="md"
          className={styles.glassyBox}
          styles={{
            root: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)" },
            indicator: { background: "rgba(168, 85, 247, 0.25)", border: "1px solid rgba(168,85,247,0.4)" },
          }}
        />

        {activeTab === "form" ? (
          /* ====================================================
             Visual Form Input Mode
             ==================================================== */
          <Box p="xs">
            <Grid gutter="md">
              {/* Template Selection Dropdown (Only in Create Mode) */}
              {!item && (
                <Grid.Col span={12}>
                  <Select
                    label="⚡ Quick Fill Template"
                    placeholder="Select a standard pre-configured D&D item template..."
                    data={EQUIPMENT_TEMPLATES}
                    onChange={handleSelectTemplate}
                    styles={{
                      input: { background: "rgba(168, 85, 247, 0.08)", color: "#e9d5ff", borderColor: "rgba(168, 85, 247, 0.3)" },
                      dropdown: { background: "rgba(20, 20, 30, 0.95)", border: "1px solid rgba(168, 85, 247, 0.3)" },
                      label: { color: "#c084fc", fontWeight: 600 }
                    }}
                    clearable
                  />
                </Grid.Col>
              )}

              {/* Item Name */}
              <Grid.Col span={12}>
                <TextInput
                  label="Item Name"
                  placeholder="e.g. Flametongue Longsword"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  required
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Rarity Tier */}
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Select
                  label="Rarity Tier"
                  placeholder="Select tier"
                  data={TIER_OPTIONS}
                  value={tier}
                  onChange={setTier}
                  required
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Weight */}
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <NumberInput
                  label="Weight (lbs)"
                  placeholder="e.g. 3"
                  min={0}
                  value={weight}
                  onChange={(val) => setWeight(val === "" ? "" : Number(val))}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Cost Quantity */}
              <Grid.Col span={{ base: 6, sm: 2 }}>
                <NumberInput
                  label="Cost Quantity"
                  placeholder="50"
                  min={0}
                  value={costQty}
                  onChange={(val) => setCostQty(val === "" ? "" : Number(val))}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Cost Unit */}
              <Grid.Col span={{ base: 6, sm: 2 }}>
                <Select
                  label="Unit"
                  placeholder="Unit"
                  data={COIN_OPTIONS}
                  value={costUnit}
                  onChange={setCostUnit}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Combat: Damage Dice */}
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                  label="Damage Dice"
                  placeholder="e.g. 1d8 or 2d6+2"
                  value={damageDice}
                  onChange={(e) => setDamageDice(e.currentTarget.value)}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Combat: Damage Type */}
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Select
                  label="Damage Type"
                  placeholder="e.g. Slashing"
                  data={DAMAGE_TYPES}
                  value={damageType}
                  onChange={setDamageType}
                  searchable
                  clearable
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Range: Normal */}
              <Grid.Col span={{ base: 6, sm: 2 }}>
                <NumberInput
                  label="Normal Range"
                  placeholder="e.g. 20"
                  min={0}
                  value={rangeNormal}
                  onChange={(val) => setRangeNormal(val === "" ? "" : Number(val))}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Range: Long */}
              <Grid.Col span={{ base: 6, sm: 2 }}>
                <NumberInput
                  label="Long Range"
                  placeholder="e.g. 60"
                  min={0}
                  value={rangeLong}
                  onChange={(val) => setRangeLong(val === "" ? "" : Number(val))}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Tags TagsInput */}
              <Grid.Col span={12}>
                <TagsInput
                  label="Tags"
                  placeholder="Add custom tags"
                  data={tags}
                  value={tags}
                  onChange={setTags}
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    dropdown: { background: "rgba(20,20,30,0.95)", border: "1px solid rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* Switches */}
              <Grid.Col span={{ base: 6, sm: 6 }}>
                <Group align="center" mt="xs">
                  <Switch
                    checked={isCustom}
                    onChange={(e) => setIsCustom(e.currentTarget.checked)}
                    label="Custom Item"
                    styles={{
                      label: { color: "rgba(255,255,255,0.85)" }
                    }}
                  />
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 6, sm: 6 }}>
                <Group align="center" mt="xs">
                  <Switch
                    checked={isDeleted}
                    onChange={(e) => setIsDeleted(e.currentTarget.checked)}
                    label="Mark as Deleted"
                    color="red"
                    styles={{
                      label: { color: "rgba(255,255,255,0.85)" }
                    }}
                  />
                </Group>
              </Grid.Col>

              {/* Description */}
              <Grid.Col span={12}>
                <Textarea
                  label="Item Description"
                  placeholder="Enter item lore or descriptions. Separate paragraphs with a new line."
                  value={description}
                  onChange={(e) => setDescription(e.currentTarget.value)}
                  minRows={3}
                  autosize
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.12)" },
                    label: { color: "rgba(255,255,255,0.85)" }
                  }}
                />
              </Grid.Col>

              {/* DM Secret Description */}
              <Grid.Col span={12}>
                <Textarea
                  label="DM-Only Secret Notes"
                  placeholder="Secrets, identification triggers, or custom history that players shouldn't see initially."
                  value={dmDescription}
                  onChange={(e) => setDmDescription(e.currentTarget.value)}
                  minRows={2}
                  autosize
                  styles={{
                    input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(239, 68, 68, 0.25)" },
                    label: { color: "#fca5a5" }
                  }}
                />
              </Grid.Col>
            </Grid>
          </Box>
        ) : (
          /* ====================================================
             Raw JSON Editor Mode
             ==================================================== */
          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              Directly edit the raw JSON fields. Ensure it conforms to the Equipment schema.
            </Text>
            <Textarea
              value={jsonPayload}
              onChange={(e) => handleJsonChange(e.currentTarget.value)}
              minRows={16}
              autosize
              className={`${styles.jsonTextarea} ${jsonError ? styles.jsonError : ""}`}
              styles={{
                input: { background: "rgba(10, 10, 15, 0.8) !important", border: "1px solid rgba(255, 255, 255, 0.1) !important" }
              }}
            />
            {jsonError && (
              <Text size="sm" c="red.4" fw={500}>
                ⚠️ Syntax Error: {jsonError}
              </Text>
            )}
          </Stack>
        )}

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="subtle" onClick={onClose} leftSection={<IconX size={16} />}>
            Cancel
          </Button>
          <Button
            className={`${styles.neonButton} ${styles.neonPurple}`}
            onClick={handleSave}
            loading={saving}
            disabled={activeTab === "json" && !!jsonError}
            leftSection={<IconCheck size={16} />}
          >
            {item ? "Save Changes" : "Create Item"}
          </Button>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
};
