import type { CSSProperties, ReactNode } from "react";
import { Group, Text } from "@mantine/core";
import { IconFlame, IconShield, IconSparkles, IconTarget, type Icon } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSpellStore } from "@store/spell/spellStore";
import type { Spell } from "@appTypes/Spell";
import { getDamageInfo } from "@utils/getDamageInfo";
import { getSchool, spellSubtitle } from "@features/spells/spellMeta";
import classes from "@features/spells/Spellbook.module.css";

interface SpellCardProps {
  /** No frame / aura: for use inside a modal. */
  flat?: boolean;
  /** Spell to show instead of the open one (e.g. an editor draft). */
  spell?: Spell;
}

/** Markdown tables arrive split across description lines; join consecutive table lines into one block. */
function groupTables(lines: string[]) {
  const blocks: string[] = [];
  let table: string[] = [];
  lines.forEach((line, i) => {
    if (line.startsWith("|") || (line.includes("#####") && lines[i + 1]?.startsWith("|"))) {
      table.push(line);
      return;
    }
    if (table.length) blocks.push(table.join("\n"));
    table = [];
    blocks.push(line);
  });
  if (table.length) blocks.push(table.join("\n"));
  return blocks;
}

const COMPONENT_NAMES: Record<string, string> = { V: "Verbal", S: "Somatic", M: "Material" };

export function SpellCard({ flat = false, spell: draft }: SpellCardProps) {
  const current = useSpellStore((state) => state.currentSpell);
  const spell = draft ?? current;

  if (!spell) {
    return (
      <Text ta="center" c="dimmed" mt="lg">
        No spell selected yet.
      </Text>
    );
  }

  const school = getSchool(spell.school.name);
  const damage = getDamageInfo(spell.damage);

  const effects: { icon: Icon; color: string; label: string }[] = [];
  if (spell.attackType) {
    effects.push({ icon: IconTarget, color: "#fb923c", label: `${capitalize(spell.attackType)} spell attack` });
  }
  if (damage) effects.push({ icon: IconFlame, color: "#f87171", label: damage.label });
  if (spell.dc?.dcType?.name) {
    const half = spell.dc.dcSuccess?.toLowerCase() === "half" ? " · half on success" : "";
    effects.push({ icon: IconShield, color: "#fcd34d", label: `${spell.dc.dcType.name} save${half}` });
  }
  if (spell.areaOfEffect?.type && spell.areaOfEffect.size) {
    effects.push({ icon: IconSparkles, color: "#67e8f9", label: `${spell.areaOfEffect.size}-ft ${spell.areaOfEffect.type}` });
  }

  return (
    <article
      className={`${classes.card} ${flat ? classes.cardFlat : ""}`}
      style={{ "--school": school.color } as CSSProperties}
    >
      <Group wrap="nowrap" gap="md" align="center">
        <div className={classes.sigil} aria-hidden>
          <school.icon size={28} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 className={classes.spellName}>{spell.name}</h2>
          <div className={classes.subtitle}>{spellSubtitle(spell.level, spell.school.name, spell.ritual)}</div>
        </div>
      </Group>

      <div className={classes.stats}>
        <Stat label="Casting Time">{spell.castingTime || "—"}</Stat>
        <Stat label="Range">{spell.range || "—"}</Stat>
        <Stat label="Components">
          <span title={spell.components.map((c) => COMPONENT_NAMES[c] ?? c).join(", ")}>
            {spell.components.join(", ") || "—"}
          </span>
        </Stat>
        <Stat label="Duration">
          {spell.duration || "—"}
          {spell.concentration && <span className={classes.tag}>Conc.</span>}
        </Stat>
      </div>

      {spell.material && (
        <Text size="xs" fs="italic" mt={-8} mb="md" style={{ color: "var(--theme-color-text-secondary)" }}>
          M: {spell.material}
        </Text>
      )}

      {effects.length > 0 && (
        <Group gap="xs" mb="xs">
          {effects.map((fx) => (
            <span key={fx.label} className={classes.effect} style={{ "--fx": fx.color } as CSSProperties}>
              <fx.icon size={14} aria-hidden />
              {fx.label}
            </span>
          ))}
        </Group>
      )}

      <div className={classes.sectionLabel}>Description</div>
      <div className={classes.description}>
        {groupTables(spell.description).map((block, i) => (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
            {block}
          </ReactMarkdown>
        ))}
      </div>

      {spell.higherLevel?.length > 0 && (
        <div className={classes.higher}>
          <div className={classes.sectionLabel} style={{ margin: "0 0 6px", color: school.color }}>
            At Higher Levels
          </div>
          {spell.higherLevel.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      )}

      {spell.classes.length > 0 && (
        <>
          <div className={classes.sectionLabel}>Available To</div>
          <Group gap="xs">
            {spell.classes.map((cls) => (
              <span
                key={cls.name}
                className={classes.effect}
                style={{ "--fx": "var(--theme-color-accent-primary, #f59e0b)" } as CSSProperties}
              >
                {cls.name}
              </span>
            ))}
          </Group>
        </>
      )}
    </article>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={classes.stat}>
      <div className={classes.statLabel}>{label}</div>
      <div className={classes.statValue}>{children}</div>
    </div>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
