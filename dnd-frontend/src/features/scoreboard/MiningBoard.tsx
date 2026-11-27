import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Paper, Title, Tooltip } from "@mantine/core";
import { IconPick } from "@tabler/icons-react";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { ListSkeleton } from "@components/common/Skeletons";
import { getMiningScoreboard, type MiningScore } from "@services/miningService";
import { useUsername } from "@store/auth/authSelectors";
import { compact } from "@features/mine/mine";
import { GEAR_SLOTS, item, itemName } from "@features/mine/art/gear";
import { FORGE_LEVELS, forgeSprite } from "@features/mine/art/forge";
import { HOUSE_LEVELS, houseIcon } from "@features/mine/art/house";
import type { Grid } from "@features/mine/art/pixel";
import { Sprite } from "@features/mine/Sprite";
import styles from "./Scoreboard.module.css";

const byRenown = (a: MiningScore, b: MiningScore) => b.renown - a.renown;

const sprites = new Map<string, Grid>();
const cached = (key: string, make: () => Grid) => {
  if (!sprites.has(key)) sprites.set(key, make());
  return sprites.get(key)!;
};

function Holding({ grid, name, tag, height }: { grid: Grid; name: string; tag: string; height: number }) {
  return (
    <Tooltip label={tag} withArrow>
      <span className={styles.holding}>
        <Sprite grid={grid} scale={height / grid.length} label={name} />
        {name}
      </span>
    </Tooltip>
  );
}

/** The Deepdelve section of /scoreboard: renown from mined ore, with each player's gear. */
export function MiningBoard() {
  const me = useUsername();
  const [scores, setScores] = useState<MiningScore[] | null>(null);
  const [failed, setFailed] = useState(false);
  const { connection } = useSignalRConnection();

  useEffect(() => {
    getMiningScoreboard()
      .then(setScores)
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    if (!connection) return;
    const onScore = (score: MiningScore) =>
      setScores((list) => list && [...list.filter((s) => s.username !== score.username), score].sort(byRenown));
    connection.on("MiningScoreChanged", onScore);
    return () => connection.off("MiningScoreChanged", onScore);
  }, [connection]);

  return (
    <>
      <Paper radius="md" withBorder className={`${styles.panel} ${styles.header}`}>
        <div className={styles.mineHead}>
          <div>
            <Title order={2} className={`narrative-title ${styles.title}`}>
              The Deepdelve
            </Title>
            <p className={styles.lede}>
              Twenty ores, five pieces of gear, ten depths. Every ore you haul up earns renown, and the rarer it is the more it counts.
            </p>
          </div>
          <Link to="/mine" className={`glass-btn-primary ${styles.mineBtn}`}>
            <IconPick size={16} /> Enter the mine
          </Link>
        </div>
      </Paper>

      {!failed && !scores ? (
        <ListSkeleton rows={3} />
      ) : (
        <Paper radius="md" withBorder className={styles.panel}>
          {failed ? (
            <div className={styles.state}>Couldn't load the mining scoreboard.</div>
          ) : scores!.length === 0 ? (
            <div className={styles.state}>Nobody has swung a pickaxe yet.</div>
          ) : (
            <>
              <div className={styles.listHead}>
                <span className={styles.eyebrow}>#</span>
                <span className={styles.eyebrow}>Delver</span>
                <span className={styles.eyebrow}>Renown</span>
              </div>
              {scores!.map((s, i) => (
                <div key={s.username} className={`${styles.row} ${s.username === me ? styles.rowMe : ""}`}>
                  <div className={styles.rank} data-place={i + 1}>
                    {i + 1}
                  </div>
                  <div className={styles.who}>
                    <div className={styles.name}>
                      <span className={styles.nameText}>{s.username}</span>
                      {s.username === me && <span className={styles.you}>You</span>}
                    </div>
                    <div className={styles.holdings}>
                      <Holding
                        grid={cached(`h${s.houseLevel}`, () => houseIcon(s.houseLevel))}
                        name={HOUSE_LEVELS[Math.max(1, Math.min(HOUSE_LEVELS.length, s.houseLevel)) - 1].name}
                        tag={`Home ${s.houseLevel} / ${HOUSE_LEVELS.length}`}
                        height={34}
                      />
                      <Holding
                        grid={cached(`f${s.forgeLevel}`, () => forgeSprite(s.forgeLevel))}
                        name={FORGE_LEVELS[Math.max(1, Math.min(FORGE_LEVELS.length, s.forgeLevel)) - 1].name}
                        tag={`Forge ${s.forgeLevel} / ${FORGE_LEVELS.length}`}
                        height={24}
                      />
                    </div>
                  </div>
                  <div className={styles.total}>
                    {compact(s.renown)}
                    <span className={styles.species}>
                      Depth {s.deepestDepth} · {compact(s.nodesBroken)} ore blocks
                    </span>
                  </div>
                  <div className={styles.catches}>
                    {GEAR_SLOTS.map((slot) => {
                      const tier = s.gear[slot] ?? 0;
                      return (
                        <Tooltip key={slot} label={`${itemName(slot, tier)} · tier ${tier} / 10`} withArrow>
                          <div className={`${styles.catch} ${tier === 10 ? styles.catchGolden : ""}`}>
                            <Sprite grid={item(slot, tier)} scale={1} />
                            <span className={styles.count}>{tier}</span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </Paper>
      )}
    </>
  );
}
