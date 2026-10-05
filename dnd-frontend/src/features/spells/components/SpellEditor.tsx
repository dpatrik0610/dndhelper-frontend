import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Autocomplete,
  Button,
  Modal,
  NumberInput,
  SegmentedControl,
  Select,
  SimpleGrid,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import type { Spell } from "@appTypes/Spell";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { createSpell, deleteSpell, updateSpell } from "@services/spellService";
import { useIsMobile } from "@hooks/useIsMobile";
import { SCHOOLS, getSchool, levelChip, levelHeading, spellSubtitle } from "@features/spells/spellMeta";
import { SpellCard } from "./SpellCard";
import classes from "@features/spells/Spellbook.module.css";

const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const COMPONENTS = [
  { value: "V", label: "Verbal" },
  { value: "S", label: "Somatic" },
  { value: "M", label: "Material" },
];
const CASTING_TIMES = ["1 action", "1 bonus action", "1 reaction", "1 minute", "10 minutes", "1 hour"];
const RANGES = ["Self", "Touch", "30 feet", "60 feet", "90 feet", "120 feet", "150 feet", "Sight", "Unlimited"];
const DURATIONS = ["Instantaneous", "1 round", "1 minute", "10 minutes", "1 hour", "8 hours", "24 hours", "Until dispelled"];
const DAMAGE_TYPES = [
  "Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic",
  "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder",
];
// SRD stores area types lowercase.
const AREAS = ["sphere", "cone", "cube", "line", "cylinder"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
const SAVES = [
  { value: "STR", label: "Strength" },
  { value: "DEX", label: "Dexterity" },
  { value: "CON", label: "Constitution" },
  { value: "INT", label: "Intelligence" },
  { value: "WIS", label: "Wisdom" },
  { value: "CHA", label: "Charisma" },
];
const CLASSES = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];

const EMPTY: Spell = {
  index: "",
  name: "",
  description: [],
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
};

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const lines = (text: string) => text.split("\n");
const firstValue = (map?: Record<string, string>) => (map ? Object.values(map)[0] : undefined);

interface SpellEditorProps {
  opened: boolean;
  /** Spell to edit; null creates a new one. */
  spell: Spell | null;
  onClose: () => void;
  onSaved: (spell: Spell) => void;
  onDeleted: () => void;
}

export function SpellEditor({ opened, spell, onClose, ...rest }: SpellEditorProps) {
  const isMobile = useIsMobile();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={1180}
      fullScreen={isMobile}
      padding={0}
      withCloseButton={false}
      // The body handles Escape so it can confirm discarding a draft; outside clicks never close.
      closeOnEscape={false}
      closeOnClickOutside={false}
      centered
    >
      {/* Remount per spell so the draft starts fresh. */}
      {opened && <EditorBody key={spell?.id ?? "new"} initial={spell} onClose={onClose} isMobile={isMobile} {...rest} />}
    </Modal>
  );
}

interface EditorBodyProps extends Omit<SpellEditorProps, "opened" | "spell"> {
  initial: Spell | null;
  isMobile: boolean;
}

