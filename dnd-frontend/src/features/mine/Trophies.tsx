import { useEffect, useState } from "react";
import type { AchCtx, Achievement } from "./achievements";
import { PanelHead } from "./CampMenus";
import styles from "./Mine.module.css";

export interface AchToast {
  key: number;
  icon: string;
  name: string;
}

export function AchievementToasts({ toasts }: { toasts: AchToast[] }) {
  if (!toasts.length) return null;
  return (
    <div className={styles.achToasts} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.key} className={styles.achToast}>
          <span className={styles.achIcon}>{t.icon}</span>
          <div>
            <span className={styles.eyebrow}>Achievement unlocked</span>
            <strong>{t.name}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrophyPanel({
  list,
  read,
  unlocked,
  onClose,
}: {
  list: Achievement[];
  read: () => AchCtx;
  unlocked: ReadonlySet<string>;
  onClose: () => void;
}) {
  const [ctx, setCtx] = useState(read);
  useEffect(() => {
    const id = setInterval(() => setCtx(read()), 1000);
    return () => clearInterval(id);
  }, [read]);
  const done = list.filter((a) => unlocked.has(a.id)).length;
  const groups = [...new Set(list.map((a) => a.group))];

  return (
    <section className={`${styles.hudPanel} ${styles.trophyPanel}`} aria-label="Achievements">
      <PanelHead title={`Achievements ${done} / ${list.length}`} onClose={onClose} />
      <div className={styles.trophyMeter}>
        <div style={{ width: `${(done / list.length) * 100}%` }} />
      </div>
      {groups.map((group) => {
        const items = list.filter((a) => a.group === group);
        const got = items.filter((a) => unlocked.has(a.id)).length;
        return (
          <div key={group} className={styles.trophyGroup}>
            <span className={styles.eyebrow}>
              {group} · {got}/{items.length}
            </span>
            {items.map((a) => {
              const has = unlocked.has(a.id);
              const secret = a.hidden && !has;
              const v = Math.min(a.goal, a.value(ctx));
              return (
                <div key={a.id} className={styles.trophy} data-got={has || undefined}>
                  <span className={styles.achIcon}>{secret ? "❔" : a.icon}</span>
                  <div className={styles.trophyText}>
                    <strong>{secret ? "???" : a.name}</strong>
                    <span className={styles.dim}>{secret ? "A hidden achievement. Keep exploring." : a.desc}</span>
                    {!has && !secret && a.goal > 1 && (
                      <div className={styles.trophyProgress}>
                        <div style={{ width: `${(v / a.goal) * 100}%` }} />
                        <span>
                          {v.toLocaleString()} / {a.goal.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
