import React, { useState, useEffect } from "react";
import {
  Group,
  Stack,
  Text,
  Button,
  TextInput,
  NumberInput,
  Switch,
  Grid,
  SegmentedControl,
  TagsInput,
} from "@mantine/core";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import type { Monster } from "@appTypes/Monster";
import { monsterService } from "@services/Admin/monsterService";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { IconSettings, IconCode, IconAlertCircle } from "@tabler/icons-react";
import styles from "../MonsterManager.module.css";

interface MonsterFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: () => void;
  monster: Monster | null; // null means create mode
}

export const MonsterFormModal: React.FC<MonsterFormModalProps> = ({
  opened,
  onClose,
  onSubmit,
  monster,
}) => {
  const [activeTab, setActiveTab] = useState<"form" | "json">("form");
  const [saving, setSaving] = useState(false);

  // Visual form states
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [cr, setCr] = useState<number | "">("");
  const [source, setSource] = useState("");
  const [isNpc, setIsNpc] = useState(false);
  const [languages, setLanguages] = useState<string[]>([]);
  const [senses, setSenses] = useState<string[]>([]);
  const [hpAverage, setHpAverage] = useState<number | "">("");
  const [hpFormula, setHpFormula] = useState("");
  const [ac, setAc] = useState<number | "">("");
  const [speedWalk, setSpeedWalk] = useState<number | "">("");
  const [speedFly, setSpeedFly] = useState<number | "">("");
  const [speedSwim, setSpeedSwim] = useState<number | "">("");

  // JSON states
  const [jsonPayload, setJsonPayload] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Populate states when monster changes or modal opens
  useEffect(() => {
    if (opened) {
      setActiveTab("form");
      setJsonError(null);
      if (monster) {
        // Edit mode
        setName(monster.name || "");
        setType(monster.type?.type || "");
        setCr(monster.cr !== undefined ? monster.cr : "");
        setSource(monster.source || "");
        setIsNpc(!!monster.isNpc);
        setLanguages(monster.languages || []);
        setSenses(monster.senses || []);
        setHpAverage(monster.hitPoints?.average !== undefined ? monster.hitPoints.average : "");
        setHpFormula(monster.hitPoints?.formula || "");
        setAc(monster.armorClass?.[0] !== undefined ? monster.armorClass[0] : "");
        setSpeedWalk(monster.speed?.walk !== undefined ? monster.speed.walk : "");
        setSpeedFly(monster.speed?.fly !== undefined ? monster.speed.fly : "");
        setSpeedSwim(monster.speed?.swim !== undefined ? monster.speed.swim : "");

        setJsonPayload(JSON.stringify(monster, null, 2));
      } else {
        // Create mode
        setName("");
        setType("");
        setCr("");
        setSource("");
        setIsNpc(false);
        setLanguages([]);
        setSenses([]);
        setHpAverage("");
        setHpFormula("");
        setAc("");
        setSpeedWalk("");
        setSpeedFly("");
        setSpeedSwim("");

        const defaultNew: Monster = {
          name: "",
          isNpc: false,
          isDeleted: false,
          type: { type: "", tags: [] },
          cr: undefined,
          source: "",
          hitPoints: { average: undefined, formula: "" },
          speed: { walk: undefined, fly: undefined, swim: undefined },
          armorClass: [],
          languages: [],
          senses: [],
        };
        setJsonPayload(JSON.stringify(defaultNew, null, 2));
      }
    }
  }, [opened, monster]);

  // Construct Monster object from current Form states
  const getMonsterFromForm = (): Monster => {
    const constructed: Monster = {
      ...(monster?.id ? { id: monster.id } : {}),
      name: name.trim(),
      isNpc,
      isDeleted: monster?.isDeleted ?? false,
      source: source.trim() || undefined,
      type: {
        type: type.trim() || undefined,
        tags: monster?.type?.tags || [],
      },
      cr: cr === "" ? undefined : Number(cr),
      languages: languages.length > 0 ? languages : undefined,
      senses: senses.length > 0 ? senses : undefined,
      hitPoints: {
        average: hpAverage === "" ? undefined : Number(hpAverage),
        formula: hpFormula.trim() || undefined,
      },
      speed: {
        walk: speedWalk === "" ? undefined : Number(speedWalk),
        fly: speedFly === "" ? undefined : Number(speedFly),
        swim: speedSwim === "" ? undefined : Number(speedSwim),
      },
      armorClass: ac === "" ? undefined : [Number(ac)],
      abilityScores: monster?.abilityScores,
    };

    return constructed;
  };

  // Synchronize Tab Changes
  const handleTabChange = (value: string) => {
    const targetTab = value as "form" | "json";
    if (targetTab === "json" && activeTab === "form") {
      // Sync from Form to JSON
      const currentMonster = getMonsterFromForm();
      setJsonPayload(JSON.stringify(currentMonster, null, 2));
      setJsonError(null);
    } else if (targetTab === "form" && activeTab === "json") {
      // Sync from JSON to Form
      try {
        const parsed = JSON.parse(jsonPayload) as Monster;
        setName(parsed.name || "");
        setType(parsed.type?.type || "");
        setCr(parsed.cr !== undefined ? parsed.cr : "");
        setSource(parsed.source || "");
        setIsNpc(!!parsed.isNpc);
        setLanguages(parsed.languages || []);
        setSenses(parsed.senses || []);
        setHpAverage(parsed.hitPoints?.average !== undefined ? parsed.hitPoints.average : "");
        setHpFormula(parsed.hitPoints?.formula || "");
        setAc(parsed.armorClass?.[0] !== undefined ? parsed.armorClass[0] : "");
        setSpeedWalk(parsed.speed?.walk !== undefined ? parsed.speed.walk : "");
        setSpeedFly(parsed.speed?.fly !== undefined ? parsed.speed.fly : "");
        setSpeedSwim(parsed.speed?.swim !== undefined ? parsed.speed.swim : "");
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

  // Save changes
  const handleSave = async () => {
    let finalItem: Monster;

    if (activeTab === "json") {
      try {
        finalItem = JSON.parse(jsonPayload) as Monster;
        if (!finalItem.name) {
          showNotification({
            title: "Validation Error",
            message: "Monster must have a name.",
            color: SectionColor.Red,
          });
          return;
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
          message: "Monster name is required.",
          color: SectionColor.Red,
        });
        return;
      }
      finalItem = getMonsterFromForm();
    }

    setSaving(true);
    try {
      if (monster?.id) {
        // Update
        await monsterService.update(monster.id, finalItem);
        showNotification({
          title: "Success",
          message: `Updated monster "${finalItem.name}" successfully!`,
          color: SectionColor.Green,
        });
      } else {
        // Create
        await monsterService.create(finalItem);
        showNotification({
          title: "Success",
          message: `Created monster "${finalItem.name}" successfully!`,
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
      title={monster ? `Edit Bestiary Record: ${monster.name}` : "Summon Custom Monster"}
      size="xl"
    >
      <Stack gap="md">
        {/* Modern Segmented Control switcher */}
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
            indicator: { background: "rgba(239, 68, 68, 0.25)", border: "1px solid rgba(239,68,68,0.4)" },
          }}
        />

        {activeTab === "form" ? (
          /* ====================================================
             Visual Form Input Mode
             ==================================================== */
          <Stack gap="md">
            <Grid gutter="md">
              {/* Left Column: Basic Information */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm" p="sm" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <Text size="xs" fw={800} c="red.2" style={{ textTransform: "uppercase", letterSpacing: "1px" }}>
                    Basic Bestiary Attributes
                  </Text>

                  <TextInput
                    label="Monster Name"
                    placeholder="e.g. Red Dragon, Goblin"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                    classNames={{ input: styles.glassyInput }}
                  />

                  <Grid gutter="sm">
                    <Grid.Col span={6}>
                      <TextInput
                        label="Monster Type"
                        placeholder="e.g. Dragon, Fiend"
                        value={type}
                        onChange={(e) => setType(e.currentTarget.value)}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Challenge Rating (CR)"
                        placeholder="e.g. 5"
                        value={cr}
                        onChange={(val) => setCr(typeof val === "number" ? val : "")}
                        min={0}
                        max={30}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                  </Grid>

                  <TextInput
                    label="Source Reference"
                    placeholder="e.g. Monster Manual p. 55"
                    value={source}
                    onChange={(e) => setSource(e.currentTarget.value)}
                    classNames={{ input: styles.glassyInput }}
                  />

                  <Switch
                    label="Classification: Is NPC Character?"
                    checked={isNpc}
                    onChange={(e) => setIsNpc(e.currentTarget.checked)}
                    mt="xs"
                    styles={{
                      track: { cursor: "pointer" },
                      label: { cursor: "pointer", fontWeight: 600, color: "rgba(255,255,255,0.85)" },
                    }}
                  />
                </Stack>
              </Grid.Col>

              {/* Right Column: Vitality & Senses */}
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="sm" p="sm" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <Text size="xs" fw={800} c="red.2" style={{ textTransform: "uppercase", letterSpacing: "1px" }}>
                    Combat, Speed & Senses
                  </Text>

                  <Grid gutter="sm">
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Hit Points Average"
                        placeholder="e.g. 136"
                        value={hpAverage}
                        onChange={(val) => setHpAverage(typeof val === "number" ? val : "")}
                        min={0}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <TextInput
                        label="HP Formula"
                        placeholder="e.g. 17d10 + 34"
                        value={hpFormula}
                        onChange={(e) => setHpFormula(e.currentTarget.value)}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid gutter="sm">
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Armor Class (AC)"
                        placeholder="e.g. 18"
                        value={ac}
                        onChange={(val) => setAc(typeof val === "number" ? val : "")}
                        min={0}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Speed: Walk (ft.)"
                        placeholder="e.g. 30"
                        value={speedWalk}
                        onChange={(val) => setSpeedWalk(typeof val === "number" ? val : "")}
                        min={0}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid gutter="sm">
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Speed: Fly (ft.)"
                        placeholder="e.g. 60"
                        value={speedFly}
                        onChange={(val) => setSpeedFly(typeof val === "number" ? val : "")}
                        min={0}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <NumberInput
                        label="Speed: Swim (ft.)"
                        placeholder="e.g. 40"
                        value={speedSwim}
                        onChange={(val) => setSpeedSwim(typeof val === "number" ? val : "")}
                        min={0}
                        classNames={{ input: styles.glassyInput }}
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Grid.Col>
            </Grid>

            {/* Senses and Languages row */}
            <Stack gap="sm" p="sm" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
              <Text size="xs" fw={800} c="red.2" style={{ textTransform: "uppercase", letterSpacing: "1px" }}>
                Communication & Perception Senses
              </Text>
              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TagsInput
                    label="Languages Spoken"
                    placeholder="Type language and press Enter..."
                    value={languages}
                    onChange={setLanguages}
                    styles={{
                      input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TagsInput
                    label="Perception Senses"
                    placeholder="e.g. Darkvision 120ft."
                    value={senses}
                    onChange={setSenses}
                    styles={{
                      input: { background: "rgba(255,255,255,0.04)", color: "white", borderColor: "rgba(255,255,255,0.1)" },
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Stack>
        ) : (
          /* ====================================================
             Raw JSON Editor Mode
             ==================================================== */
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                Configure full JSON payload block (supports hitPoints formula, abilityScores, actions, etc.).
              </Text>
              {jsonError && (
                <Group gap={4} c="red.3">
                  <IconAlertCircle size={14} />
                  <Text size="xs" fw={600}>
                    Invalid Monster JSON block.
                  </Text>
                </Group>
              )}
            </Group>

            <textarea
              className={`${styles.jsonTextarea} ${jsonError ? styles.jsonError : ""}`}
              value={jsonPayload}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={16}
              style={{
                width: "100%",
                padding: "12px",
                resize: "vertical",
                borderRadius: "8px",
                outline: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#ff8a80",
                background: "rgba(12,8,8,0.85)",
                fontFamily: "monospace",
              }}
            />
          </Stack>
        )}

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className={`${styles.neonButton} ${styles.neonRed}`}
            loading={saving}
            onClick={handleSave}
          >
            {monster ? "Save grimoire alterations" : "Summon to Bestiary"}
          </Button>
        </Group>
      </Stack>
    </AdminGlassModal>
  );
};
