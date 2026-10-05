import type { ReactNode } from "react";
import {
  IconAlertTriangle,
  IconFlag,
  IconId,
  IconLink,
  IconMasksTheater,
  IconMoodSmile,
  IconScript,
  IconUserCircle,
} from "@tabler/icons-react";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { useCurrentCharacter } from "@store/character/characterSelectors";
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

  const attributes = [
    ["Background", character.background],
    ["Age", character.age ? String(character.age) : ""],
    ["Height", character.height],
    ["Weight", character.weight],
    ["Eyes", character.eyes],
    ["Hair", character.hair],
    ["Skin", character.skin],
  ].filter(([, value]) => value?.trim());

  const traits = [
    { label: "Personality traits", value: character.personalityTraits, Icon: IconMoodSmile },
    { label: "Ideals", value: character.ideals, Icon: IconFlag },
    { label: "Bonds", value: character.bonds, Icon: IconLink },
    { label: "Flaws", value: character.flaws, Icon: IconAlertTriangle },
  ];

  // Stored one line per entry; blank lines were paragraph breaks.
  const backstory = (character.backstory ?? []).map((line) => line.trim()).filter(Boolean);

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
        {backstory.length ? (
          <div className={classes.backstory}>
            {backstory.map((line, i) => (
              <p key={i} className={classes.text}>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <Empty>No backstory yet.</Empty>
        )}
      </Panel>
    </div>
  );
}