function EditorBody({ initial, onClose, onSaved, onDeleted, isMobile }: EditorBodyProps) {
  const [spell, setSpell] = useState<Spell>(initial ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const editing = !!initial?.id;
  const school = getSchool(spell.school.name);
  const dirty = JSON.stringify(spell) !== JSON.stringify(initial ?? EMPTY);
  const canSave = !!spell.name.trim() && !!spell.school.name;

  const set = <K extends keyof Spell>(key: K, value: Spell[K]) => setSpell((s) => ({ ...s, [key]: value }));
  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // Cantrips scale by character level, leveled spells by slot level. Editing the dice
  // collapses the scaling table to a single entry.
  const diceKey = spell.level === 0 ? "damageAtCharacterLevel" : "damageAtSlotLevel";
  const dice = firstValue(spell.damage?.[diceKey]) ?? "";

  const close = () => {
    if (saving) return;
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    onClose();
  };

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try {
      await action();
    } catch (err) {
      showNotification({
        title: "Spell not saved",
        message: err instanceof Error ? err.message : String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSaving(false);
    }
  };

  const save = () =>
    run(async () => {
      const payload: Spell = {
        ...spell,
        name: spell.name.trim(),
        index: spell.index || slug(spell.name),
        description: spell.description.filter((l) => l.trim()),
        higherLevel: spell.higherLevel.filter((l) => l.trim()),
        material: spell.components.includes("M") ? spell.material : undefined,
      };
      const saved = editing ? await updateSpell(spell.id!, payload) : await createSpell(payload);
      showNotification({
        title: editing ? "Spell saved" : "Spell added",
        message: `${payload.name} is in the spellbook.`,
        color: SectionColor.Green,
      });
      onSaved(saved ?? payload);
    });

  const remove = () => {
    if (!window.confirm(`Delete ${spell.name} from the spellbook? This can't be undone.`)) return;
    void run(async () => {
      await deleteSpell(spell.id!);
      showNotification({ title: "Spell deleted", message: `${spell.name} was removed.`, color: SectionColor.Green });
      onDeleted();
    });
  };

  const form = (
    <div className={classes.edForm}>
      <EdSection title="Basics">
        <TextInput
          label="Name"
          placeholder="Name the spell"
          value={spell.name}
          onChange={(e) => set("name", e.currentTarget.value)}
          size="md"
          required
          data-autofocus
        />
        <Field label="Level">
          <div className={classes.edLevels} role="radiogroup" aria-label="Level">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={spell.level === l}
                aria-label={levelHeading(l)}
                className={classes.chip}
                data-active={spell.level === l || undefined}
                onClick={() => set("level", l)}
              >
                {l === 0 ? "Cantrip" : levelChip(l)}
              </button>
            ))}
          </div>
        </Field>
        <Field label="School">
          <div className={classes.edSchools} role="radiogroup" aria-label="School">
            {Object.entries(SCHOOLS).map(([name, meta]) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={spell.school.name === name}
                className={`${classes.chip} ${classes.schoolChip} ${classes.edSchool}`}
                style={{ "--school": meta.color } as CSSProperties}
                data-active={spell.school.name === name || undefined}
                onClick={() => set("school", { name })}
              >
                <meta.icon size={15} color={meta.color} aria-hidden />
                {name}
              </button>
            ))}
          </div>
        </Field>
      </EdSection>

      <EdSection title="Casting">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <Autocomplete label="Casting time" placeholder="1 action" data={CASTING_TIMES}
            value={spell.castingTime} onChange={(v) => set("castingTime", v)} />
          <Autocomplete label="Range" placeholder="60 feet" data={RANGES}
            value={spell.range} onChange={(v) => set("range", v)} />
          <Autocomplete label="Duration" placeholder="Instantaneous" data={DURATIONS}
            value={spell.duration} onChange={(v) => set("duration", v)} />
        </SimpleGrid>
        <Field label="Components and properties">
          <div className={classes.chips}>
            {COMPONENTS.map((c) => (
              <ToggleChip key={c.value} active={spell.components.includes(c.value)}
                onClick={() => set("components", toggle(spell.components, c.value))}>
                <b>{c.value}</b> {c.label}
              </ToggleChip>
            ))}
            <span className={classes.edSep} aria-hidden />
            <ToggleChip active={spell.concentration} onClick={() => set("concentration", !spell.concentration)}>
              Concentration
            </ToggleChip>
            <ToggleChip active={spell.ritual} onClick={() => set("ritual", !spell.ritual)}>
              Ritual
            </ToggleChip>
          </div>
        </Field>
        {spell.components.includes("M") && (
          <TextInput label="Material" placeholder="A pinch of sulfur and a bit of bat guano"
            value={spell.material ?? ""} onChange={(e) => set("material", e.currentTarget.value)} />
        )}
      </EdSection>

      <EdSection title="Effect">
        <Textarea
          label="Description"
          description="Each line is a paragraph. Markdown and tables work."
          value={spell.description.join("\n")}
          onChange={(e) => set("description", lines(e.currentTarget.value))}
          autosize
          minRows={6}
          maxRows={18}
        />
        <Textarea
          label="At higher levels"
          placeholder="How the spell scales with higher slots, if it does"
          value={spell.higherLevel.join("\n")}
          onChange={(e) => set("higherLevel", lines(e.currentTarget.value))}
          autosize
          minRows={2}
          maxRows={8}
        />
      </EdSection>

      <EdSection title="Rules" hint="Shown as tags on the spell card. Leave empty if they don't apply.">
        <Field label="Spell attack">
          <div className={classes.chips} role="radiogroup" aria-label="Spell attack">
            {[undefined, "melee", "ranged"].map((a) => {
              const active = (spell.attackType?.toLowerCase() ?? undefined) === a;
              return (
                <button key={a ?? "none"} type="button" role="radio" aria-checked={active}
                  className={classes.chip} data-active={active || undefined} onClick={() => set("attackType", a)}>
                  {a ? `${a[0].toUpperCase()}${a.slice(1)}` : "None"}
                </button>
              );
            })}
          </div>
        </Field>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Select label="Damage type" placeholder="None" data={DAMAGE_TYPES} clearable searchable
            value={spell.damage?.damageType.name ?? null}
            onChange={(v) => set("damage", v ? { ...spell.damage, damageType: { name: v } } : undefined)} />
          <TextInput label="Damage dice" placeholder="8d6" disabled={!spell.damage} value={dice}
            onChange={(e) =>
              spell.damage &&
              set("damage", {
                damageType: spell.damage.damageType,
                [diceKey]: { [spell.level === 0 ? "1" : String(spell.level)]: e.currentTarget.value },
              })
            } />
          <Select label="Saving throw" placeholder="None" data={SAVES} clearable
            value={spell.dc?.dcType.name ?? null}
            onChange={(v) =>
              set("dc", v ? { ...spell.dc, dcType: { name: v }, dcSuccess: spell.dc?.dcSuccess ?? "none" } : undefined)
            } />
          <Select label="On a successful save" disabled={!spell.dc}
            data={[{ value: "none", label: "No effect" }, { value: "half", label: "Half damage" }]}
            value={spell.dc?.dcSuccess ?? null}
            onChange={(v) => spell.dc && set("dc", { ...spell.dc, dcSuccess: v ?? "none" })} />
          <Select label="Area" placeholder="None" data={AREAS} clearable
            value={spell.areaOfEffect?.type ?? null}
            onChange={(v) => set("areaOfEffect", v ? { type: v, size: spell.areaOfEffect?.size ?? 5 } : undefined)} />
          <NumberInput label="Area size" suffix=" ft" min={0} step={5} disabled={!spell.areaOfEffect}
            value={spell.areaOfEffect?.size ?? ""}
            onChange={(v) => spell.areaOfEffect && set("areaOfEffect", { ...spell.areaOfEffect, size: Number(v) || 0 })} />
        </SimpleGrid>
      </EdSection>

      <EdSection title="Who can learn it">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <TagsInput label="Classes" placeholder="Pick or type a class" data={CLASSES}
            value={spell.classes.map((c) => c.name)}
            onChange={(v) => set("classes", v.map((name) => ({ name })))} />
          <TagsInput label="Subclasses" placeholder="Type and press Enter"
            value={spell.subclasses.map((s) => s.name)}
            onChange={(v) => set("subclasses", v.map((name) => ({ name })))} />
        </SimpleGrid>
      </EdSection>
    </div>
  );

  const preview = (
    <aside className={classes.edPreview} aria-label="Preview">
      <SpellCard flat={isMobile} spell={{ ...spell, name: spell.name.trim() || "Untitled spell", school: { name: spell.school.name || "Unknown school" } }} />
    </aside>
  );

  return (
    <div
      className={classes.editor}
      style={{ "--school": school.color } as CSSProperties}
      onKeyDown={(e) => {
        // Let an open dropdown take Escape first.
        if (e.key === "Escape" && (e.target as HTMLElement).getAttribute("aria-expanded") !== "true") close();
      }}
    >
      <header className={classes.edHeader}>
        <div className={classes.sigil} aria-hidden>
          <school.icon size={24} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 className={classes.edTitle}>{editing ? `Edit ${initial!.name}` : "New spell"}</h2>
          <div className={classes.subtitle}>
            {spell.school.name ? spellSubtitle(spell.level, spell.school.name, spell.ritual) : "Choose a level and school"}
          </div>
        </div>
        <Button variant="subtle" color="gray" onClick={close} disabled={saving}>
          Close
        </Button>
      </header>

      {isMobile && (
        <div className={classes.edTabs}>
          <SegmentedControl fullWidth value={pane} onChange={(v) => setPane(v as "edit" | "preview")}
            data={[{ value: "edit", label: "Edit" }, { value: "preview", label: "Preview" }]} />
        </div>
      )}

      <div className={classes.edBody}>
        {isMobile ? (pane === "edit" ? form : preview) : <>{form}{preview}</>}
      </div>

      <footer className={classes.edFooter}>
        {editing && (
          <Button variant="subtle" color="red" onClick={remove} disabled={saving}>
            Delete spell
          </Button>
        )}
        <span className={classes.edStatus}>
          {!canSave ? "Add a name and school to save." : dirty ? "Unsaved changes" : ""}
        </span>
        <Button className="glass-btn-primary" onClick={save} loading={saving} disabled={!canSave || (editing && !dirty)}>
          {editing ? "Save changes" : "Add spell"}
        </Button>
      </footer>
    </div>
  );
}

function EdSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className={classes.edSection}>
      <h3 className={classes.edSectionTitle}>{title}</h3>
      {hint && <p className={classes.edHint}>{hint}</p>}
      <div className={classes.edFields}>{children}</div>
    </section>
  );
}

/** Label for custom (non-Mantine) controls, styled like the inputs' labels. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className={`glassy-label ${classes.edLabel}`}>{label}</div>
      {children}
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={classes.chip} aria-pressed={active} data-active={active || undefined} onClick={onClick}>
      {children}
    </button>
  );
}
