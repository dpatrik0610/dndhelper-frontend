import { useId, useState, type CSSProperties } from "react";
import { Stack, Text, Tooltip } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { useCurrentCharacter, useEffectiveStats } from "@store/character/characterSelectors";
import { RollMark } from "@features/profile/components/EffectHint";
import { ABILITIES, signed, type StatResult } from "@utils/effects";
import { passChance, physicalLimits, rollNeeded } from "@utils/checkMath";
import classes from "./StatisticsPanel.module.css";

// Colour heats up with the danger: steel teal, amber, ember, crimson.
const DCS = [
  { value: "10", label: "Easy", pips: 1, color: "#5eead4" },
  { value: "15", label: "Medium", pips: 2, color: "#fbbf24" },
  { value: "20", label: "Hard", pips: 3, color: "#fb8a3c" },
  { value: "25", label: "Very hard", pips: 4, color: "#f8506b" },
];

/** One d20 face per DC; native radios underneath, so arrow keys and screen readers work. */
function DcPicker({ value, onChange }: { value: string; onChange: (dc: string) => void }) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label="Difficulty class" className={classes.dcGroup}>
      {DCS.map((d) => (
        <label key={d.value} className={classes.dc} style={{ "--tier": d.color } as CSSProperties}>
          <input
            type="radio"
            name={name}
            value={d.value}
            checked={value === d.value}
            onChange={() => onChange(d.value)}
            className={classes.dcInput}
            aria-label={`${d.label}, DC ${d.value}`}
          />
          <span className={classes.dieWrap} aria-hidden>
            <span className={classes.die}>
              <span className={classes.dieNum}>{d.value}</span>
            </span>
          </span>
          <span className={classes.dcText} aria-hidden>
            <span className={classes.dcLabel}>{d.label}</span>
            <span className={classes.pips}>
              {DCS.map((_, i) => (
                <span key={i} className={classes.pip} data-on={i < d.pips} />
              ))}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

const pct = (p: number) => `${Math.round(p * 100)}%`;
const feet = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} ft`;

function explain(name: string, stat: StatResult, dc: number) {
  const need = rollNeeded(stat.value, dc);
  const dice = stat.roll === "advantage" ? " on either d20" : stat.roll === "disadvantage" ? " on both d20s" : " on the d20";
  const needs = need <= 1 ? "Can't fail." : need > 20 ? "Can't succeed, even on a 20." : `Needs ${need} or higher${dice}.`;
  const withRoll = stat.roll === "normal" ? "" : ` with ${stat.roll}`;
  const without = stat.roll === "normal" ? "" : ` (${pct(passChance(stat.value, dc))} without ${stat.roll})`;
  return `${name} ${signed(stat.value)}${withRoll}. ${needs} ${pct(passChance(stat.value, dc, stat.roll))} against DC ${dc}${without}.`;
}

function OddsRow({ name, stat, dc }: { name: string; stat: StatResult; dc: number }) {
  const chance = passChance(stat.value, dc, stat.roll);
  const plain = passChance(stat.value, dc);

  return (
    <Tooltip label={explain(name, stat, dc)} multiline w={280} withArrow openDelay={150} events={{ hover: true, focus: true, touch: true }}>
      <div className={classes.row} tabIndex={0}>
        <span className={classes.name}>
          <span className={classes.nameText}>{name}</span>
          <RollMark roll={stat.roll} />
        </span>
        <span className={classes.mod}>{signed(stat.value)}</span>
        <span className={classes.track} aria-hidden>
          <span className={classes.fill} style={{ width: pct(chance) }} />
          {stat.roll !== "normal" && <span className={classes.tick} style={{ left: pct(plain) }} />}
        </span>
        <span className={classes.pct}>{pct(chance)}</span>
      </div>
    </Tooltip>
  );
}

/** Odds of passing checks and saves at a chosen DC, and the PHB physical limits, from the sheet after effects. */
export function StatisticsPanel() {
  const character = useCurrentCharacter()!;
  const { stats } = useEffectiveStats()!;
  const [dc, setDc] = useState("15");
  const target = Number(dc);

  type Odds = { name: string; stat: StatResult; chance: number };
  const byChance = (a: Odds, b: Odds) => b.chance - a.chance || a.name.localeCompare(b.name);
  const odds = (name: string, stat: StatResult): Odds => ({ name, stat, chance: passChance(stat.value, target, stat.roll) });

  const saves = ABILITIES.map((a) => odds(a.name, stats[`save:${a.key}`])).sort(byChance);
  const skills = (character.skills ?? [])
    .filter((s) => stats[`skill:${s.name}`])
    .map((s) => odds(s.name, stats[`skill:${s.name}`]))
    .sort(byChance);

  const str = stats.str.value;
  const con = stats.con.value;
  const limits = physicalLimits(str, con, character.size);
  const conMod = Math.floor((con - 10) / 2);
  const sizeNote = character.size && character.size !== "Medium" && character.size !== "Small" ? `Adjusted for ${character.size} size` : `For a ${character.size || "Medium"} creature`;
  const changed = str !== stats.str.base || con !== stats.con.base;

  const tiles = [
    { label: "Carrying capacity", value: `${limits.carry} lb`, sub: sizeNote },
    { label: "Push, drag or lift", value: `${limits.pushDragLift} lb`, sub: "Speed drops to 5 ft above carrying capacity" },
    { label: "Long jump", value: feet(limits.longJump), sub: `${feet(limits.longJump / 2)} from standing` },
    { label: "High jump", value: feet(limits.highJump), sub: `${feet(limits.highJump / 2)} from standing` },
    {
      label: "Hold breath",
      value: limits.breathMinutes < 1 ? "30 sec" : `${limits.breathMinutes} min`,
      sub: `Then ${Math.max(1, conMod)} round${Math.max(1, conMod) > 1 ? "s" : ""} before dropping to 0 HP`,
    },
  ];

  return (
    <ExpandableSection
      title="Statistics"
      color={SectionColor.Cyan}
      defaultOpen
      expandable={false}
      marginTop="md"
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        padding: "20px",
      }}
    >
      <Stack gap="xl">
        <Stack gap="sm" style={{ "--dc": DCS.find((d) => d.value === dc)?.color } as CSSProperties}>
          <Stack gap={8}>
            <Text fw={600}>Chance to pass</Text>
            <DcPicker value={dc} onChange={setDc} />
          </Stack>

          <div className={classes.columns}>
            <section>
              <h4 className={classes.heading}>Saving throws</h4>
              <div className={classes.list}>
                {saves.map((o) => (
                  <OddsRow key={o.name} name={o.name} stat={o.stat} dc={target} />
                ))}
              </div>
            </section>
            <section>
              <h4 className={classes.heading}>Skills</h4>
              <div className={classes.list}>
                {skills.map((o) => (
                  <OddsRow key={o.name} name={o.name} stat={o.stat} dc={target} />
                ))}
              </div>
            </section>
          </div>

          <Text size="xs" c="dimmed">
            Sorted best first. Advantage and disadvantage from effects are included; the white mark shows the chance without them.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Text fw={600}>Physical limits</Text>
          <div className={classes.tiles}>
            {tiles.map((t) => (
              <div key={t.label} className={classes.tile}>
                <div className={classes.tileLabel}>{t.label}</div>
                <div className={classes.tileValue}>{t.value}</div>
                <div className={classes.tileSub}>{t.sub}</div>
              </div>
            ))}
          </div>
          <Text size="xs" c="dimmed">
            From STR {str} and CON {con}
            {changed ? ", including effects" : ""}. Jumps assume a 10 ft run-up.
          </Text>
        </Stack>
      </Stack>
    </ExpandableSection>
  );
}
