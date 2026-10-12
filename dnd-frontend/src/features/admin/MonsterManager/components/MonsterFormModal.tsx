import { useEffect, useState } from "react";
import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Button,
  FileButton,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconPhotoUp, IconPlus, IconSkull, IconTrash } from "@tabler/icons-react";
import { AdminGlassModal } from "@components/admin/AdminGlassModal";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { Monster, MonsterFeature } from "@appTypes/Monster";
import { monsterService } from "@services/Admin/monsterService";
import { ABILITY_KEYS, CR_VALUES, crLabel, emptyMonster } from "@utils/monster";
import { signed } from "@utils/effects";
import styles from "@styles/AdminCatalog.module.css";

const SIZES = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
const CR_OPTIONS = CR_VALUES.map((cr) => ({ value: String(cr), label: crLabel(cr) }));
const FEATURE_LISTS = [
  ["traits", "Traits"],
  ["actions", "Actions"],
  ["bonusActions", "Bonus actions"],
  ["reactions", "Reactions"],
  ["legendaryActions", "Legendary actions"],
] as const;

/** "perception +13" ⇄ { perception: 13 } for the skills tag input. */
const bonusTags = (bonuses: Record<string, number>) => Object.entries(bonuses).map(([k, v]) => `${k} ${signed(v)}`);
function parseBonusTags(tags: string[]) {
  const result: Record<string, number> = {};
  for (const tag of tags) {
    const match = /^(.+?)\s*([+-]?\d+)$/.exec(tag.trim());
    if (match) result[match[1].toLowerCase()] = Number(match[2]);
  }
  return result;
}

interface MonsterFormModalProps {
  opened: boolean;
  /** null = create. */
  monster: Monster | null;
  onClose: () => void;
  onSaved: () => void;
  types: string[];
}

