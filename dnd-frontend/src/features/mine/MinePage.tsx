import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Tooltip } from "@mantine/core";
import { IconTrophy } from "@tabler/icons-react";
import { PageSkeleton } from "@components/common/Skeletons";
import { getMiningConfig, getMiningState, type MiningConfig, type MiningState } from "@services/miningService";
import { compact, renownBreakdown } from "./mine";
import { oreIcon } from "./render";
import { Sprite } from "./Sprite";
import { PlayView } from "./PlayView";
import styles from "./Mine.module.css";

export default function MinePage() {
  const [config, setConfig] = useState<MiningConfig | null>(null);
  const [state, setState] = useState<MiningState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([getMiningConfig(), getMiningState()])
      .then(([c, s]) => {
        setConfig(c);
        setState(s);
      })
      .catch(() => setFailed(true));
  }, []);

  const onState = useCallback((s: MiningState) => setState(s), []);

  if (failed)
    return <div className={`${styles.page} ${styles.failed}`}>The mine entrance has caved in. Try again later.</div>;
  if (!config || !state) return <PageSkeleton />;

  const found = config.ores.filter((o) => state.mined[o.key]).length;
  const critRate = state.swings ? Math.round((state.crits / state.swings) * 100) : 0;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div>
          <span className={styles.eyebrow}>
            {state.trip ? `Down the shaft · depth ${state.trip.depth}` : "Camp at the mine entrance"}
          </span>
          <h1 className={styles.h1}>The Deepdelve</h1>
        </div>
        <div className={styles.stats}>
          <RenownStat config={config} state={state} />
          <Stat label="Deepest" value={`${state.deepestDepth} / 10`} />
          <Stat label="Ore blocks" value={compact(state.nodesBroken)} />
          <Stat label="Monsters" value={compact(state.kills)} />
          <Stat label="Crit rate" value={`${critRate}%`} />
          <Stat label="Ores found" value={`${found} / ${config.ores.length}`} />
        </div>
        <Link to="/scoreboard" className={`glass-btn-secondary ${styles.linkBtn}`}>
          <IconTrophy size={16} /> Scoreboard
        </Link>
      </header>

      <PlayView config={config} state={state} onState={onState} />
    </div>
  );
}

const RENOWN_ROWS = 6;

function RenownStat({ config, state }: { config: MiningConfig; state: MiningState }) {
  const rows = renownBreakdown(config.ores, state.mined);
  const rest = rows.slice(RENOWN_ROWS).reduce((n, r) => n + r.total, 0);
  const tip = (
    <div className={styles.renownTip}>
      <b className={styles.pixel}>How renown is earned</b>
      <p>
        Every ore you carry back up to camp adds its value to your renown. Rarer ore is worth more: copper counts 1, and each ore
        after it counts about 1.6 times the one before. Faint down there and you lose half your satchel, renown included.
      </p>
      {rows.length ? (
        <table>
          <tbody>
            {rows.slice(0, RENOWN_ROWS).map((r) => (
              <tr key={r.name}>
                <td>
                  <Sprite grid={oreIcon(r.index)} scale={1} />
                </td>
                <td>{r.name}</td>
                <td className={styles.tipCalc}>
                  {compact(r.count)} × {compact(r.value)}
                </td>
                <td>{compact(r.total)}</td>
              </tr>
            ))}
            {rest > 0 && (
              <tr>
                <td />
                <td colSpan={2}>{rows.length - RENOWN_ROWS} more ores</td>
                <td>{compact(rest)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td />
              <td colSpan={2}>Renown</td>
              <td>{compact(state.renown)}</td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <p>Bank your first ore to start earning it.</p>
      )}
    </div>
  );
  return (
    <Tooltip label={tip} withArrow multiline w={320} events={{ hover: true, focus: true, touch: true }}>
      <div className={`${styles.stat} ${styles.statHelp}`} tabIndex={0}>
        <span className={styles.eyebrow}>Renown</span>
        <span className={styles.statValue}>{compact(state.renown)}</span>
      </div>
    </Tooltip>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.eyebrow}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
