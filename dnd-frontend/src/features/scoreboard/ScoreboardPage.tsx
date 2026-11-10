import { useEffect, useState } from "react";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { Paper, Title, Tooltip } from "@mantine/core";
import { ListSkeleton } from "@components/common/Skeletons";
import { CritterIcon } from "@components/layout/ThemeCritter";
import { ALL_CRITTERS } from "@components/layout/critters";
import { getCritterScoreboard, type CritterScore } from "@services/userService";
import { useUsername } from "@store/auth/authSelectors";
import { themeOptions } from "@appTypes/ThemeTypes";
import styles from "./Scoreboard.module.css";

const byScore = (a: CritterScore, b: CritterScore) =>
  b.total - a.total || a.username.localeCompare(b.username, undefined, { sensitivity: "base" });

/** Hidden page (no nav link, reached at /scoreboard): who has caught the most theme critters. */
export default function ScoreboardPage() {
  const me = useUsername();
  const [scores, setScores] = useState<CritterScore[] | null>(null);
  const [failed, setFailed] = useState(false);
  const { connection } = useSignalRConnection();

  useEffect(() => {
    getCritterScoreboard()
      .then(setScores)
      .catch(() => setFailed(true));
  }, []);

  // Live: every catch (anyone's, on any device) is broadcast with that player's new row.
  useEffect(() => {
    if (!connection) return;
    const onScore = (score: CritterScore) =>
      setScores((list) => list && [...list.filter((s) => s.username !== score.username), score].sort(byScore));
    connection.on("CritterScoreChanged", onScore);
    return () => connection.off("CritterScoreChanged", onScore);
  }, [connection]);

  const mine = scores?.find((s) => s.username === me)?.caught ?? {};
  const found = ALL_CRITTERS.filter((c) => mine[c.name]).length;

  return (
    <div className={styles.page}>
      <Paper radius="md" withBorder className={`${styles.panel} ${styles.header}`}>
        <Title order={2} className={`narrative-title ${styles.title}`}>
          Critter Scoreboard
        </Title>
        <p className={styles.lede}>
          Now and then a critter wanders by for everyone at once, in the shape of your theme. First click catches it.
        </p>

        <div className={styles.progressHead}>
          <span className={styles.eyebrow}>Your collection</span>
          <span className={styles.progressValue}>
            {found} / {ALL_CRITTERS.length} species
          </span>
        </div>
        <div className="glass-progress">
          <div className="glass-progress-bar" style={{ width: `${(found / ALL_CRITTERS.length) * 100}%` }} />
        </div>

        <div className={styles.collection}>
          {ALL_CRITTERS.map(({ theme, name }) => {
            const n = mine[name] ?? 0;
            const themeName = themeOptions.find((t) => t.key === theme)?.name;
            return (
              <Tooltip key={name} label={`${name} (${themeName}): ${n ? `caught ×${n}` : "not caught yet"}`} withArrow>
                <div className={`${styles.slot} ${n ? "" : styles.slotMissing}`}>
                  <CritterIcon name={name} size={26} />
                </div>
              </Tooltip>
            );
          })}
        </div>
      </Paper>

      {!failed && !scores ? (
        <ListSkeleton rows={4} />
      ) : (
        <Paper radius="md" withBorder className={styles.panel}>
          {failed ? (
            <div className={styles.state}>Couldn't load the scoreboard.</div>
          ) : scores!.length === 0 ? (
            <div className={styles.state}>Nobody has caught a critter yet.</div>
          ) : (
            <>
              <div className={styles.listHead}>
                <span className={styles.eyebrow}>#</span>
                <span className={styles.eyebrow}>Player</span>
                <span className={styles.eyebrow}>Caught</span>
              </div>
              {scores!.map((s, i) => {
                const caught = ALL_CRITTERS.filter((c) => s.caught[c.name]);
                return (
                  <div key={s.username} className={`${styles.row} ${s.username === me ? styles.rowMe : ""}`}>
                    <div className={styles.rank} data-place={i + 1}>
                      {i + 1}
                    </div>
                    <div className={styles.who}>
                      <div className={styles.name}>
                        <span className={styles.nameText}>{s.username}</span>
                        {s.username === me && <span className={styles.you}>You</span>}
                      </div>
                    </div>
                    <div className={styles.total}>
                      {s.total}
                      <span className={styles.species}>
                        {caught.length}/{ALL_CRITTERS.length} species
                      </span>
                    </div>
                    <div className={styles.catches}>
                      {caught.map((c) => (
                        <Tooltip key={c.name} label={c.name} withArrow>
                          <div className={styles.catch}>
                            <CritterIcon name={c.name} size={18} />
                            <span className={styles.count}>×{s.caught[c.name]}</span>
                          </div>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </Paper>
      )}
    </div>
  );
}
