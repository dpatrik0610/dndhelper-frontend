import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { IconTrophy } from "@tabler/icons-react";
import { PageSkeleton } from "@components/common/Skeletons";
import { getMiningConfig, getMiningState, type MiningConfig, type MiningState } from "@services/miningService";
import { compact } from "./mine";
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
          <Stat label="Renown" value={compact(state.renown)} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.eyebrow}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}
