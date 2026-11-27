import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Paper, Title, Tooltip } from "@mantine/core";
import { IconPick, IconTrophy } from "@tabler/icons-react";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { ListSkeleton } from "@components/common/Skeletons";
import { getMiningScoreboard, type MiningScore } from "@services/miningService";
import { useUsername } from "@store/auth/authSelectors";
import { compact } from "@features/mine/mine";
import { GEAR_SLOTS, item, itemName } from "@features/mine/art/gear";
import { FORGE_LEVELS, forgeSprite } from "@features/mine/art/forge";
import { HOUSE_LEVELS, houseIcon } from "@features/mine/art/house";
import { COIN, DIAMOND_GRID } from "@features/mine/art/materials";
import type { Grid } from "@features/mine/art/pixel";
import { Sprite } from "@features/mine/Sprite";
import styles from "./Scoreboard.module.css";

const byRenown = (a: MiningScore, b: MiningScore) => b.renown - a.renown;

const sprites = new Map<string, Grid>();
const cached = (key: string, make: () => Grid) => {
  if (!sprites.has(key)) sprites.set(key, make());
  return sprites.get(key)!;
};

const clampLevel = (n: number, max: number) => Math.max(1, Math.min(max, n || 1));

function Estate({ house, forge }: { house: number; forge: number }) {
  const h = clampLevel(house, HOUSE_LEVELS.length);
  const f = clampLevel(forge, FORGE_LEVELS.length);
  const houseName = HOUSE_LEVELS[h - 1].name;
  const forgeName = FORGE_LEVELS[f - 1].name;
  return (
    <figure className={styles.estate}>
      <div className={styles.plot}>
        <Sprite grid={cached(`h${h}`, () => houseIcon(h))} scale={1} label={houseName} />
        <Sprite grid={cached(`f${f}`, () => forgeSprite(f))} scale={1} label={forgeName} />
      </div>
      <figcaption className={styles.estateCaption}>
        <span>
          {houseName}
          <small>
            Home {h} of {HOUSE_LEVELS.length}
          </small>
        </span>
        <span>
          {forgeName}
          <small>
            Forge {f} of {FORGE_LEVELS.length}
          </small>
        </span>
      </figcaption>
    </figure>
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
              {scores!.map((s, i) => (
                <div key={s.username} className={`${styles.delver} ${s.username === me ? styles.rowMe : ""}`}>
                  <div className={styles.rank} data-place={i + 1}>
                    {i + 1}
                  </div>
                  <div className={styles.delverInfo}>
                    <div className={styles.name}>
                      <span className={styles.nameText}>{s.username}</span>
                      {s.username === me && <span className={styles.you}>You</span>}
                    </div>
                    <div className={styles.renown}>
                      <b>{compact(s.renown)}</b> renown
                    </div>
                    <dl className={styles.stats}>
                      <div>
                        <dt>Deepest</dt>
                        <dd>Depth {s.deepestDepth}</dd>
                      </div>
                      <div>
                        <dt>Ore blocks</dt>
                        <dd>{compact(s.nodesBroken)}</dd>
                      </div>
                      <div>
                        <dt>Coins</dt>
                        <dd>
                          <Sprite grid={COIN} scale={1} />
                          {compact(s.coins ?? 0)}
                        </dd>
                      </div>
                      <div>
                        <dt>Diamonds found</dt>
                        <dd>
                          <Sprite grid={DIAMOND_GRID} scale={1} />
                          {compact(s.diamonds ?? 0)}
                        </dd>
                      </div>
                      <div>
                        <dt>Achievements</dt>
                        <dd>
                          <IconTrophy size={14} aria-hidden />
                          {s.achievements ?? 0}
                        </dd>
                      </div>
                    </dl>
                    <div className={styles.gearRow}>
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
                  <Estate house={s.houseLevel} forge={s.forgeLevel} />
                </div>
              ))}
            </>
          )}
        </Paper>
      )}
    </>
  );
}