export function MonsterFormModal({ opened, monster, onClose, onSaved, types }: MonsterFormModalProps) {
  const [draft, setDraft] = useState<Monster>(emptyMonster);
  const [json, setJson] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setDraft(monster ? structuredClone(monster) : emptyMonster());
    setJsonError(null);
  }, [opened, monster]);

  const set = (patch: Partial<Monster>) => setDraft((d) => ({ ...d, ...patch }));
  const setFeatures = (key: (typeof FEATURE_LISTS)[number][0], list: MonsterFeature[]) => set({ [key]: list });

  const save = async () => {
    if (!draft.name.trim()) {
      showNotification({ title: "Name required", message: "Give the monster a name.", color: SectionColor.Red });
      return;
    }
    setSaving(true);
    try {
      if (draft.id) {
        await monsterService.update(draft);
        onSaved();
        showNotification({ title: "Saved", message: `${draft.name} is in the bestiary.`, color: SectionColor.Green });
        onClose();
      } else {
        // A new monster stays open, now with an id, so its art can be uploaded straight away.
        setDraft(await monsterService.create(draft));
        onSaved();
        showNotification({ title: "Created", message: `${draft.name} is in the bestiary. Add art on Basics, or close.`, color: SectionColor.Green });
      }
    } catch (err) {
      showNotification({ title: "Couldn't save", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File | null) => {
    if (!file || !draft.id) return;
    setUploading(true);
    try {
      const saved = await monsterService.uploadImage(draft.id, file);
      set({ imageUrl: saved.imageUrl });
      onSaved();
    } catch (err) {
      showNotification({ title: "Upload failed", message: (err as Error).message, color: SectionColor.Red });
    } finally {
      setUploading(false);
    }
  };

  const applyJson = () => {
    try {
      setDraft({ ...emptyMonster(), ...JSON.parse(json), id: draft.id });
      setJsonError(null);
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  return (
    <AdminGlassModal opened={opened} onClose={onClose} size="xl" title={draft.id ? `Edit ${monster?.name ?? draft.name}` : "New monster"}>
      <Tabs defaultValue="basics" keepMounted={false} onChange={(tab) => tab === "json" && setJson(JSON.stringify(draft, null, 2))}>
        <Tabs.List mb="md">
          <Tabs.Tab value="basics">Basics</Tabs.Tab>
          <Tabs.Tab value="defenses">Defenses & senses</Tabs.Tab>
          <Tabs.Tab value="features">Traits & actions</Tabs.Tab>
          <Tabs.Tab value="lore">Lore</Tabs.Tab>
          <Tabs.Tab value="json">JSON</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="basics">
          <Stack gap="sm">
            <Group align="flex-end" wrap="nowrap">
              <Avatar src={draft.imageUrl} size={72} radius="md" color="red">
                <IconSkull size={32} />
              </Avatar>
              <FileButton onChange={(f) => void upload(f)} accept="image/png,image/jpeg,image/webp,image/gif">
                {(props) => (
                  <Button {...props} variant="light" leftSection={<IconPhotoUp size={16} />} loading={uploading} disabled={!draft.id}>
                    Upload art
                  </Button>
                )}
              </FileButton>
              {!draft.id && <Text size="xs" c="dimmed">Save the monster first, then add art.</Text>}
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <TextInput label="Name" required value={draft.name} onChange={(e) => set({ name: e.currentTarget.value })} />
              <TextInput label="Source" placeholder="Homebrew" value={draft.source ?? ""} onChange={(e) => set({ source: e.currentTarget.value })} />
              <Select label="Challenge rating" data={CR_OPTIONS} value={String(draft.challengeRating)} onChange={(v) => set({ challengeRating: Number(v ?? 0) })} />
              <Select label="Size" data={SIZES} value={draft.size ?? null} onChange={(v) => set({ size: v })} clearable />
              <Autocomplete label="Type" placeholder="humanoid" data={types} value={draft.type ?? ""} onChange={(v) => set({ type: v })} />
              <TextInput label="Alignment" placeholder="chaotic evil" value={draft.alignment ?? ""} onChange={(e) => set({ alignment: e.currentTarget.value })} />
            </SimpleGrid>
            <TagsInput label="Tags" placeholder="goblinoid, shapechanger…" value={draft.tags} onChange={(tags) => set({ tags })} />
            <Switch label="Named NPC" checked={draft.isNpc} onChange={(e) => set({ isNpc: e.currentTarget.checked })} />

            <SimpleGrid cols={{ base: 2, sm: 4 }}>
              <NumberInput label="Armor class" min={0} value={draft.armorClass} onChange={(v) => set({ armorClass: Number(v) || 0 })} />
              <TextInput label="Armor note" placeholder="natural armor" value={draft.armorNote ?? ""} onChange={(e) => set({ armorNote: e.currentTarget.value })} />
              <NumberInput label="Hit points" min={0} value={draft.hitPoints} onChange={(v) => set({ hitPoints: Number(v) || 0 })} />
              <TextInput label="Hit dice" placeholder="2d6 + 2" value={draft.hitDice ?? ""} onChange={(e) => set({ hitDice: e.currentTarget.value })} />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 3, sm: 6 }}>
              {(["walk", "fly", "swim", "climb", "burrow"] as const).map((key) => (
                <NumberInput key={key} label={`${key} (ft.)`} min={0} step={5} value={draft.speed[key] ?? ""}
                  onChange={(v) => set({ speed: { ...draft.speed, [key]: v === "" ? (key === "walk" ? 0 : null) : Number(v) } })} />
              ))}
              <Switch label="Hover" mt="xl" checked={!!draft.speed.hover} onChange={(e) => set({ speed: { ...draft.speed, hover: e.currentTarget.checked } })} />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 3, sm: 6 }}>
              {ABILITY_KEYS.map((key) => (
                <NumberInput key={key} label={key.toUpperCase()} min={1} max={30} value={draft.abilityScores[key]}
                  onChange={(v) => set({ abilityScores: { ...draft.abilityScores, [key]: Number(v) || 10 } })} />
              ))}
            </SimpleGrid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="defenses">
          <Stack gap="sm">
            <Text size="xs" c="dimmed">Saving throws: total bonus, only for proficient saves. Leave empty otherwise.</Text>
            <SimpleGrid cols={{ base: 3, sm: 6 }}>
              {ABILITY_KEYS.map((key) => (
                <NumberInput key={key} label={`${key.toUpperCase()} save`} value={draft.savingThrows[key] ?? ""}
                  onChange={(v) => {
                    const savingThrows = { ...draft.savingThrows };
                    if (v === "") delete savingThrows[key];
                    else savingThrows[key] = Number(v);
                    set({ savingThrows });
                  }} />
              ))}
            </SimpleGrid>
            <TagsInput label="Skills" description='One per tag: "perception +13"' value={bonusTags(draft.skills)} onChange={(tags) => set({ skills: parseBonusTags(tags) })} />
            <TagsInput label="Damage vulnerabilities" value={draft.damageVulnerabilities} onChange={(v) => set({ damageVulnerabilities: v })} />
            <TagsInput label="Damage resistances" value={draft.damageResistances} onChange={(v) => set({ damageResistances: v })} />
            <TagsInput label="Damage immunities" value={draft.damageImmunities} onChange={(v) => set({ damageImmunities: v })} />
            <TagsInput label="Condition immunities" value={draft.conditionImmunities} onChange={(v) => set({ conditionImmunities: v })} />
            <Group grow align="flex-start">
              <TagsInput label="Senses" placeholder="darkvision 60 ft." value={draft.senses} onChange={(v) => set({ senses: v })} />
              <NumberInput label="Passive Perception" maw={180} value={draft.passivePerception} onChange={(v) => set({ passivePerception: Number(v) || 10 })} />
            </Group>
            <TagsInput label="Languages" value={draft.languages} onChange={(v) => set({ languages: v })} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="features">
          <Stack gap="lg">
            {FEATURE_LISTS.map(([key, label]) => (
              <FeatureListEditor key={key} label={label} features={draft[key]} onChange={(list) => setFeatures(key, list)} />
            ))}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="lore">
          <Textarea label="Lore & DM notes (markdown)" autosize minRows={10} value={draft.description ?? ""}
            onChange={(e) => set({ description: e.currentTarget.value })} />
        </Tabs.Panel>

        <Tabs.Panel value="json">
          <Stack gap="xs">
            <Text size="xs" c="dimmed">Paste or edit a whole stat block, then apply it to the form.</Text>
            <Textarea className={styles.jsonTextarea} autosize minRows={16} maxRows={28} value={json}
              onChange={(e) => setJson(e.currentTarget.value)} styles={{ input: { fontFamily: "monospace", fontSize: 12 } }} />
            {jsonError && <Text size="xs" c="red.4">{jsonError}</Text>}
            <Group justify="flex-end">
              <Button variant="light" onClick={applyJson}>Apply JSON</Button>
            </Group>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="lg">
        <Button variant="subtle" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button color="neon" onClick={() => void save()} loading={saving}>
          {draft.id ? "Save changes" : "Create monster"}
        </Button>
      </Group>
    </AdminGlassModal>
  );
}

function FeatureListEditor({ label, features, onChange }: { label: string; features: MonsterFeature[]; onChange: (list: MonsterFeature[]) => void }) {
  const update = (i: number, patch: Partial<MonsterFeature>) => onChange(features.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text fw={700} size="sm">{label}</Text>
        <Button size="xs" variant="subtle" leftSection={<IconPlus size={14} />} onClick={() => onChange([...features, { name: "", description: "" }])}>
          Add
        </Button>
      </Group>
      {features.map((f, i) => (
        <Group key={i} align="flex-start" wrap="nowrap" gap="xs">
          <TextInput placeholder="Name" value={f.name} onChange={(e) => update(i, { name: e.currentTarget.value })} w={200} />
          <Textarea placeholder="Description" autosize minRows={1} value={f.description}
            onChange={(e) => update(i, { description: e.currentTarget.value })} style={{ flex: 1 }} />
          <ActionIcon variant="subtle" color="red.5" mt={4} onClick={() => onChange(features.filter((_, j) => j !== i))} aria-label={`Remove ${f.name || "entry"}`}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
}
