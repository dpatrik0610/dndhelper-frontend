import type { ReactNode } from "react";
import { Tooltip } from "@mantine/core";
import {
  IconAlertTriangle,
  IconAward,
  IconFlag,
  IconId,
  IconLanguage,
  IconLink,
  IconMasksTheater,
  IconMoodSmile,
  IconScript,
  IconSword,
  IconUserCircle,
} from "@tabler/icons-react";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { useCurrentCharacter, useEffectiveStats } from "@store/character/characterSelectors";
import { physicalLimits } from "@utils/checkMath";
import { computeEffects } from "@utils/effects";
import classes from "./ExtraInfo.module.css";

function Panel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className={classes.panel}>
      <h3 className={classes.heading}>
        <span className={classes.headingIcon}>{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => <p className={`${classes.text} ${classes.empty}`}>{children}</p>;

export function ExtraInfo() {
  const character = useCurrentCharacter()!;
  const { stats } = useEffectiveStats()!;

  const attributes = [
    ["Background", character.background],
    ["Age", character.age ? String(character.age) : ""],
    ["Height", character.height],
    ["Weight", character.weight],
    ["Eyes", character.eyes],
    ["Hair", character.hair],
    ["Skin", character.skin],
    ["Alignment", character.alignment],
    ["Carrying Capacity", `${physicalLimits(stats.str.value, stats.con.value, character.size).carry} lbs`],
  ].filter(([, value]) => value?.trim());

  const traits = [
    { label: "Personality traits", value: character.personalityTraits, Icon: IconMoodSmile },
    { label: "Ideals", value: character.ideals, Icon: IconFlag },
    { label: "Bonds", value: character.bonds, Icon: IconLink },
    { label: "Flaws", value: character.flaws, Icon: IconAlertTriangle },
  ];

  // Proficiencies items and other effects grant, unless the sheet already lists them.
  const own = new Set((character.proficiencies ?? []).map((p) => p.trim().toLowerCase()));
  const granted = computeEffects(character).proficiencies.filter((p) => !own.has(p.detail.toLowerCase()));
  const proficiencyGroups = [
    {
      label: "Weapons & Tools",
      Icon: IconSword,
      items: [
        ...(character.proficiencies ?? []).map((name) => ({ name, source: "" })),
        ...granted.map((p) => ({ name: p.detail, source: p.source })),
      ],
    },
    { label: "Languages", Icon: IconLanguage, items: (character.languages ?? []).map((name) => ({ name, source: "" })) },
  ];

  // Stored one line per entry (the form splits on newlines), so joining restores the Markdown source.
  const backstory = (character.backstory ?? []).join("\n").trim();

  return (
    <div className={classes.stack}>
      <Panel icon={<IconId size={16} />} title="Profile">
        {attributes.length ? (
          <dl className={classes.attributes}>
            {attributes.map(([label, value]) => (
              <div key={label} className={classes.attribute}>
                <dt className={classes.label}>{label}</dt>
                <dd className={classes.value}>{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Empty>No details yet.</Empty>
        )}
      </Panel>

      <Panel icon={<IconAward size={16} />} title="Proficiencies & Languages">
        <div className={classes.traits}>
          {proficiencyGroups.map(({ label, Icon, items }) => (
            <div key={label} className={classes.trait}>
              <span className={classes.traitLabel}>
                <Icon size={14} />
                {label}
                <span className={classes.count}>{items.length}</span>
              </span>
              {items.length ? (
                <ul className={classes.tags}>
                  {items.map(({ name, source }, i) =>
                    source ? (
                      <Tooltip key={`${source}:${name}`} label={`From ${source}`} withArrow>
                        <li className={`${classes.tag} ${classes.tagGranted}`}>{name}</li>
                      </Tooltip>
                    ) : (
                      <li key={i} className={classes.tag}>{name}</li>
                    )
                  )}
                </ul>
              ) : (
                <Empty>None</Empty>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={<IconUserCircle size={16} />} title="Appearance">
        {character.appearance?.trim() ? (
          <MarkdownRenderer content={character.appearance} textColor="var(--theme-color-text-primary, #fff)" />
        ) : (
          <Empty>No description yet.</Empty>
        )}
      </Panel>

      <Panel icon={<IconMasksTheater size={16} />} title="Personality">
        <div className={classes.traits}>
          {traits.map(({ label, value, Icon }) => (
            <div key={label} className={classes.trait}>
              <span className={classes.traitLabel}>
                <Icon size={14} />
                {label}
              </span>
              {value?.trim() ? <p className={classes.text}>{value}</p> : <Empty>—</Empty>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={<IconScript size={16} />} title="Backstory">
        {backstory ? (
          <MarkdownRenderer className={classes.backstory} content={backstory} textColor="var(--theme-color-text-primary, #fff)" />
        ) : (
          <Empty>No backstory yet.</Empty>
        )}
      </Panel>
    </div>
  );
}
