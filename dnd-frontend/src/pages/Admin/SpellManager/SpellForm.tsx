import {
  TextInput,
  NumberInput,
  Switch,
  Textarea,
  MultiSelect,
  Select,
  Button,
  Group,
  Stack,
  Paper,
  Divider,
} from "@mantine/core";
import { useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import type { Spell } from "../../../types/Spell";
import { showNotification } from "../../../components/Notification/Notification";
import { SectionColor } from "../../../types/SectionColor";
import { createSpell } from "../../../services/spellService";

const DAMAGE_TYPES = [
  "Acid", "Cold", "Fire", "Force", "Lightning", "Necrotic",
  "Poison", "Psychic", "Radiant", "Thunder",
];

const AREAS = ["Sphere", "Cone", "Cube", "Line", "Cylinder"];

// ✅ Extracted school list
const SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];

export function SpellForm() {
  const token = useAuthStore((s) => s.token);

  const [spell, setSpell] = useState<Spell>({
    index: "",
    name: "",
    description: [""],
    higherLevel: [],
    range: "",
    components: [],
    ritual: false,
    duration: "",
    concentration: false,
    castingTime: "",
    level: 0,
    school: { name: "" },
    classes: [],
    subclasses: [],
    spellUrl: "",
  });

  const handleChange = <K extends keyof Spell>(key: K, value: Spell[K]) => {
    setSpell((s) => ({ ...s, [key]: value }));
  };

  const glass = { input: "glassy-input", label: "glassy-label" };

  const handleSubmit = async () => {
    try {
      await createSpell(spell, token!);
      showNotification({
        title: "Spell Created",
        message: `${spell.name} has been added.`,
        color: SectionColor.Green,
      });

      setSpell({
        index: "",
        name: "",
        description: [""],
        higherLevel: [],
        range: "",
        components: [],
        ritual: false,
        duration: "",
        concentration: false,
        castingTime: "",
        level: 0,
        school: { name: "" },
        classes: [],
        subclasses: [],
        spellUrl: "",
      });
    } catch (err) {
      showNotification({
        title: "Error",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        background: "linear-gradient(145deg, rgba(40,0,60,0.55), rgba(15,0,25,0.45))",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Stack gap="sm">

        {/* NAME + INDEX */}
        <Group grow>
          <TextInput
            classNames={glass}
            label="Name"
            value={spell.name}
            onChange={(e) => handleChange("name", e.currentTarget.value)}
            required
          />
          <TextInput
            classNames={glass}
            label="Index"
            value={spell.index}
            onChange={(e) => handleChange("index", e.currentTarget.value)}
            required
          />
        </Group>

        {/* DESCRIPTION */}
        <Textarea
          classNames={glass}
          label="Description"
          value={spell.description.join("\n")}
          onChange={(e) =>
            handleChange("description", e.currentTarget.value.split("\n"))
          }
          autosize
          minRows={3}
        />

        {/* BASIC FIELDS */}
        <Group grow>
          <TextInput
            classNames={glass}
            label="Range"
            value={spell.range}
            onChange={(e) => handleChange("range", e.currentTarget.value)}
          />
          <TextInput
            classNames={glass}
            label="Duration"
            value={spell.duration}
            onChange={(e) => handleChange("duration", e.currentTarget.value)}
          />
          <TextInput
            classNames={glass}
            label="Casting Time"
            value={spell.castingTime}
            onChange={(e) => handleChange("castingTime", e.currentTarget.value)}
          />
        </Group>

        {/* LEVEL + SCHOOL + DAMAGE TYPE */}
        <Group grow>
          <NumberInput
            classNames={glass}
            label="Level"
            min={0}
            max={9}
            value={spell.level}
            onChange={(v) => handleChange("level", Number(v))}
          />

          {/* ✅ SCHOOL SELECT */}
          <Select
            classNames={glass}
            label="School"
            data={SCHOOLS}
            placeholder="Select a school"
            value={spell.school.name || ""}
            onChange={(value) =>
              handleChange("school", value ? { name: value } : { name: "" })
            }
          />

          <Select
            classNames={glass}
            label="Damage Type"
            data={DAMAGE_TYPES}
            clearable
            value={spell.damage?.damageType.name || ""}
            onChange={(v) =>
              handleChange("damage", v ? { damageType: { name: v } } : undefined)
            }
          />
        </Group>

        {/* COMPONENTS */}
        <Divider label="Components" labelPosition="center" />
        <MultiSelect
          classNames={glass}
          data={["V", "S", "M"]}
          placeholder="Select components"
          value={spell.components}
          onChange={(v) => handleChange("components", v)}
        />
        <TextInput
          classNames={glass}
          label="Material (if any)"
          value={spell.material ?? ""}
          onChange={(e) => handleChange("material", e.currentTarget.value)}
        />

        {/* FLAGS */}
        <Group grow>
          <Switch
            classNames={glass}
            label="Ritual"
            checked={spell.ritual}
            onChange={(e) => handleChange("ritual", e.currentTarget.checked)}
          />
          <Switch
            classNames={glass}
            label="Concentration"
            checked={spell.concentration}
            onChange={(e) => handleChange("concentration", e.currentTarget.checked)}
          />
        </Group>

        {/* AREA OF EFFECT */}
        <Divider label="Area of Effect" labelPosition="center" />
        <Group grow>
          <Select
            classNames={glass}
            data={AREAS}
            placeholder="Area Type"
            value={spell.areaOfEffect?.type || ""}
            onChange={(v) =>
              handleChange(
                "areaOfEffect",
                v
                  ? { ...(spell.areaOfEffect ?? {}), type: v, size: spell.areaOfEffect?.size ?? 5 }
                  : undefined
              )
            }
          />
          <NumberInput
            classNames={glass}
            label="Size (ft)"
            value={spell.areaOfEffect?.size || 0}
            onChange={(v) =>
              handleChange(
                "areaOfEffect",
                spell.areaOfEffect
                  ? { ...spell.areaOfEffect, size: Number(v) }
                  : { type: "Sphere", size: Number(v) }
              )
            }
          />
        </Group>

        {/* CLASSES */}
        <Divider label="Classes & Subclasses" labelPosition="center" />
        <MultiSelect
          classNames={glass}
          label="Classes"
          placeholder="Select classes"
          data={[
            "Wizard", "Sorcerer", "Cleric", "Druid",
            "Bard", "Paladin", "Ranger", "Warlock",
          ]}
          value={spell.classes.map((c) => c.name)}
          onChange={(v) =>
            handleChange("classes", v.map((n) => ({ name: n })))
          }
        />
        <MultiSelect
          classNames={glass}
          label="Subclasses"
          placeholder="Select subclasses"
          data={[
            "Evocation", "Divination", "Necromancy",
            "Illusion", "Abjuration", "Conjuration",
          ]}
          value={spell.subclasses.map((s) => s.name)}
          onChange={(v) =>
            handleChange("subclasses", v.map((n) => ({ name: n })))
          }
        />

        <Divider label="Misc" labelPosition="center" />
        <TextInput
          classNames={glass}
          label="Spell API URL"
          value={spell.spellUrl}
          onChange={(e) => handleChange("spellUrl", e.currentTarget.value)}
          placeholder="/api/spells/fireball"
        />

        <Button
          variant="gradient"
          gradient={{ from: "teal", to: "cyan" }}
          onClick={handleSubmit}
        >
          Create Spell
        </Button>
      </Stack>
    </Paper>
  );
}
